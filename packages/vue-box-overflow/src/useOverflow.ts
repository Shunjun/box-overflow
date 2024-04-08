/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-04-01 13:36:40
 */
import type { BoxOverflowOptions } from 'box-overflow-core'
import { BoxOverflow } from 'box-overflow-core'
import { onScopeDispose, shallowRef, triggerRef, unref, watch } from 'vue'

export function useOverflow(options: BoxOverflowOptions) {
  const overflow = new BoxOverflow(unref(options))
  const state = shallowRef(overflow)

  const cleanup = overflow.onMount()

  watch(
    () => unref(options).getContainer(),
    (el) => {
      if (el)
        overflow.onUpdate()
    },
    {
      immediate: true,
    },
  )

  watch(
    () => unref(options),
    (options) => {
      overflow.setOptions({
        ...options,
        onDisplayChange: (overflowItems) => {
          triggerRef(state)
          options.onDisplayChange?.(overflowItems)
        },
      })
      overflow.onUpdate()
      triggerRef(state)
    },
    {
      immediate: true,
    },
  )

  onScopeDispose(cleanup)

  return state
}
