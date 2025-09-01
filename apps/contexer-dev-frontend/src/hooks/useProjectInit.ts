import { useEffect } from 'react'
import useProjectStore from '@/stores/projectSlice'
import useUserStore from '@/stores/userSlice'

export function useProjectInit() {
  const { isAuthenticated } = useUserStore()
  const { loadProjects, currentProject } = useProjectStore()

  useEffect(() => {
    if (isAuthenticated) {
      // Load projects when user is authenticated
      loadProjects()
    }
  }, [isAuthenticated, loadProjects])

  // Log current project for debugging
  useEffect(() => {
    if (currentProject) {
      console.log('🎯 Current project:', currentProject.name, currentProject.id)
    } else {
      console.log('🎯 No current project selected')
    }
  }, [currentProject])

  return { currentProject }
}
