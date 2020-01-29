// @todo - @waynevs/hooks - service needs to export function usefull hooks seperately.
import classnames from "classnames";
import {
  Dispatch,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { default as Sortable, Options } from "sortablejs";
import { useComponentDidUpdate } from "../util/hooks";
import { createUseEffectChildren } from "./use-children";
import { RequiredOptions, useNewOptions } from "./use-handlers";

export interface HookProps<T extends Item> {
  list: T[];
  setList: (newList: T[]) => void;
  clone?: (item: T) => T;
}

// @todo! - issue with cloning. extra element is being added when it's not suppossed o.
// providing overload so we can have appropriate paramater names in 'real' function.
export function useReactSortable<T extends Item, R extends HTMLElement = any>(
  props: HookProps<T>,
  options?: Options
): RefObject<R>;

export function useReactSortable<T extends Item, R extends HTMLElement = any>(
  oldProps: HookProps<T>,
  oldOptions: Options = {}
) {
  // Create standardized props and options
  const props = useInternalProps<R, T>(oldProps);
  const options = useNewOptions(props, oldOptions);
  // #@todo  —  onClone with clone, onChange with clone,

  const [prep, setPrep] = useState(false);

  // reset state so all booleans are false
  useEffect(() => {
    const notpure = props.list.some(({ chosen, selected }) => {
      return chosen || selected;
    });

    if (notpure)
      throw new Error(
        'Ensure all items in list have "chosen=false" and "selected=false" on component mount.'
      );

    const initialChange = (prev: T[]) =>
      prev.map(item => ({
        ...item,
        chosen: false,
        selected: false
      }));
    props.setList(initialChange);
  }, []);

  // mount sortable with options
  useSortableCreate(props, options);

  // continue to update sortable.options when state changes.
  useSortableOptions(props, options);

  const useEachChild = createUseEffectChildren(props, options);

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
 * Props used internally after pre-processing props.
 */
function useInternalProps<R extends HTMLElement, T extends Item>(
  props: HookProps<T>
): InternalProps<T, R> {
  // need this internal list so we can dispatch off it.
  const [list, setList] = useState(props.list);

  // when the internal list changes, change the actual list.
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
    if (ref.current) Sortable.create(ref.current, options);

    return () => {
      if (ref.current) sortable?.destroy();
    };
  }, [ref]);
}

/**
 * When the component updates (excluding first render),
 * set the options using `element.sortable.option(key, value)`.
 *
 * @todo
 * - set options to default if they're no longer included.
 * - keep track of previous options compared to new options.
 */
function useSortableOptions(
  props: InternalProps<any, any>,
  options: Options & RequiredOptions
) {
  const [prev, setPrev] = useState(options);
  // @todo - which to update?

  useComponentDidUpdate(() => {
    if (!props.sortable) return;
    const optionNames = Object.keys(options) as (keyof Options)[];

    optionNames.forEach(<O extends keyof Options>(key: O) => {
      const value = options[key] as Options[O];
      props.sortable!.option(key, value);
    });
  }, [props, options]);
}

// className.
function useClassNames<T extends Item>(
  props: InternalProps<T, any>,
  options: Options & RequiredOptions
) {
  const useEachChild = createUseEffectChildren(props, options);
  useEachChild(
    ({ element, item }) => {
      // get classNames and set defaults.
      const {
        selectedClass = "sortable-selected",
        chosenClass = "sortable-chosen",
        // not used yet
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
  clone: null | NonNullable<HookProps<T>["clone"]>;
  ref: RefObject<R>;
  sortable: Sortable | null;
};

/** The shape of the object that each item in the list should be. */
export interface Item {
  /** A unique ID. You should also use this as the key in your list. */
  id:  number;
  /** Indicates when the multidrag plugin selected this item. */
  selected?: boolean;
  /** Indicates when this has been chosen by sortable. */
  chosen?: boolean;
  /** Indicates if this item is filtered. Sortable controls adding this to the class of the element. */
  filtered?: boolean;
}
