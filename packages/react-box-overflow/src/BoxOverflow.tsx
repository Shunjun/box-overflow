/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:47:13
 */
import React, { cloneElement, isValidElement, useContext } from 'react'
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
        _children.push(cloneElement (child, { id: child.key || index, ...child.props }))
        const key = child.props.id ?? child.key ?? index
        keyList.push(key)
      }

      if ((child.type as unknown as { displayName: string }).displayName === 'BoxOverflowRest')
        rest = child
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
  [key: string]: any
}

export function BoxOverflowRest(props: BoxOverflowRestProps) {
  const instance = useContext(BoxOverflowContext)
  const indexKey = instance.options?.keyAttribute as string

  return <div {...{ ...props, [indexKey]: 'rest' }}>{props.children}</div>
}
BoxOverflowRest.displayName = 'BoxOverflowRest'

interface BoxOverflowItemProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  id: string
  [key: string]: any
}

export function BoxOverflowItem(props: BoxOverflowItemProps) {
  const instance = useContext(BoxOverflowContext)
  const indexKey = instance.options?.keyAttribute as string

  const style = instance.getItemStyle(props.id)
  return <div {...{ [indexKey]: props.id }} style={style}>{props.children}</div>
}
BoxOverflowItem.displayName = 'BoxOverflowItem'
