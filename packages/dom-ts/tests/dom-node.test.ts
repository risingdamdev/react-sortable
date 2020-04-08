//@ts-ignore
import jsdom from "global-jsdom";
import {
  contains,
  insertBefore,
  appendChild,
  insertAtIndex,
} from "../src/dom-node";
import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";

let cleanup: Function;
beforeEach(() => (cleanup = jsdom()));
afterEach(() => cleanup());

describe("contains", () => {
  test("false", () => {
    const node = document.createElement("ul");
    const other = document.createElement("li");

    const result = contains(other)(node);
    expect(result).toBeFalsy();
  });

  test("true", () => {
    const node = document.createElement("ul");
    const other = document.createElement("li");

    node.appendChild(other);

    const result = contains(other)(node);
    expect(result).toBeTruthy();
  });
});

describe("insertBefore", () => {
  test("inserts", () => {
    const node = document.createElement("ul");
    const refChild = document.createElement("li");
    node.appendChild(refChild);

    const newChild = document.createElement("li");

    const result = pipe(node, insertBefore(newChild, refChild))();

    expect(result).toStrictEqual(either.right(newChild));
  });

  test("errors", () => {
    const node = document.createElement("ul");
    const refChild = document.createElement("li");

    const newChild = document.createElement("li");
    const result = pipe(node, insertBefore(newChild, refChild))();

    expect(either.isLeft(result)).toBeTruthy();
  });
});

describe("appendChild", () => {
  test("appends childs", () => {
    const node = document.createElement("ul");
    const child = document.createElement("li");

    const result = pipe(node, appendChild(child))();

    expect(result).toStrictEqual(child);

    const contain = pipe(node, contains(child));
    expect(contain).toBeTruthy();
  });
});

describe("insertAtIndex", () => {
  describe("sucess", () => {
    test("inserts at index of 0/0", () => {
      const node = document.createElement("ul");

      const child = document.createElement("li");
      const index = 0;

      const result = pipe(node, insertAtIndex(child, index))();

      expect(result).toStrictEqual(either.right(child));
      expect(node.childNodes.item(index)).toStrictEqual(child);
    });

    test("inserts at index of 0/2", () => {
      const node = document.createElement("ul");
      const c0 = document.createElement("li");
      const c1 = document.createElement("li");

      node.appendChild(c0);
      node.appendChild(c1);

      const child = document.createElement("li");
      const index = 0;

      const result = pipe(node, insertAtIndex(child, index))();

      expect(result).toStrictEqual(either.right(child));
      expect(node.childNodes.item(index)).toStrictEqual(child);
    });

    test("inserts at index of 1/2", () => {
      const node = document.createElement("ul");
      const c0 = document.createElement("li");
      const c1 = document.createElement("li");

      node.appendChild(c0);
      node.appendChild(c1);

      const child = document.createElement("li");
      const index = 1;

      const result = pipe(node, insertAtIndex(child, index))();

      expect(result).toStrictEqual(either.right(child));
      expect(node.childNodes.item(index)).toStrictEqual(child);
    });

    test("inserts at index of 2/2", () => {
      const node = document.createElement("ul");

      const c0 = document.createElement("li");
      const c1 = document.createElement("li");

      node.appendChild(c0);
      node.appendChild(c1);

      const child = document.createElement("li");
      const index = 2;

      const result = pipe(node, insertAtIndex(child, index))();

      expect(result).toStrictEqual(either.right(child));
      expect(node.childNodes.item(index)).toStrictEqual(child);
    });
  });

  describe("error", () => {
    test("error when index is -1/0", () => {
      const node = document.createElement("ul");

      const child = document.createElement("li");
      const index = -1;

      const result = pipe(node, insertAtIndex(child, index))();

      expect(either.isLeft(result)).toBeTruthy();
      expect(node.childNodes.length).toBe(0);
    });

    test("error when index is -1/2", () => {
      const node = document.createElement("ul");
      const c0 = document.createElement("li");
      const c1 = document.createElement("li");

      node.appendChild(c0);
      node.appendChild(c1);

      const child = document.createElement("li");
      const index = -1;

      const result = pipe(node, insertAtIndex(child, index))();

      expect(either.isLeft(result)).toBeTruthy();
      expect(node.childNodes.length).toBe(2);
    });

    test("error when index is 1/0", () => {
      const node = document.createElement("ul");

      const child = document.createElement("li");
      const index = 1;

      const result = pipe(node, insertAtIndex(child, index))();

      expect(either.isLeft(result)).toBeTruthy();
      expect(node.childNodes.length).toBe(0);
    });

    test("error when index is 3/2", () => {
      const node = document.createElement("ul");
      const c0 = document.createElement("li");
      const c1 = document.createElement("li");

      node.appendChild(c0);
      node.appendChild(c1);

      const child = document.createElement("li");
      const index = 3;

      const result = pipe(node, insertAtIndex(child, index))();

      expect(either.isLeft(result)).toBeTruthy();
      expect(node.childNodes.length).toBe(2);
    });
  });
});
