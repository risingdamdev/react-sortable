import * as React from "react";
import * as ReactDOM from "react-dom";
import "./index.css";
import { App } from "../src";

import { querySelector } from "dom-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { ioEither } from "fp-ts";
import { BrowserRouter } from "react-router-dom";

const Component = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

const main = pipe(
  document,
  querySelector("body > div#app"),
  ioEither.map((el) => ReactDOM.render(<Component />, el))
);

main();
