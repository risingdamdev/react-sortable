import { io, ioEither, function as fn } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";

const documentContains = <T extends Node>(a: T | null): a is T =>
  document.contains(a);

const HTMLCollectionToArray = (collection: HTMLCollection): Array<Element> =>
  Array.from(collection);

/** remove dom element */
export const removeElement = <T extends ChildNode>(element: T) =>
  io.of(element.remove());

const isNull = <T>(a: T | null): a is null => a === null;
const isNotNull = <T>(a: T | null): a is NonNullable<T> => a !== null;

const getIndexFromParent = <T extends ParentNode>(parent: T, index: number) =>
  pipe(
    parent.children.item(index),
    ioEither.fromPredicate(isNotNull, () => null)
  );

export const addElement = <P extends Node & ParentNode, E extends Node>(
  parent: P,
  element: E,
  index: number
) =>
  pipe(
    getIndexFromParent(parent, index),
    ioEither.fold(io.of, io.of),
    ioEither.rightIO,
    ioEither.map(refChild => parent.insertBefore(element, refChild))
  );
