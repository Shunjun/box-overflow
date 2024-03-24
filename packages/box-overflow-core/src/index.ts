/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 18:03:46
 */

export interface BoxOverflowOptions {
  getContainer: () => HTMLElement
  indexAttribute?: string
  maxCount?: number
  maxLine?: number
}

export class BoxOverflow {
  options!: BoxOverflowOptions

  constructor(options: BoxOverflowOptions) {
    this.setOptions(options)
    this.init ()
  }

  setOptions(options: BoxOverflowOptions) {
    Object.entries(options).forEach(
      ([key, value]) => typeof value === 'undefined' && delete (options as any)[key],
    )

    this.options = {
      indexAttribute: 'data-index',
      ...options,
    }
  }

  onMount() {
    const container = this.options.getContainer()

    if (!container)
      return

    const children = Array.from(container.children)

    return () => {
      this.destroy()
    }
  }

  destroy() {

  }
}
