import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";

const secret = "restock-apps-script-test-secret";
const source = readFileSync(
  new URL("../../../scripts/google-orders/Code.gs", import.meta.url),
  "utf8",
);

const validPayload = {
  requestedAt: "2026-11-23T09:30:00.000Z",
  productLabel: "Шлейка Elegant · Coyote Brown · M",
  email: "ann@example.com",
  languageLabel: "Польский",
  variantKey: "elegant/harness/coyote-brown/M",
};

const googleServices = {
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: (key: string) =>
        key === "GOOGLE_SHEETS_SIGNING_SECRET" ? secret : null,
    }),
  },
  Utilities: {
    Charset: { UTF_8: "utf8" },
    computeHmacSha256Signature: (value: string, key: string) =>
      createHmac("sha256", key).update(value, "utf8").digest(),
    base64Encode: (bytes: Buffer) => bytes.toString("base64"),
    formatDate: (date: Date, timeZone: string, pattern: string) => {
      assert.equal(pattern, "yyyy-MM-dd'T'HH:mm:ss.SSS");
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-GB", {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
          hourCycle: "h23",
        })
          .formatToParts(date)
          .map(({ type, value }) => [type, value]),
      );
      return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.${parts.fractionalSecond}`;
    },
  },
  ContentService: {
    MimeType: { JSON: "application/json" },
    createTextOutput: (body: string) => ({ setMimeType: () => body }),
  },
};
const script = createContext({ ...googleServices });
runInContext(source, script);

function submitSignedPayload(
  payload: object | null | undefined,
  doPost: (event: { postData: { contents: string } }) => string = script.doPost,
) {
  const issuedAt = Date.now();
  const body = JSON.stringify({ action: "restock.create", payload });
  const signature = createHmac("sha256", secret)
    .update(`${issuedAt}.${body}`, "utf8")
    .digest("base64");
  const contents = JSON.stringify({ issuedAt, body, signature });

  return JSON.parse(doPost({ postData: { contents } }));
}

test("rejects signed payloads with missing, blank or non-string fields", () => {
  const invalidPayloads = [
    undefined,
    null,
    {},
    { ...validPayload, variantKey: undefined },
    { ...validPayload, requestedAt: "not a date" },
    { ...validPayload, email: "" },
    { ...validPayload, productLabel: " \t " },
    { ...validPayload, languageLabel: 1 },
  ];

  for (const payload of invalidPayloads) {
    assert.deepEqual(submitSignedPayload(payload), {
      ok: false,
      code: "invalid_payload",
    });
  }
});

test("builds the detail cells in sheet order and stores formula-like text literally", () => {
  const productLabel = "=1+1";
  const row = script.buildRestockDetails({ ...validPayload, productLabel });

  assert.deepEqual(structuredClone(row), [
    { userEnteredValue: { stringValue: productLabel } },
    { userEnteredValue: { stringValue: validPayload.email } },
    { userEnteredValue: { stringValue: validPayload.languageLabel } },
    { userEnteredValue: { stringValue: "Ожидает" } },
  ]);
});

test("finds the restock sheet and reports missing configuration before opening the book", () => {
  const targetSheet = { getSheetId: () => 0 };
  let spreadsheetId: string | null = "test-book-id";
  let sheet: typeof targetSheet | null = targetSheet;

  const lookup = createContext({
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => {
          assert.equal(key, "SPREADSHEET_ID");
          return spreadsheetId;
        },
      }),
    },
    SpreadsheetApp: {
      openById: (id: string) => {
        assert.equal(id, "test-book-id");
        return {
          getSheetByName: (name: string) => {
            assert.equal(name, "Заявки на поступление");
            return sheet;
          },
        };
      },
    },
  });
  runInContext(source, lookup);

  assert.equal(lookup.getRestockSheet(), targetSheet);

  sheet = null;
  assert.throws(() => lookup.getRestockSheet(), /restock_sheet_not_found/);

  spreadsheetId = null;
  assert.throws(() => lookup.getRestockSheet(), /spreadsheet_id_missing/);
});

test("writes text cells from B2 without modifying their formats", () => {
  const request = script.buildRestockUpdateCells(0, 1, validPayload);
  const values = structuredClone(script.buildRestockDetails(validPayload));

  assert.deepEqual(structuredClone(request), {
    updateCells: {
      start: { sheetId: 0, rowIndex: 1, columnIndex: 1 },
      rows: [{ values }],
      fields: "userEnteredValue",
    },
  });
});

test("writes a sortable date to A2 in the sheet timezone in winter and summer", () => {
  for (const [timestamp, expectedLocalTime] of [
    ["2026-11-26T17:25:09.475Z", "2026-11-26T18:25:09.475Z"],
    ["2026-06-26T23:25:09.475Z", "2026-06-27T01:25:09.475Z"],
  ]) {
    const update = script.buildRestockDateUpdate(
      0,
      1,
      timestamp,
      "Europe/Warsaw",
    );
    assert.deepEqual(structuredClone(update), {
      updateCells: {
        start: { sheetId: 0, rowIndex: 1, columnIndex: 0 },
        rows: [
          {
            values: [
              {
                userEnteredValue: {
                  numberValue:
                    (Date.parse(expectedLocalTime) - Date.UTC(1899, 11, 30)) /
                    86_400_000,
                },
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
    });
  }
});

test("attaches the variant key to the same single row as updateCells", () => {
  const update = script.buildRestockUpdateCells(0, 1, validPayload);
  const { sheetId, rowIndex } = update.updateCells.start;
  const metadata = script.buildRestockMetadata(
    sheetId,
    rowIndex,
    validPayload.variantKey,
  );

  assert.deepEqual(structuredClone(metadata), {
    createDeveloperMetadata: {
      developerMetadata: {
        metadataKey: "restock_variant_key",
        metadataValue: validPayload.variantKey,
        visibility: "DOCUMENT",
        location: {
          dimensionRange: {
            sheetId: 0,
            dimension: "ROWS",
            startIndex: 1,
            endIndex: 2,
          },
        },
      },
    },
  });
});

test("finds a duplicate only for the same variant and email with an open status", () => {
  const lookup = createContext({
    SpreadsheetApp: { DeveloperMetadataLocationType: { ROW: "ROW" } },
  });
  runInContext(source, lookup);

  const matchedRows = new Map<number, string[]>();
  const finder = {
    withKey(key: string) {
      assert.equal(key, "restock_variant_key");
      return this;
    },
    withValue(value: string) {
      assert.equal(value, validPayload.variantKey);
      return this;
    },
    withLocationType(locationType: string) {
      assert.equal(locationType, "ROW");
      return this;
    },
    find: () =>
      Array.from(matchedRows.keys(), (row) => ({
        getLocation: () => ({ getRow: () => ({ getRow: () => row }) }),
      })),
  };
  const sheet = {
    createDeveloperMetadataFinder: () => finder,
    getRange(row: number, column: number, height: number, width: number) {
      assert.deepEqual([column, height, width], [3, 1, 3]);
      return { getValues: () => [matchedRows.get(row)] };
    },
  };

  assert.equal(lookup.hasOpenRestockRequest(sheet, validPayload), false);

  matchedRows.set(2, ["other@example.com", "Польский", "Ожидает"]);
  matchedRows.set(3, [validPayload.email, "Польский", "Уведомили"]);
  assert.equal(lookup.hasOpenRestockRequest(sheet, validPayload), false);

  matchedRows.set(4, [validPayload.email, "Польский", "Ожидает"]);
  assert.equal(lookup.hasOpenRestockRequest(sheet, validPayload), true);
});

function createRestockWriter({
  busy = false,
  duplicate = false,
  writeFails = false,
} = {}) {
  const calls: string[] = [];
  const writer = createContext({
    ...googleServices,
    LockService: {
      getScriptLock: () => ({
        tryLock(timeout: number) {
          assert.equal(timeout, 5000);
          calls.push("lock");
          return !busy;
        },
        releaseLock() {
          calls.push("release");
        },
      }),
    },
    Sheets: {
      Spreadsheets: {
        batchUpdate(batch: { requests: object[] }, spreadsheetId: string) {
          calls.push("batchUpdate");
          assert.equal(spreadsheetId, "test-book-id");
          assert.deepEqual(structuredClone(batch.requests), [
            structuredClone(
              script.buildRestockDateUpdate(
                0,
                1,
                validPayload.requestedAt,
                "Europe/Warsaw",
              ),
            ),
            structuredClone(script.buildRestockUpdateCells(0, 1, validPayload)),
            structuredClone(
              script.buildRestockMetadata(0, 1, validPayload.variantKey),
            ),
          ]);
          if (writeFails) throw new Error("test write error");
        },
      },
    },
  });
  runInContext(source, writer);
  writer.getRestockSheet = () => {
    calls.push("find sheet");
    return {
      getSheetId: () => 0,
      getLastRow: () => 1,
      getParent: () => ({
        getId: () => "test-book-id",
        getSpreadsheetTimeZone: () => "Europe/Warsaw",
      }),
    };
  };
  writer.hasOpenRestockRequest = () => {
    calls.push("check duplicate");
    return duplicate;
  };

  return {
    calls,
    submit: () => submitSignedPayload(validPayload, writer.doPost),
  };
}

test("saves the row and its metadata in one batch while holding the lock", () => {
  const writer = createRestockWriter();
  assert.deepEqual(writer.submit(), { ok: true, status: "created" });
  assert.deepEqual(writer.calls, [
    "lock",
    "find sheet",
    "check duplicate",
    "batchUpdate",
    "release",
  ]);
});

test("releases the lock for a duplicate and skips the write", () => {
  const writer = createRestockWriter({ duplicate: true });
  assert.deepEqual(writer.submit(), { ok: true, status: "duplicate" });
  assert.deepEqual(writer.calls, [
    "lock",
    "find sheet",
    "check duplicate",
    "release",
  ]);
});

test("returns a storage error without touching the sheet when the lock is busy", () => {
  const writer = createRestockWriter({ busy: true });
  assert.deepEqual(writer.submit(), { ok: false, code: "storage_busy" });
  assert.deepEqual(writer.calls, ["lock"]);
});

test("returns a JSON storage error and releases the lock when Google Sheets throws", () => {
  const writer = createRestockWriter({ writeFails: true });
  assert.deepEqual(writer.submit(), { ok: false, code: "storage_error" });
  assert.deepEqual(writer.calls.slice(-2), ["batchUpdate", "release"]);
});

test("converts only existing literal ISO dates in column A and skips them on a rerun", () => {
  const values = [
    [validPayload.requestedAt],
    [46345.5],
    [""],
    [validPayload.requestedAt],
  ];
  const batches: object[][] = [];
  let releases = 0;
  const migration = createContext({
    ...googleServices,
    LockService: {
      getScriptLock: () => ({
        waitLock: (timeout: number) => assert.equal(timeout, 5000),
        releaseLock: () => releases++,
      }),
    },
    Sheets: {
      Spreadsheets: {
        batchUpdate(
          { requests }: { requests: object[] },
          spreadsheetId: string,
        ) {
          assert.equal(spreadsheetId, "test-book-id");
          batches.push(structuredClone(requests));
          values[0][0] = 46345.5;
        },
      },
    },
  });
  runInContext(source, migration);
  migration.getRestockSheet = () => ({
    getSheetId: () => 0,
    getLastRow: () => 5,
    getParent: () => ({
      getId: () => "test-book-id",
      getSpreadsheetTimeZone: () => "Europe/Warsaw",
    }),
    getRange: (...args: number[]) => {
      assert.deepEqual(args, [2, 1, 4, 1]);
      return {
        getValues: () => values,
        getFormulas: () => [[""], [""], [""], ["=A2"]],
      };
    },
  });

  assert.equal(migration.normalizeRestockDates(), 1);
  assert.equal(migration.normalizeRestockDates(), 0);
  assert.equal(releases, 2);
  assert.deepEqual(batches, [
    [
      structuredClone(
        script.buildRestockDateUpdate(
          0,
          1,
          validPayload.requestedAt,
          "Europe/Warsaw",
        ),
      ),
    ],
  ]);
});
