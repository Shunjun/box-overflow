/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-26 10:44:40
 */

export function isElementNode(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE
}

export function notNil<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function memo< TDeps extends readonly any[], Result>(getDeps: () => [...TDeps], fn: (...P: [...TDeps]) => Result) {
  let deps: [...TDeps] = [] as never as [...TDeps]
  let result: Result | undefined
  let firstRun = true

  return () => {
    const newDeps = getDeps()
    const depsChanged
    = newDeps.length !== deps.length
    || newDeps.some((dep: any, index: number) => deps[index] !== dep)

    if (!depsChanged && !firstRun)
      return result!

    firstRun = false
    deps = newDeps

    result = fn(...newDeps)

    return result!
  }
}
