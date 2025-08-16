import React, { useState } from "react"
import { Button } from "./button"
import { Loader2 } from "lucide-react"

interface LoadingButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  onClick?: () => void | Promise<void>
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  [key: string]: any
}

export const LoadingButton = ({
  children,
  isLoading = false,
  onClick,
  className = "",
  variant = "default",
  size = "default",
  type,
  disabled,
  ...props
}: LoadingButtonProps) => {
  const [internalLoading, setInternalLoading] = useState(false)

  const handleClick = async () => {
    if (onClick && !disabled && !isLoading) {
      setInternalLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 150))
      onClick()
      setInternalLoading(false)
    }
  }

  const loading = isLoading || internalLoading

  return (
    <Button
      onClick={handleClick}
      disabled={loading || disabled}
      className={`transition-all duration-300 hover:scale-105 active:scale-95 ${className}`}
      variant={variant}
      size={size}
      type={type}
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
