/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:46:59
 */

import { BoxOverflow } from 'box-overflow-core'
import type { BoxOverflowOptions } from 'box-overflow-core'
import { useEffect, useRef } from 'react'

export function useOverflow(options: BoxOverflowOptions) {
  const instance = useRef(new BoxOverflow(options))

  useEffect(() => {
    instance.current.setOptions(options)
  }, [options])

  useEffect(() => {
    return instance.current.onMount()
  }, [])
}
