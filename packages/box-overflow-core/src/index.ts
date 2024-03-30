/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 18:03:46
 */

import { Observer } from './observer'
import type { SetRequired } from './types'
import { isElementNode, memo, notNil } from './utils'

export interface BoxOverflowOptions {
  idAttribute?: string
  maxCount?: number
  maxLine?: number
  /**
   * 排列方向
   * @default 'ltr'
   */
  direction?: 'ltr' | 'rtl'
  getContainer: () => HTMLElement
  /**
   * 显示的数量变更
   */
  onDisplayChange?: (count: OverflowItem[]) => void

  getKeyByIndex?: (index: number) => string
}

export interface OverflowItem {
  key: string
  index: number
  line: number
  left: number
  top: number
  width: number
  height: number
}

interface SizeRect {
  width: number
  height: number
}

const internalFixedKeys = ['rest', 'prefix', 'suffix']

export class BoxOverflow {
  options!: SetRequired<BoxOverflowOptions, 'idAttribute'>
  displayCount = 0
  isRestReady = false
  hasRest = false
  containerElement: HTMLElement | null = null
  sizeChanged: boolean = false
  sizeCache = new Map<string, SizeRect>()
  measurementsCache: OverflowItem[] = []
  measureElementCache = new Map<string, HTMLElement>()

  itemsObserver = Observer.createResizeObserver(this.itemMeasurer.bind(this))
  containerObserver = Observer.createResizeObserver(this.containerMeasurer.bind(this))
  childrenObserver = Observer.createMutationObserver(this.childrenChange.bind(this))

  itemMeasurer(element: HTMLElement,
    // entry: ResizeObserverEntry
  ) {
    this.measureElement(element)
    if (this.sizeChanged)
      this.triggerChange()
  }

  containerMeasurer(element: HTMLElement,
    // entry: ResizeObserverEntry
  ) {
    this.measureContainer(element)
    this.triggerChange()
  }

  childrenChange(mutation: MutationRecord) {
    mutation.removedNodes.forEach((node) => {
      if (isElementNode(node)) {
        const key = this.idOfElement(node)
        if (!key)
          return
        this.measureElementCache.delete(key)
      }
    })
    mutation.addedNodes.forEach((node) => {
      if (isElementNode(node)) {
        const key = this.idOfElement(node)
        if (!key)
          return
        this.measureElement(node)
      }
    })
  }

  constructor(options: BoxOverflowOptions) {
    this.setOptions(options)
  }

  setOptions(options: BoxOverflowOptions) {
    Object.entries(options).forEach(
      ([key, value]) => typeof value === 'undefined' && delete (options as any)[key],
    )
    this.options = {
      idAttribute: 'data-key',
      ...options,
    }

    if (this.containerElement)
      this.triggerChange()
  }

  onMount() {
    const container = this.options.getContainer()
    if (!container)
      return

    this.containerElement = container
    this.containerObserver.observe(container)
    this.childrenObserver.observe(container)
    this.measureContainer(container)
    this.measureElements()

    this.triggerChange()

    return () => {
      this.destroy()
    }
  }

  onUpdate() {
    const container = this.options.getContainer()

    if (container !== this.containerElement) {
      this.destroy()

      this.containerElement = container

      this.containerObserver.observe(container)
      this.childrenObserver.observe(container)
      this.measureContainer(container)
      this.measureElements()

      this.triggerChange()
    }
  }

  destroy() {
    this.itemsObserver.disconnect()
    this.containerObserver.disconnect()
    this.childrenObserver.disconnect()
    this.containerElement = null
    this.measureElementCache.clear()
  }

  triggerChange = memo (() => ([this.getMeasurements(), this.sizeCache]), (measurements) => {
    this.options.onDisplayChange?.(measurements)
  })

  idOfElement(node: HTMLElement) {
    const attributeName = this.options.idAttribute
    const keyStr = node.getAttribute(attributeName)

    if (!keyStr) {
      console.warn(
        `Missing attribute name '${attributeName}={index}' on element.`,
      )
      return ''
    }

    return String(keyStr)
  }

  measureElements() {
    const container = this.containerElement
    if (!container)
      return
    const children = Array.from(container.children)
    children.forEach((child) => {
      if (isElementNode(child)) {
        const key = this.idOfElement(child)
        if (!key)
          return
        this.measureElement(child)
      }
    })
  }

  measureElement(node: HTMLElement) {
    const id = this.idOfElement(node)

    const prevNode = this.measureElementCache.get(id)
    if (node !== prevNode) {
      if (prevNode)
        this.itemsObserver.unobserve(prevNode)
      this.itemsObserver.observe(node)
      this.measureElementCache.set(id, node)
    }

    const rect = node.getBoundingClientRect()

    const prevSize = this.sizeCache.get(id)

    if (!prevSize || prevSize.width !== rect.width || prevSize.height !== rect.height) {
      this.sizeChanged = true
      this.sizeCache.set(id, { width: rect.width, height: rect.height })
    }
  }

  measureContainer(element: HTMLElement) {
    const rect = element.getBoundingClientRect()
    const style = window.getComputedStyle(element)

    const width = rect.width - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight) - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth)
    const height = rect.height - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom) - Number.parseFloat(style.borderTopWidth) - Number.parseFloat(style.borderBottomWidth)

    this.sizeCache.set('container', { width, height })
  }

  getRests = memo (() => ([this.displayCount, this.getItemCounts()]), (start, end) => {
    if (start >= end)
      return []
    const rests = []
    for (; start < end; start++) {
      const key = this.options.getKeyByIndex?.(start)
      if (!key)
        continue
      rests.push(key)
    }
    return rests
  })

  private getItemCounts() {
    return Array.from(this.measureElementCache.values())
      .filter((item) => {
        const key = this.idOfElement(item)
        return !internalFixedKeys.includes(key)
      }).length
  }

  private getMaxCount() {
    const maxCount = this.options.maxCount

    if (maxCount && maxCount < 1)
      console.error('maxCount can not be less than 1')

    const elementLength = this.getItemCounts()
    return maxCount ? Math.min(maxCount, elementLength) : elementLength
  }

  private getMaxLine() {
    const maxLine = this.options.maxLine
    if (maxLine === undefined)
      return undefined
    return Math.max(maxLine - 1, 0)
  }

  getMeasurements() {
    const maxLine = this.getMaxLine()
    const maxCount = this.getMaxCount()

    const restSize = this.sizeCache.get('rest')
    const prefixSize = this.sizeCache.get('prefix')
    const suffixSize = this.sizeCache.get('suffix')
    const containerSize = this.sizeCache.get('container')!

    let suffixSingleLine = false
    let top = 0
    let currentLineMaxHeight = 0
    let hasRest = maxCount < this.getItemCounts()

    let prevOverflow: OverflowItem | null = null
    const overflows: OverflowItem[] = []

    if (prefixSize) {
      const prefixSize = this.sizeCache.get('prefix')!
      overflows.push((prevOverflow = {
        key: 'prefix',
        index: 0,
        line: 0,
        top: 0,
        left: 0,
        width: prefixSize.width || 0,
        height: prefixSize.height || 0,
      }))
    }

    if (suffixSize && suffixSize.width > containerSize.width)
      suffixSingleLine = true

    const genNextItem = (key: string, size?: SizeRect, nextLine?: boolean) => {
      const prevIndex = prevOverflow?.index ?? -1
      const prevLine = prevOverflow?.line || 0
      const left = nextLine ? 0 : (prevOverflow?.left || 0) + (prevOverflow?.width || 0)
      return {
        key,
        index: prevIndex + 1,
        line: nextLine ? prevLine + 1 : prevLine,
        top,
        left,
        width: size?.width || 0,
        height: size?.height || 0,
      }
    }

    for (let i = 0; i < maxCount; i++) {
      const key = this.options.getKeyByIndex?.(i)
      const size = this.sizeCache.get(key!)

      if (!size && size !== null)
        break

      let nextLine = false

      const isLastOne = i === maxCount - 1
      const restWidth = isLastOne ? 0 : restSize?.width || 0

      const maybeMaxLine = notNil(maxLine) ? suffixSingleLine ? maxLine - 1 : maxLine : undefined
      let validWidth = containerSize.width
      if (prevOverflow)
        validWidth -= prevOverflow.left + prevOverflow.width

      // 最后一行
      if (notNil(maybeMaxLine) && prevOverflow?.line === maybeMaxLine) {
        validWidth -= restWidth

        if (!suffixSingleLine)
          validWidth -= suffixSize?.width || 0

        if (validWidth < size.width || 0) {
          // 没有足够的空间放下当前元素
          hasRest = true
          break
        }
      }
      else {
        if (validWidth < size.width || 0) {
          // 换行
          nextLine = true
          top += currentLineMaxHeight
          currentLineMaxHeight = 0
        }
      }

      overflows.push((prevOverflow = genNextItem(key!, size, nextLine)))

      currentLineMaxHeight = Math.max(currentLineMaxHeight, size.height)
    }

    if (hasRest)
      overflows.push(prevOverflow = genNextItem('rest', restSize, false))

    if (suffixSize)
      overflows.push(prevOverflow = genNextItem('suffix', suffixSize, suffixSingleLine))

    return this.updateMeasurementsCache(overflows)
  }

  private updateMeasurementsCache(measurements: OverflowItem[]) {
    const isSame = measurements.length === this.measurementsCache.length
      && measurements.every ((item, index) => {
        return item.key === this.measurementsCache[index]?.key
      })

    this.sizeChanged = false

    if (!isSame) {
      this.measurementsCache = measurements
      const displayCount = measurements.filter(item => !internalFixedKeys.includes(item.key)).length
      this.displayCount = displayCount
    }

    return this.measurementsCache
  }

  getContainerStyle(): Partial<CSSStyleDeclaration> {
    const { direction } = this.options

    const style: Partial<CSSStyleDeclaration> = {
      display: 'flex',
      flexWrap: 'wrap',
      position: 'relative',
    }
    direction && (style.direction = direction)
    return style
  }

  getItemStyle(id: string): Partial<CSSStyleDeclaration> {
    const item = this.measurementsCache.find(item => item.key === id)

    if (!item) {
      return {
        opacity: '0',
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
      }
    }
    return {
      flexShrink: '0',
      margin: '0',
    }
  }

  getRestStyle(): Partial<CSSStyleDeclaration> {
    const rest = this.measurementsCache.find(item => item.key === 'rest')
    if (!rest)
      return { opacity: '0', position: 'absolute', top: '-9999px', left: '-9999px' }
    return {
      flexShrink: '0',
      margin: '0',
    }
  }
}
