/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-29 16:53:37
 */

import { useCallback, useRef } from 'react'

type AnyFunction = (...param: any) => any

export function useRefFn<FN extends AnyFunction>(fn: FN) {
  const fnRef = useRef<FN>()
  fnRef.current = fn

  return useCallback((...params: Parameters<FN>) => {
    fnRef.current?.(...params)
  }, [])
}
