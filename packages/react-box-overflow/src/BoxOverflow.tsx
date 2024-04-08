/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:47:13
 */
import type { FunctionComponent } from 'react'
import React, { cloneElement, createElement, isValidElement, useContext, useMemo } from 'react'
import type { BoxOverflow as BoxOverflowInstance } from 'box-overflow-core'
import { useOverflow } from './useOverflow'
import type { DataType } from './types'
import type { BoxOverflowItemProps, BoxOverflowProps, BoxOverflowRestProps, CommonChildProps } from './interface'
import { capitalizeFirstLetter } from './utils'

const BoxOverflowContext = React.createContext<BoxOverflowInstance >({} as BoxOverflowInstance)

const fixedDisplayNameMap = {
  rest: 'BoxOverflowRest',
  prefix: 'BoxOverflowPrefix',
  suffix: 'BoxOverflowSuffix',
}

type FixKeys = keyof typeof fixedDisplayNameMap

function genFixComponent(type: 'prefix' | 'suffix'): FunctionComponent<CommonChildProps> {
  const Comp = (props: CommonChildProps) => {
    const { component = 'div', ...restProps } = props
    const instance = useContext(BoxOverflowContext)
    const idKey = instance.options?.idAttribute as string

    return createElement(component, { ...restProps, [idKey]: type })
  }
  Comp.displayName = `BoxOverflow${capitalizeFirstLetter(type)}`
  return Comp
}

const BoxOverflowItem: FunctionComponent<BoxOverflowItemProps> = (props: BoxOverflowItemProps) => {
  const { component = 'div', id: _id, ...restProps } = props
  const instance = useContext(BoxOverflowContext)
  const idKey = instance.options?.idAttribute as string

  const id = String(_id)

  const style = {
    ...props.style,
    ...instance.getItemStyle(id),
  }
  return createElement(component, { ...restProps, [idKey]: id, style })
}
BoxOverflowItem.displayName = 'BoxOverflowItem'

const BoxOverflowRest: FunctionComponent<BoxOverflowRestProps> = (props: BoxOverflowRestProps) => {
  const { component = 'div', children: _children, ...restProps } = props
  const instance = useContext(BoxOverflowContext)
  const idKey = instance.options?.idAttribute as string
  const style = instance.getRestStyle()

  const rests = instance.getRests()

  const children = useMemo (() => {
    if (typeof _children === 'function')
      return _children(rests)
    return _children
  }, [_children, rests])

  return createElement(component, { ...restProps, ...props, [idKey]: 'rest', children, style: { ...props.style, ...style } })
}
BoxOverflowRest.displayName = 'BoxOverflowRest'

export function BoxOverflow<K extends keyof any = 'key', D extends DataType<K> = DataType<K>>(props: BoxOverflowProps<K, D>) {
  const { component, children, className, style, ...restProps } = props

  const containerRef = React.useRef<HTMLDivElement>(null)

  const keyList: string[] = []
  const _children: React.ReactNode[] = []
  const fixItems: Partial<Record<FixKeys, React.ReactElement | null>> = { }

  React.Children.forEach(children, (child, index) => {
    if (isValidElement(child)) {
      const displayName = (child.type as unknown as { displayName: string }).displayName

      if (displayName === 'BoxOverflowItem') {
        const id = child.props.id ?? child.key ?? index
        const idStr = String(id)
        _children.push(cloneElement (child, { key: idStr, id: idStr, ...child.props }))
        keyList.push(idStr)
      }

      const type = Object.entries(fixedDisplayNameMap).find(([_, value]) => value === displayName)?.[0]
      if (type)
        fixItems[type as FixKeys] = cloneElement(child, { key: type })
    }
  })

  const instance = useOverflow({
    getKeyByIndex: (index: number) => {
      return keyList[index]
    },
    ...restProps,
    getContainer: () => containerRef.current as HTMLDivElement,
  })

  const _style: React.CSSProperties = {
    ...instance.getContainerStyle() as React.CSSProperties,
    ...style,
  }

  const _component = component || 'div'
  return (
    <BoxOverflowContext.Provider value={instance}>
      {React.createElement(_component, {
        children: [fixItems.prefix, ..._children, fixItems.rest, fixItems.suffix],
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
BoxOverflow.Suffix = genFixComponent('suffix')
BoxOverflow.Prefix = genFixComponent('prefix')
