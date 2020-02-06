import { useCallback, useMemo } from "react";
import { MoveEvent, Options, SortableEvent } from "sortablejs";
import { capitalize, dom } from "../util";
import { eventToArray, Standard } from "../util/event-to-array";
import { InternalProps, Item } from "./use-react-sortable";
import { default as Sortable } from "sortablejs";

/**
 * @summary  Handlers.
 *
 * @description
 * If required, Handlers do the following actions in this order:
 * - Reverse DOM actions called by Sortable.
 * - Modify local state.
 * - Call `props[onHandler](evt)`.
 * - Call `props.setList(newState)` after modifying state.
 * @todo
 * + sorting
 *  + any sorting actions sshould be done with onMove
 *  + react state should change during onMove but not change the DOM while dragging.
 *  + once dragging has ended, then apply other state changes
 * + onSpill
 *  + store state on move.
 *  + previous state so we can revert back to it.
 */
export function useNewOptions<T extends Item, R extends HTMLElement>(
  props: InternalProps<T, R>,
  options: Options
): Options & RequiredOptions {
  // util functions for handlers

  // calls the options[handler] event if it exists, but not for `onMove`.
  const callHandler = useCallback(
    (event: SortableEvent) => {
      const name = capitalize(event.type) as Exclude<Handlers, "onMove">;
      const onHandler = options[name];
      if (onHandler) onHandler(event);
    },
    [props, options]
  );

  // create the options object that `Sortable.create` will consume.
  const newOptions: NewOptions = useMemo(() => {
    /**
     * We attach any `options.on[Handler]` callback provided by the user
     * into the object.
     */
    const normal = ([
      "onAdd",
      "onChange",
      "onClone",
      "onFilter",
      "onRemove",
      "onSort",
      "onUpdate"
    ] as const).reduce((prev, eventName) => {
      prev[eventName] = (event: SortableEvent) => {
        callHandler(event);
      };
      return prev;
    }, {} as NormalHandlers);
    // anything to do with the dragging of items
    // and changes of sorting
    //should only be done by `onMove`

    // choose handlers

    const onChoose = (event: SortableEvent) => {
      callHandler(event);
    };
    const onUnchoose = (event: SortableEvent) => {
      callHandler(event);
    };

    // select handlers

    const onSelect = (event: SortableEvent) => {
      callHandler(event);
    };

    const onDeselect = (event: SortableEvent) => {
      callHandler(event);
    };

    // lifecycle handlers

    // create the standards thing because this has multidrag properties in it.
    const onStart = (event: SortableEvent) => {
      localState.current = props.list;
      callHandler(event);
    };

    const onEnd = (event: SortableEvent) => {
      localState.current = null;
      callHandler(event);
    };

    // @ts-ignore
    const onMove: RequiredOptions["onMove"] = (
      event: MoveEvent,
      originalEvent: Event
    ) => {
      // @todo - add void to return type
      // -1 | 1 | false | void
      const result =
        options.onMove &&
        (options.onMove(event, originalEvent) as undefined | -1 | 1 | false);

      const getChildrenFromChild = (child: HTMLElement) => {
        const collection = child.parentElement?.children;
        if (!collection) throw new Error();
        return Array.from(collection);
      };

      const getIndexOfElement = (element: HTMLElement) =>
        getChildrenFromChild(element).indexOf(element);

      const calcNewIndex = (): number => {
        const newIndex = getIndexOfElement(event.related);
        return result === -1 ? newIndex - 1 : newIndex;
      };

      const oldIndex = getIndexOfElement(event.dragged);
      const newIndex = calcNewIndex();

      // from !== to ? different lists: same lists.
      // remove item from old list, add to new list. could be same.

      console.log({ oldIndex, newIndex });
      // change old index number

      // if (result === -1) {

      //   // if -1, item is before
      //   props.setList(prevList => {
      //     const newList = [...prevList];

      //     return newList;
      //   });
      // }

      // // before anything,
      // // swap old with new

      // // if 1, item is after
      // if (result === -1) {
      //   props.setList(prevList => {
      //     const newList = [...prevList];
      //     return newList;
      //   });
      // }
      // // if false, item does nothing.
      // return result;
    };

    const onSpill = (event: SortableEvent) => {
      const removeable = options.removeOnSpill && !options.revertOnSpill;
      if (removeable) dom.insertNodeAt(event.from, event.item, event.oldIndex!);
      callHandler(event);
      // props.setList(prevList => prevList);
    };

    return {
      ...options,
      ...normal,
      onChoose,
      onDeselect,
      onEnd,
      onMove,
      onSelect,
      onSpill,
      onStart,
      onUnchoose
    };
  }, [props, options, callHandler]);
  return newOptions;
}

const localState: LocalState = {
  current: null
};

/** Used to infer types. */
const types = [
  "onAdd",
  "onChange",
  "onChoose",
  "onClone",
  "onDeselect",
  "onEnd",
  "onFilter",
  "onMove",
  "onRemove",
  "onSelect",
  "onSort",
  "onSpill",
  "onStart",
  "onUnchoose",
  "onUpdate"
] as const;

/**
 * A list of all handler names as a string union
 */
export type Handlers = typeof types extends ReadonlyArray<infer T> ? T : never;

/**
 * All of the handler methods that we need to add custom callbacks to.
 */
export type RequiredOptions = Required<Pick<Sortable.Options, Handlers>>;

/**
 * A mix between the partial options and required methods.
 * This gets passed into sortable.create and sortbale. add options.
 */
export type NewOptions = Omit<Options, Handlers> & RequiredOptions;

export interface LocalState<T extends Item = any> {
  current: null | T[];
}

/**
 * Handlers that don't have any special DOM handling logic.
 */
export type NormalHandlers = Required<
  Pick<
    Sortable.Options,
    | "onAdd"
    | "onChange"
    | "onClone"
    | "onFilter"
    | "onRemove"
    | "onSort"
    | "onUpdate"
  >
>;
