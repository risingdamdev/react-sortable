import { insertAtIndex, remove } from "dom-ts";
import { array, io, ioEither, ord, option } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { NormalizedEvent } from "./normalize-event";
import { ID } from ".";

export type NormalizedEventIndicies = Pick<
  NormalizedEvent,
  "oldIndex" | "newIndex"
>;

export const ordOldIndex = pipe(
  ord.ordNumber,
  ord.contramap<number, NormalizedEventIndicies>(
    (normalized) => normalized.oldIndex
  )
);

export const ordNewIndex = pipe(
  ord.ordNumber,
  ord.contramap<number, NormalizedEventIndicies>(
    (normalized) => normalized.oldIndex
  )
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

// for each,

// get values for each in old, use it in new.
export const normalizedInsert = <T extends ID>(
  normalized: NormalizedEventIndicies[],
  previous: T[],
  original: T[]
) =>
  pipe(
    normalized,
    array.sort(ordNewIndex),
    array.reverse,
    array.reduce(option.some(previous), (prev, { oldIndex, newIndex }) =>
      pipe(
        array.lookup(oldIndex, original),
        option.chain((item) =>
          pipe(prev, option.chain(array.insertAt(newIndex, item)))
        )
      )
    )
  );
