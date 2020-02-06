import React, { useState, useEffect } from "react";
import { useReactSortable } from "../../src";
import { Item, threes } from "../util";

type I = ReturnType<typeof threes> extends (infer P)[] ? P : never;

export function SimpleList() {
  const [list, setList] = useState(threes);
  const ref = useReactSortable<I>({ list, setList }, { animation: 200 });
  useEffect(() =>{console.table(list)},[list])
  return (
    <div ref={ref} id="simple-list">
      {list.map(item => (
        <Item className="test" id={`simple-item-${item.id}`} key={item.id}>
          {item.id}. {item.name}
        </Item>
      ))}
    </div>
  );
}
