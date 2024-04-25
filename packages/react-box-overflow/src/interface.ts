/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:47:58
 */
import type React from 'react'
import type { BoxOverflowOptions } from 'box-overflow-core'
import type { DataType } from './types'

export interface BoxOverflowProps<K extends keyof any = 'key', D extends DataType<K> = DataType<K> > extends Omit<BoxOverflowOptions, 'getContainer'> {
  className?: string
  style?: React.CSSProperties
  component?: string
  children?: React.ReactNode
  idKey?: keyof D
}

export interface CommonChildProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  component?: string
}

export interface BoxOverflowRestProps extends Omit<CommonChildProps, 'children'> {
  children?: React.ReactNode | RestRender
}

export interface BoxOverflowItemProps extends Omit<CommonChildProps, 'id'> {
  id: string | number
}

export type RestRender = (ids: string[]) => React.ReactNode
