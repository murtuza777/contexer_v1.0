import { useEffect, useCallback } from 'react'
import { eventEmitter } from '@/components/AiChat/utils/EventEmitter'
import useProjectStore from '@/stores/projectSlice'
import { useFileStore } from '@/components/WeIde/stores/fileStore'

export function useSeamlessStateManagement() {
  const { 
    currentProject, 
    setCurrentProjectByChatUuid,
    saveChatMessages,
    loadChatMessages,
    saveBuilderState,
    loadBuilderState,
    updateProjectActivity
  } = useProjectStore()

  const { setFiles, setEmptyFiles } = useFileStore()
  const getCurrentFiles = useFileStore(state => state.getCurrentFiles)

  // Save chat messages when they change
  const handleChatMessagesChange = useCallback(async (messages: any[]) => {
    if (currentProject && messages.length > 0) {
      console.log('💾 Saving chat messages for project:', currentProject.id)
      await saveChatMessages(currentProject.id, messages)
      await updateProjectActivity(currentProject.id)
    }
  }, [currentProject, saveChatMessages, updateProjectActivity])

  // Save builder state when files change
  const handleBuilderStateChange = useCallback(async (builderState: any) => {
    if (currentProject) {
      console.log('💾 Saving builder state for project:', currentProject.id)
      await saveBuilderState(currentProject.id, builderState)
    }
  }, [currentProject, saveBuilderState])

  // Load project state when switching projects
  const loadProjectState = useCallback(async (projectId: string) => {
    try {
      console.log('📂 Loading project state for:', projectId)
      
      // Load chat messages
      const messages = await loadChatMessages(projectId)
      if (messages.length > 0) {
        console.log('📨 Loaded chat messages:', messages.length)
        // Emit event to restore chat messages
        eventEmitter.emit('chat:restore', { projectId, messages })
      }

      // Load builder state
      const builderState = await loadBuilderState(projectId)
      if (builderState) {
        console.log('🏗️ Loaded builder state:', Object.keys(builderState))
        // Restore files from builder state
        if (builderState.files) {
          setFiles(builderState.files)
        }
      } else {
        // No builder state found, reset IDE files for a clean new project
        console.log('🧹 No builder state found, clearing IDE files')
        setEmptyFiles()
      }

    } catch (error) {
      console.error('Failed to load project state:', error)
    }
  }, [loadChatMessages, loadBuilderState, setFiles])

  // Listen for chat selection events
  useEffect(() => {
    const unsubscribe = eventEmitter.on('chat:select', async (chatUuid: string) => {
      console.log('🔄 Chat selected, loading project state:', chatUuid)
      
      if (chatUuid) {
        // Ensure file store is scoped to this chat before setting files
        const { setCurrentChat } = useFileStore.getState()
        setCurrentChat(chatUuid)
        // Set current project based on chat UUID
        await setCurrentProjectByChatUuid(chatUuid)
        
        // Load the project's state
        await loadProjectState(chatUuid)
      }
    })

    return () => unsubscribe()
  }, [setCurrentProjectByChatUuid, loadProjectState])

  // Listen for chat message changes
  useEffect(() => {
    const unsubscribe = eventEmitter.on('chat:messages:change', handleChatMessagesChange)
    return () => unsubscribe()
  }, [handleChatMessagesChange])

  // Listen for builder state changes
  useEffect(() => {
    const unsubscribe = eventEmitter.on('builder:state:change', handleBuilderStateChange)
    return () => unsubscribe()
  }, [handleBuilderStateChange])

  // Reset builder files immediately when a brand new chat is created
  useEffect(() => {
    const unsubscribe = eventEmitter.on('chat:create', async (chatUuid: string) => {
      console.log('🧼 New chat created, resetting IDE files for:', chatUuid)
      setEmptyFiles()
    })
    return () => unsubscribe()
  }, [setEmptyFiles])

  // Auto-save builder state when files change
  useEffect(() => {
    const currentFiles = getCurrentFiles?.() || {}
    if (currentProject && Object.keys(currentFiles).length > 0) {
      const builderState = {
        files: currentFiles,
        lastSaved: new Date().toISOString()
      }
      
      // Debounce the save operation
      const timeoutId = setTimeout(() => {
        handleBuilderStateChange(builderState)
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [currentProject, handleBuilderStateChange, getCurrentFiles])

  // Expose functions for manual state management
  const saveCurrentChatMessages = useCallback(async (messages: any[]) => {
    if (currentProject) {
      await saveChatMessages(currentProject.id, messages)
    }
  }, [currentProject, saveChatMessages])

  const saveCurrentBuilderState = useCallback(async (builderState: any) => {
    if (currentProject) {
      await saveBuilderState(currentProject.id, builderState)
    }
  }, [currentProject, saveBuilderState])

  const loadCurrentProjectState = useCallback(async () => {
    if (currentProject) {
      await loadProjectState(currentProject.id)
    }
  }, [currentProject, loadProjectState])

  return {
    currentProject,
    saveCurrentChatMessages,
    saveCurrentBuilderState,
    loadCurrentProjectState,
    loadProjectState
  }
}
