/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:46:59
 */

import type { Measurement } from 'box-overflow-core'
import { BoxOverflow } from 'box-overflow-core'
import { useEffect, useLayoutEffect, useReducer, useRef } from 'react'
import type { Options } from './interface'

export function useOverflow(options: Options) {
  const instance = useRef(new BoxOverflow(options))

  const [,forceRenderer] = useReducer (() => {
    return []
  }, [])

  useEffect(() => {
    return instance.current.onMount()
  }, [])

  // useMemo(()=> {},[options])

  useLayoutEffect(() => {
    instance.current.setOptions({
      ...options,
      onDisplayChange: (measurements: Measurement[]) => {
        forceRenderer()
        options.onDisplayChange?.(measurements)
      },
    })
  }, [options])

  return {
    displayCount: instance.current.displayCount,
    instance: instance.current,
  }
}
