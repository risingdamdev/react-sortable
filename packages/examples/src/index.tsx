import React, { FunctionComponent, useRef, useState } from "react";
import { useSortable } from "react-sortablejs";

export const ExampleOne: FunctionComponent = () => {
  const ref = useRef<HTMLUListElement>(null);

  const [list] = useSortable(
    {
      useList: useState([
        { id: "1", name: "shrek" },
        { id: "2", name: "fiona" }
      ]),
      ref
    },
    { animation: 200 }
  );

  return (
    <ul className="p-4" ref={ref}>
      {list.map(item => (
        <li className="p-2 bg-blue-300 mb-1" key={item.id}>
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
