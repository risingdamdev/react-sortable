import React, { useState } from "react";
import { generateData } from "./helpers";
import { useReactSortable } from "../../src";

export function SimpleList() {
    const [list, setList] = useState(generateData);
    const ref = useReactSortable({ list, setList });
    return (
      <ul id='simple-list' ref={ref}>
        {list.map(item => (
          <li id={`item-${item.id}`} key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  }
  