import React from "react";
import { render } from "react-dom";
import { SimpleList } from "./simple-list";

function App() {
  return (
    <main>
      <SimpleList />
    </main>
  );
}

const el = document.getElementById("app");
render(<App />, el);
