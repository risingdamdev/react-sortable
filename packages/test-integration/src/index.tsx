import * as React from "react";
import { Route, Switch } from "react-router";
import { useSortable } from "react-sortablejs";
// fixtures

export interface Fixture {
  name: string;
  component: React.ComponentType;
}

export const classes = {
  container: "shadow-xl",
  list: "p-2 bg-white border-gray-600 border rounded-sm mb-1",
};

export const fixtures: Fixture[] = [
  {
    name: "test-01",
    component: () => {
      const ref = React.useRef(null);
      const [list] = useSortable({
        ref,
        useList: React.useState([
          { id: "11", value: "shrek" },
          { id: "22", value: "fiona" },
          { id: "33", value: "donkey" },
          { id: "44", value: "lord faarquad" },
        ]),
      });

      return (
        <ul ref={ref} className={classes.container}>
          {list.map(({ id, value }) => (
            <li key={id} className={classes.list}>
              {value}
            </li>
          ))}
        </ul>
      );
    },
  },
];

// boilerplate

export const Template: React.FC = ({ children }) => (
  <main className="bg-blue-200 p-4 min-h-screen">{children}</main>
);

export const App: React.FC = () => {
  return (
    <Template>
      <Switch>
        {fixtures.map(({ name, component: Component }) => (
          <Route exact path={"/" + name}>
            <h1 className="text-xl text-center bg-pink-100 mb-3 p-2 border border-gray-600">
              {name}
            </h1>
            <Component />
          </Route>
        ))}
      </Switch>
    </Template>
  );
};
