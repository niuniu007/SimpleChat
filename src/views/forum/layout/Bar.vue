<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { NButton } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useUserStore } from '@/store'
import { defineEmits } from "vue";

import AvatarComponent from '@/views/forum/components/Chat/Message/Avatar.vue'
const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))
const userStore = useUserStore()
const isVisableSeting = ref(false)
const isVisableChat = ref<boolean>(true);
const isVisableFirends = ref<boolean>(false);

const switchPanelEmit = defineEmits(['switchPanel'])
function switchPanel(panel: string) {
    //切换面版
    switch (panel) {
        case "chat":
            isVisableChat.value = true
            isVisableFirends.value = false;
            break;
        case "firends":
            isVisableChat.value = false
            isVisableFirends.value = true;
            break;
    }

    //通知父窗体
    switchPanelEmit('switchPanel', panel);
}

</script>
<template>
    <div class="h-full w-14 bg-[#425956] dark:bg-[#24272e] flex justify-between flex-col items-center float-left">
        <div class="flex py-5  items-center flex-col">
            <AvatarComponent :user-id="userStore.userInfo.id" :user-name="userStore.userInfo.name"
                :avatar="userStore.userInfo.avatar" :size="36"></AvatarComponent>
            <div class="mt-10">
                <NButton quaternary text  @click="switchPanel('chat')">
                    <span class="text-xl text-[#fff] dark:text-white">
                        <SvgIcon icon="bi:chat-fill" style="font-size:20px;"   :class="{'text-green-600':isVisableChat}" />
                    </span>
                </NButton>
            </div>
            <div class="mt-4">
                <NButton quaternary text  @click="switchPanel('firends')">
                    <span class="text-xl text-[#fff] dark:text-white">
                        <SvgIcon icon="bi:person-lines-fill" style="font-size:22px;"  :class="{'text-green-600':isVisableFirends}"  />
                    </span>
                </NButton>
            </div>
        </div>
        <div class="pb-4">
            <NButton text :title="$t('setting.setting')" @click="isVisableSeting = true">
                <span class="text-xl text-[#fff] dark:text-white">
                    <SvgIcon icon="bi:list" style="font-size: 26px;" />
                </span>
            </NButton>
        </div>
    </div>

    <Setting v-if="isVisableSeting" v-model:visible="isVisableSeting" />
</template>
 