import { DependencyList, useRef, useEffect, EffectCallback } from "react";

/** Skips the initial render */
export function useComponentDidUpdate(
  onUpdate: EffectCallback,
  deps?: DependencyList
) {
  const componentDidMount = useRef(false);
  useEffect(() => {
    if (!componentDidMount.current) componentDidMount.current = true;
    else return onUpdate();
  }, deps);
}

//@todo - a new `useChildren` hook.