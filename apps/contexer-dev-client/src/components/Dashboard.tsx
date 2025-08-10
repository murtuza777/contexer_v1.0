import React from "react"

// Simple component that just returns the builder interface
// This acts as a bridge - when user accesses dashboard, they get the builder
const Dashboard: React.FC = () => {
  // Return null so the parent App.tsx will show the builder interface
  // The "dashboard" is actually just the builder interface in this app
  return null
}

export default Dashboard
