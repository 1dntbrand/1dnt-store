import assert from "node:assert/strict";
import { test } from "node:test";
import services from "../../src/features/storefront/data/services.json";
import type { ServiceText } from "../../src/features/storefront/lib/service-text";

const copy = services as Record<string, ServiceText>;
const kind = (block: ServiceText["pages"][number][number]["blocks"][number]) =>
  typeof block === "string" ? "text" : Object.keys(block)[0];
const shape = (text: ServiceText) =>
  text.pages.map((page) =>
    page.map((section) => ({
      blocks: section.blocks.map(kind),
      rows: section.blocks.flatMap((block) =>
        typeof block === "object" && "rows" in block
          ? block.rows.map(([, value]) => value === null)
          : [],
      ),
    })),
  );

test("every language has the same customer-care structure as English", () => {
  for (const [language, text] of Object.entries(copy)) {
    assert.equal(text.labels.length, text.pages.length, language);
    assert.deepEqual(shape(text), shape(copy.en), language);
  }
});

test("details that are known appear the same in every language", () => {
  const values = (text: ServiceText) =>
    text.pages
      .flat()
      .flatMap((section) =>
        section.blocks.flatMap((block) =>
          typeof block === "object" && "address" in block
            ? [block.address]
            : [],
        ),
      );
  for (const text of Object.values(copy))
    assert.deepEqual(values(text), values(copy.en));
});
