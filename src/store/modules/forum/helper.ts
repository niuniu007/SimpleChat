import { ss } from '@/utils/storage'

const LOCAL_NAME = 'forumStorage'

export function defaultState(): Forum.ForumChat {
  return { active: "", history: [], chat: [],rooms:[], friends:[]}
}

export function getLocalState(): Forum.ForumChat {
  const localState = ss.get(LOCAL_NAME)
  return localState?? defaultState()
}

export function setLocalState(state: Forum.ForumChat) {
  ss.set(LOCAL_NAME, state)
}
