/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-30 16:19:13
 */
import { createElement, useContext, useMemo } from 'react'
import { BoxOverflowContext } from './BoxOverflow'
import type { BoxOverflowRestProps } from './interface'

export function BoxOverflowRest(props: BoxOverflowRestProps) {
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
