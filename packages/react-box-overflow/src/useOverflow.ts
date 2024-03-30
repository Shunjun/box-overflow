/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:46:59
 */
import type { OverflowItem } from 'box-overflow-core'
import { BoxOverflow } from 'box-overflow-core'
import { useEffect, useLayoutEffect, useReducer, useRef } from 'react'
import type { Options } from './interface'
import { useRefFn } from './useRefFn'

const useIsomorphicLayoutEffect
  = typeof document !== 'undefined' ? useLayoutEffect : useEffect

export function useOverflow(options: Options) {
  const [,forceRenderer] = useReducer (() => {
    return []
  }, [])

  const onDisplayChange = useRefFn((items: OverflowItem[]) => {
    forceRenderer()
    options.onDisplayChange?.(items)
  })

  const mergedOptions = {
    ...options,
    onDisplayChange,
  }

  const instance = useRef((new BoxOverflow(mergedOptions)))

  useEffect(() => {
    return instance.current.onMount()
  }, [])

  useIsomorphicLayoutEffect (() => {
    return instance.current.onUpdate()
  })

  useLayoutEffect(() => {
    instance.current.setOptions({
      ...options,
      onDisplayChange,
    })
  }, [options])

  return instance.current
}
