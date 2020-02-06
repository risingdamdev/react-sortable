import React, { useState } from "react";
import styled from "styled-components";
import { ReactSortable } from "../../src";
import { Item, threes } from "../util";


export function Filter() {
  const [list, setList] = useState(threes);
  return (
    <ReactSortable
      filter=".filter"
      list={list}
      setList={setList}
      animation={150}
    >
      {list.map(item => (
        <CustomItem key={item.id}>
          {item.id}. {item.name}
        </CustomItem>
      ))}
    </ReactSortable>
  );
}

const CustomItem = styled(Item)`
  &.filter {
    background-color: #f33a;
  }
`;
