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
