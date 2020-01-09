import { Item } from "../hooks/use-react-sortable";
import { createSort, Standard } from ".";

/** Remove the node that was passed in from the DOM. */
function removeNode(node: HTMLElement) {
  if (node.parentElement !== null) node.parentElement.removeChild(node);
}

/** Insert the `newChild` as a child of the parent as child number `index` */
// check end boundary: if parent.children has 5 items,
// child will be an index of 6 or less.
function insertNodeAt(
  parent: HTMLElement,
  newChild: HTMLElement,
  index: number
) {
  const refChild = parent.children[index] || null;
  const indexIsAboveNextIndex = parent.children.length > index;
  if (!refChild && indexIsAboveNextIndex) throw new Error(badDOMIndexGiven);
  parent.insertBefore(newChild, refChild);
}

/** Remove the `customs[x].element` from the DOM */
function removeEachNode<T extends Item>(customs: Standard<T>[]) {
  customs.forEach(curr => removeNode(curr.element));
}

/** Inserts the `customs[x].element` as a child of `customs[x].parent` at `customs[x].oldIndex`. */
function insertEachNode<T extends Item>(customs: Standard<T>[]) {
  const sort = createSort({ type: "oldIndex", ascending: true });
  customs.sort(sort).forEach(curr => {
    insertNodeAt(curr.parentElement, curr.element, curr.oldIndex);
  });
}

/** Utility functions for changing the dom when required. */
export const dom = { removeNode, insertEachNode, removeEachNode, insertNodeAt };

const badDOMIndexGiven =
  "Would add gap in children if DOM let me. Index is wrong. Try again :)";
