import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Project {
  id: string // This will be the chat UUID
  name: string
  description?: string
  context?: any
  status: 'draft' | 'active' | 'generating' | 'generated' | 'failed'
  generation_status: 'context_only' | 'generating' | 'generated' | 'failed'
  project_path?: string
  created_at: string
  updated_at: string
  chat_uuid: string // Link to the chat
  chat_messages?: any[] // Store chat messages for this project
  last_chat_activity?: string // Last activity timestamp
  builder_state?: any // Store builder state (files, etc.)
}

interface ProjectState {
  currentProject: Project | null
  projects: Project[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Project management
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project | null>
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>
  deleteProject: (id: string) => Promise<boolean>
  loadProjects: () => Promise<void>
  loadProject: (id: string) => Promise<Project | null>
  
  // Utility
  getCurrentProjectId: () => string | null
  isProjectReady: () => boolean
  
  // Chat integration - each chat is its own project
  setCurrentProjectByChatUuid: (chatUuid: string) => Promise<void>
  createProjectFromChat: (chatUuid: string, projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'chat_uuid'>) => Promise<Project | null>
  getCurrentChatUuid: () => string | null
  
  // State management
  saveChatMessages: (projectId: string, messages: any[]) => Promise<void>
  loadChatMessages: (projectId: string) => Promise<any[]>
  saveBuilderState: (projectId: string, builderState: any) => Promise<void>
  loadBuilderState: (projectId: string) => Promise<any>
  updateProjectActivity: (projectId: string) => Promise<void>
}

const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      projects: [],
      isLoading: false,
      error: null,

      setCurrentProject: (project) => {
        set({ currentProject: project })
        // Also set it in window for backward compatibility
        if (project) {
          (window as any).__CURRENT_PROJECT_ID__ = project.id
        } else {
          delete (window as any).__CURRENT_PROJECT_ID__
        }
      },

      setProjects: (projects) => set({ projects }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      createProject: async (projectData) => {
        const { setLoading, setError, loadProjects } = get()
        
        try {
          setLoading(true)
          setError(null)

          const baseUrl = (import.meta as any)?.env?.VITE_APP_BASE_URL || 'http://localhost:3000'
          const token = localStorage.getItem('token')
          
          if (!token) {
            throw new Error('No authentication token found')
          }

          const response = await fetch(`${baseUrl}/api/projects`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(projectData)
          })

          if (!response.ok) {
            throw new Error(`Failed to create project: ${response.statusText}`)
          }

          const result = await response.json()
          
          if (result.success) {
            // Reload projects to get the updated list
            await loadProjects()
            return result.data
          } else {
            throw new Error(result.errors?.[0] || 'Failed to create project')
          }
        } catch (error: any) {
          setError(error.message)
          return null
        } finally {
          setLoading(false)
        }
      },

      updateProject: async (id, updates) => {
        const { setLoading, setError, currentProject, setCurrentProject } = get()
        
        try {
          setLoading(true)
          setError(null)

          const baseUrl = (import.meta as any)?.env?.VITE_APP_BASE_URL || 'http://localhost:3000'
          const token = localStorage.getItem('token')
          
          if (!token) {
            throw new Error('No authentication token found')
          }

          // Temporary backend health guard
          try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 700)
            const health = await fetch(`${baseUrl}/api/test`, { signal: controller.signal })
            clearTimeout(timeout)
            if (!health.ok) {
              if (!(window as any).__PROJECT_GUARD_LOGGED__) {
                console.warn('Backend not healthy, skipping updateProject temporarily')
                ;(window as any).__PROJECT_GUARD_LOGGED__ = true
              }
              return false
            }
          } catch (_) {
            if (!(window as any).__PROJECT_GUARD_LOGGED__) {
              console.warn('Backend unreachable, skipping updateProject temporarily')
              ;(window as any).__PROJECT_GUARD_LOGGED__ = true
            }
            return false
          }

          console.log('🔄 Updating project:', id, 'with updates:', updates)

          const response = await fetch(`${baseUrl}/api/projects/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
          })

          if (!response.ok) {
            throw new Error(`Failed to update project: ${response.statusText}`)
          }

          const result = await response.json()
          console.log('📦 Update project response:', result)
          
          if (result.success) {
            console.log('✅ Project updated successfully')
            // Update current project if it's the one being updated
            if (currentProject?.id === id) {
              const updatedProject = { ...currentProject, ...updates }
              console.log('🔄 Updating current project:', updatedProject)
              setCurrentProject(updatedProject)
            }
            return true
          } else {
            throw new Error(result.errors?.[0] || 'Failed to update project')
          }
        } catch (error: any) {
          setError(error.message)
          return false
        } finally {
          setLoading(false)
        }
      },

      deleteProject: async (id) => {
        const { setLoading, setError, currentProject, setCurrentProject, loadProjects } = get()
        
        try {
          setLoading(true)
          setError(null)

          const baseUrl = (import.meta as any)?.env?.VITE_APP_BASE_URL || 'http://localhost:3000'
          const token = localStorage.getItem('token')
          
          if (!token) {
            throw new Error('No authentication token found')
          }

          const response = await fetch(`${baseUrl}/api/projects/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error(`Failed to delete project: ${response.statusText}`)
          }

          const result = await response.json()
          
          if (result.success) {
            // Clear current project if it's the one being deleted
            if (currentProject?.id === id) {
              setCurrentProject(null)
            }
            // Reload projects
            await loadProjects()
            return true
          } else {
            throw new Error(result.errors?.[0] || 'Failed to delete project')
          }
        } catch (error: any) {
          setError(error.message)
          return false
        } finally {
          setLoading(false)
        }
      },

      loadProjects: async () => {
        const { setLoading, setError, setProjects } = get()
        
        try {
          setLoading(true)
          setError(null)

          const baseUrl = (import.meta as any)?.env?.VITE_APP_BASE_URL || 'http://localhost:3000'
          const token = localStorage.getItem('token')
          
          if (!token) {
            throw new Error('No authentication token found')
          }

          const response = await fetch(`${baseUrl}/api/projects`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error(`Failed to load projects: ${response.statusText}`)
          }

          const result = await response.json()
          console.log('📦 Projects API response:', result)
          
          if (result.success) {
            console.log('✅ Loaded projects:', result.projects?.length || 0, 'projects')
            result.projects?.forEach((project: any) => {
              console.log('📄 Project:', { id: project.id, name: project.name, chat_uuid: project.chat_uuid, hasContext: !!project.context })
            })
            setProjects(result.projects || [])
          } else {
            throw new Error(result.errors?.[0] || 'Failed to load projects')
          }
        } catch (error: any) {
          setError(error.message)
        } finally {
          setLoading(false)
        }
      },

      loadProject: async (id) => {
        const { setLoading, setError, setCurrentProject } = get()
        
        try {
          setLoading(true)
          setError(null)

          const baseUrl = (import.meta as any)?.env?.VITE_APP_BASE_URL || 'http://localhost:3000'
          const token = localStorage.getItem('token')
          
          if (!token) {
            throw new Error('No authentication token found')
          }

          const response = await fetch(`${baseUrl}/api/projects/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error(`Failed to load project: ${response.statusText}`)
          }

          const result = await response.json()
          
          if (result.success) {
            setCurrentProject(result.data)
            return result.data
          } else {
            throw new Error(result.errors?.[0] || 'Failed to load project')
          }
        } catch (error: any) {
          setError(error.message)
          return null
        } finally {
          setLoading(false)
        }
      },

      getCurrentProjectId: () => {
        const { currentProject } = get()
        return currentProject?.id || null
      },

      isProjectReady: () => {
        const { currentProject } = get()
        return currentProject?.generation_status === 'generated' && !!currentProject?.project_path
      },

      setCurrentProjectByChatUuid: async (chatUuid) => {
        const { projects, setCurrentProject, loadProjects } = get()
        
        console.log('🔍 Setting project by chat UUID:', chatUuid)
        
        // Refresh projects list to ensure we have latest data
        await loadProjects()
        const { projects: refreshedProjects } = get()
        
        // Find project by chat UUID
        const project = refreshedProjects.find(p => p.chat_uuid === chatUuid)
        
        if (project) {
          console.log('✅ Found existing project for chat:', project.name)
          setCurrentProject(project)
        } else {
          console.log('🆕 Creating new project for chat UUID:', chatUuid)
          // Clear current project first to ensure clean state
          setCurrentProject(null)
          
          // Create a new isolated project for this chat
          const newProject = await get().createProjectFromChat(chatUuid, {
            name: `Chat Project ${new Date().toLocaleDateString()}`,
            description: 'Project created from chat',
            context: {
              goal: '',
              user_stories: [],
              tech_stack: [],
              project_type: 'web_app',
              version: '1.0.0'
            },
            status: 'draft',
            generation_status: 'context_only'
          })
          
          if (newProject) {
            console.log('✅ Created new isolated project:', newProject.name)
            setCurrentProject(newProject)
          }
        }
      },

      createProjectFromChat: async (chatUuid, projectData) => {
        const { setLoading, setError, loadProjects } = get()
        
        try {
          setLoading(true)
          setError(null)

          const baseUrl = (import.meta as any)?.env?.VITE_APP_BASE_URL || 'http://localhost:3000'
          
          // Ensure guest authentication
          const userStore = (await import('./userSlice')).default
          let { token, user } = userStore.getState()
          
          // Always ensure we have guest authentication for project creation
          if (!token || !user || token === null) {
            console.log('🔑 Authenticating as guest for project creation')
            const guestUser = { 
              id: `guest_${Date.now()}`, 
              email: "guest@contexer.dev", 
              username: "Guest User" 
            }
            userStore.getState().login(guestUser as any, "guest-token")
            token = "guest-token"
            console.log('✅ Guest authentication set')
          }

          console.log('🔑 Using token for project creation:', token)

          console.log('🆕 Creating new isolated project for chat:', chatUuid)
          console.log('📦 Project data:', projectData)
          
          const requestBody = {
            name: projectData.name,
            description: projectData.description,
            context: projectData.context,
            chat_uuid: chatUuid,
            generation_status: projectData.generation_status || 'context_only',
            project_path: projectData.project_path || null
          }
          
          console.log('📤 Sending request body:', JSON.stringify(requestBody, null, 2))
          
          const response = await fetch(`${baseUrl}/api/projects`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
          })

          console.log('📡 Response status:', response.status, response.statusText)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ API Error Response:', errorText)
            throw new Error(`Failed to create project: ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          
          if (result.success) {
            console.log('✅ Created isolated project:', result.project)
            // Reload projects to get the updated list
            await loadProjects()
            return result.project
          } else {
            throw new Error(result.errors?.[0] || 'Failed to create project')
          }
        } catch (error: any) {
          console.error('❌ Failed to create project:', error)
          setError(error.message)
          return null
        } finally {
          setLoading(false)
        }
      },

      getCurrentChatUuid: () => {
        const { currentProject } = get()
        return currentProject?.chat_uuid || null
      },

      // Removed associateChatWithCurrentProject - not needed in chat-as-project model

      saveChatMessages: async (projectId, messages) => {
        try {
          const baseUrl = (import.meta as any)?.env?.VITE_APP_BASE_URL || 'http://localhost:3000'
          const token = localStorage.getItem('token')
          
          if (!token) {
            throw new Error('No authentication token found')
          }

          const response = await fetch(`${baseUrl}/api/projects/${projectId}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ messages })
          })

          if (!response.ok) {
            throw new Error(`Failed to save chat messages: ${response.statusText}`)
          }

          // Update local state
          const { currentProject, projects } = get()
          if (currentProject?.id === projectId) {
            set({ 
              currentProject: { 
                ...currentProject, 
                chat_messages: messages,
                last_chat_activity: new Date().toISOString()
              }
            })
          }

          // Update projects array
          const updatedProjects = projects.map(p => 
            p.id === projectId 
              ? { ...p, chat_messages: messages, last_chat_activity: new Date().toISOString() }
              : p
          )
          set({ projects: updatedProjects })

        } catch (error) {
          console.error('Failed to save chat messages:', error)
        }
      },

      loadChatMessages: async (projectId) => {
        try {
          const baseUrl = (import.meta as any)?.env?.VITE_APP_BASE_URL || 'http://localhost:3000'
          const token = localStorage.getItem('token')
          
          if (!token) {
            throw new Error('No authentication token found')
          }

          const response = await fetch(`${baseUrl}/api/projects/${projectId}/chat`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error(`Failed to load chat messages: ${response.statusText}`)
          }

          const result = await response.json()
          return result.messages || []

        } catch (error) {
          console.error('Failed to load chat messages:', error)
          return []
        }
      },

      saveBuilderState: async (projectId, builderState) => {
        try {
          const baseUrl = (import.meta as any)?.env?.VITE_APP_BASE_URL || 'http://localhost:3000'
          const token = localStorage.getItem('token')
          
          if (!token) {
            throw new Error('No authentication token found')
          }

          // Temporary backend health guard
          try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 700)
            const health = await fetch(`${baseUrl}/api/test`, { signal: controller.signal })
            clearTimeout(timeout)
            if (!health.ok) {
              if (!(window as any).__PROJECT_GUARD_LOGGED__) {
                console.warn('Backend not healthy, skipping saveBuilderState temporarily')
                ;(window as any).__PROJECT_GUARD_LOGGED__ = true
              }
              return
            }
          } catch (_) {
            if (!(window as any).__PROJECT_GUARD_LOGGED__) {
              console.warn('Backend unreachable, skipping saveBuilderState temporarily')
              ;(window as any).__PROJECT_GUARD_LOGGED__ = true
            }
            return
          }

          const response = await fetch(`${baseUrl}/api/projects/${projectId}/builder`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ builderState })
          })

          if (!response.ok) {
            throw new Error(`Failed to save builder state: ${response.statusText}`)
          }

          // Update local state
          const { currentProject, projects } = get()
          if (currentProject?.id === projectId) {
            set({ 
              currentProject: { 
                ...currentProject, 
                builder_state: builderState
              }
            })
          }

          // Update projects array
          const updatedProjects = projects.map(p => 
            p.id === projectId 
              ? { ...p, builder_state: builderState }
              : p
          )
          set({ projects: updatedProjects })

        } catch (error) {
          console.error('Failed to save builder state:', error)
        }
      },

      loadBuilderState: async (projectId) => {
        try {
          const baseUrl = (import.meta as any)?.env?.VITE_APP_BASE_URL || 'http://localhost:3000'
          const token = localStorage.getItem('token')
          
          if (!token) {
            throw new Error('No authentication token found')
          }

          const response = await fetch(`${baseUrl}/api/projects/${projectId}/builder`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error(`Failed to load builder state: ${response.statusText}`)
          }

          const result = await response.json()
          return result.builderState || null

        } catch (error) {
          console.error('Failed to load builder state:', error)
          return null
        }
      },

      updateProjectActivity: async (projectId) => {
        try {
          const baseUrl = (import.meta as any)?.env?.VITE_APP_BASE_URL || 'http://localhost:3000'
          const token = localStorage.getItem('token')
          
          if (!token) {
            // No token available, just update local state
            console.log('No authentication token found, updating local state only')
            const { currentProject, projects } = get()
            if (currentProject?.id === projectId) {
              set({ 
                currentProject: { 
                  ...currentProject, 
                  last_chat_activity: new Date().toISOString()
                }
              })
            }
            return
          }

          // Temporary backend health guard
          try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 700)
            const health = await fetch(`${baseUrl}/api/test`, { signal: controller.signal })
            clearTimeout(timeout)
            if (!health.ok) {
              if (!(window as any).__PROJECT_GUARD_LOGGED__) {
                console.warn('Backend not healthy, skipping updateProjectActivity temporarily')
                ;(window as any).__PROJECT_GUARD_LOGGED__ = true
              }
              // proceed to update local state below regardless
            }
          } catch (_) {
            if (!(window as any).__PROJECT_GUARD_LOGGED__) {
              console.warn('Backend unreachable, skipping updateProjectActivity temporarily')
              ;(window as any).__PROJECT_GUARD_LOGGED__ = true
            }
            // proceed to update local state below regardless
            const { currentProject, projects } = get()
            if (currentProject?.id === projectId) {
              set({ 
                currentProject: { 
                  ...currentProject, 
                  last_chat_activity: new Date().toISOString()
                }
              })
            }
            const updatedProjects = projects.map(p => 
              p.id === projectId 
                ? { ...p, last_chat_activity: new Date().toISOString() }
                : p
            )
            set({ projects: updatedProjects })
            return
          }

          const response = await fetch(`${baseUrl}/api/projects/${projectId}/activity`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              last_activity: new Date().toISOString() 
            })
          })

          if (!response.ok) {
            console.warn(`Failed to update project activity: ${response.statusText}`)
            // Don't throw error, just update local state
          }

          // Update local state regardless of API response
          const { currentProject, projects } = get()
          if (currentProject?.id === projectId) {
            set({ 
              currentProject: { 
                ...currentProject, 
                last_chat_activity: new Date().toISOString()
              }
            })
          }

          // Update projects array
          const updatedProjects = projects.map(p => 
            p.id === projectId 
              ? { ...p, last_chat_activity: new Date().toISOString() }
              : p
          )
          set({ projects: updatedProjects })

        } catch (error) {
          console.error('Failed to update project activity:', error)
        }
      }
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({
        currentProject: state.currentProject,
        // Don't persist projects array as it should be fetched fresh
      })
    }
  )
)

export default useProjectStore
