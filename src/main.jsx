import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WBSEditor from './WBSEditor.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WBSEditor />
  </StrictMode>,
)
