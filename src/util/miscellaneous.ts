import { Item } from "../hooks/use-react-sortable";
import { Standard } from "./event-to-array";

/** Transforms `update` into `onUpdate`. */
export const capitalize = (type: string) => {
  const name = type.substring(0, 1).toUpperCase() + type.substring(1);
  return "on" + name;
};

// start at -1 and traverse backwards.
let uuid = -1;

export const createClone = <T extends Item>(item: T) => {
  let id: T["id"] = uuid--;
  if (typeof item.id === "string") id = String(id);
  return { ...item, id };
};

export interface SortParams {
  /** @default 'oldIndex' */
  type: "oldIndex" | "newIndex";

  /** @default true */
  ascending: boolean;
}
/**
 * Returns a sort function.
 */
export function createSort<T extends Item>(params?: SortParams) {
  const { type, ascending }: SortParams = {
    type: "oldIndex",
    ascending: true,
    ...params
  };
  return ascending
    ? (a: Standard<T>, b: Standard<T>): number => a[type] - b[type]
    : (a: Standard<T>, b: Standard<T>): number => a[type] + b[type];
}
