import React, { useState, useRef, useEffect } from "react"
import classNames from "classnames"
import { App, Tooltip, Modal, Input } from "antd"
import { FileText, ChevronDown } from "lucide-react"
import type { UploadButtonsProps } from "./types"

import { useTranslation } from "react-i18next"
import { IModelOption } from "../.."
import useChatStore from "@/stores/chatSlice"
import { aiProvierIcon } from "./config"
import MCPToolsButton from "./MCPToolsButton"

export const UploadButtons: React.FC<UploadButtonsProps> = ({
  isLoading,
  isUploading,
  append,
  onImageClick,
  baseModal,
  messages,
  handleSubmitWithFiles,
  setMessages,
  setBaseModal,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { modelOptions, clearImages } = useChatStore()
  const [isFigmaModalOpen, setIsFigmaModalOpen] = useState(false)
  const [figmaUrl, setFigmaUrl] = useState(() => localStorage.getItem('figmaUrl') || '')
  const [figmaToken, setFigmaToken] = useState(() => localStorage.getItem('figmaToken') || '')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleModelSelect = (model: IModelOption) => {
    setBaseModal(model)
    setIsOpen(false)
    console.log("Selected model:", model.value)
  }

  const handleFigmaSubmit = () => {
    localStorage.setItem('figmaUrl', figmaUrl)
    localStorage.setItem('figmaToken', figmaToken)
    setIsFigmaModalOpen(false)
  }

  // Define a reusable button style component
  const ToolbarButton = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
    <button
      ref={ref}
      {...props}
      className={classNames(
        "p-2 text-gray-400 flex items-center justify-center rounded-md transition-colors hover:text-gray-200 hover:bg-slate-700/30",
        props.disabled && "opacity-50 cursor-not-allowed",
        props.className
      )}
    >
      {props.children}
    </button>
  ))
  const isElectron = typeof window !== 'undefined' && !!window.electron;
  
  const canUseMCP = isElectron && baseModal.functionCall;


  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2">
        {/* MCP Tools Button - Disabled when functionCall is false */}
        {isElectron && (
          <Tooltip
            title={
              <div className="text-xs">
                <div className="font-medium mb-1">
                  {!canUseMCP
                    ? t("chat.buttons.mcp_disabled")
                    : t("chat.buttons.mcp_tools")}
                </div>
                <div className="text-gray-300">
                  {!canUseMCP
                    ? t("chat.buttons.not_support_mcp")
                    : t("chat.buttons.click_to_use_mcp")}
                </div>
              </div>
            }
            placement="bottom"
          >
            <span className={!canUseMCP ? "cursor-not-allowed" : ""}>
              <MCPToolsButton 
                ToolbarButton={ToolbarButton} 
                disabled={!canUseMCP}
              />
            </span>
          </Tooltip>
        )}

        {/* figma todo */}
        {/* <Tooltip
          title={
            <div className="text-xs">
              <div className="font-medium mb-1">
                {t("chat.buttons.figma_integration")}
              </div>
            </div>
          }
          placement="bottom"
        >
          <button
            type="button"
            onClick={() => setIsFigmaModalOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-500 flex hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500/20 rounded-lg transition-all duration-200"
          >
            <Figma className="w-4 h-4" />
          </button>
        </Tooltip> */}

        <Tooltip
          title={
            <div className="text-xs">
              <div className="font-medium mb-1">
                {isLoading || isUploading || !baseModal.useImage
                  ? t("chat.buttons.upload_disabled")
                  : t("chat.buttons.upload_image")}
              </div>
              <div className="text-gray-300">
                {isLoading || isUploading
                  ? t("chat.buttons.waiting")
                  : !baseModal.useImage
                    ? t("chat.buttons.not_support_image")
                    : t("chat.buttons.click_to_upload")}
              </div>
            </div>
          }
          placement="bottom"
        >
          <ToolbarButton
            type="button"
            onClick={onImageClick}
            disabled={isLoading || isUploading || !baseModal.useImage}
            // className={classNames(
            //   "p-2 text-gray-600 dark:text-gray-500 flex hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500/20 rounded-lg transition-all duration-200",
            //   (isLoading || isUploading || !baseModal.useImage) &&
            //   "opacity-50 cursor-not-allowed"
            // )}
          >
            <FileText className="w-4 h-4" />
          </ToolbarButton>
        </Tooltip>

      </div>

      <div className="relative ml-2" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={classNames(
            "flex items-center justify-between w-[140px] px-2.5 py-1.5 text-xs text-gray-400 bg-slate-800/30 border border-slate-700/20 rounded-md transition-colors hover:bg-slate-700/40 hover:text-gray-200",
            isOpen && "bg-slate-700/40 text-gray-200"
          )}
        >
          <span className="truncate">{baseModal.label}</span>
          <ChevronDown
            className={classNames(
              "w-3 h-3 transition-transform",
              isOpen ? "-rotate-180" : "rotate-0"
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-[140px] bg-slate-800/95 border border-slate-700/30 rounded-md shadow-lg z-50">
            {modelOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setBaseModal(option);
                  setIsOpen(false);
                }}
                className={classNames(
                  "w-full px-2.5 py-1.5 text-left text-xs transition-colors",
                  "hover:bg-slate-700/50 hover:text-gray-200",
                  baseModal.value === option.value
                    ? "bg-slate-700/50 text-gray-200"
                    : "text-gray-400"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
