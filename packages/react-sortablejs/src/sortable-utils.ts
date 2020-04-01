import Sortable from "sortablejs";
import { array, either, function as fn, option } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";

export interface NormalizedEvent {
  parent: HTMLElement;
  element: HTMLElement;
  oldIndex: number;
  newIndex: number;
}

const normalizeEventMultidrag = (
  evt: Sortable.SortableEvent
): NormalizedEvent[] =>
  pipe(
    evt.oldIndicies,
    array.mapWithIndex((idx, curr) => ({
      parent: evt.from,
      element: curr.multiDragElement,
      oldIndex: curr.index,
      newIndex: evt.newIndicies[idx].index
    }))
  );

const normalizeEventSwap = (evt: Sortable.SortableEvent): NormalizedEvent[] => [
  // drag item
  {
    element: evt.item,
    oldIndex: evt.oldIndex!,
    newIndex: evt.newIndex!,
    parent: evt.from
  },
  // swap item
  {
    element: evt.swapItem!,
    oldIndex: evt.newIndex!,
    newIndex: evt.oldIndex!,
    parent: evt.to
  }
];

const normalizeEventNormal = (
  evt: Sortable.SortableEvent
): NormalizedEvent[] => [
  {
    element: evt.item,
    newIndex: evt.newIndex!,
    oldIndex: evt.oldIndex!,
    parent: evt.from
  }
];

// todo - calm down this child, he's screaming to be parametized!
export const normalizeEvent = (evt: Sortable.SortableEvent) =>
  pipe(
    either.right(evt),
    either.filterOrElse(a => !a.swapItem, normalizeEventSwap),
    either.filterOrElse(
      a => !(a.oldIndicies && a.oldIndicies.length > 0),
      normalizeEventMultidrag
    ),
    either.swap,
    either.getOrElse(normalizeEventNormal)
  );
