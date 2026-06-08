(function () {
  "use strict";

  const STANDARD_HEADERS = {
    employees: [
      "Employee ID",
      "Nome",
      "Cognome",
      "Reparto",
      "Mansione",
      "Role ID",
      "N. corsi richiesti",
    ],
    roleObligationMatrix: [
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
    requiredObligations: [
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
    certificateRepository: [
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
  };

  const ALIASES = {
    "Employee ID": ["employee id", "id dipendente", "codice dipendente", "matricola"],
    Nome: ["nome", "first name", "name"],
    Cognome: ["cognome", "surname", "last name"],
    Reparto: ["reparto", "department", "area", "funzione"],
    Mansione: ["mansione", "job", "ruolo", "posizione", "qualifica"],
    "Role ID": ["role id", "id ruolo", "codice ruolo"],
    "N. corsi richiesti": ["n. corsi richiesti", "corsi richiesti", "numero corsi richiesti"],
    "Matrix Row ID": ["matrix row id", "id matrice", "matrix id"],
    "Course ID": ["course id", "id corso", "codice corso"],
    "Corso obbligatorio": ["corso obbligatorio", "corso", "course", "nome corso"],
    "Categoria corso": ["categoria corso", "categoria", "course category"],
    "Rinnovo mesi": ["rinnovo mesi", "validita mesi", "validita", "renewal months"],
    "Profilo rischio corso": ["profilo rischio corso", "profilo rischio", "rischio"],
    "Required Obligation ID": ["required obligation id", "id obbligo", "obligation id"],
    Controllo: ["controllo", "check"],
    "Valore atteso": ["valore atteso", "expected value"],
    "Valore effettivo": ["valore effettivo", "actual value"],
    "Certificate ID": ["certificate id", "id attestato", "attestato id"],
    "Certificate Presence": ["certificate presence", "presenza attestato", "presenza", "stato attestato"],
    "Issue Date": ["issue date", "data rilascio", "data emissione", "data corso", "data conclusione"],
    "Expiry Date": ["expiry date", "data scadenza", "scadenza"],
    "Evidence File": ["evidence file", "file evidenza", "evidenza", "documento"],
  };

  const SECTION_LABELS = {
    employees: "Anagrafica dipendenti",
    roleObligationMatrix: "Matrice ruolo-obbligo",
    requiredObligations: "Obblighi richiesti",
    certificateRepository: "Repository attestati",
  };

  async function importFiles(fileList, options) {
    const files = Array.from(fileList || []);
    const opts = options || {};
    if (!files.length) {
      throw new Error("Seleziona almeno un file Excel o CSV.");
    }

    const sheets = [];
    for (const file of files) {
      const parsed = await parseFile(file);
      sheets.push(...parsed);
    }

    if (!sheets.length) {
      throw new Error("Non sono stati trovati fogli o righe leggibili nei file caricati.");
    }

    return normalizeImport(sheets, files, opts);
  }

  async function parseFile(file) {
    const name = file.name || "file";
    const lower = name.toLowerCase();
    if (lower.endsWith(".csv")) {
      const text = await file.text();
      const rows = parseDelimited(text);
      return [tableToSheet(stripExtension(name), rows, name)];
    }
    if (lower.endsWith(".xlsx")) {
      return parseXlsx(file);
    }
    throw new Error(`Formato non supportato: ${name}. Usa .xlsx o .csv.`);
  }

  function parseDelimited(text) {
    const delimiter = detectDelimiter(text);
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      if (quoted) {
        if (char === '"' && next === '"') {
          cell += '"';
          i += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          cell += char;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === delimiter) {
        row.push(cell);
        cell = "";
      } else if (char === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else if (char !== "\r") {
        cell += char;
      }
    }

    row.push(cell);
    if (row.some((value) => String(value).trim())) rows.push(row);
    return rows;
  }

  function detectDelimiter(text) {
    const firstLine = text.split(/\r?\n/, 1)[0] || "";
    const candidates = [",", ";", "\t"];
    return candidates
      .map((delimiter) => ({
        delimiter,
        count: firstLine.split(delimiter).length,
      }))
      .sort((a, b) => b.count - a.count)[0].delimiter;
  }

  function tableToSheet(sheetName, table, sourceFile) {
    const firstDataRow = table.findIndex((row) => row.some((cell) => String(cell || "").trim()));
    if (firstDataRow === -1) {
      return { name: sheetName, headers: [], rows: [], sourceFile };
    }
    const headers = Array.from(table[firstDataRow] || [], (cell) => String(cell || "").trim());
    const rows = table
      .slice(firstDataRow + 1)
      .filter((row) => row.some((cell) => String(cell || "").trim()))
      .map((row) => {
        const item = {};
        headers.forEach((header, index) => {
          if (header) item[header] = normalizeCellValue(row[index]);
        });
        return item;
      });
    return { name: sheetName, headers, rows, sourceFile };
  }

  async function parseXlsx(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const zip = await unzip(bytes);
    const workbookXml = zip["xl/workbook.xml"];
    if (!workbookXml) {
      throw new Error(`${file.name}: workbook.xml non trovato. Il file Excel non sembra valido.`);
    }

    const relsXml = zip["xl/_rels/workbook.xml.rels"];
    const relationships = parseWorkbookRelationships(relsXml || "");
    const workbook = parseWorkbook(workbookXml);
    const sharedStrings = parseSharedStrings(zip["xl/sharedStrings.xml"] || "");
    const sheets = [];

    workbook.forEach((sheet, index) => {
      const target = relationships[sheet.relId] || `worksheets/sheet${index + 1}.xml`;
      const path = resolveWorkbookTarget(target);
      const xml = zip[path];
      if (!xml) return;
      sheets.push(parseWorksheet(xml, sharedStrings, sheet.name, file.name));
    });

    if (!sheets.length) {
      Object.keys(zip)
        .filter((path) => path.startsWith("xl/worksheets/") && path.endsWith(".xml"))
        .sort()
        .forEach((path, index) => {
          sheets.push(parseWorksheet(zip[path], sharedStrings, `Sheet ${index + 1}`, file.name));
        });
    }

    return sheets;
  }

  async function unzip(bytes) {
    const entries = readZipEntries(bytes);
    const result = {};
    for (const entry of entries) {
      if (entry.name.endsWith("/")) continue;
      const data = entry.method === 0 ? entry.data : await inflateEntry(entry);
      result[normalizeZipPath(entry.name)] = new TextDecoder("utf-8").decode(data);
    }
    return result;
  }

  function readZipEntries(bytes) {
    const eocdOffset = findEndOfCentralDirectory(bytes);
    const entriesCount = readUInt16(bytes, eocdOffset + 10);
    const centralDirectoryOffset = readUInt32(bytes, eocdOffset + 16);
    const entries = [];
    let offset = centralDirectoryOffset;

    for (let index = 0; index < entriesCount; index += 1) {
      if (readUInt32(bytes, offset) !== 0x02014b50) break;
      const method = readUInt16(bytes, offset + 10);
      const compressedSize = readUInt32(bytes, offset + 20);
      const fileNameLength = readUInt16(bytes, offset + 28);
      const extraLength = readUInt16(bytes, offset + 30);
      const commentLength = readUInt16(bytes, offset + 32);
      const localHeaderOffset = readUInt32(bytes, offset + 42);
      const name = new TextDecoder("utf-8").decode(
        bytes.slice(offset + 46, offset + 46 + fileNameLength)
      );

      const localNameLength = readUInt16(bytes, localHeaderOffset + 26);
      const localExtraLength = readUInt16(bytes, localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      entries.push({
        name,
        method,
        data: bytes.slice(dataStart, dataStart + compressedSize),
      });
      offset += 46 + fileNameLength + extraLength + commentLength;
    }

    return entries;
  }

  async function inflateEntry(entry) {
    if (entry.method !== 8) {
      throw new Error(`Metodo ZIP non supportato nel file Excel: ${entry.method}`);
    }
    if (!("DecompressionStream" in window)) {
      throw new Error(
        "Questo browser non puo leggere XLSX direttamente. Usa Chrome/Edge aggiornato o carica CSV."
      );
    }
    const errors = [];
    for (const format of ["deflate-raw", "deflate"]) {
      try {
        return await inflateWithFormat(entry.data, format);
      } catch (error) {
        errors.push(error);
      }
    }
    const message = errors[0] && errors[0].message ? errors[0].message : "decompressione non riuscita";
    throw new Error(`Non riesco a leggere questo XLSX nel browser (${message}). Prova con Chrome/Edge aggiornato o esporta il file in CSV.`);
  }

  async function inflateWithFormat(data, format) {
    const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream(format));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  function findEndOfCentralDirectory(bytes) {
    for (let index = bytes.length - 22; index >= 0; index -= 1) {
      if (readUInt32(bytes, index) === 0x06054b50) return index;
    }
    throw new Error("Archivio XLSX non leggibile: fine ZIP non trovata.");
  }

  function readUInt16(bytes, offset) {
    return bytes[offset] | (bytes[offset + 1] << 8);
  }

  function readUInt32(bytes, offset) {
    return (
      (bytes[offset] |
        (bytes[offset + 1] << 8) |
        (bytes[offset + 2] << 16) |
        (bytes[offset + 3] << 24)) >>>
      0
    );
  }

  function parseWorkbook(xml) {
    const doc = parseXml(xml);
    return Array.from(doc.getElementsByTagName("sheet")).map((sheet) => ({
      name: sheet.getAttribute("name") || "Sheet",
      relId:
        sheet.getAttribute("r:id") ||
        sheet.getAttribute("id") ||
        sheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id"),
    }));
  }

  function parseWorkbookRelationships(xml) {
    const result = {};
    if (!xml) return result;
    const doc = parseXml(xml);
    Array.from(doc.getElementsByTagName("Relationship")).forEach((rel) => {
      const id = rel.getAttribute("Id");
      const target = rel.getAttribute("Target");
      if (id && target) result[id] = target;
    });
    return result;
  }

  function parseSharedStrings(xml) {
    if (!xml) return [];
    const doc = parseXml(xml);
    return Array.from(doc.getElementsByTagName("si")).map((item) =>
      Array.from(item.getElementsByTagName("t"))
        .map((node) => node.textContent || "")
        .join("")
    );
  }

  function parseWorksheet(xml, sharedStrings, sheetName, sourceFile) {
    const doc = parseXml(xml);
    const table = [];
    Array.from(doc.getElementsByTagName("row")).forEach((rowNode) => {
      const row = [];
      Array.from(rowNode.getElementsByTagName("c")).forEach((cellNode) => {
        const ref = cellNode.getAttribute("r") || "";
        const column = columnIndex(ref.replace(/\d+/g, ""));
        row[column] = readCellValue(cellNode, sharedStrings);
      });
      table.push(row);
    });
    return tableToSheet(sheetName, table, sourceFile);
  }

  function readCellValue(cellNode, sharedStrings) {
    const type = cellNode.getAttribute("t");
    if (type === "inlineStr") {
      return Array.from(cellNode.getElementsByTagName("t"))
        .map((node) => node.textContent || "")
        .join("");
    }
    const valueNode = cellNode.getElementsByTagName("v")[0];
    const raw = valueNode ? valueNode.textContent || "" : "";
    if (type === "s") return sharedStrings[Number(raw)] || "";
    if (type === "b") return raw === "1";
    return normalizeCellValue(raw);
  }

  function columnIndex(columnLetters) {
    return columnLetters.split("").reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1;
  }

  function parseXml(xml) {
    return new DOMParser().parseFromString(xml, "application/xml");
  }

  function normalizeImport(sheets, files, options) {
    const assignments = assignSheets(sheets);
    const warnings = [];
    const errors = [];

    const employees = normalizeSection(assignments.employees, "employees");
    const matrix = normalizeSection(assignments.roleObligationMatrix, "roleObligationMatrix");
    let obligations = normalizeSection(assignments.requiredObligations, "requiredObligations");
    let certificates = normalizeSection(assignments.certificateRepository, "certificateRepository");

    fillEmployeeRoles(employees.rows);
    fillMatrixIds(matrix.rows, employees.rows);

    if (!obligations.rows.length && employees.rows.length && matrix.rows.length) {
      obligations = buildObligationsFromMatrix(employees.rows, matrix.rows);
      warnings.push("Obblighi richiesti generati automaticamente da anagrafica e matrice ruolo-obbligo.");
    } else {
      fillObligationDetails(obligations.rows, employees.rows, matrix.rows);
    }

    fillCertificateLinks(certificates.rows, obligations.rows, employees.rows, matrix.rows);
    validateImport(employees.rows, matrix.rows, obligations.rows, certificates.rows, errors, warnings);

    const source = {
      meta: {
        productName: "Infinea AuditMate",
        pilotCompany: options.companyName || inferCompanyName(files) || "Azienda cliente",
        scope: "Health & Safety Training Compliance",
        preparedAt: new Date().toISOString(),
        sourceFiles: files.reduce((acc, file) => {
          acc[stripExtension(file.name || "file")] = file.name || "file";
          return acc;
        }, {}),
        notes: [
          "Dati importati dal cliente tramite procedura guidata.",
          "Database locale di sviluppo: in produzione sara sostituito da backend e database multi-cliente.",
        ],
      },
      employees,
      roleObligationMatrix: matrix,
      requiredObligations: obligations,
      certificateRepository: certificates,
      quality: buildQuality(employees.rows, matrix.rows, obligations.rows, certificates.rows),
    };

    return {
      source,
      assignments: Object.fromEntries(
        Object.entries(assignments).map(([key, value]) => [
          key,
          value ? `${value.name} (${value.sourceFile})` : null,
        ])
      ),
      summary: {
        employees: employees.rows.length,
        roleObligationMatrix: matrix.rows.length,
        requiredObligations: obligations.rows.length,
        certificateRepository: certificates.rows.length,
        warnings,
        errors,
      },
    };
  }

  function assignSheets(sheets) {
    const result = {};
    Object.keys(STANDARD_HEADERS).forEach((section) => {
      let best = null;
      sheets.forEach((sheet) => {
        const score = scoreSheet(sheet, section);
        if (score > 0 && (!best || score > best.score)) best = { sheet, score };
      });
      result[section] = best ? best.sheet : null;
    });
    return result;
  }

  function scoreSheet(sheet, section) {
    const normalizedHeaders = new Set((sheet.headers || []).map(normalizeKey));
    const has = (field) => Boolean(findHeader(field, normalizedHeaders));
    if (section === "employees" && !(has("Employee ID") && (has("Nome") || has("Cognome") || has("Mansione")))) {
      return 0;
    }
    if (section === "roleObligationMatrix" && !(has("Role ID") && (has("Course ID") || has("Corso obbligatorio")))) {
      return 0;
    }
    if (section === "requiredObligations" && !(has("Employee ID") && (has("Course ID") || has("Corso obbligatorio")))) {
      return 0;
    }
    if (section === "requiredObligations" && (has("Certificate ID") || has("Issue Date") || has("Expiry Date"))) {
      return 0;
    }
    if (section === "certificateRepository" && !(has("Certificate ID") || has("Issue Date") || has("Expiry Date"))) {
      return 0;
    }
    const headerScore = STANDARD_HEADERS[section].reduce((score, field) => {
      return score + (findHeader(field, normalizedHeaders) ? 1 : 0);
    }, 0);
    const name = normalizeKey(`${sheet.name} ${sheet.sourceFile}`);
    const nameBonus =
      section === "employees" && /employee|dipendent|anagrafic|registry/.test(name)
        ? 4
        : section === "roleObligationMatrix" && /matrix|matrice|ruol/.test(name)
          ? 4
          : section === "requiredObligations" && /required|obbligh/.test(name)
            ? 4
            : section === "certificateRepository" && /certificat|attestat|repository/.test(name)
              ? 4
              : 0;
    const conflictPenalty =
      section === "employees" && (has("Certificate ID") || has("Required Obligation ID"))
        ? 8
        : section === "roleObligationMatrix" && has("Employee ID")
          ? 5
          : section === "requiredObligations" && (has("Certificate ID") || has("Issue Date") || has("Expiry Date"))
            ? 9
            : section === "certificateRepository" && (has("Certificate ID") || has("Issue Date") || has("Expiry Date"))
              ? -4
              : 0;
    return Math.max(0, headerScore + nameBonus - conflictPenalty);
  }

  function normalizeSection(sheet, section) {
    const headers = STANDARD_HEADERS[section];
    if (!sheet) return { sheetName: SECTION_LABELS[section], headers, rows: [] };
    const normalizedHeaderMap = new Map((sheet.headers || []).map((header) => [normalizeKey(header), header]));
    const mapping = {};
    headers.forEach((field) => {
      const header = findHeader(field, normalizedHeaderMap);
      if (header) mapping[field] = header;
    });

    const rows = sheet.rows
      .map((row) => {
        const normalized = {};
        headers.forEach((field) => {
          normalized[field] = normalizeFieldValue(field, row[mapping[field]]);
        });
        return normalized;
      })
      .filter((row) => Object.values(row).some((value) => String(value || "").trim()));

    return { sheetName: sheet.name, headers, rows };
  }

  function findHeader(field, headersOrMap) {
    const candidates = [field].concat(ALIASES[field] || []).map(normalizeKey);
    if (headersOrMap instanceof Map) {
      const key = candidates.find((candidate) => headersOrMap.has(candidate));
      return key ? headersOrMap.get(key) : "";
    }
    return candidates.find((candidate) => headersOrMap.has(candidate));
  }

  function fillEmployeeRoles(employees) {
    const roleByJob = new Map();
    employees.forEach((row) => {
      const key = normalizeKey(`${row.Reparto}|${row.Mansione}`);
      if (!row["Role ID"]) {
        if (!roleByJob.has(key)) roleByJob.set(key, `R${String(roleByJob.size + 1).padStart(3, "0")}`);
        row["Role ID"] = roleByJob.get(key);
      } else if (!roleByJob.has(key)) {
        roleByJob.set(key, row["Role ID"]);
      }
    });
  }

  function fillMatrixIds(matrix, employees) {
    const roleByJob = new Map(
      employees.map((row) => [normalizeKey(`${row.Reparto}|${row.Mansione}`), row["Role ID"]])
    );
    const courseIds = new Map();
    matrix.forEach((row, index) => {
      const jobKey = normalizeKey(`${row.Reparto}|${row.Mansione}`);
      if (!row["Role ID"]) row["Role ID"] = roleByJob.get(jobKey) || `R${String(index + 1).padStart(3, "0")}`;
      if (!row["Course ID"]) {
        const courseKey = normalizeKey(row["Corso obbligatorio"]);
        if (!courseIds.has(courseKey)) courseIds.set(courseKey, `C${String(courseIds.size + 1).padStart(3, "0")}`);
        row["Course ID"] = courseIds.get(courseKey);
      }
      if (!row["Matrix Row ID"]) row["Matrix Row ID"] = `M${String(index + 1).padStart(3, "0")}`;
      if (!row["Rinnovo mesi"]) row["Rinnovo mesi"] = 60;
    });
  }

  function buildObligationsFromMatrix(employees, matrix) {
    const rows = [];
    let index = 1;
    employees.forEach((employee) => {
      const matching = matrix.filter(
        (item) =>
          item["Role ID"] === employee["Role ID"] ||
          normalizeKey(`${item.Reparto}|${item.Mansione}`) === normalizeKey(`${employee.Reparto}|${employee.Mansione}`)
      );
      matching.forEach((item) => {
        rows.push({
          "Required Obligation ID": `REQ${String(index).padStart(4, "0")}`,
          "Employee ID": employee["Employee ID"],
          Nome: employee.Nome,
          Cognome: employee.Cognome,
          Reparto: employee.Reparto,
          Mansione: employee.Mansione,
          "Role ID": employee["Role ID"],
          "Course ID": item["Course ID"],
          "Corso obbligatorio": item["Corso obbligatorio"],
          "Categoria corso": item["Categoria corso"],
          "Rinnovo mesi": item["Rinnovo mesi"],
          "Profilo rischio corso": item["Profilo rischio corso"],
          Controllo: "Attestato presente e valido",
          "Valore atteso": "Present",
          "Valore effettivo": "",
        });
        index += 1;
      });
    });
    return {
      sheetName: "Required Obligations",
      headers: STANDARD_HEADERS.requiredObligations,
      rows,
    };
  }

  function fillObligationDetails(obligations, employees, matrix) {
    const employeeById = new Map(employees.map((row) => [row["Employee ID"], row]));
    const matrixByRoleCourse = new Map(matrix.map((row) => [`${row["Role ID"]}|${row["Course ID"]}`, row]));
    obligations.forEach((row, index) => {
      if (!row["Required Obligation ID"]) row["Required Obligation ID"] = `REQ${String(index + 1).padStart(4, "0")}`;
      const employee = employeeById.get(row["Employee ID"]) || {};
      ["Nome", "Cognome", "Reparto", "Mansione", "Role ID"].forEach((field) => {
        if (!row[field]) row[field] = employee[field] || "";
      });
      const matrixRow = matrixByRoleCourse.get(`${row["Role ID"]}|${row["Course ID"]}`) || {};
      ["Corso obbligatorio", "Categoria corso", "Rinnovo mesi", "Profilo rischio corso"].forEach((field) => {
        if (!row[field]) row[field] = matrixRow[field] || "";
      });
      if (!row.Controllo) row.Controllo = "Attestato presente e valido";
      if (!row["Valore atteso"]) row["Valore atteso"] = "Present";
    });
  }

  function fillCertificateLinks(certificates, obligations, employees, matrix) {
    const obligationById = new Map(obligations.map((row) => [row["Required Obligation ID"], row]));
    const obligationByEmployeeCourse = new Map(
      obligations.map((row) => [`${row["Employee ID"]}|${row["Course ID"]}`, row])
    );
    const employeeById = new Map(employees.map((row) => [row["Employee ID"], row]));
    const matrixByCourse = new Map(matrix.map((row) => [row["Course ID"], row]));
    certificates.forEach((row, index) => {
      if (!row["Certificate ID"]) row["Certificate ID"] = `CERT-${String(index + 1).padStart(4, "0")}`;
      let obligation = null;
      if (row["Employee ID"] && row["Course ID"]) {
        obligation = obligationByEmployeeCourse.get(`${row["Employee ID"]}|${row["Course ID"]}`) || null;
      }
      if (!obligation) obligation = obligationById.get(row["Required Obligation ID"]) || null;
      if (obligation) row["Required Obligation ID"] = obligation["Required Obligation ID"];
      const employee = employeeById.get(row["Employee ID"]) || obligation || {};
      ["Nome", "Cognome", "Reparto", "Mansione", "Role ID"].forEach((field) => {
        if (!row[field]) row[field] = employee[field] || "";
      });
      if (!row["Course ID"] && obligation) row["Course ID"] = obligation["Course ID"];
      const matrixRow = matrixByCourse.get(row["Course ID"]) || obligation || {};
      ["Corso obbligatorio", "Rinnovo mesi"].forEach((field) => {
        if (!row[field]) row[field] = matrixRow[field] || "";
      });
      if (!row["Certificate Presence"]) row["Certificate Presence"] = "Present";
    });
  }

  function validateImport(employees, matrix, obligations, certificates, errors, warnings) {
    if (!employees.length) errors.push("Manca l'anagrafica dipendenti.");
    if (!matrix.length && !obligations.length) {
      errors.push("Manca la matrice ruolo-obbligo o un elenco di obblighi richiesti.");
    }
    const employeeIds = new Set(employees.map((row) => row["Employee ID"]).filter(Boolean));
    const duplicateEmployees = findDuplicates(employees.map((row) => row["Employee ID"]).filter(Boolean));
    if (duplicateEmployees.length) warnings.push(`${duplicateEmployees.length} ID dipendente duplicati.`);

    const unknownObligations = obligations.filter((row) => row["Employee ID"] && !employeeIds.has(row["Employee ID"]));
    if (unknownObligations.length) warnings.push(`${unknownObligations.length} obblighi hanno Employee ID non presente.`);

    const unknownCertificates = certificates.filter((row) => row["Employee ID"] && !employeeIds.has(row["Employee ID"]));
    if (unknownCertificates.length) warnings.push(`${unknownCertificates.length} attestati hanno Employee ID non presente.`);

    const invalidDates = certificates.filter(
      (row) => (row["Issue Date"] && !isISODate(row["Issue Date"])) || (row["Expiry Date"] && !isISODate(row["Expiry Date"]))
    );
    if (invalidDates.length) warnings.push(`${invalidDates.length} attestati hanno date non riconosciute.`);
  }

  function buildQuality(employees, matrix, obligations, certificates) {
    const employeeIds = new Set(employees.map((row) => row["Employee ID"]));
    const certificateObligations = new Set(
      certificates
        .filter((row) => String(row["Certificate Presence"] || "").toLowerCase().includes("present"))
        .map((row) => row["Required Obligation ID"])
    );
    return {
      employees: employees.length,
      roles: new Set(employees.map((row) => row["Role ID"]).filter(Boolean)).size,
      requiredObligations: obligations.length,
      certificates: certificates.length,
      matrixRows: matrix.length,
      missingCertificateRows: obligations
        .filter((row) => !certificateObligations.has(row["Required Obligation ID"]))
        .map((row) => row["Required Obligation ID"]),
      unknownEmployeeInObligations: obligations
        .filter((row) => row["Employee ID"] && !employeeIds.has(row["Employee ID"]))
        .map((row) => row["Employee ID"]),
      unknownEmployeeInCertificates: certificates
        .filter((row) => row["Employee ID"] && !employeeIds.has(row["Employee ID"]))
        .map((row) => row["Employee ID"]),
    };
  }

  function normalizeFieldValue(field, value) {
    if (value === undefined || value === null) return "";
    if (field === "Issue Date" || field === "Expiry Date") return normalizeDate(value);
    if (field === "Rinnovo mesi" || field === "N. corsi richiesti") return Number(value) || "";
    return String(value).trim();
  }

  function normalizeCellValue(value) {
    if (value === undefined || value === null) return "";
    const text = String(value).trim();
    if (!text) return "";
    if (/^-?\d+([.,]\d+)?$/.test(text)) return Number(text.replace(",", "."));
    return text;
  }

  function normalizeDate(value) {
    if (!value) return "";
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10);
    }
    if (typeof value === "number") return excelDateToISO(value);
    const text = String(value).trim();
    if (!text) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    const isoDateTime = text.match(/^(\d{4}-\d{2}-\d{2})[ tT]\d{1,2}:\d{2}/);
    if (isoDateTime) return isoDateTime[1];
    const dateMatch = text.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, "0");
      const month = dateMatch[2].padStart(2, "0");
      const year = dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3];
      return `${year}-${month}-${day}`;
    }
    return text;
  }

  function excelDateToISO(serial) {
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const date = new Date(utcValue * 1000);
    return date.toISOString().slice(0, 10);
  }

  function isISODate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
  }

  function findDuplicates(values) {
    const seen = new Set();
    const duplicates = new Set();
    values.forEach((value) => {
      if (seen.has(value)) duplicates.add(value);
      seen.add(value);
    });
    return Array.from(duplicates);
  }

  function inferCompanyName(files) {
    const first = files[0] && files[0].name ? stripExtension(files[0].name) : "";
    return first.replace(/employee|registry|required|obligations|certificate|repository|matrix|role/gi, "").trim();
  }

  function stripExtension(name) {
    return String(name || "").replace(/\.[^.]+$/, "");
  }

  function normalizeKey(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function normalizeZipPath(path) {
    const parts = [];
    String(path || "")
      .replace(/\\/g, "/")
      .split("/")
      .forEach((part) => {
        if (!part || part === ".") return;
        if (part === "..") parts.pop();
        else parts.push(part);
      });
    return parts.join("/");
  }

  function resolveWorkbookTarget(target) {
    const normalized = normalizeZipPath(target.startsWith("/") ? target.slice(1) : target);
    if (normalized.startsWith("xl/")) return normalized;
    return normalizeZipPath(`xl/${normalized}`);
  }

  window.InfineaImporter = {
    importFiles,
    standardHeaders: STANDARD_HEADERS,
  };
})();
