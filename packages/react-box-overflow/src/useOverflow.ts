/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:46:59
 */

import { BoxOverflow } from 'box-overflow-core'
import { useEffect, useReducer, useRef } from 'react'
import type { Options } from './interface'

export function useOverflow(options: Options) {
  const instance = useRef(new BoxOverflow(options))

  const [,forceRenderer] = useReducer (() => {
    return []
  }, [])

  useEffect(() => {
    return instance.current.onMount()
  }, [])

  useEffect(() => {
    instance.current.setOptions({
      ...options,
      onDisplayChange: (count: number) => {
        forceRenderer()
        options.onDisplayChange?.(count)
      },
    })
  }, [options])

  return {
    displayCount: instance.current.displayCount,
    allDisplayed: instance.current.allDisplayed,
    instance: instance.current,
  }
}
