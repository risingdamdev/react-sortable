import { array, io, ioEither, option, ord, record } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { useEffect, useMemo, useRef } from "react";
import Sortable from "sortablejs";
import { removeElement } from "./dom-utils";
import { NormalizedEvent, normalizeEvent } from "./sortable-utils";

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

const ordOldIndex = pipe(
  ord.ordNumber,
  ord.contramap((normalized: NormalizedEvent) => normalized.oldIndex)
);

export const useSortable = <T extends ID>(
  { ref, useList }: UseSortableParams<T>,
  options: Sortable.Options = {}
) => {
  useEffect(() => {
    effectCreateSortable(option.fromNullable(ref.current), options)();
  }, [ref]);

  const sortable = useGetSortable(ref);

  const newOptions: Sortable.Options = useMemo(
    () => ({
      ...options,
      // move from old pos to new pos
      onUpdate: evt =>
        pipe(
          evt,
          normalizeEvent,
          array.sort(ordOldIndex),
          array.map(({ parent, element, oldIndex }) =>
            pipe(
              removeElement(element),
              io.map(() => parent.children.item(oldIndex) ?? null),
              io.map(a => parent.insertBefore(element, a))
            )
          ),
          array.array.sequence(io.io)
        )(),
      onAdd: evt =>
        pipe(
          evt,
          normalizeEvent,
          array.sort(ordOldIndex),
          array.map(({ element }) => removeElement(element)),
          array.array.sequence(io.io)
        )(),
      // order max value i think
      onRemove: evt =>
        pipe(
          evt,
          normalizeEvent,
          array.sort(ordOldIndex),
          array.map(({ element, oldIndex, parent }) =>
            pipe(
              io.of(null),
              io.map(() => parent.children.item(oldIndex) ?? null),
              io.map(a => parent.insertBefore(element, a))
            )
          ),
          array.array.sequence(io.io)
        )
    }),
    [options]
  );

  useEffect(() => {
    effectUpdateOptions(sortable.current, newOptions)();
  }, [sortable, options]);

  return useList;
};
