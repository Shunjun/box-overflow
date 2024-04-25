<template>
    <BoxOverflow class="" :maxLine='3'>
        <div v-for="item in data" :data-id="item">
            {{ item }}
        </div>
        <template #rest="props">
            <div>+ {{ props.rests.length }}</div>
        </template>
    </BoxOverflow>
</template>

<script setup lang="ts">
import { BoxOverflow } from 'vue-box-overflow'
import { faker } from '@faker-js/faker'
import { ref } from 'vue';

const data = ref(Array.from({ length: 100 }).map(() => faker.lorem.sentence()))
</script>