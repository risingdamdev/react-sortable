import React, { FunctionComponent, useRef, useState } from "react";
import { useSortable } from "react-sortablejs";
import { array } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";

let id = 0;
const createId = () => (id++).toString();

const newItems = () =>
  pipe(
    ["shrek", "fiona", "donkey"],
    array.map(name => ({ id: createId(), name }))
  );

export const ExampleOne: FunctionComponent = () => {
  const ref = useRef<HTMLUListElement>(null);

  const [list] = useSortable(
    { useList: useState(newItems), ref },
    { animation: 300, multiDrag: true }
  );

  return (
    <ul className="p-4" ref={ref}>
      {list.map(item => (
        <li className="p-2 bg-blue-300 mb-1 rounded-sm" key={item.id}>
          {item.name}
        </li>
      ))}
    </ul>
  );
};

export const App = () => (
  <div>
    <ExampleOne />
  </div>
);
