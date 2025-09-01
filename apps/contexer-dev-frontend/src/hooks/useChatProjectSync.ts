import { useEffect } from 'react'
import { eventEmitter } from '@/components/AiChat/utils/EventEmitter'
import useProjectStore from '@/stores/projectSlice'

export function useChatProjectSync() {
  const { setCurrentProjectByChatUuid, getCurrentChatUuid } = useProjectStore()

  useEffect(() => {
    // Listen for chat selection events - each chat has its own project
    const unsubscribe = eventEmitter.on('chat:select', async (chatUuid: string) => {
      console.log('🔄 Chat selected:', chatUuid)
      
      if (chatUuid) {
        // In chat-as-project model, simply set the project for this chat
        // This will either find existing project or create a new one
        await setCurrentProjectByChatUuid(chatUuid)
      }
    })

    return () => unsubscribe()
  }, [setCurrentProjectByChatUuid])

  useEffect(() => {
    // Listen for chat creation events - always create new isolated project
    const unsubscribe = eventEmitter.on('chat:create', async (chatUuid: string) => {
      console.log('🆕 New chat created:', chatUuid)
      
      if (chatUuid) {
        // Each new chat gets its own completely isolated project
        console.log('🔄 Creating new isolated project for chat:', chatUuid)
        await setCurrentProjectByChatUuid(chatUuid)
      }
    })

    return () => unsubscribe()
  }, [setCurrentProjectByChatUuid])

  useEffect(() => {
    // Listen for context clear events - reset all state
    const unsubscribe = eventEmitter.on('context:clear', () => {
      console.log('🧹 Clearing all context')
      const { setCurrentProject } = useProjectStore.getState()
      setCurrentProject(null)
    })

    return () => unsubscribe()
  }, [])

  return {
    getCurrentChatUuid
  }
}
