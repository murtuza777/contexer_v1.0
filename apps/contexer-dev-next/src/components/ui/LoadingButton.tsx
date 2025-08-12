"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const LoadingButton = ({
  children,
  isLoading = false,
  onClick,
  className = "",
  variant = "default",
  size = "default",
  ...props
}: {
  children: React.ReactNode
  isLoading?: boolean
  onClick?: () => void
  className?: string
  variant?: "default" | "outline"
  size?: "default" | "lg"
  [key: string]: any
}) => {
  const [internalLoading, setInternalLoading] = useState(false)

  const handleClick = async () => {
    if (onClick) {
      setInternalLoading(true)
      // Simulate micro-interaction delay
      await new Promise((resolve) => setTimeout(resolve, 150))
      onClick()
      setInternalLoading(false)
    }
  }

  const loading = isLoading || internalLoading

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={`transition-all duration-300 hover:scale-105 active:scale-95 ${className}`}
      variant={variant}
      size={size}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  )
}

export default LoadingButton
