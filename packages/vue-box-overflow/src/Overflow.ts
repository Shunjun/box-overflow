import type {
  VNode,
} from 'vue'
import {
  Fragment,
  createVNode,
  defineComponent,
  normalizeStyle,
  ref,
  renderSlot,
  unref,
} from 'vue'
import type { BoxOverflowOptions } from 'box-overflow-core'
import { useOverflow } from './useOverflow.js'

export default defineComponent({
  name: 'Overflow',
  props: {
    maxLine: {
      type: Number,
    },
    component: {
      type: String,
      default: 'div',
    },
  },
  setup(props, ctx) {
    const { component, ...options } = props
    const parentRef = ref<HTMLElement | null>(null)
    const idList: string[] = []

    const instance = useOverflow({
      getIdByIndex: (index) => {
        return idList[index]
      },
      ...options,
      getContainer: () => {
        return parentRef.value as HTMLElement
      },
    } as BoxOverflowOptions)

    return () => {
      idList.length = 0
      let itemIndex = 0
      const idAttribute = instance.value.options.idAttribute

      const children = []
      // prefix
      const prefix = renderSlot(ctx.slots, 'prefix')
      if (prefix.children?.length) {
        children.push(createVNode('div', {
          [idAttribute]: 'prefix',
          style: unref(instance).getItemStyle('prefix'),
        }, [prefix]))
      }

      // default slot
      const defaultSlot = ctx.slots.default?.() || []
      children.push(defaultSlot.map((fragment: any, index: number) => {
        const children = (fragment.children || []).map((child: VNode, index: number) => {
          const id = String(child.props?.[idAttribute] || itemIndex++)
          idList.push(id)
          const style = ref(normalizeStyle(unref(instance).getItemStyle(id)))
          return (createVNode('div', { key: child.key || index, style: style.value, [idAttribute]: id }, [child]))
        })
        const key = (fragment && (fragment as any).key) || `_default${index}`
        return (createVNode(Fragment, { key }, children))
      }))

      // rest
      const rest = renderSlot(ctx.slots, 'rest', {
        rests: unref(instance).getRests(),
      })
      if (rest.children?.length) {
        children.push(createVNode('div', {
          [idAttribute]: 'rest',
          style: unref(instance).getRestStyle(),
        }, [rest]))
      }

      const suffix = renderSlot(ctx.slots, 'suffix')
      if (suffix.children?.length) {
        children.push(createVNode('div', {
          [idAttribute]: 'suffix',
          style: unref(instance).getItemStyle('suffix'),
        }, [suffix]),
        )
      }

      return createVNode(component, { ref: parentRef, style: unref(instance).getContainerStyle() }, children)
    }
  },
})
