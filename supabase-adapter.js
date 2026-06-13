(function () {
  "use strict";

  const SESSION_KEY = "infinea.auditmate.supabaseSession.v1";
  const config = window.INFINEA_SUPABASE_CONFIG || {};
  const hasConfig = Boolean(config.url && config.anonKey);
  const baseUrl = String(config.url || "").replace(/\/$/, "");
  const REQUEST_TIMEOUT_MS = 15000;
  let authSession = loadStoredAuthSession();

  async function getCurrentSession() {
    if (!hasConfig || !authSession || !authSession.access_token) return null;
    if (isExpired(authSession)) {
      try {
        authSession = await refreshSession(authSession.refresh_token);
        saveStoredAuthSession(authSession);
      } catch (error) {
        clearStoredAuthSession();
        authSession = null;
        return null;
      }
    }
    return hydrateSession(authSession);
  }

  async function signInManager(email, password) {
    ensureConfigured();
    authSession = await passwordGrant(email, password);
    saveStoredAuthSession(authSession);
    const session = await hydrateSession(authSession);
    if (!session || session.role !== "manager") {
      await signOut();
      throw new Error("Accesso riuscito, ma questo utente non risulta manager. Controlla la tabella public.profiles.");
    }
    return session;
  }

  async function signInClient(name, email, password) {
    ensureConfigured();
    const accessEmail = normalizeAccessEmail(email);
    const organization = await validateCompanyAccess(accessEmail, password, null);
    if (!organization || !organization.organization_id) {
      throw new Error("Email o password cliente non corretta.");
    }

    try {
      authSession = await passwordGrant(email, password);
    } catch (error) {
      if (String(error.message || "").toLowerCase().includes("email non confermata")) {
        throw error;
      }
      authSession = await signUp(email, password, {
        organization_id: organization.organization_id,
        organization_name: name,
        access_email: accessEmail,
        role: "client",
      });
    }
    if (!authSession || !authSession.access_token) {
      throw new Error("Supabase sta richiedendo conferma email. Per questa demo vai in Supabase > Authentication > Providers > Email e disattiva Confirm email, poi elimina o conferma manualmente l'utente appena creato e riprova.");
    }
    saveStoredAuthSession(authSession);
    await rpc("join_organization_with_company_password", {
      input_code: accessEmail,
      input_password: password,
    });
    return hydrateSession(authSession);
  }

  async function signOut() {
    if (authSession && authSession.access_token) {
      try {
        await authFetch("/auth/v1/logout", {
          method: "POST",
          token: authSession.access_token,
        });
      } catch (error) {
        // La sessione locale va chiusa comunque.
      }
    }
    authSession = null;
    clearStoredAuthSession();
  }

  async function listOrganizations() {
    ensureConfigured();
    const rows = await rest(
      "/rest/v1/organizations?select=id,name,code,created_at,updated_at&order=created_at.desc"
    );
    const result = [];
    for (const row of rows || []) {
      const [employees, memberships, imports] = await Promise.all([
        countRows("employees", row.id),
        countRows("memberships", row.id),
        rest(
          `/rest/v1/imports?select=created_at,status&organization_id=eq.${encodeURIComponent(row.id)}&order=created_at.desc&limit=1`
        ),
      ]);
      result.push({
        ...row,
        employeeCount: employees,
        userCount: memberships,
        lastImport: imports && imports[0] ? imports[0] : null,
      });
    }
    return result;
  }

  async function createOrganization(name, email, companyPassword) {
    ensureConfigured();
    if (String(companyPassword || "").length < 6) {
      throw new Error("La password cliente deve avere almeno 6 caratteri.");
    }
    return rpc("manager_create_organization", {
      input_name: name,
      input_code: normalizeAccessEmail(email),
      input_password: companyPassword,
    });
  }

  async function deleteOrganization(organizationId) {
    ensureConfigured();
    if (!organizationId) throw new Error("Cliente non selezionato.");
    return rest(`/rest/v1/organizations?id=eq.${encodeURIComponent(organizationId)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
  }

  async function loadComplianceSource(organizationId) {
    ensureConfigured();
    if (!organizationId) return null;
    const [organizationRows, employees, courses, roleObligations, requiredObligations, certificates] =
      await Promise.all([
        rest(`/rest/v1/organizations?select=id,name,code&id=eq.${encodeURIComponent(organizationId)}&limit=1`),
        selectAll("employees", organizationId),
        selectAll("courses", organizationId),
        selectAll("role_obligations", organizationId),
        selectAll("required_obligations", organizationId),
        selectAll("certificates", organizationId),
      ]);
    const organization = organizationRows && organizationRows[0] ? organizationRows[0] : null;
    if (!organization) return null;
    return rowsToSource(organization, employees, courses, roleObligations, requiredObligations, certificates);
  }

  async function saveComplianceSource(organizationId, source) {
    ensureConfigured();
    if (!organizationId) throw new Error("Organizzazione non selezionata.");
    const payload = sourceToRows(organizationId, source);
    for (const table of ["certificates", "required_obligations", "role_obligations", "courses", "employees"]) {
      await rest(`/rest/v1/${table}?organization_id=eq.${encodeURIComponent(organizationId)}`, {
        method: "DELETE",
      });
    }
    await insertRows("employees", payload.employees);
    await insertRows("courses", payload.courses);
    await insertRows("role_obligations", payload.roleObligations);
    await insertRows("required_obligations", payload.requiredObligations);
    await insertRows("certificates", payload.certificates);
    await insertRows("imports", [
      {
        organization_id: organizationId,
        status: "completed",
        summary: source.quality || {},
      },
    ]);
    return loadComplianceSource(organizationId);
  }

  async function clearComplianceSource(organizationId) {
    ensureConfigured();
    for (const table of ["certificates", "required_obligations", "role_obligations", "courses", "employees"]) {
      await rest(`/rest/v1/${table}?organization_id=eq.${encodeURIComponent(organizationId)}`, {
        method: "DELETE",
      });
    }
  }

  async function validateCompanyAccess(code, password, token) {
    const rows = await rpc(
      "validate_company_access",
      {
        input_code: code,
        input_password: password,
      },
      token
    );
    return Array.isArray(rows) ? rows[0] : rows;
  }

  async function passwordGrant(email, password) {
    return authFetch("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: { email, password },
    });
  }

  async function signUp(email, password, data) {
    return authFetch("/auth/v1/signup", {
      method: "POST",
      body: { email, password, data },
    });
  }

  async function refreshSession(refreshToken) {
    return authFetch("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });
  }

  async function hydrateSession(session) {
    if (!session || !session.access_token || !session.user) return null;
    const profileRows = await rest(
      `/rest/v1/profiles?select=id,email,role,full_name&id=eq.${encodeURIComponent(session.user.id)}&limit=1`,
      { token: session.access_token }
    );
    const profile = profileRows && profileRows[0] ? profileRows[0] : null;
    const membershipRows = await rest(
      `/rest/v1/memberships?select=organization_id,role,organizations(id,name,code)&user_id=eq.${encodeURIComponent(session.user.id)}&order=created_at.asc&limit=1`,
      { token: session.access_token }
    );
    const membership = membershipRows && membershipRows[0] ? membershipRows[0] : null;
    return {
      email: session.user.email,
      userId: session.user.id,
      role: profile && profile.role === "manager" ? "manager" : "client",
      organizationId: membership ? membership.organization_id : null,
      organizationName: membership && membership.organizations ? membership.organizations.name : "",
      organizationCode: membership && membership.organizations ? membership.organizations.code : "",
    };
  }

  async function selectAll(table, organizationId) {
    return rest(
      `/rest/v1/${table}?select=*&organization_id=eq.${encodeURIComponent(organizationId)}&order=created_at.asc`
    );
  }

  async function insertRows(table, rows) {
    if (!rows.length) return;
    await rest(`/rest/v1/${table}`, {
      method: "POST",
      body: rows,
      headers: { Prefer: "return=minimal" },
    });
  }

  async function countRows(table, organizationId) {
    const response = await request(`/rest/v1/${table}?select=*&organization_id=eq.${encodeURIComponent(organizationId)}`, {
      method: "HEAD",
      headers: { Prefer: "count=exact" },
    });
    const range = response.headers.get("content-range") || "";
    const total = Number(range.split("/")[1]);
    return Number.isFinite(total) ? total : 0;
  }

  async function rpc(name, args, token) {
    return rest(`/rest/v1/rpc/${name}`, {
      method: "POST",
      body: args,
      token,
    });
  }

  async function rest(path, options = {}) {
    const response = await request(path, options);
    if (response.status === 204) return null;
    return response.json();
  }

  async function authFetch(path, options = {}) {
    const response = await request(path, {
      ...options,
      token: options.token || (authSession ? authSession.access_token : null),
      authEndpoint: true,
    });
    return response.json();
  }

  async function request(path, options = {}) {
    ensureConfigured();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const headers = {
      apikey: config.anonKey,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    const token = options.token || (authSession ? authSession.access_token : null);
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(await readError(response));
      }
      return response;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Supabase non risponde: controlla connessione, Project URL e chiave anon.");
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function readError(response) {
    try {
      const data = await response.json();
      const message =
        data.msg || data.message || data.error_description || data.error || `Errore Supabase ${response.status}`;
      if (message === "Invalid login credentials") {
        return "Email o password non corretta, oppure utente non confermato in Supabase.";
      }
      if (message.toLowerCase().includes("email not confirmed")) {
        return "Email non confermata: in Supabase > Authentication > Providers > Email disattiva Confirm email, oppure conferma manualmente l'utente in Authentication > Users.";
      }
      return message;
    } catch (error) {
      return `Errore Supabase ${response.status}`;
    }
  }

  function sourceToRows(organizationId, source) {
    const employees = source.employees.rows.map((row) => ({
      organization_id: organizationId,
      employee_id: row["Employee ID"],
      first_name: row.Nome || "",
      last_name: row.Cognome || "",
      department: row.Reparto || "",
      job_title: row.Mansione || "",
      role_id: row["Role ID"] || "",
      required_course_count: Number(row["N. corsi richiesti"] || 0),
      raw: row,
    }));

    const courseMap = new Map();
    source.roleObligationMatrix.rows.forEach((row) => {
      const courseId = row["Course ID"];
      if (!courseId || courseMap.has(courseId)) return;
      courseMap.set(courseId, {
        organization_id: organizationId,
        course_id: courseId,
        name: row["Corso obbligatorio"] || "",
        category: row["Categoria corso"] || "",
        renewal_months: Number(row["Rinnovo mesi"] || 0),
        risk_profile: row["Profilo rischio corso"] || "",
        raw: row,
      });
    });

    return {
      employees,
      courses: Array.from(courseMap.values()),
      roleObligations: source.roleObligationMatrix.rows.map((row) => ({
        organization_id: organizationId,
        matrix_row_id: row["Matrix Row ID"],
        role_id: row["Role ID"],
        department: row.Reparto || "",
        job_title: row.Mansione || "",
        course_id: row["Course ID"],
        course_name: row["Corso obbligatorio"] || "",
        category: row["Categoria corso"] || "",
        renewal_months: Number(row["Rinnovo mesi"] || 0),
        risk_profile: row["Profilo rischio corso"] || "",
        raw: row,
      })),
      requiredObligations: source.requiredObligations.rows.map((row) => ({
        organization_id: organizationId,
        obligation_id: row["Required Obligation ID"],
        employee_id: row["Employee ID"],
        course_id: row["Course ID"],
        raw: row,
      })),
      certificates: source.certificateRepository.rows.map((row) => ({
        organization_id: organizationId,
        certificate_id: row["Certificate ID"],
        obligation_id: row["Required Obligation ID"],
        employee_id: row["Employee ID"],
        course_id: row["Course ID"],
        presence: row["Certificate Presence"] || "",
        issue_date: nullIfEmpty(row["Issue Date"]),
        expiry_date: nullIfEmpty(row["Expiry Date"]),
        evidence_file: row["Evidence File"] || "",
        raw: row,
      })),
    };
  }

  function rowsToSource(organization, employees, courses, roleObligations, requiredObligations, certificates) {
    const employeeRows = employees.map((row) => row.raw || {
      "Employee ID": row.employee_id,
      Nome: row.first_name,
      Cognome: row.last_name,
      Reparto: row.department,
      Mansione: row.job_title,
      "Role ID": row.role_id,
      "N. corsi richiesti": row.required_course_count,
    });
    const matrixRows = roleObligations.map((row) => row.raw || {});
    const requiredRows = requiredObligations.map((row) => row.raw || {});
    const certificateRows = certificates.map((row) => row.raw || {});
    return {
      meta: {
        productName: "Infinea AuditMate",
        pilotCompany: organization.name,
        scope: "Health & Safety Training Compliance",
        preparedAt: new Date().toISOString(),
        sourceFiles: {},
        notes: ["Database caricato da Supabase."],
      },
      employees: { sheetName: "Employee Registry", headers: [], rows: employeeRows },
      roleObligationMatrix: { sheetName: "Role Obligation Matrix", headers: [], rows: matrixRows },
      requiredObligations: { sheetName: "Required Obligations", headers: [], rows: requiredRows },
      certificateRepository: { sheetName: "Certificate Repository", headers: [], rows: certificateRows },
      quality: {
        employees: employeeRows.length,
        roles: new Set(employeeRows.map((row) => row["Role ID"])).size,
        requiredObligations: requiredRows.length,
        certificates: certificateRows.length,
        matrixRows: matrixRows.length,
        missingCertificateRows: [],
        unknownEmployeeInObligations: [],
        unknownEmployeeInCertificates: [],
        courses: courses.length,
      },
    };
  }

  function normalizeCode(value) {
    return String(value || "").trim().toUpperCase().replace(/\s+/g, "-");
  }

  function normalizeAccessEmail(value) {
    return String(value || "").trim().toLowerCase().toUpperCase();
  }

  function nullIfEmpty(value) {
    return value ? value : null;
  }

  function isExpired(session) {
    if (!session.expires_at) return false;
    return Date.now() > Number(session.expires_at) * 1000 - 60000;
  }

  function loadStoredAuthSession() {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveStoredAuthSession(session) {
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      // La sessione in memoria resta valida.
    }
  }

  function clearStoredAuthSession() {
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      // La sessione in memoria viene comunque rimossa.
    }
  }

  function ensureConfigured() {
    if (!hasConfig) {
      throw new Error("Supabase non configurato. Inserisci URL e anon key in supabase-config.js.");
    }
  }

  window.InfineaBackend = {
    isConfigured: hasConfig,
    getCurrentSession,
    signInManager,
    signInClient,
    signOut,
    listOrganizations,
    createOrganization,
    deleteOrganization,
    loadComplianceSource,
    saveComplianceSource,
    clearComplianceSource,
  };
})();
