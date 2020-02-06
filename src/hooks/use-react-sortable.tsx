import classnames from "classnames";
import {
  Dispatch,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
  DependencyList
} from "react";
import { default as Sortable, Options } from "sortablejs";
import { useComponentDidUpdate } from "../util/hooks";
import { RequiredOptions, useNewOptions, NewOptions } from "./use-handlers";

export interface SortableHookProps<T extends Item> {
  list: T[];
  setList: (newList: T[]) => void;
  clone?: (item: T) => T;
}

// @todo! - issue with cloning. extra element is being added when it's not suppossed o.
// providing overload so we can have appropriate paramater names in 'real' function.
/**
 *
 * @param props
 * @param options The options passed to the second argument in `Sortable.create(el, options)`
 */
export function useReactSortable<T extends Item, R extends HTMLElement = any>(
  props: SortableHookProps<T>,
  options?: Options
): RefObject<R>;

export function useReactSortable<T extends Item, R extends HTMLElement = any>(
  oldProps: SortableHookProps<T>,
  oldOptions: Options = {}
) {
  // Create standardized props and options
  const props = useInternalProps<R, T>(oldProps);
  const options = useNewOptions(props, oldOptions);

  // validate the items in the object
  useValidateListItems(props.list);

  // mount sortable with options
  useSortableCreate(props, options);

  // continue to update sortable.options when state changes.
  useSortableOptions(props, options);

  const useEachChild = createUseEffectChildren(props);

  // data-id
  useEachChild(({ element, item }) => {
    const dataId = String(item.id);
    element.setAttribute("data-id", dataId);
  });

  // classNames
  useClassNames(props, options);

  return props.ref;
}

/**
 * @summary Validates all items in the list for compatibility.
 *
 * @description
 * On mount, check to see if each item in the list is controlled.
 * If `chosen` or `selected` are true, and error is thrown.
 */
function useValidateListItems<T extends Item>(list: T[]) {
  useEffect(() => {
    const notpure = list.some(({ chosen, selected }) => chosen || selected);
    if (notpure)
      throw new Error(
        'Ensure all items in list have "chosen=false" and "selected=false" on component mount.'
      );
  }, []);
}

/**
 * Props used internally after pre-processing props.
 */
function useInternalProps<R extends HTMLElement, T extends Item>(
  props: SortableHookProps<T>
): InternalProps<T, R> {
  // need this internal list so we can dispatch off it.
  const [list, setList] = useState(props.list);
  // when we are in the middle of a drag, don't move anything.

  // when the internal list changes, change the list from the user.
  useEffect(() => {
    props.setList(list);
  }, [list]);

  const ref = useRef<R>(null);

  const sortable = useMemo(() => {
    if (!ref.current) return null;
    //@ts-ignore
    return Sortable.get(ref.current) as Sortable | null;
  }, [ref, props]);

  return { clone: null, list, setList, ref, sortable };
}

/**
 * On componentDidMount, use `Sortable.create(element, options)`.
 */
function useSortableCreate<T extends Item>(
  props: InternalProps<T, any>,
  options: Options & RequiredOptions
) {
  const { ref, sortable } = props;
  useEffect(() => {
    if (ref.current) {
      Sortable.create(ref.current, options);
    }
    return () => {
      if (ref.current) sortable?.destroy();
    };
  }, [ref]);
}

/**
 * When the component updates (excluding first render),
 * set the options using `element.sortable.option(key, value)`.
 *
 * @todo Only update when it has to be updated,
 * - set options to default if they're no longer included.
 * - keep track of previous options compared to new options.
 */
function useSortableOptions(
  { sortable }: Pick<InternalProps<any, any>, "sortable">,
  options: NewOptions
) {
  useComponentDidUpdate(() => {
    if (!sortable) return;
    const optionNames = Object.keys(options) as (keyof Options)[];

    optionNames.forEach(<O extends keyof Options>(key: O) => {
      const value = options[key] as Options[O];
      sortable!.option(key, value);
    });
  }, [sortable, options]);
}

// className.
//@todo - only add classNames that can be changed when not dragging.
function useClassNames<T extends Item>(
  props: Pick<InternalProps<T, any>, "list" | "ref">,
  options: NewOptions
) {
  const useEachChild = createUseEffectChildren(props);
  useEachChild(
    ({ element, item }) => {
      // get classNames and set defaults.
      const {
        selectedClass = "sortable-selected",
        chosenClass = "sortable-chosen",
        // not used yet, but kept here for reference.
        dragClass = "sortable-drag",
        fallbackClass = "sortable-fallback",
        ghostClass = "sortable-ghost",
        swapClass = "sortable-swap-highlight"
      } = options;

      // only classes in here affect changes.
      const classNameState = {
        [selectedClass]: item.selected,
        [chosenClass]: item.chosen
      };

      // remove any currently assigned matching classNames.
      // ensures react state changes the DOM.
      const forbidden = Object.keys(classNameState);
      const bareClassName = element.className
        .trim()
        .split(" ")
        .filter(name => !forbidden.includes(name))
        .join(" ");
      const newClassName = classnames(bareClassName, classNameState);
      element.className = newClassName;
    },

    [props, options]
  );
}

/**
 * Props used internally after pre-processing props.
 */
export type InternalProps<T extends Item, R extends HTMLElement> = {
  list: T[];
  setList: Dispatch<(prevState: T[]) => T[]>;
  clone: null | NonNullable<SortableHookProps<T>["clone"]>;
  ref: RefObject<R>;
  sortable: Sortable | null;
};

/** The shape of the object that each item in the list should be. */
export interface Item {
  /** A unique ID. You should also use this as the key in your list. */
  id: number | string;
  /** Indicates when the multidrag plugin selected this item. */
  selected?: boolean;
  /** Indicates when this has been chosen by sortable. */
  chosen?: boolean;
  /** Indicates if this item is filtered. Sortable controls adding this to the class of the element. */
  filtered?: boolean;
}

export type CreateUseEffectChildrenParams<
  T extends Item,
  R extends HTMLElement
> = Pick<InternalProps<T, R>, "ref" | "list">;

export interface useChildrenParams<T extends Item> {
  /** The current element. */
  element: Element;
  /** The current item in the list. */
  item: T;
  /** The current index of the item. */
  index: number;
  /** The entire list of elements. */
  elements: Element[];
  /** The entire list of items. */
  list: T[];
}

/**
 * @summary Returns a react hook that iterates each child element within the sortable container element.
 * Provides us with a neater API to use.
 */
export const createUseEffectChildren = <T extends Item, R extends HTMLElement>({
  list,
  ref
}: CreateUseEffectChildrenParams<T, R>) => (
  predicate: (param: useChildrenParams<T>) => void,
  deps: DependencyList = []
) => {
  useEffect(() => {
    if (!ref.current) return;
    const elements = Array.from(ref.current.children);
    // if (elements.length !== list.length) throw new Error();
    elements.forEach((element, index) => {
      const item = list[index];
      if (!item)
        throw new Error(
          "Cannot find item. Link React state to DOM elements has been done badly."
        );
      predicate({ element, elements, index, list, item });
    });
  }, [list, ref, ...deps]);
};
