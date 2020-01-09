import { DependencyList, useEffect } from "react";
import { Options } from "sortablejs";
import { RequiredOptions } from "./use-handlers";
import { InternalProps, Item } from "./use-react-sortable";

export interface useChildrenParams<T extends Item> {
  element: Element;
  item: T;
  index: number;
  elements: Element[];
  list: T[];
}

/**
 * Sets the attrs for each element in `element.children`.
 */
export function createUseEffectChildren<T extends Item, R extends HTMLElement>(
  props: InternalProps<T, R>,
  options?: Options & RequiredOptions
) {
  return (
    predicate: (param: useChildrenParams<T>) => void,
    deps: DependencyList = []
  ) => {
    const { list, ref } = props;

    useEffect(() => {
      if (!ref.current) return;
      const elements = Array.from(ref.current.children);
      // if (elements.length !== list.length) throw new Error();
      elements.forEach((element, index) => {
        const item = list[index];
        if (!item) throw new Error();
        predicate({ element, elements, index, list, item });
      });
    }, [props, options, ...deps]);
  };
}
