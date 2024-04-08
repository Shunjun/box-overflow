<template>
    <div>
        <div ref="container" :style="instance.getContainerStyle()">
            <template v-for="item in data">
                <div :data-id="item" :style="instance.getItemStyle(item)">
                    {{ item }}
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOverflow } from 'vue-box-overflow'
import { faker } from '@faker-js/faker'
import { ref } from 'vue';

const data = ref(Array.from({ length: 100 }).map(() => faker.lorem.sentence()))

const container = ref(null)
const instance = useOverflow({
    getContainer: () => container.value as unknown as HTMLElement,
    getKeyByIndex: (index) => data.value[index],
    maxLine: 3
})

</script>