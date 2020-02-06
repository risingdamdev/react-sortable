import { Item } from "../hooks/use-react-sortable";
import { Standard } from "./event-to-array";

/** Transforms `update` into `onUpdate`. */
export const capitalize = (type: string) => {
  const name = type.substring(0, 1).toUpperCase() + type.substring(1);
  return "on" + name;
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
