import { Item } from "../../src";

let id = 0;
export type TestItem = Item & { name: string };

export function generateData() {
  return [...Array(5)].map<TestItem>((_, index) => ({
    id: id++,
    name: `value-${index}`,
    chosen: false,
    selected: false
  }));
}
