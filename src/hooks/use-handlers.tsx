import { useCallback, useMemo } from "react";
import { MoveEvent, Options, SortableEvent } from "sortablejs";
import { Standard, eventToArray } from "../util/event-to-array";
import { Action, stateReducer } from "./state-reducer";
import { InternalProps, Item } from "./use-react-sortable";
import { dom, capitalize } from "../util";

/**
 * @summary  Handlers.
 *
 * @description
 * If required, Handlers do the following actions in this order:
 * - Reverse DOM actions called by Sortable.
 * - Modify local state.
 * - Call `props[onHandler](evt)`.
 * - Call `props.setList(newState)` after modifying state.
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
      console.log(name);
      if (onHandler) onHandler(event);
    },
    [props, options]
  );

  const createStandard = useCallback(
    (event: SortableEvent) => {
      return eventToArray(props.list, event);
    },
    [props]
  );

  const callSetList = useCallback(
    (event: SortableEvent, std: Standard<T>[]) => {
      const action: Action<T> = {
        clone: props.clone,
        event,
        std,
        type: capitalize(event.type) as Exclude<Handlers, "onMove">
      };

      props.setList(prev => {
        const newState = stateReducer(prev, action);
        if (!newState) return prev;
        return newState;
      });
    },
    [props, options]
  );

  const newOptions = useMemo(() => {
    
    const onAdd = (event: SortableEvent) => {
      if (!localState.current) throw new Error("onAdd has no local state");
      const std = eventToArray(localState.current, event);
      
      dom.removeEachNode(std);
      
      callHandler(event);
      callSetList(event, (std as unknown) as Standard<T>[]);
    };
    
    // on change
    // if pull=== clone, remove clone element?
    const onChange = (event: SortableEvent) => {
      const std = createStandard(event);
      if (std.length === 1) {
        const { clone } = std.pop()!;
        console.log({event})
        if (event.pullMode === "clone" && clone) dom.removeNode(clone);
      }
      callHandler(event);
    };

    const onChoose = (event: SortableEvent) => {
      const std = createStandard(event);
      callHandler(event);
      callSetList(event, std);
    };

    const onClone = (event: SortableEvent) => {
      callHandler(event);
    };

    const onDeselect = (event: SortableEvent) => {
      const std = createStandard(event);
      callHandler(event);
      callSetList(event, std);
    };

    const onEnd = (event: SortableEvent) => {
      localState.current = null;
      const std = createStandard(event);
      callHandler(event);
      callSetList(event, std);
    };

    const onFilter = (event: SortableEvent) => {
      callHandler(event);
    };

    const onMove: Required<OptionHandlers>["onMove"] = (
      event: MoveEvent,
      originalEvent: Event
    ) => {
      const onHandler = options.onMove;
      // @todo - true || -1 as type doesn't seem right.
      const defaultValue = event.willInsertAfter || -1;
      if (!onHandler) return defaultValue;
      return onHandler(event, originalEvent) || defaultValue;
    };

    const onRemove = (event: SortableEvent) => {
      const std = createStandard(event);

      dom.insertEachNode(std);
      if (event.pullMode === "clone") {
        // if pull mode is clone, also remove the cloned DOM elements.
        std.forEach(curr => {
          if (!curr.clone) throw new Error("should have a clone here.");
          dom.removeNode(curr.clone);
        });
      }

      callHandler(event);
      callSetList(event, std);
    };

    const onSelect = (event: SortableEvent) => {
      const std = createStandard(event);
      callHandler(event);
      callSetList(event, std);
    };

    const onSort = (event: SortableEvent) => {
      callHandler(event);
    };

    const onSpill = (event: SortableEvent) => {
      if (options.removeOnSpill && !options.revertOnSpill) {
        dom.removeNode(event.item);
      }
      callHandler(event);
    };

    const onStart = (event: SortableEvent) => {
      localState.current = props.list;
      const std = createStandard(event);
      callHandler(event);
      callSetList(event, std);
    };

    const onUnchoose = (event: SortableEvent) => {
      const std = createStandard(event);
      callHandler(event);
      callSetList(event, std);
    };

    const onUpdate = (event: SortableEvent) => {
      const std = createStandard(event);

      dom.removeEachNode(std);
      dom.insertEachNode(std);

      callHandler(event);
      callSetList(event, std);
    };

    return {
      ...options,
      onAdd,
      onChange,
      onChoose,
      onClone,
      onDeselect,
      onEnd,
      onFilter,
      onMove,
      onRemove,
      onSelect,
      onSort,
      onSpill,
      onStart,
      onUnchoose,
      onUpdate
    };
  }, [props, options]);
  return newOptions;
}

const localState: LocalState = {
  current: null
};

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

/** A list of all handlers. */
export type Handlers = typeof types extends ReadonlyArray<infer T> ? T : never;
export type OptionHandlers = Pick<Options, Handlers>;
export type RequiredOptions = Required<OptionHandlers>;
export type NewOptions = Options & RequiredOptions;

export interface LocalState<T extends Item = any> {
  current: null | T[];
}
