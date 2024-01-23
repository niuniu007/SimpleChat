<script setup lang='ts'>
 
import { SvgIcon } from '@/components/common'
import { NInput } from 'naive-ui';

</script>
<template>
    <div class="flex h-10 items-left ">
        <div>
            <n-input placeholder="搜索">
                <template #prefix>
                    <SvgIcon icon="ic:baseline-search"></SvgIcon>
                </template>
            </n-input>
        </div>
    </div>
</template>