/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 18:03:46
 */

import { Observer } from './observer'
import type { SetRequired } from './types'
import { isElementNode, notNil } from './utils'

export interface BoxOverflowOptions {
  keyAttribute?: string
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
  onDisplayChange?: (count: number) => void

  getKeyByIndex?: (index: number) => string
}

interface Measurement {
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

const internalKeys = ['rest', 'prefix', 'suffix']

export class BoxOverflow {
  options!: SetRequired<BoxOverflowOptions, 'keyAttribute'>
  displayCount: number | null = null
  isRestReady = false
  hasRest = false
  sizeCache = new Map<string, SizeRect>()
  measurementsCache: Measurement[] = []
  measureElementCache = new Map<string, HTMLElement>()

  itemsObserver = Observer.createResizeObserver(this.itemMeasurer.bind(this))
  containerObserver = Observer.createResizeObserver(this.containerMeasurer.bind(this))
  childrenObserver = Observer.createMutationObserver(this.childrenChange.bind(this))

  itemMeasurer(element: HTMLElement,
    // entry: ResizeObserverEntry
  ) {
    this.measureElement(element)
  }

  containerMeasurer(element: HTMLElement, entry: ResizeObserverEntry) {
    this.sizeCache.set('container', { width: entry.contentRect.width, height: entry.contentRect.height })
    this.getMeasurements()
  }

  childrenChange(mutation: MutationRecord) {
    mutation.removedNodes.forEach((node) => {
      if (isElementNode(node)) {
        const key = this.keyOfElement(node)
        if (!key)
          return
        this.measureElementCache.delete(key)
      }
    })
    mutation.addedNodes.forEach((node) => {
      if (isElementNode(node)) {
        const key = this.keyOfElement(node)
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
      keyAttribute: 'data-key',
      ...options,
    }
  }

  onMount() {
    const container = this.options.getContainer()
    if (!container)
      return
    this.containerObserver.observe(container)
    this.childrenObserver.observe(container)

    const containerRect = container.getBoundingClientRect()
    this.sizeCache.set('container', { width: containerRect.width, height: containerRect.height })

    const children = Array.from(container.children)
    children.forEach((child) => {
      if (isElementNode(child)) {
        const key = this.keyOfElement(child)
        if (!key)
          return
        this.measureElement(child)
      }
    })

    this.triggerChange()

    return () => {
      this.destroy()
    }
  }

  destroy() {
    this.itemsObserver.disconnect()
    this.containerObserver.disconnect()
    this.childrenObserver.disconnect()
  }

  triggerChange() {
    const measurements = this.getMeasurements()
    this.options.onDisplayChange?.(measurements?.length)
  }

  keyOfElement(node: HTMLElement) {
    const attributeName = this.options.keyAttribute
    const keyStr = node.getAttribute(attributeName)

    if (!keyStr) {
      console.warn(
        `Missing attribute name '${attributeName}={index}' on element.`,
      )
      return ''
    }

    return String(keyStr)
  }

  // getKeyByIndex(index: number) {
  //   if(index )
  // }

  measureElement(node: HTMLElement) {
    const key = this.keyOfElement(node)

    // const measurement = this.measurementsCache.get(key)
    // if (!measurement) {
    //   this.measurerElementCache.forEach((node) => {
    //     if (element === node) {
    //       this.itemsObserver.unobserve(node)
    //       this.measurerElementCache.delete(key)
    //     }
    //   })
    // }

    const prevNode = this.measureElementCache.get(key)

    if (node !== prevNode) {
      if (prevNode)
        this.itemsObserver.unobserve(prevNode)
      this.itemsObserver.observe(node)
      this.measureElementCache.set(key, node)
    }
    const rect = node.getBoundingClientRect()

    this.sizeCache.set(key, { width: rect.width, height: rect.height })
  }

  getMaxCount() {
    const maxCount = this.options.maxCount
    const elementLength = Array.from(this.measureElementCache.values())
      .filter((item) => {
        const key = this.keyOfElement(item)
        return !internalKeys.includes(key)
      }).length
    return maxCount ? Math.min(maxCount, elementLength) : elementLength
  }

  getMaxLine() {
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
    let hasRest = false

    let prevMeasurement: Measurement | null = null
    const measurements: Measurement[] = []

    if (prefixSize) {
      const prefixSize = this.sizeCache.get('prefix')!
      measurements.push((prevMeasurement = {
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

    const genNextMeasurement = (key: string, size?: SizeRect, nextLine?: boolean) => {
      const prevIndex = prevMeasurement?.index ?? -1
      const prevLine = prevMeasurement?.line || 0
      const left = nextLine ? 0 : (prevMeasurement?.left || 0) + (prevMeasurement?.width || 0)
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

      // const { width: currentWidth = 0, height:  = 0 } = size || {}
      const isLastOne = i === maxCount - 1
      const restWidth = isLastOne ? 0 : restSize?.width || 0

      const maybeMaxLine = notNil(maxLine) ? suffixSingleLine ? maxLine - 1 : maxLine : undefined
      let validWidth = containerSize.width
      if (prevMeasurement)
        validWidth -= prevMeasurement.left + prevMeasurement.width

      // 最后一行
      if (notNil(maybeMaxLine) && prevMeasurement?.line === maybeMaxLine) {
        validWidth -= restWidth
        if (suffixSingleLine)
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

      measurements.push((prevMeasurement = genNextMeasurement(key!, size, nextLine)))

      currentLineMaxHeight = Math.max(currentLineMaxHeight, size.height)
    }

    if (hasRest)
      measurements.push(prevMeasurement = genNextMeasurement('rest', restSize, false))

    if (suffixSize)
      measurements.push(prevMeasurement = genNextMeasurement('suffix', suffixSize, suffixSingleLine))

    this.measurementsCache = measurements
    return measurements
  }

  getItemStyle(id: string) {
    const item = this.measurementsCache.find(item => item.key === id)

    const hiddenStyle = {
      display: 'none',
      position: 'absolute',
      top: '-9999px',
      left: '-9999px',
    }

    if (!item)
      return hiddenStyle

    return {}
  }
}
