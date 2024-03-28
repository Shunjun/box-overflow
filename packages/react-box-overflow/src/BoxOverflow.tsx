/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:47:13
 */
import React, { cloneElement, createElement, isValidElement, useContext } from 'react'
import type { BoxOverflow as BoxOverflowInstance, BoxOverflowOptions } from 'box-overflow-core'
import { useOverflow } from './useOverflow'
import type { DataType } from './types'

const BoxOverflowContext = React.createContext<BoxOverflowInstance >({} as BoxOverflowInstance)

interface BoxOverflowProps<K extends keyof any = 'key', D extends DataType<K> = DataType<K> > extends Omit<BoxOverflowOptions, 'getContainer'> {
  className?: string
  style?: React.CSSProperties
  component?: string
  children?: React.ReactNode
  indexKey?: keyof D
}

export function BoxOverflow<K extends keyof any = 'key', D extends DataType<K> = DataType<K>>(props: BoxOverflowProps<K, D>) {
  const { component, children, className, style, ...restProps } = props

  const containerRef = React.useRef<HTMLDivElement>(null)

  const keyList: string[] = []
  let rest: React.ReactElement | null = null
  const _children: React.ReactNode[] = []
  const prefix = null
  const suffix = null
  React.Children.forEach(children, (child, index) => {
    if (isValidElement(child)) {
      if ((child.type as unknown as { displayName: string }).displayName === 'BoxOverflowItem') {
        const key = child.props.id ?? child.key ?? index
        _children.push(cloneElement (child, { key, id: key, ...child.props }))
        keyList.push(key)
      }

      if ((child.type as unknown as { displayName: string }).displayName === 'BoxOverflowRest')
        rest = cloneElement(child, { key: 'rest' })
    }
  })

  const { instance } = useOverflow({
    getKeyByIndex: (index: number) => {
      return keyList[index]
    },
    ...restProps,
    getContainer: () => containerRef.current as HTMLDivElement,
  })

  const _style: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    ...style,
  }

  const _component = component || 'div'
  return (
    <BoxOverflowContext.Provider value={instance}>
      {React.createElement(_component, {
        children: [prefix, ..._children, rest, suffix],
        ref: containerRef,
        className,
        style: _style,
      })}
    </BoxOverflowContext.Provider>
  )
}
BoxOverflow.displayName = 'BoxOverflow'
BoxOverflow.Rest = BoxOverflowRest
BoxOverflow.Item = BoxOverflowItem

interface BoxOverflowRestProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  component?: string
  [key: string]: any
}

export function BoxOverflowRest(props: BoxOverflowRestProps) {
  const { component = 'div', ...restProps } = props
  const instance = useContext(BoxOverflowContext)
  const indexKey = instance.options?.keyAttribute as string

  const style = instance.getRestStyle()

  return createElement(component, { ...restProps, ...props, [indexKey]: 'rest', style: { ...props.style, ...style } })
}
BoxOverflowRest.displayName = 'BoxOverflowRest'

interface BoxOverflowItemProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  component?: string
  id?: string
  [key: string]: any
}

export function BoxOverflowItem(props: BoxOverflowItemProps) {
  const { component = 'div', id, ...restProps } = props
  const instance = useContext(BoxOverflowContext)
  const indexKey = instance.options?.keyAttribute as string

  const style = instance.getItemStyle(id!)
  return createElement(component, { ...restProps, [indexKey]: id, style: { ...props.style, ...style } })
}
BoxOverflowItem.displayName = 'BoxOverflowItem'
