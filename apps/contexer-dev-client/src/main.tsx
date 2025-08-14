import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './global.css'
import logoUrl from './assets/logo.svg'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Ensure favicon uses our SVG in both dev and build
const ensureFavicon = () => {
  const head = document.head || document.getElementsByTagName('head')[0]
  let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    head.appendChild(link)
  }
  if (link.href !== logoUrl) {
    link.type = 'image/svg+xml'
    link.href = logoUrl
  }
}

ensureFavicon()
