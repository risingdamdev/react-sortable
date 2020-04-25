import { array, ioEither, option, record } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { useEffect, useMemo, useRef, useState } from "react";
import Sortable from "sortablejs";
import { onAddDOM, onRemoveDOM, onUpdateDOM, ordOldIndex } from "./actions-dom";
import { normalizeEvent } from "./normalize-event";

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

const getSortable = (el: HTMLElement) => option.fromNullable(Sortable.get(el));

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
  const [userList, setUserList] = useList;
  const [list, setList] = useState(userList);

  useEffect(() => {
    setUserList(list);
  }, [list]);

  useEffect(() => {
    effectCreateSortable(option.fromNullable(ref.current), options)();
  }, [ref]);

  const sortable = useGetSortable(ref);

  const newOptions: Sortable.Options = useMemo(
    () => ({
      ...options,
      // move from old pos to new pos
      // onUpdate: (evt) => {
      //   const normalized = pipe(normalizeEvent(evt), array.sort(ordOldIndex));
      //   onUpdateDOM(normalized)();
      //   // iterate normalized, get all state items by index

      //   // iterate normalized, remove one by one from end

      //   // iterate normalized, insert one by one from start
      //   const newList = pipe(normalized);
      // },
      // onAdd: (evt) => {
      //   const normalized = pipe(normalizeEvent(evt), array.sort(ordOldIndex));
      //   onAddDOM(normalized)();
      // },
      // onRemove: (evt) => {
      //   const normalized = pipe(normalizeEvent(evt), array.sort(ordOldIndex));
      //   onRemoveDOM(normalized)();
      // },
    }),
    [options]
  );

  useEffect(() => {
    effectUpdateOptions(sortable.current, newOptions)();
  }, [sortable, options]);

  return useList;
};
