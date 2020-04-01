import {
  array,
  either,
  ioEither,
  option,
  record,
  function as fn,
  eq
} from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { useEffect, useMemo, useRef } from "react";
import Sortable from "sortablejs";

export interface ID {
  id: string;
}

export interface UseSortableParams<
  T extends ID = ID,
  R extends HTMLElement = HTMLElement
> {
  /** The output of useState hook containg containing the array of items */
  useList: [T[], React.Dispatch<React.SetStateAction<T[]>>];
  ref: React.MutableRefObject<R> | React.RefObject<R>;
}

const createSortable = <T extends HTMLElement>(options: Sortable.Options) => (
  element: T
) => ioEither.tryCatch(() => Sortable.create(element, options), String);

const effectCreateSortable = (
  element: option.Option<HTMLElement>,
  options: Sortable.Options
) =>
  pipe(
    element,
    ioEither.fromOption(() => ""),
    ioEither.chain(createSortable(options))
  );

const updateOptions = (options: Sortable.Options) => (sortable: Sortable) =>
  ioEither.right<string, {}>(
    pipe(
      options as Required<Sortable.Options>,
      record.reduceWithIndex({}, (k, prev, v) => {
        sortable.option(k, v);
        return prev;
      })
    )
  );

const effectUpdateOptions = (
  sortable: option.Option<Sortable>,
  options: Sortable.Options
) =>
  pipe(
    sortable,
    ioEither.fromOption(() => ""),
    ioEither.chain(updateOptions(options))
  );

const getSortable = (el: HTMLElement) =>
  //@ts-ignore
  option.fromNullable(Sortable.get(el) as Sortable | null);

const useGetSortable = (ref: UseSortableParams["ref"]) => {
  const sortable = useRef<option.Option<Sortable>>(option.none);

  useEffect(() => {
    sortable.current = pipe(
      ref.current,
      option.fromNullable,
      option.chain(getSortable)
    );
  }, [ref]);

  return sortable;
};

// add it back in

export const useSortable = <T extends ID>(
  { ref, useList }: UseSortableParams<T>,
  options: Sortable.Options = {}
) => {
  useEffect(() => {
    effectCreateSortable(option.fromNullable(ref.current), options)();
  }, [ref]);

  const sortable = useGetSortable(ref);

  const newOptions = useMemo(
    () =>
      ({
        ...options
        // move from old pos to new pos
      } as Sortable.Options),
    [options]
  );

  useEffect(() => {
    effectUpdateOptions(sortable.current, options)();
  }, [sortable, options]);

  return useList;
};

interface NormalizedEvent {
  parent: HTMLElement;
  element: HTMLElement;
  oldIndex: number;
  newIndex: number;
}

const normalizeEventMultidrag = (evt: Sortable.SortableEvent) => (
  oldIndicies: Sortable.SortableEvent["oldIndicies"]
): NormalizedEvent[] =>
  pipe(
    oldIndicies,
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

const isMultiDrag = (evt: Sortable.SortableEvent) =>
  evt.oldIndicies && evt.oldIndicies.length > 0;

// todo - calm down this child, he's screaming to be parametized!
const normalizeEvent = (evt: Sortable.SortableEvent) =>
  pipe(
    evt.oldIndicies,
    either.right,
    either.chain(a =>
      pipe(
        evt,
        either.fromPredicate(isMultiDrag, () => a),
        either.map(f => normalizeEventMultidrag(evt)(evt.oldIndicies)),
        either.swap
      )
    ),
    either.chain(a =>
      pipe(
        evt.swapItem,
        either.fromNullable(a),
        either.map(() => normalizeEventSwap(evt)),
        either.swap
      )
    ),
    either.swap,
    either.getOrElse(() => normalizeEventNormal(evt))
  );
