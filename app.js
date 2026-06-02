(function () {
  "use strict";

  const source = window.INFINEA_COMPLIANCE_DATA;
  const LOCAL_UPLOAD_KEY = "infinea.auditmate.uploadedCertificates.v1";

  const icons = {
    dashboard:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h8V3H3v10Z"/><path d="M13 21h8V3h-8v18Z"/><path d="M3 21h8v-6H3v6Z"/></svg>',
    users:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    alert:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
    matrix:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>',
    report:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>',
    download:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
    copy:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8h12v12H8z"/><path d="M4 16V4h12"/></svg>',
    print:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>',
    upload:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>',
  };

  const titles = {
    dashboard: [
      "Dashboard compliance",
      "Stato calcolato da anagrafica, matrice obblighi e attestati.",
    ],
    employees: [
      "Dipendenti",
      "Vista per persona con stato compliance, gap e attestati collegati.",
    ],
    gaps: [
      "Gap & priorita",
      "Azioni ordinate per urgenza: scaduti, mancanti e attestati in scadenza.",
    ],
    upload: [
      "Carica attestato",
      "Registra i dati di un corso concluso e aggiorna subito lo stato compliance.",
    ],
    matrix: [
      "Matrice regole",
      "Regole ruolo-obbligo usate come fonte verificabile del calcolo.",
    ],
    report: [
      "Audit readiness report",
      "Sintesi esportabile per revisione interna, RSPP o consulente.",
    ],
  };

  const statusMeta = {
    valid: {
      label: "Valido",
      short: "Valido",
      badge: "badge-success",
      dot: "dot-success",
      color: "var(--success)",
    },
    due90: {
      label: "In scadenza 90g",
      short: "90g",
      badge: "badge-info",
      dot: "dot-warning",
      color: "var(--info)",
    },
    due60: {
      label: "In scadenza 60g",
      short: "60g",
      badge: "badge-warning",
      dot: "dot-warning",
      color: "var(--warning)",
    },
    due30: {
      label: "In scadenza 30g",
      short: "30g",
      badge: "badge-warning",
      dot: "dot-warning",
      color: "var(--warning)",
    },
    expired: {
      label: "Scaduto",
      short: "Scaduto",
      badge: "badge-danger",
      dot: "dot-danger",
      color: "var(--danger)",
    },
    missing: {
      label: "Mancante",
      short: "Mancante",
      badge: "badge-danger",
      dot: "dot-danger",
      color: "var(--danger)",
    },
    incomplete: {
      label: "Metadata incompleti",
      short: "Incompleto",
      badge: "badge-danger",
      dot: "dot-danger",
      color: "var(--danger)",
    },
  };

  const employeeStatusMeta = {
    compliant: {
      label: "Compliant",
      badge: "badge-success",
    },
    atRisk: {
      label: "Compliant con alert",
      badge: "badge-warning",
    },
    nonCompliant: {
      label: "Non compliant",
      badge: "badge-danger",
    },
  };

  const els = {};
  const state = {
    view: "dashboard",
    asOf: todayISO(),
    employeeSearch: "",
    employeeStatus: "all",
    employeeDepartment: "all",
    selectedEmployeeId: "",
    gapSearch: "",
    gapStatus: "critical",
    gapDepartment: "all",
    gapCategory: "all",
    uploadEmployeeId: "",
    uploadObligationId: "",
    uploadIssueDate: todayISO(),
    uploadExpiryDate: "",
    uploadTrainer: "",
    uploadFileName: "",
    uploadNote: "",
    uploadedCertificates: loadUploadedCertificates(),
    matrixSearch: "",
    model: null,
  };

  function init() {
    if (!source) {
      document.body.innerHTML =
        '<main class="main"><section class="empty"><div><h1>Dati non trovati</h1><p>Il file data/compliance-data.js non e stato caricato.</p></div></section></main>';
      return;
    }

    cacheElements();
    decorateIcons(document);
    initMeta();
    bindEvents();
    els.asOfDate.value = state.asOf;
    renderAll();
  }

  function cacheElements() {
    els.navItems = Array.from(document.querySelectorAll(".nav-item"));
    els.views = {
      dashboard: document.getElementById("dashboardView"),
      employees: document.getElementById("employeesView"),
      gaps: document.getElementById("gapsView"),
      upload: document.getElementById("uploadView"),
      matrix: document.getElementById("matrixView"),
      report: document.getElementById("reportView"),
    };
    els.viewTitle = document.getElementById("viewTitle");
    els.viewSubtitle = document.getElementById("viewSubtitle");
    els.asOfDate = document.getElementById("asOfDate");
    els.dataNotice = document.getElementById("dataNotice");
    els.quickReportBtn = document.getElementById("quickReportBtn");
    els.toast = document.getElementById("toast");
  }

  function initMeta() {
    document.getElementById("pilotCompany").textContent =
      source.meta.pilotCompany || "Azienda pilota";
    document.getElementById("dataStamp").textContent =
      "Preparato " + formatDate(source.meta.preparedAt.slice(0, 10));
  }

  function bindEvents() {
    els.navItems.forEach((button) => {
      button.addEventListener("click", () => {
        setView(button.dataset.view);
      });
    });

    els.asOfDate.addEventListener("change", (event) => {
      state.asOf = event.target.value || todayISO();
      renderAll();
    });

    els.quickReportBtn.addEventListener("click", () => {
      downloadGapsCsv();
    });

    document.addEventListener("input", (event) => {
      const key = event.target.dataset.filter;
      if (!key) return;
      updateFilterState(key, event.target.value);
      if (shouldRenderWhileTyping(key)) {
        renderCurrentViewPreservingFocus(event.target);
      }
    });

    document.addEventListener("change", (event) => {
      if (event.target.id === "uploadEvidenceFile") {
        state.uploadFileName = event.target.files[0] ? event.target.files[0].name : "";
        renderCurrentView();
        return;
      }
      const key = event.target.dataset.filter;
      if (!key) return;
      updateFilterState(key, event.target.value);
      renderCurrentView();
    });

    document.addEventListener("submit", (event) => {
      if (event.target.id !== "trainingUploadForm") return;
      event.preventDefault();
      registerTrainingCertificate();
    });

    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-action]");
      if (!target) return;

      const action = target.dataset.action;
      if (action === "select-employee") {
        state.selectedEmployeeId = target.dataset.employeeId;
        setView("employees");
        renderCurrentView();
      }
      if (action === "copy-evidence") {
        copyText(target.dataset.evidence || "");
      }
      if (action === "download-gaps") {
        downloadGapsCsv();
      }
      if (action === "download-summary") {
        downloadSummaryJson();
      }
      if (action === "print-report") {
        setView("report");
        window.print();
      }
      if (action === "view-gaps") {
        setView("gaps");
      }
      if (action === "start-upload") {
        startUploadFor(target.dataset.employeeId, target.dataset.obligationId);
      }
    });
  }

  function updateFilterState(key, value) {
    state[key] = value;
    if (key === "uploadEmployeeId") {
      state.uploadObligationId = "";
      state.uploadExpiryDate = "";
      state.uploadFileName = "";
    }
    if (key === "uploadObligationId" || key === "uploadIssueDate") {
      state.uploadExpiryDate = defaultExpiryForUpload();
    }
  }

  function shouldRenderWhileTyping(key) {
    return key === "employeeSearch" || key === "gapSearch" || key === "matrixSearch";
  }

  function renderCurrentViewPreservingFocus(target) {
    const key = target.dataset.filter;
    const selectionStart = target.selectionStart;
    const selectionEnd = target.selectionEnd;
    renderCurrentView();

    const next = els.views[state.view].querySelector(`[data-filter="${key}"]`);
    if (!next) return;

    next.focus({ preventScroll: true });
    if (
      typeof next.setSelectionRange === "function" &&
      selectionStart !== null &&
      selectionEnd !== null
    ) {
      next.setSelectionRange(selectionStart, selectionEnd);
    }
  }

  function setView(view) {
    state.view = view;
    els.navItems.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.view === view);
    });
    Object.entries(els.views).forEach(([key, node]) => {
      node.classList.toggle("is-active", key === view);
    });
    els.viewTitle.textContent = titles[view][0];
    els.viewSubtitle.textContent = titles[view][1];
    renderCurrentView();
  }

  function renderAll() {
    state.model = buildComplianceModel(state.asOf);
    renderNotice();
    renderCurrentView();
  }

  function renderCurrentView() {
    if (!state.model) state.model = buildComplianceModel(state.asOf);
    if (state.view === "dashboard") renderDashboard();
    if (state.view === "employees") renderEmployees();
    if (state.view === "gaps") renderGaps();
    if (state.view === "upload") renderUpload();
    if (state.view === "matrix") renderMatrix();
    if (state.view === "report") renderReport();
    decorateIcons(els.views[state.view]);
  }

  function renderNotice() {
    const model = state.model;
    const q = source.quality;
    const unknowns =
      q.unknownEmployeeInObligations.length + q.unknownEmployeeInCertificates.length;
    const localUploads = state.uploadedCertificates.length;
    els.dataNotice.innerHTML = `
      <span><strong>${q.employees}</strong> dipendenti, <strong>${q.requiredObligations}</strong> obblighi, <strong>${q.certificates + localUploads}</strong> attestati${localUploads ? `, inclusi <strong>${localUploads}</strong> caricati in questa sessione` : ""}. Calcolo alla data <strong>${formatDate(state.asOf)}</strong>.</span>
      <span>${unknowns === 0 ? "Dati coerenti: nessun ID dipendente fuori anagrafica." : `${unknowns} anomalie ID da verificare.`}</span>
    `;
  }

  function renderDashboard() {
    const model = state.model;
    const s = model.stats;
    const critical = s.expired + s.missing + s.incomplete;
    const readiness = percent(s.compliantToday, s.totalObligations);
    const cleanRate = percent(s.valid, s.totalObligations);
    const topDepartments = model.departmentStats
      .slice()
      .sort((a, b) => b.critical - a.critical || b.alerts - a.alerts)
      .slice(0, 6);
    const topUrgent = model.priorityList.slice(0, 8);

    els.views.dashboard.innerHTML = `
      <div class="grid grid-kpis">
        ${kpiCard("Audit readiness", `${readiness}%`, `${s.compliantToday}/${s.totalObligations} obblighi compliant oggi`, readiness, "success")}
        ${kpiCard("Senza alert", `${cleanRate}%`, `${s.valid}/${s.totalObligations} obblighi pienamente validi`, cleanRate, "info")}
        ${kpiCard("Criticita", String(critical), `${s.expired} scaduti, ${s.missing} mancanti`, percent(critical, s.totalObligations), "danger")}
        ${kpiCard("Alert scadenza", String(s.due30 + s.due60 + s.due90), `${s.due30} entro 30g, ${s.due60} entro 60g, ${s.due90} entro 90g`, percent(s.due30 + s.due60 + s.due90, s.totalObligations), "warning")}
      </div>

      <div class="grid grid-two" style="margin-top:16px">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Stato obblighi</h2>
              <p>Gli obblighi in scadenza sono ancora compliant oggi, ma generano alert operativi.</p>
            </div>
            <span class="badge ${readiness >= 75 ? "badge-success" : readiness >= 60 ? "badge-warning" : "badge-danger"}">${readiness}% readiness</span>
          </div>
          ${stackedBar([
            ["valid", s.valid],
            ["due90", s.due90],
            ["due60", s.due60],
            ["due30", s.due30],
            ["expired", s.expired],
            ["missing", s.missing + s.incomplete],
          ], s.totalObligations)}
          <div class="legend">
            ${legendItem("valid", `${s.valid} validi`)}
            ${legendItem("due30", `${s.due30 + s.due60 + s.due90} in scadenza`)}
            ${legendItem("expired", `${s.expired} scaduti`)}
            ${legendItem("missing", `${s.missing + s.incomplete} mancanti/incompleti`)}
          </div>
          <div class="mini-chart" style="margin-top:22px">
            ${topDepartments.map((dept) => barRow(dept.department, dept.critical + dept.alerts, Math.max(1, topDepartments[0].critical + topDepartments[0].alerts))).join("")}
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Priorita operative</h2>
              <p>Azioni da validare o pianificare per prime.</p>
            </div>
            <button class="button button-ghost" type="button" data-action="view-gaps">Vedi tutto</button>
          </div>
          <div class="priority-list">
            ${topUrgent.map(priorityItem).join("") || emptySmall("Nessuna priorita aperta.")}
          </div>
        </section>
      </div>

      <div class="grid grid-two" style="margin-top:16px">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Dipendenti per stato</h2>
              <p>Classificazione basata sugli obblighi assegnati a ciascun dipendente.</p>
            </div>
          </div>
          <div class="grid grid-three">
            ${employeeStatusCard("compliant", model.employeeStatusCounts.compliant)}
            ${employeeStatusCard("atRisk", model.employeeStatusCounts.atRisk)}
            ${employeeStatusCard("nonCompliant", model.employeeStatusCounts.nonCompliant)}
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Sintesi manageriale</h2>
              <p>Testo generato dai dati, utile come base del report.</p>
            </div>
          </div>
          ${managerSummary(model)}
        </section>
      </div>
    `;
  }

  function renderEmployees() {
    const model = state.model;
    const departments = unique(model.employees.map((employee) => employee.department));
    const filtered = model.employees
      .filter((employee) => {
        const aggregate = model.employeeMap.get(employee.id);
        const text = `${employee.id} ${employee.name} ${employee.surname} ${employee.department} ${employee.job}`.toLowerCase();
        return (
          text.includes(state.employeeSearch.toLowerCase()) &&
          (state.employeeStatus === "all" || aggregate.status === state.employeeStatus) &&
          (state.employeeDepartment === "all" || employee.department === state.employeeDepartment)
        );
      })
      .sort((a, b) => {
        const aa = model.employeeMap.get(a.id);
        const bb = model.employeeMap.get(b.id);
        return bb.critical - aa.critical || bb.alerts - aa.alerts || a.surname.localeCompare(b.surname);
      });

    if (!state.selectedEmployeeId && filtered.length) {
      state.selectedEmployeeId = filtered[0].id;
    }

    els.views.employees.innerHTML = `
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Registro dipendenti</h2>
            <p>${filtered.length} risultati filtrati su ${model.employees.length} dipendenti.</p>
          </div>
        </div>
        <div class="filters">
          <input data-filter="employeeSearch" value="${escapeAttr(state.employeeSearch)}" placeholder="Cerca nome, mansione, reparto..." />
          <select data-filter="employeeStatus">
            ${option("all", "Tutti gli stati", state.employeeStatus)}
            ${option("compliant", "Compliant", state.employeeStatus)}
            ${option("atRisk", "Compliant con alert", state.employeeStatus)}
            ${option("nonCompliant", "Non compliant", state.employeeStatus)}
          </select>
          <select data-filter="employeeDepartment">
            ${option("all", "Tutti i reparti", state.employeeDepartment)}
            ${departments.map((dept) => option(dept, dept, state.employeeDepartment)).join("")}
          </select>
          <button class="button" type="button" data-action="download-gaps">
            <span class="button-icon" data-icon="download"></span>
            CSV gap
          </button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Dipendente</th>
                <th>Reparto</th>
                <th>Mansione</th>
                <th>Obblighi</th>
                <th>Criticita</th>
                <th>Alert</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(employeeRow).join("")}
            </tbody>
          </table>
        </div>
      </section>
      ${renderEmployeeDetail()}
    `;
  }

  function renderEmployeeDetail() {
    const model = state.model;
    const aggregate = model.employeeMap.get(state.selectedEmployeeId);
    if (!aggregate) {
      return `<section class="empty detail-panel"><div><h2>Nessun dipendente selezionato</h2><p>Seleziona una riga per vedere il dettaglio degli obblighi.</p></div></section>`;
    }

    const urgent = aggregate.obligations
      .filter((item) => item.isCritical || item.isAlert)
      .sort(sortByPriority);

    return `
      <section class="panel detail-panel">
        <div class="panel-header">
          <div>
            <h2>${escapeHtml(aggregate.employee.name)} ${escapeHtml(aggregate.employee.surname)}</h2>
            <p>${escapeHtml(aggregate.employee.department)} - ${escapeHtml(aggregate.employee.job)} - ${escapeHtml(aggregate.employee.roleId)}</p>
          </div>
          ${employeeBadge(aggregate.status)}
        </div>
        <div class="detail-grid">
          ${detailStat(aggregate.obligations.length, "Obblighi richiesti")}
          ${detailStat(aggregate.valid, "Validi")}
          ${detailStat(aggregate.alerts, "Alert scadenza")}
          ${detailStat(aggregate.critical, "Criticita")}
        </div>
        <div class="table-wrap" style="margin-top:16px">
          <table>
            <thead>
              <tr>
                <th>Obbligo</th>
                <th>Categoria</th>
                <th>Scadenza</th>
                <th>Stato</th>
                <th>Motivo</th>
                <th>Evidenza</th>
              </tr>
            </thead>
            <tbody>
              ${aggregate.obligations
                .sort(sortByPriority)
                .map(obligationDetailRow)
                .join("")}
            </tbody>
          </table>
        </div>
        ${
          urgent.length
            ? `<div class="manager-summary" style="margin-top:14px"><p><strong>Spiegazione gap:</strong> ${escapeHtml(explainEmployeeGap(aggregate))}</p></div>`
            : ""
        }
      </section>
    `;
  }

  function renderGaps() {
    const model = state.model;
    const departments = unique(model.employees.map((employee) => employee.department));
    const categories = unique(model.obligations.map((item) => item.category));
    const rows = model.obligations
      .filter((item) => {
        const text = `${item.id} ${item.employeeName} ${item.department} ${item.job} ${item.courseName} ${item.category}`.toLowerCase();
        const statusOk =
          state.gapStatus === "all" ||
          (state.gapStatus === "critical" && item.isCritical) ||
          (state.gapStatus === "alerts" && item.isAlert) ||
          item.status === state.gapStatus;
        return (
          text.includes(state.gapSearch.toLowerCase()) &&
          statusOk &&
          (state.gapDepartment === "all" || item.department === state.gapDepartment) &&
          (state.gapCategory === "all" || item.category === state.gapCategory)
        );
      })
      .sort(sortByPriority);

    els.views.gaps.innerHTML = `
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Gap list</h2>
            <p>${rows.length} righe in vista. La compliance e verificabile per Required Obligation ID.</p>
          </div>
          <button class="button button-primary" type="button" data-action="download-gaps">
            <span class="button-icon" data-icon="download"></span>
            Scarica CSV
          </button>
        </div>
        <div class="filters">
          <input data-filter="gapSearch" value="${escapeAttr(state.gapSearch)}" placeholder="Cerca dipendente, corso, reparto..." />
          <select data-filter="gapStatus">
            ${option("critical", "Solo criticita", state.gapStatus)}
            ${option("alerts", "Solo alert", state.gapStatus)}
            ${option("all", "Tutti", state.gapStatus)}
            ${option("expired", "Scaduti", state.gapStatus)}
            ${option("missing", "Mancanti", state.gapStatus)}
            ${option("due30", "Scadenza 30g", state.gapStatus)}
            ${option("due60", "Scadenza 60g", state.gapStatus)}
            ${option("due90", "Scadenza 90g", state.gapStatus)}
          </select>
          <select data-filter="gapDepartment">
            ${option("all", "Tutti i reparti", state.gapDepartment)}
            ${departments.map((dept) => option(dept, dept, state.gapDepartment)).join("")}
          </select>
          <select data-filter="gapCategory">
            ${option("all", "Tutte le categorie", state.gapCategory)}
            ${categories.map((cat) => option(cat, cat, state.gapCategory)).join("")}
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Priorita</th>
                <th>Dipendente</th>
                <th>Obbligo</th>
                <th>Reparto</th>
                <th>Scadenza</th>
                <th>Stato</th>
                <th>Motivo</th>
                <th>Evidenza</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(gapRow).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderUpload() {
    const model = state.model;
    const candidates = model.employeeAggregates
      .filter((item) => item.critical > 0)
      .sort((a, b) => b.critical - a.critical || a.employee.surname.localeCompare(b.employee.surname));

    if (!candidates.length) {
      els.views.upload.innerHTML = `
        <section class="empty">
          <div>
            <h2>Nessun dipendente non compliant</h2>
            <p>Alla data ${formatDate(state.asOf)} non ci sono obblighi critici da sanare.</p>
          </div>
        </section>
        ${renderUploadHistory()}
      `;
      return;
    }

    if (!state.uploadEmployeeId || !candidates.some((item) => item.employee.id === state.uploadEmployeeId)) {
      state.uploadEmployeeId = candidates[0].employee.id;
      state.uploadObligationId = "";
      state.uploadExpiryDate = "";
    }

    const selected = model.employeeMap.get(state.uploadEmployeeId);
    const openObligations = selected.obligations.filter((item) => item.isCritical).sort(sortByPriority);
    if (!state.uploadObligationId || !openObligations.some((item) => item.id === state.uploadObligationId)) {
      state.uploadObligationId = openObligations[0] ? openObligations[0].id : "";
      state.uploadExpiryDate = "";
    }
    if (!state.uploadIssueDate) state.uploadIssueDate = todayISO();
    if (!state.uploadExpiryDate) state.uploadExpiryDate = defaultExpiryForUpload();

    const selectedObligation = openObligations.find((item) => item.id === state.uploadObligationId);
    const preview = selectedObligation ? previewUploadedStatus(selectedObligation) : null;

    els.views.upload.innerHTML = `
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Registrazione corso concluso</h2>
            <p>Seleziona un dipendente non compliant, collega il corso all obbligo aperto e registra il nuovo attestato.</p>
          </div>
          <span class="badge badge-neutral">${candidates.length} dipendenti da sanare</span>
        </div>

        <div class="upload-layout">
          <form class="upload-form" id="trainingUploadForm">
            <div class="form-grid">
              <label class="form-field form-field-wide">
                <span>Dipendente non compliant</span>
                <select data-filter="uploadEmployeeId" required>
                  ${candidates
                    .map((item) =>
                      option(
                        item.employee.id,
                        `${item.employee.surname} ${item.employee.name} - ${item.employee.department} (${item.critical} criticita)`,
                        state.uploadEmployeeId
                      )
                    )
                    .join("")}
                </select>
              </label>

              <label class="form-field form-field-wide">
                <span>Obbligo da sanare</span>
                <select data-filter="uploadObligationId" required>
                  ${openObligations
                    .map((item) => option(item.id, `${item.courseName} - ${statusMeta[item.status].label}`, state.uploadObligationId))
                    .join("")}
                </select>
              </label>

              <label class="form-field">
                <span>Data conclusione corso</span>
                <input type="date" data-filter="uploadIssueDate" value="${escapeAttr(state.uploadIssueDate)}" required />
              </label>

              <label class="form-field">
                <span>Data scadenza attestato</span>
                <input type="date" data-filter="uploadExpiryDate" value="${escapeAttr(state.uploadExpiryDate)}" required />
              </label>

              <label class="form-field">
                <span>Ente formatore</span>
                <input data-filter="uploadTrainer" value="${escapeAttr(state.uploadTrainer)}" placeholder="Es. Safety Academy" />
              </label>

              <label class="form-field">
                <span>Documento evidenza</span>
                <input id="uploadEvidenceFile" type="file" accept=".pdf,.jpg,.jpeg,.png" />
              </label>

              <label class="form-field form-field-wide">
                <span>Note validazione</span>
                <input data-filter="uploadNote" value="${escapeAttr(state.uploadNote)}" placeholder="Es. dati verificati da HR/HSE" />
              </label>
            </div>

            <div class="upload-actions">
              <button class="button button-primary" type="submit">
                <span class="button-icon" data-icon="upload"></span>
                Registra attestato
              </button>
              <span class="muted">${state.uploadFileName ? `File selezionato: ${escapeHtml(state.uploadFileName)}` : "Il documento e opzionale in questo MVP; viene salvato il nome file."}</span>
            </div>
          </form>

          <aside class="upload-preview">
            <h3>Anteprima ricalcolo</h3>
            ${selectedObligation ? uploadPreviewCard(selected, selectedObligation, preview) : emptySmall("Nessun obbligo critico selezionabile.")}
          </aside>
        </div>
      </section>
      ${renderUploadHistory()}
    `;
  }

  function renderUploadHistory() {
    const rows = state.uploadedCertificates.slice().reverse();
    return `
      <section class="panel detail-panel">
        <div class="panel-header">
          <div>
            <h2>Attestati caricati in questa sessione</h2>
            <p>Questi record sono salvati nel browser e usati dal motore compliance dell MVP.</p>
          </div>
          <span class="badge badge-neutral">${rows.length} caricamenti</span>
        </div>
        ${
          rows.length
            ? `<div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Certificate ID</th>
                      <th>Dipendente</th>
                      <th>Corso</th>
                      <th>Rilascio</th>
                      <th>Scadenza</th>
                      <th>Evidenza</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows
                      .map(
                        (row) => `
                          <tr>
                            <td><strong>${escapeHtml(row.id)}</strong></td>
                            <td>${escapeHtml(row.employeeName)}</td>
                            <td>${escapeHtml(row.courseName)}</td>
                            <td>${formatDate(row.issueDate)}</td>
                            <td>${formatDate(row.expiryDate)}</td>
                            <td>${escapeHtml(row.evidenceFile || "n.d.")}</td>
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>`
            : emptySmall("Nessun attestato registrato manualmente.")
        }
      </section>
    `;
  }

  function uploadPreviewCard(selected, obligation, preview) {
    const afterBadge = preview ? statusBadge(preview.status) : '<span class="badge badge-neutral">Da completare</span>';
    return `
      <div class="upload-preview-card">
        <p><strong>Dipendente:</strong> ${escapeHtml(selected.employee.name)} ${escapeHtml(selected.employee.surname)}</p>
        <p><strong>Mansione:</strong> ${escapeHtml(selected.employee.job)}</p>
        <p><strong>Obbligo:</strong> ${escapeHtml(obligation.courseName)}</p>
        <p><strong>Stato attuale:</strong> ${statusBadge(obligation.status)}</p>
        <p><strong>Stato dopo caricamento:</strong> ${afterBadge}</p>
        <p><strong>Scadenza proposta:</strong> ${formatDate(state.uploadExpiryDate)}</p>
        <p class="muted">La fonte regolatoria resta la matrice ruolo-obbligo; questo caricamento aggiorna solo l evidenza collegata all obbligo selezionato.</p>
      </div>
    `;
  }

  function renderMatrix() {
    const model = state.model;
    const roleCounts = countBy(model.employees, "roleId");
    const rows = model.matrix
      .filter((item) => {
        const text = `${item.roleId} ${item.department} ${item.job} ${item.courseName} ${item.category} ${item.riskProfile}`.toLowerCase();
        return text.includes(state.matrixSearch.toLowerCase());
      })
      .sort((a, b) => a.roleId.localeCompare(b.roleId) || a.courseName.localeCompare(b.courseName));

    const courses = unique(model.matrix.map((row) => row.courseId)).length;

    els.views.matrix.innerHTML = `
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Matrice ruolo-obbligo</h2>
            <p>${rows.length} regole in vista su ${model.matrix.length}. ${courses} corsi distinti.</p>
          </div>
        </div>
        <div class="filters compact">
          <input data-filter="matrixSearch" value="${escapeAttr(state.matrixSearch)}" placeholder="Cerca ruolo, mansione, corso, rischio..." />
          <span class="badge badge-neutral">${model.stats.roles} ruoli</span>
          <span class="badge badge-neutral">${courses} corsi</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Role ID</th>
                <th>Reparto</th>
                <th>Mansione</th>
                <th>Dipendenti</th>
                <th>Course ID</th>
                <th>Corso obbligatorio</th>
                <th>Categoria</th>
                <th>Rinnovo</th>
                <th>Rischio</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (row) => `
                    <tr>
                      <td><strong>${escapeHtml(row.roleId)}</strong></td>
                      <td>${escapeHtml(row.department)}</td>
                      <td>${escapeHtml(row.job)}</td>
                      <td>${roleCounts[row.roleId] || 0}</td>
                      <td>${escapeHtml(row.courseId)}</td>
                      <td>${escapeHtml(row.courseName)}</td>
                      <td>${escapeHtml(row.category)}</td>
                      <td>${escapeHtml(String(row.renewalMonths || ""))} mesi</td>
                      <td><span class="badge badge-neutral">${escapeHtml(row.riskProfile || "n.d.")}</span></td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderReport() {
    const model = state.model;
    const s = model.stats;
    const critical = s.expired + s.missing + s.incomplete;
    const readiness = percent(s.compliantToday, s.totalObligations);
    const topUrgent = model.priorityList.slice(0, 10);

    els.views.report.innerHTML = `
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Report pronto per audit</h2>
            <p>Usa stampa per salvare in PDF oppure esporta le righe gap in CSV.</p>
          </div>
          <div class="report-actions">
            <button class="button" type="button" data-action="print-report">
              <span class="button-icon" data-icon="print"></span>
              Stampa / PDF
            </button>
            <button class="button" type="button" data-action="download-gaps">
              <span class="button-icon" data-icon="download"></span>
              CSV gap
            </button>
            <button class="button" type="button" data-action="download-summary">
              <span class="button-icon" data-icon="download"></span>
              JSON sintesi
            </button>
          </div>
        </div>

        <article class="report-sheet" id="reportContent">
          <div class="report-title">
            <div>
              <h2>${escapeHtml(source.meta.productName)} - Audit Readiness Report</h2>
              <p class="muted">${escapeHtml(source.meta.pilotCompany)} | ${escapeHtml(source.meta.scope)} | Data controllo: ${formatDate(state.asOf)}</p>
            </div>
            <span class="badge ${readiness >= 75 ? "badge-success" : readiness >= 60 ? "badge-warning" : "badge-danger"}">${readiness}% readiness</span>
          </div>

          <div class="grid grid-three">
            ${detailStat(s.totalEmployees, "Dipendenti mappati")}
            ${detailStat(s.totalObligations, "Obblighi richiesti")}
            ${detailStat(critical, "Criticita aperte")}
          </div>

          <section class="report-section">
            <h3>Sintesi</h3>
            ${managerSummary(model)}
          </section>

          <section class="report-section">
            <h3>Metriche principali</h3>
            <ul>
              <li>${s.compliantToday} obblighi risultano compliant alla data di controllo.</li>
              <li>${s.valid} obblighi sono pienamente validi senza alert di scadenza.</li>
              <li>${s.expired} attestati sono scaduti e ${s.missing} obblighi non hanno attestato presente.</li>
              <li>${s.due30 + s.due60 + s.due90} attestati richiedono monitoraggio entro 90 giorni.</li>
            </ul>
          </section>

          <section class="report-section">
            <h3>Prime priorita</h3>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Dipendente</th>
                    <th>Obbligo</th>
                    <th>Stato</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  ${topUrgent
                    .map(
                      (item) => `
                        <tr>
                          <td>${escapeHtml(item.id)}</td>
                          <td>${escapeHtml(item.employeeName)}</td>
                          <td>${escapeHtml(item.courseName)}</td>
                          <td>${statusBadge(item.status)}</td>
                          <td>${escapeHtml(item.reason)}</td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </section>

          <section class="report-section">
            <h3>Nota metodologica</h3>
            <p class="muted">Il calcolo usa regole verificabili: dipendente, ruolo, mansione, matrice ruolo-obblighi, attestati disponibili e date di scadenza. L AI e prevista come acceleratore operativo per estrazione e spiegazione, non come fonte autonoma della compliance.</p>
          </section>
        </article>
      </section>
    `;
  }

  function buildComplianceModel(asOfISO) {
    const asOf = parseISODate(asOfISO);
    const employees = source.employees.rows.map((row) => ({
      id: row["Employee ID"],
      name: row.Nome,
      surname: row.Cognome,
      department: row.Reparto,
      job: row.Mansione,
      roleId: row["Role ID"],
      requiredCourseCount: Number(row["N. corsi richiesti"] || 0),
    }));

    const employeeById = new Map(employees.map((employee) => [employee.id, employee]));

    const matrix = source.roleObligationMatrix.rows.map((row) => ({
      id: row["Matrix Row ID"],
      roleId: row["Role ID"],
      department: row.Reparto,
      job: row.Mansione,
      courseId: row["Course ID"],
      courseName: row["Corso obbligatorio"],
      category: row["Categoria corso"],
      renewalMonths: Number(row["Rinnovo mesi"] || 0),
      riskProfile: row["Profilo rischio corso"],
    }));

    const sourceCertificates = source.certificateRepository.rows.map((row) => ({
      id: row["Certificate ID"],
      obligationId: row["Required Obligation ID"],
      employeeId: row["Employee ID"],
      courseId: row["Course ID"],
      courseName: row["Corso obbligatorio"],
      presence: row["Certificate Presence"],
      issueDate: row["Issue Date"],
      expiryDate: row["Expiry Date"],
      evidenceFile: row["Evidence File"],
      source: "excel",
    }));
    const certificates = sourceCertificates.concat(
      state.uploadedCertificates.map((row) => ({
        id: row.id,
        obligationId: row.obligationId,
        employeeId: row.employeeId,
        courseId: row.courseId,
        courseName: row.courseName,
        presence: "Present",
        issueDate: row.issueDate,
        expiryDate: row.expiryDate,
        evidenceFile: row.evidenceFile,
        source: "manual",
      }))
    );

    const certByObligation = groupBy(certificates, "obligationId");

    const obligations = source.requiredObligations.rows.map((row) => {
      const employee = employeeById.get(row["Employee ID"]) || {};
      const item = {
        id: row["Required Obligation ID"],
        employeeId: row["Employee ID"],
        employeeName: [row.Nome || employee.name, row.Cognome || employee.surname]
          .filter(Boolean)
          .join(" "),
        department: row.Reparto || employee.department || "n.d.",
        job: row.Mansione || employee.job || "n.d.",
        roleId: row["Role ID"] || employee.roleId || "n.d.",
        courseId: row["Course ID"],
        courseName: row["Corso obbligatorio"],
        category: row["Categoria corso"] || "n.d.",
        renewalMonths: Number(row["Rinnovo mesi"] || 0),
        riskProfile: row["Profilo rischio corso"] || "n.d.",
        control: row.Controllo || "",
      };

      const presentCertificates = (certByObligation[item.id] || []).filter((certificate) =>
        String(certificate.presence || "").toLowerCase().includes("present")
      );
      const bestCertificate = presentCertificates
        .slice()
        .sort((a, b) => {
          const ad = parseISODate(a.expiryDate);
          const bd = parseISODate(b.expiryDate);
          return bd.getTime() - ad.getTime();
        })[0];

      return attachStatus(item, bestCertificate, asOf);
    });

    const employeeGroups = groupBy(obligations, "employeeId");
    const employeeAggregates = employees.map((employee) => {
      const rows = employeeGroups[employee.id] || [];
      const critical = rows.filter((item) => item.isCritical).length;
      const alerts = rows.filter((item) => item.isAlert).length;
      const valid = rows.filter((item) => item.status === "valid").length;
      const status = critical > 0 ? "nonCompliant" : alerts > 0 ? "atRisk" : "compliant";
      return {
        employee,
        status,
        obligations: rows,
        critical,
        alerts,
        valid,
      };
    });

    const employeeMap = new Map(employeeAggregates.map((item) => [item.employee.id, item]));
    const stats = buildStats(employees, obligations);
    const departmentStats = buildDepartmentStats(employeeAggregates);

    return {
      asOfISO,
      asOf,
      employees,
      obligations,
      certificates,
      matrix,
      employeeAggregates,
      employeeMap,
      employeeStatusCounts: countEmployeeStatuses(employeeAggregates),
      stats,
      departmentStats,
      priorityList: obligations.filter((item) => item.isCritical || item.isAlert).sort(sortByPriority),
    };
  }

  function attachStatus(item, certificate, asOf) {
    if (!certificate) {
      return {
        ...item,
        certificate: null,
        status: "missing",
        daysLeft: null,
        expiryDate: "",
        evidenceFile: "",
        isCritical: true,
        isAlert: false,
        reason: "Nessun attestato presente per l obbligo richiesto.",
      };
    }

    const expiry = parseISODate(certificate.expiryDate);
    if (!certificate.expiryDate || Number.isNaN(expiry.getTime())) {
      return {
        ...item,
        certificate,
        status: "incomplete",
        daysLeft: null,
        expiryDate: certificate.expiryDate || "",
        evidenceFile: certificate.evidenceFile || "",
        isCritical: true,
        isAlert: false,
        reason: "Attestato presente ma data scadenza non valorizzata.",
      };
    }

    const daysLeft = daysBetween(asOf, expiry);
    let status = "valid";
    if (daysLeft < 0) status = "expired";
    else if (daysLeft <= 30) status = "due30";
    else if (daysLeft <= 60) status = "due60";
    else if (daysLeft <= 90) status = "due90";

    const isCritical = status === "expired";
    const isAlert = status === "due30" || status === "due60" || status === "due90";
    return {
      ...item,
      certificate,
      status,
      daysLeft,
      expiryDate: certificate.expiryDate,
      evidenceFile: certificate.evidenceFile || "",
      isCritical,
      isAlert,
      reason: reasonForStatus(status, daysLeft, certificate.expiryDate),
    };
  }

  function reasonForStatus(status, daysLeft, expiryDate) {
    if (status === "valid") return "Attestato presente e valido oltre 90 giorni.";
    if (status === "due90") return `Attestato valido ma in scadenza tra ${daysLeft} giorni.`;
    if (status === "due60") return `Attestato valido ma in scadenza tra ${daysLeft} giorni.`;
    if (status === "due30") return `Attestato valido ma in scadenza tra ${daysLeft} giorni.`;
    if (status === "expired") return `Attestato scaduto il ${formatDate(expiryDate)}.`;
    return "Da verificare.";
  }

  function buildStats(employees, obligations) {
    const counts = countBy(obligations, "status");
    const critical = (counts.expired || 0) + (counts.missing || 0) + (counts.incomplete || 0);
    return {
      totalEmployees: employees.length,
      roles: unique(employees.map((employee) => employee.roleId)).length,
      totalObligations: obligations.length,
      compliantToday: obligations.length - critical,
      valid: counts.valid || 0,
      due30: counts.due30 || 0,
      due60: counts.due60 || 0,
      due90: counts.due90 || 0,
      expired: counts.expired || 0,
      missing: counts.missing || 0,
      incomplete: counts.incomplete || 0,
    };
  }

  function buildDepartmentStats(employeeAggregates) {
    const map = new Map();
    employeeAggregates.forEach((item) => {
      const key = item.employee.department || "n.d.";
      if (!map.has(key)) {
        map.set(key, {
          department: key,
          employees: 0,
          compliant: 0,
          atRisk: 0,
          nonCompliant: 0,
          critical: 0,
          alerts: 0,
        });
      }
      const row = map.get(key);
      row.employees += 1;
      row[item.status] += 1;
      row.critical += item.critical;
      row.alerts += item.alerts;
    });
    return Array.from(map.values()).sort((a, b) => a.department.localeCompare(b.department));
  }

  function countEmployeeStatuses(employeeAggregates) {
    return employeeAggregates.reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      { compliant: 0, atRisk: 0, nonCompliant: 0 }
    );
  }

  function sortByPriority(a, b) {
    const rank = {
      expired: 1,
      missing: 2,
      incomplete: 3,
      due30: 4,
      due60: 5,
      due90: 6,
      valid: 7,
    };
    const ar = rank[a.status] || 99;
    const br = rank[b.status] || 99;
    if (ar !== br) return ar - br;
    if (a.daysLeft === null && b.daysLeft !== null) return 1;
    if (a.daysLeft !== null && b.daysLeft === null) return -1;
    return (a.daysLeft || 0) - (b.daysLeft || 0);
  }

  function kpiCard(label, value, note, progress, tone) {
    const dot = tone === "danger" ? "dot-danger" : tone === "warning" ? "dot-warning" : "dot-success";
    const fill =
      tone === "danger" ? "var(--danger)" : tone === "warning" ? "var(--warning)" : tone === "info" ? "var(--info)" : "var(--success)";
    return `
      <article class="card kpi">
        <div class="kpi-top">
          <span class="kpi-label">${escapeHtml(label)}</span>
          <span class="status-dot ${dot}"></span>
        </div>
        <strong class="kpi-value">${escapeHtml(value)}</strong>
        <p class="kpi-note">${escapeHtml(note)}</p>
        <div class="progress-track" aria-hidden="true">
          <div class="progress-fill" style="width:${clamp(progress, 0, 100)}%; background:${fill}"></div>
        </div>
      </article>
    `;
  }

  function stackedBar(parts, total) {
    return `
      <div class="stacked-bar" aria-label="Distribuzione stato obblighi">
        ${parts
          .filter(([, value]) => value > 0)
          .map(
            ([status, value]) => `
              <span class="stacked-part" title="${escapeAttr(statusMeta[status].label)}: ${value}" style="width:${percent(value, total)}%; background:${statusMeta[status].color}"></span>
            `
          )
          .join("")}
      </div>
    `;
  }

  function legendItem(status, text) {
    return `
      <span class="legend-item">
        <span class="status-dot ${statusMeta[status].dot}"></span>
        ${escapeHtml(text)}
      </span>
    `;
  }

  function employeeStatusCard(status, value) {
    const meta = employeeStatusMeta[status];
    return `
      <article class="detail-stat">
        <strong>${value}</strong>
        <span>${escapeHtml(meta.label)}</span>
      </article>
    `;
  }

  function priorityItem(item) {
    return `
      <article class="priority-item">
        <div>
          <strong>${escapeHtml(item.employeeName)}</strong>
          <span>${escapeHtml(item.courseName)} - ${escapeHtml(item.department)}</span>
        </div>
        <div class="priority-meta">
          ${statusBadge(item.status)}
          ${
            item.isCritical
              ? `<button class="button button-ghost" type="button" data-action="start-upload" data-employee-id="${escapeAttr(item.employeeId)}" data-obligation-id="${escapeAttr(item.id)}">Carica</button>`
              : ""
          }
          <button class="button button-ghost" type="button" data-action="select-employee" data-employee-id="${escapeAttr(item.employeeId)}">Apri</button>
        </div>
      </article>
    `;
  }

  function managerSummary(model) {
    const s = model.stats;
    const readiness = percent(s.compliantToday, s.totalObligations);
    const critical = s.expired + s.missing + s.incomplete;
    const firstDept = model.departmentStats
      .slice()
      .sort((a, b) => b.critical - a.critical || b.alerts - a.alerts)[0];
    const firstPriority = model.priorityList[0];

    return `
      <div class="manager-summary">
        <p><strong>Readiness attuale:</strong> ${readiness}% degli obblighi risulta compliant alla data ${formatDate(model.asOfISO)}.</p>
        <p><strong>Criticita aperte:</strong> ${critical} obblighi richiedono intervento per attestati scaduti, mancanti o incompleti.</p>
        <p><strong>Alert:</strong> ${s.due30 + s.due60 + s.due90} attestati sono validi oggi ma da monitorare entro 90 giorni.</p>
        ${
          firstDept
            ? `<p><strong>Area piu esposta:</strong> ${escapeHtml(firstDept.department)} con ${firstDept.critical} criticita e ${firstDept.alerts} alert.</p>`
            : ""
        }
        ${
          firstPriority
            ? `<p><strong>Prima azione:</strong> verificare ${escapeHtml(firstPriority.employeeName)} per ${escapeHtml(firstPriority.courseName)} (${escapeHtml(statusMeta[firstPriority.status].label)}).</p>`
            : ""
        }
      </div>
    `;
  }

  function employeeRow(employee) {
    const aggregate = state.model.employeeMap.get(employee.id);
    return `
      <tr>
        <td>
          <button class="row-button" type="button" data-action="select-employee" data-employee-id="${escapeAttr(employee.id)}">
            ${escapeHtml(employee.name)} ${escapeHtml(employee.surname)}
          </button>
          <div class="muted">${escapeHtml(employee.id)} - ${escapeHtml(employee.roleId)}</div>
        </td>
        <td>${escapeHtml(employee.department)}</td>
        <td>${escapeHtml(employee.job)}</td>
        <td>${aggregate.obligations.length}</td>
        <td>${aggregate.critical}</td>
        <td>${aggregate.alerts}</td>
        <td>${employeeBadge(aggregate.status)}</td>
      </tr>
    `;
  }

  function obligationDetailRow(item) {
    return `
      <tr>
        <td>
          <strong>${escapeHtml(item.courseName)}</strong>
          <div class="muted">${escapeHtml(item.id)} - ${escapeHtml(item.courseId)}</div>
        </td>
        <td>${escapeHtml(item.category)}</td>
        <td class="nowrap">${item.expiryDate ? formatDate(item.expiryDate) : "n.d."}</td>
        <td>${statusBadge(item.status)}</td>
        <td>${escapeHtml(item.reason)}</td>
        <td>${gapActions(item)}</td>
      </tr>
    `;
  }

  function gapRow(item) {
    return `
      <tr>
        <td>${priorityLabel(item)}</td>
        <td>
          <button class="row-button" type="button" data-action="select-employee" data-employee-id="${escapeAttr(item.employeeId)}">
            ${escapeHtml(item.employeeName)}
          </button>
          <div class="muted">${escapeHtml(item.employeeId)} - ${escapeHtml(item.job)}</div>
        </td>
        <td>
          <strong>${escapeHtml(item.courseName)}</strong>
          <div class="muted">${escapeHtml(item.id)} - ${escapeHtml(item.courseId)}</div>
        </td>
        <td>${escapeHtml(item.department)}</td>
        <td class="nowrap">${item.expiryDate ? formatDate(item.expiryDate) : "n.d."}</td>
        <td>${statusBadge(item.status)}</td>
        <td>${escapeHtml(item.reason)}</td>
        <td>${gapActions(item)}</td>
      </tr>
    `;
  }

  function detailStat(value, label) {
    return `
      <article class="detail-stat">
        <strong>${escapeHtml(String(value))}</strong>
        <span>${escapeHtml(label)}</span>
      </article>
    `;
  }

  function barRow(label, value, max) {
    return `
      <div class="bar-row">
        <strong title="${escapeAttr(label)}">${escapeHtml(label)}</strong>
        <div class="progress-track">
          <div class="progress-fill" style="width:${percent(value, max)}%; background:var(--warning)"></div>
        </div>
        <span>${value}</span>
      </div>
    `;
  }

  function priorityLabel(item) {
    if (item.status === "expired") return '<span class="badge badge-danger">1 Scaduto</span>';
    if (item.status === "missing") return '<span class="badge badge-danger">2 Mancante</span>';
    if (item.status === "incomplete") return '<span class="badge badge-danger">3 Metadata</span>';
    if (item.status === "due30") return '<span class="badge badge-warning">4 Entro 30g</span>';
    if (item.status === "due60") return '<span class="badge badge-warning">5 Entro 60g</span>';
    if (item.status === "due90") return '<span class="badge badge-info">6 Entro 90g</span>';
    return '<span class="badge badge-success">Valido</span>';
  }

  function statusBadge(status) {
    const meta = statusMeta[status] || statusMeta.incomplete;
    return `<span class="badge ${meta.badge}">${escapeHtml(meta.label)}</span>`;
  }

  function employeeBadge(status) {
    const meta = employeeStatusMeta[status] || employeeStatusMeta.nonCompliant;
    return `<span class="badge ${meta.badge}">${escapeHtml(meta.label)}</span>`;
  }

  function evidenceButton(path) {
    if (!path) return '<span class="muted">Non presente</span>';
    return `
      <button class="button button-ghost" type="button" data-action="copy-evidence" data-evidence="${escapeAttr(path)}" title="${escapeAttr(path)}">
        <span class="button-icon" data-icon="copy"></span>
        Copia path
      </button>
    `;
  }

  function gapActions(item) {
    const upload = item.isCritical
      ? `<button class="button button-ghost" type="button" data-action="start-upload" data-employee-id="${escapeAttr(item.employeeId)}" data-obligation-id="${escapeAttr(item.id)}">
          <span class="button-icon" data-icon="upload"></span>
          Carica
        </button>`
      : "";
    const evidence = item.evidenceFile ? evidenceButton(item.evidenceFile) : "";
    return upload || evidence || '<span class="muted">Non presente</span>';
  }

  function explainEmployeeGap(aggregate) {
    const first = aggregate.obligations.filter((item) => item.isCritical || item.isAlert).sort(sortByPriority)[0];
    if (!first) return "Il dipendente non presenta gap aperti alla data di controllo.";
    if (first.status === "missing") {
      return `${aggregate.employee.name} ${aggregate.employee.surname} risulta non compliant perche la mansione ${aggregate.employee.job} richiede ${first.courseName}, ma non esiste un attestato presente collegato all obbligo ${first.id}.`;
    }
    if (first.status === "expired") {
      return `${aggregate.employee.name} ${aggregate.employee.surname} risulta non compliant perche l obbligo ${first.courseName} e coperto da un attestato scaduto il ${formatDate(first.expiryDate)}.`;
    }
    return `${aggregate.employee.name} ${aggregate.employee.surname} e compliant oggi, ma l attestato ${first.courseName} andra gestito prima della scadenza del ${formatDate(first.expiryDate)}.`;
  }

  function startUploadFor(employeeId, obligationId) {
    state.uploadEmployeeId = employeeId || "";
    state.uploadObligationId = obligationId || "";
    state.uploadIssueDate = todayISO();
    state.uploadExpiryDate = defaultExpiryForUpload();
    state.uploadFileName = "";
    setView("upload");
  }

  function registerTrainingCertificate() {
    const obligation = state.model.obligations.find((item) => item.id === state.uploadObligationId);
    const aggregate = state.model.employeeMap.get(state.uploadEmployeeId);
    if (!obligation || !aggregate) {
      showToast("Seleziona dipendente e obbligo prima di salvare.");
      return;
    }
    if (!state.uploadIssueDate || !state.uploadExpiryDate) {
      showToast("Inserisci data corso e data scadenza.");
      return;
    }

    const certificateId = nextManualCertificateId();
    const evidenceFile =
      state.uploadFileName ||
      `repo/certificates/${certificateId}_${obligation.employeeId}_${obligation.courseId}.pdf`;
    const certificate = {
      id: certificateId,
      obligationId: obligation.id,
      employeeId: obligation.employeeId,
      employeeName: obligation.employeeName,
      department: obligation.department,
      job: obligation.job,
      roleId: obligation.roleId,
      courseId: obligation.courseId,
      courseName: obligation.courseName,
      renewalMonths: obligation.renewalMonths,
      issueDate: state.uploadIssueDate,
      expiryDate: state.uploadExpiryDate,
      evidenceFile,
      trainer: state.uploadTrainer,
      note: state.uploadNote,
      createdAt: new Date().toISOString(),
    };

    state.uploadedCertificates.push(certificate);
    saveUploadedCertificates();
    state.selectedEmployeeId = obligation.employeeId;
    state.uploadObligationId = "";
    state.uploadExpiryDate = "";
    state.uploadFileName = "";
    state.uploadNote = "";
    state.model = buildComplianceModel(state.asOf);
    renderNotice();
    showToast("Attestato registrato e compliance ricalcolata.");
    setView("employees");
  }

  function previewUploadedStatus(obligation) {
    return attachStatus(
      obligation,
      {
        id: "PREVIEW",
        presence: "Present",
        issueDate: state.uploadIssueDate,
        expiryDate: state.uploadExpiryDate,
        evidenceFile: state.uploadFileName,
      },
      parseISODate(state.asOf)
    );
  }

  function defaultExpiryForUpload() {
    const obligation = state.model
      ? state.model.obligations.find((item) => item.id === state.uploadObligationId)
      : null;
    const months = obligation ? obligation.renewalMonths : 60;
    return addMonthsISO(state.uploadIssueDate || todayISO(), months || 60);
  }

  function nextManualCertificateId() {
    const suffix = String(state.uploadedCertificates.length + 1).padStart(3, "0");
    return `CERT-MVP-${compactDateTime()}-${suffix}`;
  }

  function loadUploadedCertificates() {
    try {
      const raw = window.localStorage.getItem(LOCAL_UPLOAD_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function saveUploadedCertificates() {
    try {
      window.localStorage.setItem(LOCAL_UPLOAD_KEY, JSON.stringify(state.uploadedCertificates));
    } catch (error) {
      showToast("Attestato registrato, ma il browser non ha salvato la sessione locale.");
    }
  }

  function downloadGapsCsv() {
    const rows = state.model.priorityList.map((item) => ({
      "Required Obligation ID": item.id,
      "Employee ID": item.employeeId,
      Dipendente: item.employeeName,
      Reparto: item.department,
      Mansione: item.job,
      "Course ID": item.courseId,
      "Corso obbligatorio": item.courseName,
      Categoria: item.category,
      Stato: statusMeta[item.status].label,
      "Data scadenza": item.expiryDate || "",
      "Giorni residui": item.daysLeft === null ? "" : item.daysLeft,
      Motivo: item.reason,
      Evidenza: item.evidenceFile || "",
    }));
    const csv = toCsv(rows);
    downloadFile(`infinea-gap-list-${state.asOf}.csv`, csv, "text/csv;charset=utf-8");
    showToast("CSV gap scaricato.");
  }

  function downloadSummaryJson() {
    const model = state.model;
    const payload = {
      meta: source.meta,
      asOf: state.asOf,
      stats: model.stats,
      employeeStatusCounts: model.employeeStatusCounts,
      manualUploads: state.uploadedCertificates,
      topPriorities: model.priorityList.slice(0, 20).map((item) => ({
        id: item.id,
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        courseName: item.courseName,
        status: item.status,
        reason: item.reason,
        expiryDate: item.expiryDate,
      })),
    };
    downloadFile(
      `infinea-audit-summary-${state.asOf}.json`,
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8"
    );
    showToast("Sintesi JSON scaricata.");
  }

  function toCsv(rows) {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(",")];
    rows.forEach((row) => {
      lines.push(headers.map((header) => csvEscape(row[header])).join(","));
    });
    return lines.join("\r\n");
  }

  function csvEscape(value) {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function copyText(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast("Path evidenza copiato."),
        () => fallbackCopy(text)
      );
      return;
    }
    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    showToast("Path evidenza copiato.");
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2200);
  }

  function option(value, label, selected) {
    return `<option value="${escapeAttr(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
  }

  function emptySmall(text) {
    return `<div class="empty" style="min-height:120px"><p>${escapeHtml(text)}</p></div>`;
  }

  function decorateIcons(root) {
    root.querySelectorAll("[data-icon]").forEach((node) => {
      const key = node.dataset.icon;
      if (icons[key]) node.innerHTML = icons[key];
    });
  }

  function groupBy(rows, key) {
    return rows.reduce((acc, row) => {
      const value = row[key] || "n.d.";
      if (!acc[value]) acc[value] = [];
      acc[value].push(row);
      return acc;
    }, {});
  }

  function countBy(rows, key) {
    return rows.reduce((acc, row) => {
      const value = row[key] || "n.d.";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
  }

  function percent(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function daysBetween(start, end) {
    const ms = 24 * 60 * 60 * 1000;
    return Math.ceil((stripTime(end).getTime() - stripTime(start).getTime()) / ms);
  }

  function stripTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function parseISODate(value) {
    if (!value) return new Date(NaN);
    if (value instanceof Date) return value;
    const clean = String(value).slice(0, 10);
    const parts = clean.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date(NaN);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function addMonthsISO(value, months) {
    const date = parseISODate(value);
    if (Number.isNaN(date.getTime())) return "";
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    target.setMonth(target.getMonth() + Number(months || 0));
    return toISODate(target);
  }

  function toISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function todayISO() {
    return toISODate(new Date());
  }

  function compactDateTime() {
    const now = new Date();
    return (
      String(now.getFullYear()) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0")
    );
  }

  function formatDate(value) {
    if (!value) return "n.d.";
    const date = parseISODate(value);
    if (Number.isNaN(date.getTime())) return "n.d.";
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
