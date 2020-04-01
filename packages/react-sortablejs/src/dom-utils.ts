import { io } from "fp-ts";

const documentContains = <T extends Node>(a: T | null): a is T =>
  document.contains(a);

const HTMLCollectionToArray = (collection: HTMLCollection): Array<Element> =>
  Array.from(collection);

/** remove dom element */
export const removeElement = (element: HTMLElement) => io.of(element.remove());
