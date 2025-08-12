"use client"

import { useAuth } from "@/hooks/useAuth"

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard!</h1>
        {user && <p>Hello, {user.username || user.email}!</p>}
      </div>
    </div>
  )
}
