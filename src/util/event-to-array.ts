import { SortableEvent } from "sortablejs";
import { Item } from "../hooks/use-react-sortable";
import { createSort } from ".";

// @todo - add multidrag types to @types/sortablejs.
/** Used by `getMode`. */
export type Mode = "multidrag" | "swap" | "normal";

/**
 * @summary Asserts if 'MultiDrag', 'Swap' or neither are being used.
 */
export function getMode(evt: SortableEvent): Mode {
  if (evt.oldIndicies && evt.oldIndicies.length > 0) return "multidrag";
  if (evt.swapItem) return "swap";
  return "normal";
}

/**
 * @summary creates a standard API to interact with `SortableEvent` type.
 * @param list The current state of the list.
 * @param evt the event passed from sortable props
 * 
 * This does not work with `onMove`, as it doesn't know when it is multidrag, swap, or normal mode.
 */

export function eventToArray<T extends Item>(
  list: T[],
  evt: SortableEvent
): Standard<T>[] {
  const parentElement = evt.from;
  let custom: PreStandard[] = [];

  const mode = getMode(evt);
  switch (mode) {
    case "normal":
      const item: PreStandard = {
        element: evt.item,
        newIndex: evt.newIndex!,
        oldIndex: evt.oldIndex!,
        clone: evt.clone,
        parentElement
      };
      custom = [item];
      break;
    case "swap":
      const drag: PreStandard = {
        element: evt.item,
        oldIndex: evt.oldIndex!,
        newIndex: evt.newIndex!,
        clone: evt.clone,
        parentElement
      };
      const swap: PreStandard = {
        element: evt.swapItem!,
        oldIndex: evt.newIndex!,
        newIndex: evt.oldIndex!,
        clone: null,
        parentElement
      };
      custom = [drag, swap];
      break;
    case "multidrag":
      custom = evt.oldIndicies.map<PreStandard>((curr, index) => ({
        element: curr.multiDragElement,
        oldIndex: curr.index,
        newIndex: evt.newIndicies[index].index,
        parentElement,
        //@ts-ignore - @todo - fix types
        clone: evt.clones[index]
      }));
      break;
  }
  const sort = createSort({ type: "oldIndex", ascending: true });

  // attaches the item to the indicies.
  const customs: Standard<T>[] = custom
    .map<Standard<T>>(curr => ({ ...curr, item: list[curr.oldIndex] }))
    .sort(sort);
  return customs;
}

export interface Standard<T> {
  parentElement: HTMLElement;
  element: HTMLElement;
  clone: HTMLElement | null;
  oldIndex: number;
  newIndex: number;
  item: T;
}

export type PreStandard = Omit<Standard<any>, "item">;
