/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:47:13
 */
import React from 'react'
import { BoxOverflowOptions } from 'box-overflow-core'
import { useOverflow } from './useOverflow'

interface BoxOverflowProps {
  component?: string
  children?: React.ReactNode
}

export function BoxOverflow(props: BoxOverflowProps) {
  const { component, children, ...restProps } = props

  const containerRef = React.useRef<HTMLDivElement>(null)

  useOverflow({
    ...restProps,
  })

  const _component = component || 'div'
  return React.createElement(_component, { children, ref: containerRef })
}
