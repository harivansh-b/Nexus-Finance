import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const clerkEnabled = Boolean(PUBLISHABLE_KEY)

const app = (
  <React.StrictMode>
    <App clerkEnabled={clerkEnabled} />
  </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  clerkEnabled ? (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {app}
    </ClerkProvider>
  ) : (
    app
  ),
)
