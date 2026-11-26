function hasValidRestockSignature(issuedAt, body, signature) {
  const maxAgeMs = 5 * 60 * 1000;

  if (
    !Number.isSafeInteger(issuedAt) ||
    Math.abs(Date.now() - issuedAt) > maxAgeMs ||
    typeof body !== "string" ||
    typeof signature !== "string"
  ) {
    return false;
  }

  const secret = PropertiesService.getScriptProperties().getProperty(
    "GOOGLE_SHEETS_SIGNING_SECRET",
  );
  if (!secret) return false;

  const bytes = Utilities.computeHmacSha256Signature(
    `${issuedAt}.${body}`,
    secret,
    Utilities.Charset.UTF_8,
  );
  const expected = Utilities.base64Encode(bytes);

  if (signature.length !== expected.length) return false;

  let difference = 0;
  for (let i = 0; i < expected.length; i++) {
    difference |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return difference === 0;
}

function doPost(e) {
  let request;

  try {
    request = JSON.parse(e.postData.contents);
  } catch {
    return jsonResponse({ ok: false, code: "invalid_json" });
  }

  const { issuedAt, body, signature } = request ?? {};

  if (!hasValidRestockSignature(issuedAt, body, signature)) {
    return jsonResponse({ ok: false, code: "invalid_signature" });
  }

  let command;

  try {
    command = JSON.parse(body);
  } catch {
    return jsonResponse({ ok: false, code: "invalid_body" });
  }

  if (command?.action !== "restock.create") {
    return jsonResponse({ ok: false, code: "unsupported_action" });
  }

  const payload = command.payload;
  const requiredFields = [
    "requestedAt",
    "productLabel",
    "email",
    "languageLabel",
    "variantKey",
  ];

  const hasAllFields = requiredFields.every((field) => {
    const value = payload?.[field];
    return typeof value === "string" && value.trim().length > 0;
  });

  if (!hasAllFields || !Number.isFinite(Date.parse(payload.requestedAt))) {
    return jsonResponse({ ok: false, code: "invalid_payload" });
  }

  try {
    return jsonResponse(saveRestockRequest(payload));
  } catch {
    return jsonResponse({ ok: false, code: "storage_error" });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function buildRestockDetails(payload) {
  return [
    payload.productLabel,
    payload.email,
    payload.languageLabel,
    "Ожидает",
  ].map((rowItem) => ({
    userEnteredValue: { stringValue: rowItem },
  }));
}

function getRestockSheet() {
  const spreadsheetId =
    PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");

  if (!spreadsheetId) {
    throw new Error("spreadsheet_id_missing");
  }

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  const sheet = spreadsheet.getSheetByName("Заявки на поступление");

  if (!sheet) {
    throw new Error("restock_sheet_not_found");
  }

  return sheet;
}

function buildRestockDateUpdate(sheetId, rowIndex, requestedAt, timeZone) {
  const localDateTime = Utilities.formatDate(
    new Date(requestedAt),
    timeZone,
    "yyyy-MM-dd'T'HH:mm:ss.SSS",
  );
  // Sheets stores local date and time as days since 1899-12-30.
  const sheetsEpoch = Date.UTC(1899, 11, 30);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const numberValue =
    (Date.parse(`${localDateTime}Z`) - sheetsEpoch) / millisecondsPerDay;

  return {
    updateCells: {
      start: { sheetId, rowIndex, columnIndex: 0 },
      rows: [
        {
          values: [
            {
              userEnteredValue: { numberValue },
              userEnteredFormat: {
                numberFormat: {
                  type: "DATE_TIME",
                  pattern: "dd.mm.yyyy hh:mm",
                },
              },
            },
          ],
        },
      ],
      fields: "userEnteredValue,userEnteredFormat.numberFormat",
    },
  };
}

function buildRestockUpdateCells(sheetId, rowIndex, payload) {
  return {
    updateCells: {
      start: {
        sheetId,
        rowIndex,
        columnIndex: 1,
      },
      rows: [
        {
          values: buildRestockDetails(payload),
        },
      ],
      fields: "userEnteredValue",
    },
  };
}

function buildRestockMetadata(sheetId, rowIndex, variantKey) {
  return {
    createDeveloperMetadata: {
      developerMetadata: {
        metadataKey: "restock_variant_key",
        metadataValue: variantKey,
        visibility: "DOCUMENT",
        location: {
          dimensionRange: {
            sheetId,
            dimension: "ROWS",
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      },
    },
  };
}

function hasOpenRestockRequest(sheet, payload) {
  const matches = sheet
    .createDeveloperMetadataFinder()
    .withKey("restock_variant_key")
    .withValue(payload.variantKey)
    .withLocationType(SpreadsheetApp.DeveloperMetadataLocationType.ROW)
    .find();

  return matches.some((match) => {
    const row = match.getLocation().getRow();
    const [email, , status] = sheet
      .getRange(row.getRow(), 3, 1, 3)
      .getValues()[0];

    return email === payload.email && status === "Ожидает";
  });
}

function saveRestockRequest(payload) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { ok: false, code: "storage_busy" };
  }

  try {
    const sheet = getRestockSheet();
    if (hasOpenRestockRequest(sheet, payload)) {
      return { ok: true, status: "duplicate" };
    }

    const spreadsheet = sheet.getParent();
    const sheetId = sheet.getSheetId();
    const rowIndex = sheet.getLastRow();

    const requests = [
      buildRestockDateUpdate(
        sheetId,
        rowIndex,
        payload.requestedAt,
        spreadsheet.getSpreadsheetTimeZone(),
      ),
      buildRestockUpdateCells(sheetId, rowIndex, payload),
      buildRestockMetadata(sheetId, rowIndex, payload.variantKey),
    ];

    Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheet.getId());

    return { ok: true, status: "created" };
  } finally {
    lock.releaseLock();
  }
}

// Run once from the Apps Script editor to convert dates written by older versions.
function normalizeRestockDates() {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    const sheet = getRestockSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return 0;

    const spreadsheet = sheet.getParent();
    const sheetId = sheet.getSheetId();
    const timeZone = spreadsheet.getSpreadsheetTimeZone();
    const range = sheet.getRange(2, 1, lastRow - 1, 1);
    const formulas = range.getFormulas();
    const requests = [];
    const legacyDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    range.getValues().forEach(([value], index) => {
      if (
        formulas[index][0] ||
        typeof value !== "string" ||
        !legacyDatePattern.test(value) ||
        !Number.isFinite(Date.parse(value))
      ) {
        return;
      }

      requests.push(
        buildRestockDateUpdate(sheetId, index + 1, value, timeZone),
      );
    });

    if (requests.length > 0) {
      Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheet.getId());
    }
    return requests.length;
  } finally {
    lock.releaseLock();
  }
}
