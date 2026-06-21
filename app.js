(function () {
  "use strict";

  const LOCAL_UPLOAD_KEY = "infinea.auditmate.uploadedCertificates.v1";
  const LOCAL_SIDEBAR_KEY = "infinea.auditmate.sidebarCollapsed.v1";
  let source = createEmptyComplianceSource();

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
    import:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/></svg>',
    eye:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 3 18 18"/><path d="M10.6 10.6a3 3 0 0 0 3.8 3.8"/><path d="M9.9 4.2A10.5 10.5 0 0 1 12 4.0c6.5 0 10 8 10 8a18.2 18.2 0 0 1-3.1 4.3"/><path d="M6.5 6.5A18.8 18.8 0 0 0 2 12s3.5 8 10 8a10.7 10.7 0 0 0 4.1-.8"/></svg>',
    sidebar:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/><path d="m15 9-3 3 3 3"/></svg>',
  };

  const titles = {
    setup: [
      "Importa dati",
      "Parti da un database vuoto e popola l'app caricando Excel o CSV del cliente.",
    ],
    clients: [
      "Clienti",
      "Pannello manager per creare, aprire o rimuovere clienti.",
    ],
    dashboard: [
      "Dashboard compliance",
      "Stato calcolato da anagrafica, matrice obblighi e attestati.",
    ],
    employees: [
      "Dipendenti",
      "Vista per persona con stato compliance, gap e attestati collegati.",
    ],
    gaps: [
      "Gap & priorità",
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
    view: hasComplianceData() ? "dashboard" : "setup",
    asOf: todayISO(),
    employeeSearch: "",
    employeeStatus: "all",
    employeeDepartment: "all",
    selectedEmployeeId: "",
    gapSearch: "",
    gapStatus: "critical",
    gapDepartment: "all",
    gapCategory: "all",
    uploadEmployeeQuery: "",
    uploadPickerOpen: false,
    uploadEmployeeId: "",
    uploadObligationId: "",
    uploadIssueDate: todayISO(),
    uploadExpiryDate: "",
    uploadTrainer: "",
    uploadFileName: "",
    uploadNote: "",
    uploadedCertificates: loadUploadedCertificates(),
    sidebarCollapsed: loadSidebarCollapsed(),
    importCompanyName: "",
    importBusy: false,
    importResult: null,
    importError: "",
    matrixSearch: "",
    authMode: "client",
    authError: "",
    session: null,
    backendReady: Boolean(window.InfineaBackend && window.InfineaBackend.isConfigured),
    backendLoading: true,
    organizations: [],
    organizationsLoading: false,
    organizationFormName: "",
    organizationFormEmail: "",
    organizationFormPassword: "",
    organizationPasswordVisible: false,
    organizationDeleteTargetId: "",
    logoutConfirmOpen: false,
    clearDatabaseConfirmOpen: false,
    model: null,
  };

  async function init() {
    cacheElements();
    decorateIcons(document);
    syncAuthScreen({ resetFields: true });
    applySidebarState();
    initMeta();
    bindEvents();
    els.asOfDate.value = state.asOf;
    syncViewChrome();
    renderAll();
    enhanceDateInputs(document);
    await hydrateBackendSession();
  }

  function cacheElements() {
    els.appShell = document.getElementById("appShell");
    els.sidebarToggle = document.getElementById("sidebarToggle");
    els.navItems = Array.from(document.querySelectorAll(".nav-item"));
    els.views = {
      setup: document.getElementById("setupView"),
      clients: document.getElementById("clientsView"),
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
    els.loginScreen = document.getElementById("loginScreen");
    els.authForm = document.getElementById("authForm");
    els.authTitle = document.getElementById("authTitle");
    els.authSubtitle = document.getElementById("authSubtitle");
    els.authName = document.getElementById("authName");
    els.authNameLabel = document.getElementById("authNameLabel");
    els.authEmail = document.getElementById("authEmail");
    els.authEmailLabel = document.getElementById("authEmailLabel");
    els.authPassword = document.getElementById("authPassword");
    els.authPasswordLabel = document.getElementById("authPasswordLabel");
    els.authPasswordToggle = document.getElementById("authPasswordToggle");
    els.authError = document.getElementById("authError");
    els.authSubmit = document.getElementById("authSubmit");
    els.authTabs = Array.from(document.querySelectorAll("[data-auth-mode]"));
    els.nameField = document.getElementById("nameField");
    els.logoutBtn = document.getElementById("logoutBtn");
    els.modalRoot = document.getElementById("modalRoot");
  }

  function initMeta() {
    const workspaceLabel = document.getElementById("workspaceLabel");
    if (workspaceLabel) {
      workspaceLabel.textContent = isManager() && !state.session.organizationId ? "Area manager" : "Database cliente";
    }
    document.getElementById("pilotCompany").textContent =
      state.session && state.session.organizationName
        ? state.session.organizationName
        : hasComplianceData()
          ? source.meta.pilotCompany || "Azienda cliente"
          : isManager()
            ? "Manager Infinea"
            : "Database vuoto";
    document.getElementById("dataStamp").textContent =
      isManager() && !state.session.organizationId
        ? "Controllo clienti"
        : hasComplianceData()
          ? "Importato " + formatDate(source.meta.preparedAt.slice(0, 10))
          : "Importa Excel/CSV";
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

    els.sidebarToggle.addEventListener("click", () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      saveSidebarCollapsed(state.sidebarCollapsed);
      applySidebarState();
    });

    els.authForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleAuthSubmit();
    });

    els.authTabs.forEach((button) => {
      button.addEventListener("click", () => {
        state.authMode = button.dataset.authMode;
        state.authError = "";
        syncAuthScreen({ resetFields: true });
      });
    });

    if (els.authPasswordToggle) {
      els.authPasswordToggle.addEventListener("click", () => {
        togglePasswordVisibility();
      });
    }

    document.addEventListener("input", (event) => {
      const formKey = event.target.dataset.managerForm;
      if (formKey) {
        state[formKey] = event.target.value;
        return;
      }
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
      if (event.target.id === "trainingUploadForm") {
        event.preventDefault();
        registerTrainingCertificate();
        return;
      }
      if (event.target.id !== "organizationForm") return;
      event.preventDefault();
      createManagerOrganization();
    });

    els.logoutBtn.addEventListener("click", () => {
      openLogoutConfirm();
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".custom-select")) {
        closeCustomSelects();
      }

      const insideUploadPicker = event.target.closest(".person-search");
      if (state.uploadPickerOpen && state.view === "upload" && !insideUploadPicker) {
        state.uploadPickerOpen = false;
        state.uploadEmployeeQuery = "";
        renderCurrentView();
        return;
      }

      const target = event.target.closest("[data-action]");
      if (!target) return;

      const action = target.dataset.action;
      if (action === "refresh-organizations") {
        loadOrganizations();
      }
      if (action === "select-organization") {
        selectManagerOrganization(target.dataset.organizationId);
      }
      if (action === "toggle-organization-password") {
        toggleOrganizationPasswordVisibility(target);
      }
      if (action === "request-delete-organization") {
        openDeleteOrganizationConfirm(target.dataset.organizationId);
      }
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
      if (action === "view-setup") {
        setView("setup");
      }
      if (action === "open-import-panel") {
        openImportPanel();
      }
      if (action === "process-data-import") {
        processDataImport();
      }
      if (action === "clear-local-database") {
        openClearDatabaseConfirm();
      }
      if (action === "cancel-logout") {
        closeLogoutConfirm();
      }
      if (action === "confirm-logout") {
        closeLogoutConfirm();
        logoutLocalSession();
      }
      if (action === "cancel-clear-database") {
        closeClearDatabaseConfirm();
      }
      if (action === "confirm-clear-database") {
        closeClearDatabaseConfirm();
        clearLocalDatabase();
      }
      if (action === "cancel-delete-organization") {
        closeDeleteOrganizationConfirm();
      }
      if (action === "confirm-delete-organization") {
        deleteManagerOrganization();
      }
      if (action === "start-upload") {
        startUploadFor(target.dataset.employeeId, target.dataset.obligationId);
      }
      if (action === "select-upload-employee") {
        selectUploadEmployee(target.dataset.employeeId);
      }
      if (action === "open-upload-picker") {
        if (state.uploadPickerOpen) return;
        state.uploadPickerOpen = true;
        renderCurrentView();
        focusUploadEmployeeSearch();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        (state.logoutConfirmOpen || state.clearDatabaseConfirmOpen || state.organizationDeleteTargetId)
      ) {
        closeAllConfirmModals();
        return;
      }
      if (event.key === "Escape") {
        closeCustomSelects();
      }
      if (event.key !== "Escape" || !state.uploadPickerOpen || state.view !== "upload") return;
      state.uploadPickerOpen = false;
      state.uploadEmployeeQuery = "";
      renderCurrentView();
    });
  }

  function updateFilterState(key, value) {
    state[key] = value;
    if (key === "uploadEmployeeId") {
      state.uploadObligationId = "";
      state.uploadExpiryDate = "";
      state.uploadFileName = "";
    }
    if (key === "uploadEmployeeQuery") {
      state.uploadPickerOpen = true;
    }
    if (key === "uploadObligationId" || key === "uploadIssueDate") {
      state.uploadExpiryDate = defaultExpiryForUpload();
    }
  }

  function shouldRenderWhileTyping(key) {
    return (
      key === "employeeSearch" ||
      key === "gapSearch" ||
      key === "matrixSearch" ||
      key === "uploadEmployeeQuery"
    );
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

  function focusUploadEmployeeSearch() {
    window.setTimeout(() => {
      const input = els.views.upload.querySelector('[data-filter="uploadEmployeeQuery"]');
      if (!input) return;
      input.focus({ preventScroll: true });
      if (typeof input.setSelectionRange === "function") {
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 0);
  }

  function enhanceSelects(root) {
    if (!root) return;
    root.querySelectorAll("select[data-filter]").forEach((select) => {
      if (select.dataset.enhanced === "true") return;
      select.dataset.enhanced = "true";
      select.classList.add("native-select-hidden");

      const wrapper = document.createElement("div");
      wrapper.className = "custom-select";

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "custom-select-trigger";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      trigger.textContent = select.options[select.selectedIndex]
        ? select.options[select.selectedIndex].textContent
        : "Seleziona";

      const menu = document.createElement("div");
      menu.className = "custom-select-menu";
      menu.setAttribute("role", "listbox");

      Array.from(select.options).forEach((option) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "custom-select-option";
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(option.selected));
        item.dataset.value = option.value;
        item.textContent = option.textContent;
        item.addEventListener("click", (event) => {
          event.stopPropagation();
          select.value = option.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          closeCustomSelects();
        });
        menu.appendChild(item);
      });

      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        const wasOpen = wrapper.classList.contains("is-open");
        closeCustomSelects();
        wrapper.classList.toggle("is-open", !wasOpen);
        trigger.setAttribute("aria-expanded", String(!wasOpen));
      });

      wrapper.append(trigger, menu);
      select.insertAdjacentElement("afterend", wrapper);
    });
  }

  function enhanceDateInputs(root) {
    if (!root) return;
    root.querySelectorAll('input[type="date"]').forEach((input) => {
      if (input.dataset.dateEnhanced !== "true") {
        input.dataset.dateEnhanced = "true";
        input.classList.add("native-date-hidden");

        const wrapper = document.createElement("button");
        wrapper.type = "button";
        wrapper.className = "custom-date";

        const value = document.createElement("span");
        value.className = "custom-date-value";

        const icon = document.createElement("span");
        icon.className = "custom-date-icon";
        icon.dataset.icon = "calendar";

        wrapper.append(value, icon);
        input.insertAdjacentElement("afterend", wrapper);
        decorateIcons(wrapper);

        wrapper.addEventListener("click", () => {
          if (wrapper.classList.contains("is-picker-open")) {
            input.blur();
            wrapper.classList.remove("is-picker-open");
            wrapper.setAttribute("aria-expanded", "false");
            return;
          }
          wrapper.classList.add("is-picker-open");
          wrapper.setAttribute("aria-expanded", "true");
          input.focus({ preventScroll: true });
          try {
            if (typeof input.showPicker === "function") {
              input.showPicker();
            } else {
              input.click();
            }
          } catch (error) {
            input.click();
          }
        });

        input.addEventListener("change", () => {
          syncCustomDate(input);
          wrapper.classList.remove("is-picker-open");
          wrapper.setAttribute("aria-expanded", "false");
        });

        input.addEventListener("blur", () => {
          window.setTimeout(() => {
            wrapper.classList.remove("is-picker-open");
            wrapper.setAttribute("aria-expanded", "false");
          }, 120);
        });
      }
      syncCustomDate(input);
    });
  }

  function syncCustomDate(input) {
    const wrapper = input.nextElementSibling;
    if (!wrapper || !wrapper.classList.contains("custom-date")) return;
    const value = wrapper.querySelector(".custom-date-value");
    if (!value) return;
    value.textContent = input.value ? formatDate(input.value) : "Seleziona data";
  }

  function closeCustomSelects(except) {
    document.querySelectorAll(".custom-select.is-open").forEach((node) => {
      if (except && node === except) return;
      node.classList.remove("is-open");
      const trigger = node.querySelector(".custom-select-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  function setView(view) {
    if (view === "clients" && !isManager()) view = "setup";
    state.view = view;
    syncViewChrome();
    renderCurrentView();
  }

  function syncViewChrome() {
    els.navItems.forEach((button) => {
      const managerOnly = button.dataset.managerOnly === "true";
      button.classList.toggle("is-hidden", managerOnly && !isManager());
      button.classList.toggle("is-active", button.dataset.view === state.view);
    });
    Object.entries(els.views).forEach(([key, node]) => {
      node.classList.toggle("is-active", key === state.view);
    });
    els.viewTitle.textContent = titles[state.view][0];
    els.viewSubtitle.textContent = titles[state.view][1];
  }

  function applySidebarState() {
    if (!els.appShell || !els.sidebarToggle) return;
    const collapsed = state.sidebarCollapsed;
    els.appShell.classList.toggle("is-sidebar-collapsed", collapsed);
    els.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
    els.sidebarToggle.setAttribute(
      "aria-label",
      collapsed ? "Apri barra laterale" : "Chiudi barra laterale"
    );
    els.sidebarToggle.title = collapsed ? "Apri barra laterale" : "Chiudi barra laterale";
  }

  function syncAuthScreen(options = {}) {
    const isLoggedIn = Boolean(state.session && state.session.email);
    document.body.classList.toggle("is-authenticated", isLoggedIn);
    document.body.classList.toggle("is-locked", !isLoggedIn);
    if (!els.loginScreen) return;

    const isManagerMode = state.authMode === "manager";

    els.authTabs.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.authMode === state.authMode);
    });
    els.authTitle.textContent = isManagerMode ? "Accesso manager" : "Accesso cliente";
    els.authSubtitle.textContent = isManagerMode
      ? "Usa l'email e la password dell'utente manager autorizzato."
      : "Usa nome, email e password ricevuti dal manager.";
    els.authSubmit.textContent = state.backendLoading ? "Connessione..." : "Entra";
    els.authSubmit.disabled = state.backendLoading || !state.backendReady;
    els.nameField.classList.toggle("is-hidden", isManagerMode);
    els.authName.required = !isManagerMode;
    els.authNameLabel.textContent = "Nome";
    els.authEmailLabel.textContent = "Email";
    els.authPasswordLabel.textContent = "Password";
    els.authName.placeholder = "Es. Chimiver";
    els.authEmail.placeholder = isManagerMode ? "manager@infinea.ai" : "utente@azienda.it";
    els.authPassword.placeholder = isManagerMode ? "Password manager" : "Password";
    if (options.resetFields) {
      els.authName.value = "";
      els.authEmail.value = "";
      els.authPassword.value = "";
    }
    els.authError.textContent = state.backendReady
      ? state.authError
      : "Accesso non disponibile. Contatta l'amministratore.";
    syncPasswordToggle();
  }

  function togglePasswordVisibility() {
    const shouldShow = els.authPassword.type === "password";
    els.authPassword.type = shouldShow ? "text" : "password";
    syncPasswordToggle();
  }

  function syncPasswordToggle() {
    if (!els.authPasswordToggle) return;
    const isVisible = els.authPassword.type === "text";
    els.authPasswordToggle.setAttribute("aria-label", isVisible ? "Nascondi password" : "Mostra password");
    els.authPasswordToggle.setAttribute("aria-pressed", String(isVisible));
    const icon = els.authPasswordToggle.querySelector("[data-icon]");
    if (!icon) return;
    icon.dataset.icon = isVisible ? "eye" : "eyeOff";
    decorateIcons(els.authPasswordToggle);
  }

  async function handleAuthSubmit() {
    const email = els.authEmail.value.trim().toLowerCase();
    const password = els.authPassword.value;
    const name = els.authName.value.trim();

    if (!email || !password) {
      state.authError = "Inserisci email e password.";
      syncAuthScreen();
      return;
    }
    if (password.length < 6) {
      state.authError = "La password deve avere almeno 6 caratteri.";
      syncAuthScreen();
      return;
    }
    if (!state.backendReady) {
      state.authError = "Accesso non disponibile. Contatta l'amministratore.";
      syncAuthScreen();
      return;
    }
    if (state.authMode === "client" && !name) {
      state.authError = "Inserisci il nome.";
      syncAuthScreen();
      return;
    }

    state.authError = "";
    state.backendLoading = true;
    syncAuthScreen();
    try {
      const session =
        state.authMode === "manager"
          ? await window.InfineaBackend.signInManager(email, password)
          : await window.InfineaBackend.signInClient(name, email, password);
      state.authError = "Accesso riuscito. Carico il workspace...";
      syncAuthScreen();
      await startLocalSession(session);
      showToast("Accesso effettuato.");
    } catch (error) {
      console.warn("Login failed", error);
      state.authError = "Accesso non riuscito. Controlla le credenziali e riprova.";
      syncAuthScreen();
    } finally {
      state.backendLoading = false;
      syncAuthScreen();
    }
  }

  async function hydrateBackendSession() {
    state.backendLoading = true;
    syncAuthScreen();
    try {
      if (!window.InfineaBackend || !window.InfineaBackend.isConfigured) {
        state.backendReady = false;
        return;
      }
      state.backendReady = true;
      const session = await window.InfineaBackend.getCurrentSession();
      if (session) await startLocalSession(session, { silent: true });
    } catch (error) {
      state.authError = error.message || "Sessione non caricata.";
    } finally {
      state.backendLoading = false;
      syncAuthScreen();
    }
  }

  async function startLocalSession(session, options = {}) {
    state.session = session;
    state.authError = "";
    if (isManager()) {
      source = createEmptyComplianceSource();
      state.view = "clients";
      state.model = buildComplianceModel(state.asOf);
      initMeta();
      syncAuthScreen();
      syncViewChrome();
      renderAll();
      await loadOrganizations();
      if (!options.silent) showToast("Workspace manager aperto.");
      return;
    } else if (session.organizationId) {
      state.importCompanyName = session.organizationName || "";
      source = createEmptyComplianceSource();
      state.view = "setup";
      state.model = buildComplianceModel(state.asOf);
      initMeta();
      syncAuthScreen();
      syncViewChrome();
      renderAll();
      try {
        const loaded = await window.InfineaBackend.loadComplianceSource(session.organizationId);
        source = loaded || createEmptyComplianceSource();
        state.view = hasComplianceData() ? "dashboard" : "setup";
      } catch (error) {
        showToast(error.message || "Dati azienda non caricati.");
      }
    }
    state.model = buildComplianceModel(state.asOf);
    initMeta();
    syncAuthScreen();
    syncViewChrome();
    renderAll();
    if (!options.silent) showToast("Workspace sincronizzato.");
  }

  async function logoutLocalSession() {
    try {
      if (window.InfineaBackend) await window.InfineaBackend.signOut();
    } catch (error) {
      showToast(error.message || "Logout non completato.");
    }
    state.session = null;
    source = createEmptyComplianceSource();
    state.view = "setup";
    state.authError = "";
    state.organizations = [];
    state.model = buildComplianceModel(state.asOf);
    syncAuthScreen({ resetFields: true });
    syncViewChrome();
    renderAll();
    showToast("Sessione chiusa.");
  }

  function isManager() {
    return Boolean(state.session && state.session.role === "manager");
  }

  function isClient() {
    return Boolean(state.session && state.session.role === "client");
  }

  async function loadOrganizations() {
    if (!isManager() || !state.backendReady) return;
    state.organizationsLoading = true;
    renderCurrentView();
    try {
      state.organizations = await window.InfineaBackend.listOrganizations();
    } catch (error) {
      showToast(error.message || "Clienti non caricati.");
    } finally {
      state.organizationsLoading = false;
      renderCurrentView();
    }
  }

  async function createManagerOrganization() {
    if (!isManager()) return;
    if (!state.organizationFormName || !state.organizationFormEmail || !state.organizationFormPassword) {
      showToast("Compila nome, email e password.");
      return;
    }
    if (state.organizationFormPassword.length < 6) {
      showToast("La password cliente deve avere almeno 6 caratteri.");
      return;
    }
    try {
      await window.InfineaBackend.createOrganization(
        state.organizationFormName,
        state.organizationFormEmail,
        state.organizationFormPassword
      );
      state.organizationFormName = "";
      state.organizationFormEmail = "";
      state.organizationFormPassword = "";
      state.organizationPasswordVisible = false;
      showToast("Azienda creata.");
      await loadOrganizations();
    } catch (error) {
      showToast(error.message || "Azienda non creata.");
    }
  }

  function toggleOrganizationPasswordVisibility(button) {
    state.organizationPasswordVisible = !state.organizationPasswordVisible;
    const input = document.getElementById("organizationFormPassword");
    if (input) input.type = state.organizationPasswordVisible ? "text" : "password";
    if (!button) return;
    button.setAttribute("aria-label", state.organizationPasswordVisible ? "Nascondi password" : "Mostra password");
    button.setAttribute("aria-pressed", String(state.organizationPasswordVisible));
    const icon = button.querySelector("[data-icon]");
    if (icon) icon.dataset.icon = state.organizationPasswordVisible ? "eye" : "eyeOff";
    decorateIcons(button);
    button.blur();
  }

  async function selectManagerOrganization(organizationId) {
    const organization = state.organizations.find((item) => item.id === organizationId);
    if (!organization) return;
    state.session = {
      ...state.session,
      organizationId: organization.id,
      organizationName: organization.name,
      organizationCode: organization.code,
    };
    const loaded = await window.InfineaBackend.loadComplianceSource(organization.id);
    source = loaded || createEmptyComplianceSource();
    state.importCompanyName = organization.name;
    state.view = hasComplianceData() ? "dashboard" : "setup";
    state.model = buildComplianceModel(state.asOf);
    initMeta();
    syncViewChrome();
    renderAll();
  }

  function getOrganizationById(organizationId) {
    return state.organizations.find((item) => item.id === organizationId) || null;
  }

  function openDeleteOrganizationConfirm(organizationId) {
    if (!isManager()) return;
    const organization = getOrganizationById(organizationId);
    if (!organization) {
      showToast("Cliente non trovato.");
      return;
    }
    state.logoutConfirmOpen = false;
    state.clearDatabaseConfirmOpen = false;
    state.organizationDeleteTargetId = organization.id;
    renderConfirmModal();
  }

  function closeDeleteOrganizationConfirm() {
    state.organizationDeleteTargetId = "";
    renderConfirmModal();
  }

  async function deleteManagerOrganization() {
    if (!isManager() || !state.organizationDeleteTargetId) return;
    const organizationId = state.organizationDeleteTargetId;
    const organization = getOrganizationById(organizationId);
    try {
      await window.InfineaBackend.deleteOrganization(organizationId);
      state.organizationDeleteTargetId = "";
      if (state.session && state.session.organizationId === organizationId) {
        state.session = {
          ...state.session,
          organizationId: null,
          organizationName: "",
          organizationCode: "",
        };
        source = createEmptyComplianceSource();
        state.view = "clients";
        state.model = buildComplianceModel(state.asOf);
        initMeta();
      }
      showToast(`${organization ? organization.name : "Cliente"} eliminato.`);
      renderConfirmModal();
      await loadOrganizations();
      renderAll();
    } catch (error) {
      showToast(error.message || "Cliente non eliminato.");
      closeDeleteOrganizationConfirm();
    }
  }

  /*
  function oldLocalAuthRemoved() {
    if (false) {
      if (password.length < 6) {
        state.authError = "La password deve avere almeno 6 caratteri.";
        syncAuthScreen();
        return;
      }
    }
  }
  */

  function openLogoutConfirm() {
    if (!state.session) return;
    state.clearDatabaseConfirmOpen = false;
    state.organizationDeleteTargetId = "";
    state.logoutConfirmOpen = true;
    renderConfirmModal();
  }

  function closeLogoutConfirm() {
    state.logoutConfirmOpen = false;
    renderConfirmModal();
  }

  function openClearDatabaseConfirm() {
    state.logoutConfirmOpen = false;
    state.organizationDeleteTargetId = "";
    state.clearDatabaseConfirmOpen = true;
    renderConfirmModal();
  }

  function closeClearDatabaseConfirm() {
    state.clearDatabaseConfirmOpen = false;
    renderConfirmModal();
  }

  function closeAllConfirmModals() {
    state.logoutConfirmOpen = false;
    state.clearDatabaseConfirmOpen = false;
    state.organizationDeleteTargetId = "";
    renderConfirmModal();
  }

  function renderConfirmModal() {
    if (!els.modalRoot) return;
    const organizationToDelete = state.organizationDeleteTargetId
      ? getOrganizationById(state.organizationDeleteTargetId)
      : null;
    const config = state.logoutConfirmOpen
      ? {
          eyebrow: "Conferma uscita",
          title: "Sei sicuro di voler uscire dall'account?",
          body: "La sessione verra chiusa. I dati importati resteranno salvati nel database centrale.",
          cancelAction: "cancel-logout",
          confirmAction: "confirm-logout",
          confirmLabel: "Esci dall'account",
        }
      : state.clearDatabaseConfirmOpen
        ? {
            eyebrow: "Conferma eliminazione",
            title: "Vuoi svuotare il database azienda?",
            body: "Questa operazione cancella i dati importati per l'azienda selezionata. Gli account restano attivi.",
            cancelAction: "cancel-clear-database",
            confirmAction: "confirm-clear-database",
            confirmLabel: "Svuota database",
          }
        : organizationToDelete
          ? {
              eyebrow: "Conferma eliminazione",
              title: `Vuoi eliminare ${organizationToDelete.name}?`,
              body: "Questa operazione rimuove il cliente dall'app e cancella i dati compliance collegati. L'operazione non si puo annullare.",
              cancelAction: "cancel-delete-organization",
              confirmAction: "confirm-delete-organization",
              confirmLabel: "Elimina cliente",
            }
          : null;

    if (!config) {
      els.modalRoot.innerHTML = "";
      return;
    }
    els.modalRoot.innerHTML = `
      <section class="modal-backdrop" role="presentation">
        <div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirmModalTitle">
          <div class="confirm-modal-icon" aria-hidden="true">IA</div>
          <div class="confirm-modal-copy">
            <p class="eyebrow">${escapeHtml(config.eyebrow)}</p>
            <h2 id="confirmModalTitle">${escapeHtml(config.title)}</h2>
            <p>${escapeHtml(config.body)}</p>
          </div>
          <div class="confirm-modal-actions">
            <button class="button" type="button" data-action="${config.cancelAction}">Annulla</button>
            <button class="button button-danger" type="button" data-action="${config.confirmAction}">${config.confirmLabel}</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderAll() {
    state.model = buildComplianceModel(state.asOf);
    renderNotice();
    renderCurrentView();
  }

  function renderCurrentView() {
    if (!state.model) state.model = buildComplianceModel(state.asOf);
    if (state.view === "clients") {
      renderClients();
      decorateIcons(els.views.clients);
      return;
    }
    if (state.view === "setup") renderSetup();
    if (!hasComplianceData() && state.view !== "setup") {
      renderNoDataView(state.view);
      decorateIcons(els.views[state.view]);
      return;
    }
    if (state.view === "dashboard") renderDashboard();
    if (state.view === "employees") renderEmployees();
    if (state.view === "gaps") renderGaps();
    if (state.view === "upload") renderUpload();
    if (state.view === "matrix") renderMatrix();
    if (state.view === "report") renderReport();
    decorateIcons(els.views[state.view]);
    enhanceSelects(els.views[state.view]);
    enhanceDateInputs(els.views[state.view]);
  }

  function renderNotice() {
    if (state.view === "clients") {
      els.dataNotice.innerHTML = `
        <span><strong>Area manager.</strong> Crea un cliente o aprine uno esistente per gestire import e dashboard.</span>
        <button class="button button-ghost" type="button" data-action="refresh-organizations">Aggiorna clienti</button>
      `;
      return;
    }
    if (!hasComplianceData()) {
      els.dataNotice.innerHTML = `
        <span><strong>Database vuoto.</strong> Carica un template Excel/CSV per iniziare a calcolare la compliance${state.session && state.session.organizationName ? ` di <strong>${escapeHtml(state.session.organizationName)}</strong>` : ""}.</span>
        <button class="button button-ghost" type="button" data-action="open-import-panel">Importa dati</button>
      `;
      return;
    }
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

  function renderSetup() {
    const hasData = hasComplianceData();
    const q = source.quality || createEmptyQuality();
    const result = state.importResult;
    const warnings = result && result.summary ? result.summary.warnings : [];
    const errors = result && result.summary ? result.summary.errors : [];
    els.views.setup.innerHTML = `
      <section class="panel import-panel">
        <div class="panel-header">
          <div>
            <h2>Database cliente</h2>
            <p>I dati entrano tramite upload Excel/CSV e vengono salvati nel database centrale dell'azienda selezionata.</p>
          </div>
          <span class="badge ${hasData ? "badge-success" : "badge-neutral"}">${hasData ? "Dati caricati" : "Vuoto"}</span>
        </div>

        <div class="import-layout">
          <div class="import-dropzone">
            <label class="form-field">
              <span>Nome azienda nel report</span>
              <input data-filter="importCompanyName" value="${escapeAttr(state.importCompanyName)}" placeholder="Es. Chimiver" />
            </label>
            <label class="file-drop" for="dataImportFiles">
              <span class="mini-icon" data-icon="import"></span>
              <strong>Carica file Excel o CSV</strong>
              <span>Accetta tre file o un workbook unico: dipendenti-ruolo, ruolo-corsi e stato attestati.</span>
              <input id="dataImportFiles" type="file" multiple accept=".xlsx,.csv" />
            </label>
            <div class="import-actions">
              <button class="button button-primary" type="button" data-action="process-data-import" ${state.importBusy ? "disabled" : ""}>
                <span class="button-icon" data-icon="import"></span>
                ${state.importBusy ? "Importazione..." : "Importa e popola database"}
              </button>
              ${
                hasData
                  ? `<button class="button button-danger" type="button" data-action="clear-local-database">Svuota database azienda</button>`
                  : ""
              }
            </div>
            <p class="muted">I dati sono separati per azienda e protetti da regole di accesso dedicate.</p>
          </div>

          <aside class="import-status">
            <h3>Stato dati</h3>
            <div class="detail-grid import-stats">
              ${detailStat(q.employees || 0, "Dipendenti")}
              ${detailStat(q.matrixRows || 0, "Righe matrice")}
              ${detailStat(q.requiredObligations || 0, "Obblighi")}
              ${detailStat(q.certificates || 0, "Attestati")}
            </div>
            ${
              hasData
                ? `<div class="manager-summary">
                    <p><strong>Azienda:</strong> ${escapeHtml(source.meta.pilotCompany || "Azienda cliente")}</p>
                    <p><strong>Ultimo import:</strong> ${formatDate(String(source.meta.preparedAt || "").slice(0, 10))}</p>
                    <p><strong>Qualita:</strong> ${(source.quality.unknownEmployeeInObligations || []).length + (source.quality.unknownEmployeeInCertificates || []).length} anomalie ID dipendente.</p>
                  </div>`
                : `<p class="muted">Nessun dato importato. Dopo il caricamento la dashboard si aggiornera automaticamente.</p>`
            }
          </aside>
        </div>

        ${
          state.importError
            ? `<div class="import-message import-message-error"><strong>Import non completato</strong><span>${escapeHtml(state.importError)}</span></div>`
            : ""
        }
        ${
          result
            ? `<div class="import-message ${errors.length ? "import-message-error" : "import-message-success"}">
                <strong>${errors.length ? "Import completato con errori bloccanti" : "Import completato"}</strong>
                <span>${result.summary.employees} dipendenti, ${result.summary.requiredObligations} obblighi, ${result.summary.certificateRepository} attestati.</span>
                ${warnings.length ? `<ul>${warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
                ${errors.length ? `<ul>${errors.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
              </div>`
            : ""
        }
      </section>

      <section class="panel detail-panel">
        <div class="panel-header">
          <div>
            <h2>Template atteso</h2>
            <p>Lo schema consigliato usa tre blocchi dati non ridondanti. Gli obblighi vengono generati automaticamente.</p>
          </div>
        </div>
        <div class="template-grid">
          ${importTemplateCard("Dipendenti - ruolo", ["Employee ID", "Nome", "Cognome", "Reparto", "Mansione", "Role ID"])}
          ${importTemplateCard("Ruolo - corsi", ["Role ID", "Course ID", "Corso obbligatorio", "Rinnovo mesi", "Profilo rischio corso"])}
          ${importTemplateCard("Stato attestati", ["Employee ID", "Course ID", "Certificate Presence", "Issue Date", "Expiry Date"])}
        </div>
      </section>
    `;
  }

  function importTemplateCard(title, fields) {
    return `
      <article class="template-card">
        <strong>${escapeHtml(title)}</strong>
        <span>${fields.map((field) => `<code>${escapeHtml(field)}</code>`).join("")}</span>
      </article>
    `;
  }

  function renderClients() {
    const organizations = state.organizations || [];
    const passwordIcon = state.organizationPasswordVisible ? "eye" : "eyeOff";
    const passwordType = state.organizationPasswordVisible ? "text" : "password";
    els.views.clients.innerHTML = `
      <section class="panel import-panel clients-panel">
        <div class="panel-header">
          <div>
            <h2>Clienti gestiti</h2>
            <p>Crea l'accesso cliente con nome, email e password. Sono gli stessi tre dati usati poi nel login cliente.</p>
          </div>
          <button class="button" type="button" data-action="refresh-organizations">
            Aggiorna
          </button>
        </div>
        <div class="import-layout">
          <form class="import-status" id="organizationForm">
            <h3>Nuova azienda</h3>
            <label class="form-field">
              <span>Nome</span>
              <input data-manager-form="organizationFormName" value="${escapeAttr(state.organizationFormName)}" placeholder="Es. Chimiver" required />
            </label>
            <label class="form-field">
              <span>Email</span>
              <input data-manager-form="organizationFormEmail" value="${escapeAttr(state.organizationFormEmail)}" type="email" placeholder="cliente@azienda.it" required />
            </label>
            <label class="form-field">
              <span>Password</span>
              <span class="password-control manager-password-control">
                <input id="organizationFormPassword" data-manager-form="organizationFormPassword" value="${escapeAttr(state.organizationFormPassword)}" type="${passwordType}" minlength="6" placeholder="Minimo 6 caratteri" required />
                <button class="password-toggle" type="button" data-action="toggle-organization-password" aria-label="${state.organizationPasswordVisible ? "Nascondi password" : "Mostra password"}" aria-pressed="${String(state.organizationPasswordVisible)}">
                  <span class="button-icon" data-icon="${passwordIcon}"></span>
                </button>
              </span>
            </label>
            <button class="button button-primary" type="submit">Crea accesso cliente</button>
            <p class="muted">Il cliente entrerà con questi tre campi. La password viene salvata come hash.</p>
          </form>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Azienda</th>
                  <th>Email</th>
                  <th>Utenti</th>
                  <th>Dipendenti</th>
                  <th>Ultimo import</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${
                  state.organizationsLoading
                    ? `<tr><td colspan="6">Caricamento clienti...</td></tr>`
                    : organizations.length
                      ? organizations.map((item) => `
                          <tr>
                            <td><strong>${escapeHtml(item.name)}</strong></td>
                            <td>${escapeHtml(formatAccessEmail(item.code))}</td>
                            <td>${item.userCount || 0}</td>
                            <td>${item.employeeCount || 0}</td>
                            <td>${item.lastImport ? formatDate(String(item.lastImport.created_at).slice(0, 10)) : "n.d."}</td>
                            <td>
                              <div class="table-actions">
                                <button class="row-button" type="button" data-action="select-organization" data-organization-id="${escapeAttr(item.id)}">Apri</button>
                                <button class="row-button row-button-danger" type="button" data-action="request-delete-organization" data-organization-id="${escapeAttr(item.id)}">Elimina</button>
                              </div>
                            </td>
                          </tr>
                        `).join("")
                      : `<tr><td colspan="6">Nessuna azienda creata.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;
  }

  function renderNoDataView(view) {
    els.views[view].innerHTML = `
      <section class="empty empty-import">
        <div>
          <h2>Database vuoto</h2>
          <p>Per usare questa sezione devi prima caricare i dati cliente da Excel o CSV.</p>
          <button class="button button-primary" type="button" data-action="open-import-panel">
            <span class="button-icon" data-icon="import"></span>
            Vai a Importa dati
          </button>
        </div>
      </section>
    `;
  }

  function openImportPanel() {
    setView("setup");
    const fileInput = document.getElementById("dataImportFiles");
    if (!fileInput) return;
    fileInput.scrollIntoView({ behavior: "smooth", block: "center" });
    fileInput.focus({ preventScroll: true });
    fileInput.click();
  }

  function renderDashboard() {
    const model = state.model;
    const s = model.stats;
    const critical = s.expired + s.missing + s.incomplete;
    const readiness = percent(s.compliantToday, s.totalObligations);
    const cleanRate = percent(s.valid, s.totalObligations);
    const chartDepartments = model.obligationDepartmentStats
      .slice()
      .sort((a, b) => b.total - a.total || a.department.localeCompare(b.department))
      .slice(0, 6);
    const topUrgent = model.priorityList.slice(0, 8);

    els.views.dashboard.innerHTML = `
      <div class="grid grid-kpis">
        ${kpiCard("Audit readiness", `${readiness}%`, `${s.compliantToday}/${s.totalObligations} obblighi compliant oggi`, readiness, "success")}
        ${kpiCard("Senza alert", `${cleanRate}%`, `${s.valid}/${s.totalObligations} obblighi pienamente validi`, cleanRate, "info")}
        ${kpiCard("Alert scadenza", String(s.due30 + s.due60 + s.due90), `${s.due30} entro 30g, ${s.due60} entro 60g, ${s.due90} entro 90g`, percent(s.due30 + s.due60 + s.due90, s.totalObligations), "warning")}
        ${kpiCard("Criticita", String(critical), `${s.expired} scaduti, ${s.missing} mancanti`, percent(critical, s.totalObligations), "danger")}
      </div>

      <div class="dashboard-overview">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Compliance per Reparto</h2>
              <p>Distribuzione degli obblighi per reparto: conformi, in scadenza e non conformi.</p>
            </div>
            <span class="badge ${readiness >= 75 ? "badge-success" : readiness >= 60 ? "badge-warning" : "badge-danger"}">${readiness}% readiness</span>
          </div>
          ${complianceDepartmentChart(chartDepartments)}
          <div class="chart-embedded-status">
            <div>
              <h3>Dipendenti per stato</h3>
              <p>Classificazione basata sugli obblighi assegnati a ciascun dipendente.</p>
            </div>
            <div class="dashboard-status-grid">
              ${employeeStatusCard("compliant", model.employeeStatusCounts.compliant)}
              ${employeeStatusCard("atRisk", model.employeeStatusCounts.atRisk)}
              ${employeeStatusCard("nonCompliant", model.employeeStatusCounts.nonCompliant)}
            </div>
          </div>
        </section>

        <div class="dashboard-side">
          <section class="panel">
            <div class="panel-header">
              <div>
                <h2>Priorità operative</h2>
                <p>Azioni da validare o pianificare per prime.</p>
              </div>
              <button class="button button-ghost" type="button" data-action="view-gaps">Vedi tutto</button>
            </div>
            <div class="priority-list compact">
              ${topUrgent.slice(0, 5).map(priorityItem).join("") || emptySmall("Nessuna priorità aperta.")}
            </div>
          </section>
        </div>
      </div>

      <div class="dashboard-summary">
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
      <div class="employees-layout">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Registro dipendenti</h2>
              <p>${filtered.length} risultati filtrati su ${model.employees.length} dipendenti. Seleziona un nome per aggiornare il dettaglio a destra.</p>
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
          <div class="table-wrap employees-table">
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
      </div>
    `;
  }

  function renderEmployeeDetail() {
    const model = state.model;
    const aggregate = model.employeeMap.get(state.selectedEmployeeId);
    if (!aggregate) {
      return `<section class="empty employee-detail-panel"><div><h2>Nessun dipendente selezionato</h2><p>Seleziona una riga per vedere il dettaglio degli obblighi.</p></div></section>`;
    }

    const urgent = aggregate.obligations
      .filter((item) => item.isCritical || item.isAlert)
      .sort(sortByPriority);

    return `
      <section class="panel employee-detail-panel">
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
        <div class="table-wrap employee-obligation-table">
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
                <th>Priorità</th>
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
    const allCandidates = model.employeeAggregates
      .filter((item) => item.critical > 0)
      .sort((a, b) => b.critical - a.critical || a.employee.surname.localeCompare(b.employee.surname));
    const query = normalizeText(state.uploadEmployeeQuery);
    const candidates = allCandidates.filter((item) => {
      const text = normalizeText(
        `${item.employee.name} ${item.employee.surname} ${item.employee.department} ${item.employee.job} ${item.employee.id}`
      );
      return !query || text.includes(query);
    });

    if (!allCandidates.length) {
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

    if (!state.uploadEmployeeId || !allCandidates.some((item) => item.employee.id === state.uploadEmployeeId)) {
      state.uploadEmployeeId = allCandidates[0].employee.id;
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
          <span class="badge badge-neutral">${candidates.length}/${allCandidates.length} risultati</span>
        </div>

        <div class="upload-layout">
          <form class="upload-form" id="trainingUploadForm">
            <div class="form-grid">
              <label class="form-field form-field-wide">
                <span>Dipendente non compliant</span>
                <div class="person-search ${state.uploadPickerOpen ? "is-open" : ""}">
                  ${
                    state.uploadPickerOpen
                      ? `<input data-filter="uploadEmployeeQuery" value="${escapeAttr(state.uploadEmployeeQuery)}" placeholder="Cerca per nome, cognome, reparto..." autocomplete="off" role="combobox" aria-expanded="true" aria-controls="uploadPersonPicker" />
                        <div class="person-picker" id="uploadPersonPicker" role="listbox" aria-label="Dipendenti non compliant filtrati">
                          ${
                            candidates.length
                              ? candidates
                                  .slice(0, 8)
                                  .map((item) => uploadCandidateButton(item))
                                  .join("")
                              : `<div class="person-picker-empty">Nessun risultato per questa ricerca.</div>`
                          }
                        </div>`
                      : `<button class="selected-person-summary selected-person-trigger" type="button" data-action="open-upload-picker" aria-expanded="false">
                          <span>
                            <strong>${escapeHtml(selected.employee.surname)} ${escapeHtml(selected.employee.name)}</strong>
                            <small>${escapeHtml(selected.employee.department)} - ${escapeHtml(selected.employee.job)}</small>
                          </span>
                          <em>Cerca</em>
                        </button>`
                  }
                </div>
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

  function uploadCandidateButton(item) {
    const active = state.uploadEmployeeId === item.employee.id;
    return `
      <button class="person-option ${active ? "is-selected" : ""}" type="button" data-action="select-upload-employee" data-employee-id="${escapeAttr(item.employee.id)}">
        <span>
          <strong>${escapeHtml(item.employee.surname)} ${escapeHtml(item.employee.name)}</strong>
          <small>${escapeHtml(item.employee.department)} - ${escapeHtml(item.employee.job)}</small>
        </span>
        <span class="badge badge-danger">${item.critical} criticita</span>
      </button>
    `;
  }

  function selectUploadEmployee(employeeId) {
    const aggregate = state.model.employeeMap.get(employeeId);
    if (!aggregate) return;
    state.uploadEmployeeId = employeeId;
    state.uploadEmployeeQuery = "";
    state.uploadPickerOpen = false;
    state.uploadObligationId = "";
    state.uploadExpiryDate = "";
    state.uploadFileName = "";
    renderCurrentView();
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
            <h3>Prime priorità</h3>
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
    const obligationDepartmentStats = buildObligationDepartmentStats(obligations);

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
      obligationDepartmentStats,
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

  function buildObligationDepartmentStats(obligations) {
    const map = new Map();
    obligations.forEach((item) => {
      const key = item.department || "n.d.";
      if (!map.has(key)) {
        map.set(key, {
          department: key,
          conforming: 0,
          expiring: 0,
          nonCompliant: 0,
          total: 0,
        });
      }
      const row = map.get(key);
      row.total += 1;
      if (item.isCritical) row.nonCompliant += 1;
      else if (item.isAlert) row.expiring += 1;
      else row.conforming += 1;
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

  function complianceDepartmentChart(rows) {
    if (!rows.length) return emptySmall("Nessun reparto disponibile per il grafico.");

    const values = rows.flatMap((row) => [row.conforming, row.expiring, row.nonCompliant]);
    const maxValue = Math.max(5, ...values);
    const yMax = niceChartMax(maxValue);
    const yTicks = [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0];
    const plot = { x: 62, y: 26, width: 820, height: 230 };
    const groupWidth = plot.width / rows.length;
    const barWidth = Math.min(28, Math.max(14, groupWidth / 5));
    const barGap = 7;
    const colors = {
      conforming: "var(--primary)",
      expiring: "var(--accent)",
      nonCompliant: "var(--danger)",
    };

    const grid = yTicks
      .map((tick) => {
        const y = plot.y + plot.height - (tick / yMax) * plot.height;
        return `
          <line class="chart-grid" x1="${plot.x}" y1="${y}" x2="${plot.x + plot.width}" y2="${y}" />
          <text class="chart-axis-label" x="${plot.x - 12}" y="${y + 4}" text-anchor="end">${tick}</text>
        `;
      })
      .join("");

    const chartRows = rows.map((row, index) => {
      const center = plot.x + groupWidth * index + groupWidth / 2;
      const start = center - (barWidth * 3 + barGap * 2) / 2;
      const tooltipWidth = 214;
      const tooltipHeight = 124;
      const tooltipX = clamp(center - tooltipWidth / 2, plot.x + 4, plot.x + plot.width - tooltipWidth - 4);
      const tooltipY = plot.y + 10;
      return {
        row,
        center,
        start,
        hoverX: plot.x + groupWidth * index + 3,
        hoverWidth: Math.max(10, groupWidth - 6),
        tooltipWidth,
        tooltipHeight,
        tooltipX,
        tooltipY,
      };
    });

    const bars = chartRows
      .map((item) => {
        const row = item.row;
        return `
          <g>
            ${chartBar(item.start, row.conforming, yMax, plot, barWidth, colors.conforming)}
            ${chartBar(item.start + barWidth + barGap, row.expiring, yMax, plot, barWidth, colors.expiring)}
            ${chartBar(item.start + (barWidth + barGap) * 2, row.nonCompliant, yMax, plot, barWidth, colors.nonCompliant)}
            <text class="chart-x-label" x="${item.center}" y="${plot.y + plot.height + 25}" text-anchor="middle">${escapeSvg(shortLabel(row.department, 15))}</text>
          </g>
        `;
      })
      .join("");

    const tooltips = chartRows
      .map((item) => {
        const row = item.row;
        return `
          <g class="chart-group" tabindex="0" aria-label="${escapeAttr(row.department)}: ${row.conforming} conformi, ${row.expiring} in scadenza, ${row.nonCompliant} non conformi">
            <rect class="chart-hover-band" x="${item.hoverX}" y="${plot.y}" width="${item.hoverWidth}" height="${plot.height}" rx="8" />
            <g class="chart-tooltip" transform="translate(${item.tooltipX}, ${item.tooltipY})">
              <rect width="${item.tooltipWidth}" height="${item.tooltipHeight}" rx="9" />
              <text class="chart-tooltip-title" x="16" y="28">${escapeSvg(shortLabel(row.department, 20))}</text>
              <text class="chart-tooltip-line tooltip-success" x="16" y="58">Conformi: ${row.conforming}</text>
              <text class="chart-tooltip-line tooltip-warning" x="16" y="84">In scadenza: ${row.expiring}</text>
              <text class="chart-tooltip-line tooltip-danger" x="16" y="110">Non conformi: ${row.nonCompliant}</text>
            </g>
          </g>
        `;
      })
      .join("");

    return `
      <div class="department-chart" aria-label="Compliance per reparto">
        <svg viewBox="0 0 920 320" role="img">
          <g>
            ${grid}
            <line class="chart-axis" x1="${plot.x}" y1="${plot.y + plot.height}" x2="${plot.x + plot.width}" y2="${plot.y + plot.height}" />
            <line class="chart-axis" x1="${plot.x}" y1="${plot.y}" x2="${plot.x}" y2="${plot.y + plot.height}" />
            ${bars}
            ${tooltips}
          </g>
        </svg>
        <div class="chart-legend">
          <span><i style="background:${colors.conforming}"></i>Conformi</span>
          <span><i style="background:${colors.expiring}"></i>In scadenza</span>
          <span><i style="background:${colors.nonCompliant}"></i>Non conformi</span>
        </div>
      </div>
    `;
  }

  function chartBar(x, value, yMax, plot, width, color) {
    const height = Math.max(0, (value / yMax) * plot.height);
    const y = plot.y + plot.height - height;
    return `
      <rect class="chart-bar" x="${x}" y="${y}" width="${width}" height="${height}" rx="5" fill="${color}"></rect>
    `;
  }

  function niceChartMax(value) {
    if (value <= 12) return 12;
    if (value <= 20) return 20;
    if (value <= 40) return 40;
    if (value <= 60) return 60;
    return Math.ceil(value / 25) * 25;
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
      <tr class="${state.selectedEmployeeId === employee.id ? "is-selected-row" : ""}">
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
    state.uploadEmployeeQuery = "";
    state.uploadPickerOpen = false;
    state.uploadIssueDate = todayISO();
    state.uploadExpiryDate = defaultExpiryForUpload();
    state.uploadFileName = "";
    setView("upload");
  }

  async function registerTrainingCertificate() {
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

    source.certificateRepository.rows.push({
      "Certificate ID": certificate.id,
      "Required Obligation ID": certificate.obligationId,
      "Employee ID": certificate.employeeId,
      Nome: aggregate.employee.name,
      Cognome: aggregate.employee.surname,
      Reparto: certificate.department,
      Mansione: certificate.job,
      "Role ID": certificate.roleId,
      "Course ID": certificate.courseId,
      "Corso obbligatorio": certificate.courseName,
      "Rinnovo mesi": certificate.renewalMonths,
      "Certificate Presence": "Present",
      "Issue Date": certificate.issueDate,
      "Expiry Date": certificate.expiryDate,
      "Evidence File": certificate.evidenceFile,
    });
    source.quality.certificates = source.certificateRepository.rows.length;
    if (state.session && state.session.organizationId) {
      try {
        source = await window.InfineaBackend.saveComplianceSource(state.session.organizationId, source);
      } catch (error) {
        showToast(error.message || "Attestato non salvato nel database centrale.");
        return;
      }
    }
    state.selectedEmployeeId = obligation.employeeId;
    state.uploadObligationId = "";
    state.uploadExpiryDate = "";
    state.uploadFileName = "";
    state.uploadNote = "";
    state.model = buildComplianceModel(state.asOf);
    renderNotice();
    showToast("Attestato registrato nel database centrale e compliance ricalcolata.");
    setView("employees");
  }

  async function processDataImport() {
    const input = document.getElementById("dataImportFiles");
    const files = input ? Array.from(input.files || []) : [];
    if (!files.length) {
      showToast("Seleziona almeno un file Excel o CSV da importare.");
      return;
    }
    if (!window.InfineaImporter) {
      showToast("Modulo import non disponibile.");
      return;
    }
    if (!state.session || !state.session.organizationId) {
      showToast("Seleziona o accedi a un'azienda prima di importare.");
      return;
    }

    state.importBusy = true;
    state.importError = "";
    state.importResult = null;
    renderCurrentView();

    try {
      const result = await window.InfineaImporter.importFiles(files, {
        companyName: state.importCompanyName,
      });
      state.importResult = result;
      if (result.summary.errors.length) {
        state.importError = "Correggi gli errori bloccanti prima di salvare il database.";
        showToast("Import letto, ma non salvato per errori bloccanti.");
        return;
      }

      result.source.meta.pilotCompany =
        state.importCompanyName || state.session.organizationName || result.source.meta.pilotCompany;
      source = result.source;
      state.uploadedCertificates = [];
      saveUploadedCertificates();
      source = await window.InfineaBackend.saveComplianceSource(state.session.organizationId, source);
      state.model = buildComplianceModel(state.asOf);
      initMeta();
      renderNotice();
      showToast("Database aziendale popolato. Dashboard aggiornata.");
      setView("dashboard");
    } catch (error) {
      state.importError = error.message || "Import non riuscito.";
      showToast(state.importError);
    } finally {
      state.importBusy = false;
      renderCurrentView();
    }
  }

  async function clearLocalDatabase() {
    if (!state.session || !state.session.organizationId) {
      showToast("Nessuna azienda selezionata.");
      return;
    }
    source = createEmptyComplianceSource();
    state.uploadedCertificates = [];
    state.importResult = null;
    state.importError = "";
    state.selectedEmployeeId = "";
    state.uploadEmployeeId = "";
    state.uploadObligationId = "";
    saveUploadedCertificates();
    try {
      await window.InfineaBackend.clearComplianceSource(state.session.organizationId);
    } catch (error) {
      showToast(error.message || "Database non svuotato.");
      return;
    }
    state.model = buildComplianceModel(state.asOf);
    initMeta();
    renderNotice();
    setView("setup");
    showToast("Database azienda svuotato.");
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

  function createEmptyComplianceSource() {
    return {
      meta: {
        productName: "Infinea AuditMate",
        pilotCompany: "Azienda cliente",
        scope: "Health & Safety Training Compliance",
        preparedAt: new Date().toISOString(),
        sourceFiles: {},
        notes: ["Database vuoto in attesa di import dati cliente."],
      },
      employees: {
        sheetName: "Employee Registry",
        headers: ["Employee ID", "Nome", "Cognome", "Reparto", "Mansione", "Role ID", "N. corsi richiesti"],
        rows: [],
      },
      roleObligationMatrix: {
        sheetName: "Role Obligation Matrix",
        headers: [
          "Matrix Row ID",
          "Role ID",
          "Reparto",
          "Mansione",
          "Course ID",
          "Corso obbligatorio",
          "Categoria corso",
          "Rinnovo mesi",
          "Profilo rischio corso",
        ],
        rows: [],
      },
      requiredObligations: {
        sheetName: "Required Obligations",
        headers: [
          "Required Obligation ID",
          "Employee ID",
          "Nome",
          "Cognome",
          "Reparto",
          "Mansione",
          "Role ID",
          "Course ID",
          "Corso obbligatorio",
          "Categoria corso",
          "Rinnovo mesi",
          "Profilo rischio corso",
          "Controllo",
          "Valore atteso",
          "Valore effettivo",
        ],
        rows: [],
      },
      certificateRepository: {
        sheetName: "Certificate Repository",
        headers: [
          "Certificate ID",
          "Required Obligation ID",
          "Employee ID",
          "Nome",
          "Cognome",
          "Reparto",
          "Mansione",
          "Role ID",
          "Course ID",
          "Corso obbligatorio",
          "Rinnovo mesi",
          "Certificate Presence",
          "Issue Date",
          "Expiry Date",
          "Evidence File",
        ],
        rows: [],
      },
      quality: createEmptyQuality(),
    };
  }

  function createEmptyQuality() {
    return {
      employees: 0,
      roles: 0,
      requiredObligations: 0,
      certificates: 0,
      matrixRows: 0,
      missingCertificateRows: [],
      unknownEmployeeInObligations: [],
      unknownEmployeeInCertificates: [],
    };
  }

  function hasComplianceData() {
    return Boolean(
      source &&
        source.employees &&
        source.employees.rows &&
        source.employees.rows.length
    );
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
      showToast("Attestato registrato, ma il browser non ha salvato la cache temporanea.");
    }
  }

  function loadSidebarCollapsed() {
    try {
      return window.localStorage.getItem(LOCAL_SIDEBAR_KEY) === "true";
    } catch (error) {
      return false;
    }
  }

  function saveSidebarCollapsed(collapsed) {
    try {
      window.localStorage.setItem(LOCAL_SIDEBAR_KEY, String(collapsed));
    } catch (error) {
      // La preferenza visiva puo restare solo nella sessione corrente.
    }
  }

  function downloadGapsCsv() {
    if (!hasComplianceData()) {
      showToast("Importa prima i dati cliente.");
      setView("setup");
      return;
    }
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
    if (!hasComplianceData()) {
      showToast("Importa prima i dati cliente.");
      setView("setup");
      return;
    }
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

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
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

  function formatAccessEmail(value) {
    return String(value || "").trim().toLowerCase();
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

  function escapeSvg(value) {
    return escapeHtml(value);
  }

  function shortLabel(value, maxLength) {
    const text = String(value || "");
    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
  }

  document.addEventListener("DOMContentLoaded", init);
})();
