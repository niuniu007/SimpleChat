<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NLayout, NLayoutContent } from 'naive-ui'
import Sider from './sider/index.vue'
import MsgWind from './msgWind.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import bar from './Bar.vue'
import firends from './firends.vue'

const { isMobile } = useBasicLayout()
//const collapsed = computed(() => appStore.siderCollapsed)

const isVisableChat = ref<boolean>(true);
const isVisableFirends = ref<boolean>(false);

const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['rounded-none', 'shadow-none']
  return ['border', 'rounded-md', 'shadow-md', 'dark:border-neutral-800']
})


function switchPanel(panel: string) {
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
}

</script>

<template >
  <div class="transition-all absolute" :class="[isMobile ? 'p-0' : 'px-0 py-0']" style="height:90%; width: 80%;top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); ">
    <div class="h-full overflow-hidden" :class="getMobileClass">
      <NLayout class="h-full">
        <bar @switchPanel="switchPanel" />
        <NLayout class=" h-full " has-sider>
          <Sider v-if="isVisableChat" />
          <firends v-if="isVisableFirends" @switchPanel="switchPanel" />
          <NLayoutContent class="h-full">
            <MsgWind class="h-full "></MsgWind>
          </NLayoutContent>
        </NLayout>
      </NLayout>
    </div>
  </div>
</template>
