/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-26 10:40:03
 */

export enum ObserverType {
  Resize,
  Mutation,
}

export type ResizeHandler = (ele: HTMLElement, entry: ResizeObserverEntry) => void
export type MutationHandler = (mutation: MutationRecord) => void

export type SetRequired< T, K extends keyof T > = Omit < T, K > & Required < Pick < T, K >>
