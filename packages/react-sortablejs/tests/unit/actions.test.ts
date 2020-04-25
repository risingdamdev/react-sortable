import { normalizedInsert, NormalizedEventIndicies } from "../src/actions-dom";
import { NormalizedEvent } from "../src/normalize-event";
import { ID } from "../src";
import { option } from "fp-ts";

describe("normalizedInsert", () => {
  type TestTable = [string, NormalizedEventIndicies[], ID[], ID[], ID[]];

  const success: TestTable[] = [
    [
      "basic 1",
      [{ oldIndex: 0, newIndex: 0 }],
      [],
      [{ id: "11" }],
      [{ id: "11" }],
    ],
    [
      "basic 2",
      [{ oldIndex: 0, newIndex: 1 }],
      [{ id: "11" }],
      [{ id: "22" }, { id: "11" }],
      [{ id: "11" }, { id: "22" }],
    ],
    [
      "basic 3",
      [
        { oldIndex: 1, newIndex: 0 },
        { oldIndex: 0, newIndex: 1 },
      ],
      [{ id: "33" }],
      [{ id: "11" }, { id: "22" }],
      [{ id: "22" }, { id: "11" }, { id: "33" }],
    ],
    [
      "basic 4",
      [
        { oldIndex: 1, newIndex: 0 },
        { oldIndex: 0, newIndex: 1 },
      ],
      [],
      [{ id: "11" }, { id: "22" }],
      [{ id: "22" }, { id: "11" }],
    ],
  ];

  describe.each(success)(
    "success",
    (name, normalized, previous, original, expected) => {
      test(name, () => {
        const result = normalizedInsert(normalized, previous, original);
        expect(result).toStrictEqual(option.some(expected));
      });
    }
  );

  const error: TestTable[] = [];

  describe.skip.each(error)(
    "error",
    (name, normalized, previous, original, expected) => {
      test(name, () => {
        const result = normalizedInsert(normalized, previous, original);
        expect(result).toStrictEqual(option.some(expected));
      });
    }
  );
});
