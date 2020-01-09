import { SortableEvent } from "sortablejs";
import { Standard } from "../util/event-to-array";
import { Handlers } from "./use-handlers";
import { InternalProps, Item } from "./use-react-sortable";
import { createClone, createSort } from "../util/miscellaneous";

const createRemove = <T extends Item>(std: Standard<T>[]) => {
  return (item: T, index: number): boolean =>
    !!std.find(ss => ss.oldIndex !== index);
};

const createInsert = <T extends Item>(std: Standard<T>[]) => {
  return (prev: T[], curr: T, index: number, array: T[]): T[] => {
    if (index !== 0) return prev;
    prev = array;
    const sort = createSort({ ascending: true, type: "newIndex" });
    std.sort(sort).forEach(s => prev.splice(s.newIndex, 0, s.item));
    return prev;
  };
};

/**
 * Changes the state according to the sortable event.
 * @param state
 * @param action
 */
export function stateReducer<T extends Item>(
  state: T[],
  action: Action<T>
): T[] | null {
  const { event, std, type, clone } = action;

  const removeOldIndicies = createRemove(std);
  const insertNewIndicies = createInsert(std);

  switch (type) {
    case "onUpdate": {
      console.log("update");
      console.table(state);
      return state
        .filter(removeOldIndicies)
        .reduce(insertNewIndicies, [] as T[]);
    }

    case "onAdd": {
      return state.reduce(insertNewIndicies, [] as T[]);
    }

    case "onRemove": {
      const newState = state.filter(removeOldIndicies);

      // if pull mode, insert new items in old places
      if (event.pullMode === "clone") {
        // replace the std items with a new clone
        std.forEach(s => {
          const newItem = !!clone ? clone(s.item) : createClone(s.item);
          newState.splice(s.oldIndex, 0, newItem);
        });
      }

      // @todo - deselect all items, this is what multi drag does also.
      return newState;
    }

    case "onSelect":
      // @todo
      // make the 1 or all items === false, so we can add with useEffect()
      // handle all cases - selecting 1 item or multiple.
      // selected items are all in multidrag array.
      return onSelectEvents(state, event, true);

    case "onDeselect":
      // @todo
      // make the 1 or all items === false, so we can add with useEffect()
      // handle all cases - deslecting 1 item or multiple.
      return onSelectEvents(state, event, false);
    case "onStart":
      // if chosen, make dragging true
      return state.map(item =>
        !!item.chosen ? { ...item, dragging: true } : item
      );
    case "onEnd":
      console.log("end");
      console.table(state);
      return state.map(item => ({ ...item, dragging: false }));
    case "onChoose":
    // return onChooseEvents(state, event, true);
    case "onUnchoose":
    // return onChooseEvents(state, event, false);
    case "onSpill":
      // these will do something soon.
      // if the logic is true, do something.
      return null;
    default:
      throw new Error();
  }
}

const onChooseEvents = <T extends Item>(
  list: T[],
  event: SortableEvent,
  boolean: boolean
) => {
  const newList = [...list];
  const index = event.oldIndex;
  if (index === undefined || index === -1) throw new Error();
  newList[index].chosen = boolean;
  return newList;
};

const onSelectEvents = <T extends Item>(
  list: T[],
  event: SortableEvent,
  boolean: boolean
) => {
  const newList = list.map(item => ({ ...item, selected: false }));
  event.newIndicies.forEach(curr => {
    const { index } = curr;
    if (index === -1) return; // means it's being deleted
    newList[index].selected = boolean;
  });
  return newList;
};

export const globalState: GlobalState = { current: null };

export interface GlobalState {
  current: null | (Item & { [key: string]: any })[];
}

export type Action<T extends Item> = DefaultAction<T>;

export type DefaultAction<T extends Item> = {
  type: Exclude<Handlers, "onMove">;
  event: SortableEvent;
  std: Standard<T>[];
  clone: InternalProps<T, any>["clone"];
};
