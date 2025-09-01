import { WebContainer } from '@webcontainer/api';
import { useFileStore } from '../../stores/fileStore';

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;
let isBooting = false;

export async function getWebContainerInstance(): Promise<WebContainer | null> {
  // Return existing instance if available
  if (webcontainerInstance) {
    console.log('Returning existing WebContainer instance');
    return webcontainerInstance;
  }
  
  // If already booting, wait for that promise
  if (bootPromise) {
    console.log('Waiting for existing boot promise');
    return bootPromise;
  }

  // Prevent multiple boot attempts
  if (isBooting) {
    console.log('Already booting, waiting...');
    // Wait a bit and try again
    await new Promise(resolve => setTimeout(resolve, 100));
    return getWebContainerInstance();
  }

  try {
    isBooting = true;
    console.log('Starting WebContainer boot process');
    
    bootPromise = WebContainer.boot().then(async (instance) => {
      console.log('WebContainer booted successfully');
      webcontainerInstance = instance;
      
      // Initialize the root directory
      await instance.fs.mkdir('/', { recursive: true });
      
      // Mount initial files
      const getCurrentFiles = useFileStore.getState().getCurrentFiles;
      const files = (getCurrentFiles && getCurrentFiles()) || {} as Record<string, string>;
      for (const [path, contents] of Object.entries(files || {})) {
        try {
          const fullPath = `/${path}`;
          // Create parent directories
          const parentDir = fullPath.substring(0, fullPath.lastIndexOf('/'));
          if (parentDir !== '') {
            await instance.fs.mkdir(parentDir, { recursive: true });
          }
          // Write file
          await instance.fs.writeFile(fullPath, contents);
        } catch (fileError) {
          console.warn(`Failed to mount file ${path}:`, fileError);
        }
      }
      
      return instance;
    });

    const instance = await bootPromise;
    return instance;
  } catch (error) {
    console.error('Failed to boot WebContainer:', error);
    webcontainerInstance = null;
    
    // Check if it's a limit error and provide helpful message
    if (error instanceof Error && error.message.includes('Unable to create more instances')) {
      console.error('WebContainer instance limit reached. Only one instance can be created per page.');
    }
    
    return null;
  } finally {
    bootPromise = null;
    isBooting = false;
  }
}

// Add cleanup function for better resource management
export function destroyWebContainerInstance(): void {
  if (webcontainerInstance) {
    console.log('Destroying WebContainer instance');
    try {
      // Note: WebContainer doesn't have a direct destroy method
      // but we can clean up our references
      webcontainerInstance = null;
    } catch (error) {
      console.error('Error during WebContainer cleanup:', error);
    }
  }
  bootPromise = null;
  isBooting = false;
}

// Add function to check if instance exists
export function hasWebContainerInstance(): boolean {
  return webcontainerInstance !== null;
}