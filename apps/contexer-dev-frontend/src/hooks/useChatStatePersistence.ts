import { useEffect, useCallback } from 'react'
import { eventEmitter } from '@/components/AiChat/utils/EventEmitter'
import useProjectStore from '@/stores/projectSlice'

export function useChatStatePersistence() {
  const { currentProject, saveChatMessages, updateProjectActivity } = useProjectStore()

  // Save chat messages when they change
  const handleMessagesChange = useCallback(async (messages: any[]) => {
    if (currentProject && messages.length > 0) {
      console.log('💾 Saving chat messages for project:', currentProject.id)
      await saveChatMessages(currentProject.id, messages)
      await updateProjectActivity(currentProject.id)
    }
  }, [currentProject, saveChatMessages, updateProjectActivity])

  // Listen for chat message changes
  useEffect(() => {
    const unsubscribe = eventEmitter.on('chat:messages:change', handleMessagesChange)
    return () => unsubscribe()
  }, [handleMessagesChange])

  // Listen for new messages being added
  useEffect(() => {
    const unsubscribe = eventEmitter.on('chat:message:add', async (message: any) => {
      if (currentProject) {
        console.log('📨 New message added, updating activity for project:', currentProject.id)
        await updateProjectActivity(currentProject.id)
      }
    })
    return () => unsubscribe()
  }, [currentProject, updateProjectActivity])

  return {
    saveMessages: handleMessagesChange
  }
}
