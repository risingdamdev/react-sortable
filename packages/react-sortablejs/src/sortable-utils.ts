import { array, either, function as fn } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import Sortable from "sortablejs";

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
      newIndex: evt.newIndicies[idx].index,
    }))
  );

const normalizeEventSwap = (evt: Sortable.SortableEvent): NormalizedEvent[] => [
  // drag item
  {
    element: evt.item,
    oldIndex: evt.oldIndex!,
    newIndex: evt.newIndex!,
    parent: evt.from,
  },
  // swap item
  {
    element: evt.swapItem!,
    oldIndex: evt.newIndex!,
    newIndex: evt.oldIndex!,
    parent: evt.to,
  },
];

const normalizeEventNormal = (
  evt: Sortable.SortableEvent
): NormalizedEvent[] => [
  {
    element: evt.item,
    newIndex: evt.newIndex!,
    oldIndex: evt.oldIndex!,
    parent: evt.from,
  },
];

const isMultidrag = (evt: Sortable.SortableEvent) =>
  evt.oldIndicies && evt.oldIndicies.length > 0;

const isSwap = (evt: Sortable.SortableEvent) => !!evt.swapItem;

export const normalizeEvent = (evt: Sortable.SortableEvent) =>
  pipe(
    either.right(evt),
    either.filterOrElse(fn.not(isSwap), normalizeEventSwap),
    either.filterOrElse(fn.not(isMultidrag), normalizeEventMultidrag),
    either.swap,
    either.getOrElse(normalizeEventNormal)
  );
