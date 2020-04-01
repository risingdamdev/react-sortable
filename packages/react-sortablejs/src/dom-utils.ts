import { array, io, ioEither, option } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";

const documentContains = <T extends Node>(a: T | null): a is T =>
  document.contains(a);

const HTMLCollectionToArray = (collection: HTMLCollection): Array<Element> =>
  Array.from(collection);

/** insert an element to the index of the dom */
export const addElementAtIndex = (
  parent: HTMLElement,
  element: HTMLElement,
  index: number
) =>
  pipe(
    parent,
    option.fromPredicate(documentContains),
    option.chain(a =>
      pipe(
        a.children,
        HTMLCollectionToArray,
        option.fromPredicate(b => index > 0 || index <= b.length)
      )
    ),
    option.map(a => pipe(array.lookup(index + 1, a), option.toNullable)),
    ioEither.fromOption(() => "validation failed"),
    ioEither.map(adjecentElement =>
      parent.insertBefore(element, adjecentElement)
    )
  );

/** remove dom element */
export const removeElement = (element: HTMLElement) => io.of(element.remove());
