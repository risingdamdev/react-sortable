import {
  createElement,
  PropsWithChildren,
  ReactHTML,
  CSSProperties,
  ForwardRefExoticComponent,
  RefAttributes
} from "react";
import { Item, useReactSortable } from "./hooks/use-react-sortable";
import { Options } from "sortablejs";

export function ReactSortable<T extends Item>(
  props: PropsWithChildren<ReactSortableProps<T>>
) {
  const {
    tag,
    children,
    list,
    setList,
    clone,
    className,
    id,
    style,
    ...options
  } = props;
  const rest = { className, id, style };
  const ref = useReactSortable({ list, setList, clone }, options);
  return createElement(tag || "div", { ...rest, ref }, children);
}

export interface ReactSortableProps<T extends Item> extends Options {
  className?: string[];
  clone?: (item: T) => T;
  id?: string;
  list: T[];
  setList: (newList: T[]) => void;
  style?: CSSProperties;
  tag?: ForwardRefExoticComponent<RefAttributes<any>> | keyof ReactHTML;
}
