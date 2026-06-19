import { expect, test } from "vitest";
import { migrateSave } from "../src/lib/migrate";
import { SAVE_VERSION } from "../src/constants/config";

test("current-version save passes through unchanged", () => {
  const save = { version: SAVE_VERSION, gold: 42 };
  expect(migrateSave(save)).toBe(save);
});

test("non-object input -> null", () => {
  expect(migrateSave(null)).toBeNull();
  expect(migrateSave(undefined)).toBeNull();
  expect(migrateSave("nope")).toBeNull();
});

test("missing/invalid version -> null", () => {
  expect(migrateSave({ gold: 1 })).toBeNull();
});

test("older version with no migration path -> null (discard)", () => {
  expect(migrateSave({ version: SAVE_VERSION - 1 })).toBeNull();
});

test("future version (downgrade) -> null", () => {
  expect(migrateSave({ version: SAVE_VERSION + 5 })).toBeNull();
});
