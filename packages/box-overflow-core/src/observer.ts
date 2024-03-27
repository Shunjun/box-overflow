/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-26 00:18:36
 */

import type { MutationHandler, ResizeHandler } from './types'
import { ObserverType } from './types'

export class Observer<T extends ObserverType > {
  private _observer: ResizeObserver | MutationObserver | null = null

  constructor(private readonly type: T, private handler: ResizeHandler | MutationHandler) {
  }

  static createResizeObserver(handler: ResizeHandler) {
    return new Observer(ObserverType.Resize, handler)
  }

  static createMutationObserver(handler: MutationHandler) {
    return new Observer(ObserverType.Mutation, handler)
  }

  get ob() {
    if (this._observer)
      return this._observer

    if (this.type === ObserverType.Resize) {
      if (typeof ResizeObserver !== 'undefined') {
        return (this._observer = new ResizeObserver((entries) => {
          entries.forEach((entry) => {
            (this.handler as ResizeHandler)(entry.target as HTMLElement, entry)
          })
        }))
      }
      return null
    }
    else {
      if (typeof MutationObserver !== 'undefined') {
        return (this._observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList')
              (this.handler as MutationHandler) (mutation)
          })
        }))
      }
      return null
    }
  }

  observe(target: HTMLElement) {
    if (this.type === ObserverType.Resize)
      this.ob?.observe(target, { box: 'border-box' })
    else
      this.ob?.observe(target, { childList: true })
  }

  unobserve(target: HTMLElement) {
    this.ob instanceof ResizeObserver && this.ob?.unobserve(target)
  }

  disconnect() {
    if (!this.ob)
      return
    this.ob?.disconnect()
  }
}
