<template>
    <BoxOverflow class="">
        <template v-for="item in data">
            <div :data-id="item">
                {{ item }}
            </div>
        </template>
        <template #rest="props">
            <div>+ {{ props.lenth }}</div>
        </template>

    </BoxOverflow>
</template>

<script setup lang="ts">
import { BoxOverflow } from 'vue-box-overflow'
import { faker } from '@faker-js/faker'
import { ref } from 'vue';

const data = ref(Array.from({ length: 100 }).map(() => faker.lorem.sentence()))

</script>