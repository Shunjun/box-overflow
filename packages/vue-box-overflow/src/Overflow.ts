import type {
  VNode,
} from 'vue'
import {
  Fragment,
  createBlock,
  createElementVNode,
  defineComponent,
  openBlock,
  ref,
  renderSlot,
  resolveDynamicComponent,
  withCtx,
} from 'vue'
import type { BoxOverflowOptions } from 'box-overflow-core'
import { useOverflow } from './useOverflow.js'
import type { BoxOverflowProps } from './interface.js'

export default defineComponent<BoxOverflowProps>({
  name: 'Overflow',
  setup(props, ctx) {
    const { component = 'div', ...options } = props
    const parentRef = ref<HTMLElement | null>(null)
    const instance = useOverflow({
      ...options,
      getContainer: () => {
        return parentRef.value as HTMLElement
      },
    } as BoxOverflowOptions)

    return () => {
      const slot = ctx.slots.default?.() || []
      openBlock()
      const newSlot = slot.map((fragment: any, index: number) => {
        const children = (fragment.children || []).map((child: VNode, index: number) => {
          const { id } = child.props || {}
          const style = instance.value.getItemStyle(id)
          return createElementVNode('div', { 'key': child.key || index, style, 'data-id': id }, [child])
        })
        return createBlock(Fragment, { key:
           (fragment && (fragment as any).key)
           || `_default${index}` }, children)
      })
      return createBlock(resolveDynamicComponent(component), {
        ref: parentRef,
      }, {
        default: withCtx(() => [
          createBlock(Fragment, null, newSlot),
          createBlock('div', {}, [renderSlot(ctx.slots, 'rest')]),
        ]),
        _: 3,
      })
    }
  },
})
