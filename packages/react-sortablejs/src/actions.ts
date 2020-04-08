import { insertAtIndex, remove } from "dom-ts";
import { array, io, ioEither, ord } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { ID } from "../src";
import { NormalizedEvent } from "./sortable-utils";

export const ordOldIndex = pipe(
  ord.ordNumber,
  ord.contramap((normalized: NormalizedEvent) => normalized.oldIndex)
);

export const onUpdateDOM = (normalized: NormalizedEvent[]) =>
  pipe(
    normalized,
    array.map(({ parent, element, oldIndex }) =>
      pipe(
        ioEither.rightIO(remove(element)),
        ioEither.map(() => parent),
        ioEither.chain(insertAtIndex(element, oldIndex))
      )
    ),
    array.array.sequence(ioEither.ioEither)
  );

export const onAddDOM = (normalized: NormalizedEvent[]) =>
  pipe(
    normalized,
    array.map(({ element }) => remove(element)),
    array.array.sequence(io.io)
  );

export const onRemoveDOM = (normalized: NormalizedEvent[]) =>
  pipe(
    normalized,
    array.reverse,
    array.map(({ element, oldIndex, parent }) =>
      insertAtIndex(element, oldIndex)(parent)
    ),
    array.array.sequence(ioEither.ioEither)
  );
