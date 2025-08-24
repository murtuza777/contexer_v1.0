import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Settings, SettingsTab, TAB_KEYS } from "../Settings"
import { db } from "../../utils/indexDB"
import { eventEmitter } from "../AiChat/utils/EventEmitter"
import useUserStore from "../../stores/userSlice"
import { useTranslation } from "react-i18next"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  username: string
  onMouseEnter: () => void
  onMouseLeave: () => void
  onChatSelect?: (uuid: string) => void
}

export function Sidebar({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
  onChatSelect,
}: SidebarProps) {
  const { t } = useTranslation()
  const { user, isAuthenticated, logout, openLoginModal } = useUserStore()

  const [settingsState, setSettingsState] = useState<{
    isOpen: boolean
    tab: SettingsTab
  }>({
    isOpen: false,
    tab: TAB_KEYS.GENERAL,
  })
  const [chatHistory, setChatHistory] = useState<
    {
      uuid: string
      title?: string
      lastMessage: string
      time: number
    }[]
  >([])
  const [searchTerm, setSearchTerm] = useState("")

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const uuids = await db.getAllUuids()
      const historyPromises = uuids.map(async (uuid) => {
        const records = await db.getByUuid(uuid)
        const latestRecord = records[0] // Already sorted by time, get latest

        // Add safety check
        if (!latestRecord?.data?.messages?.length) {
          return {
            uuid,
            title: "New Chat",
            lastMessage: "",
            time: latestRecord?.time || Date.now(),
          }
        }

        const lastMessage =
          latestRecord.data.messages[latestRecord.data.messages.length - 1]

        return {
          uuid,
          title: latestRecord.data.title || "New Chat",
          lastMessage: lastMessage?.content || "",
          time: latestRecord.time,
        }
      })

      const history = await Promise.all(historyPromises)
      // Sort by time
      const sortedHistory = history.sort((a, b) => b.time - a.time)
      setChatHistory(sortedHistory)
    } catch (error) {
      console.error("Failed to load chat history:", error)
      setChatHistory([]) // Set empty array when error occurs
    }
  }

  useEffect(() => {
    loadChatHistory()

    // Subscribe to database updates
    db.subscribe(() => {
      loadChatHistory()
    })

    // Cleanup subscription
    // return () => unsubscribe();
  }, [])

  // Filter chat history
  const filteredHistory = chatHistory.filter(
    (chat) =>
      chat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Delete chat history
  const deleteChat = async (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await db.deleteByUuid(uuid)
    await loadChatHistory()
  }

  const openSettings = (tab: SettingsTab) => {
    setSettingsState({
      isOpen: true,
      tab,
    })
  }

  const closeSettings = () => {
    setSettingsState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    )
  }

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation()
    logout()
    onClose()
  }

  const openUserCenter = () => {
    const url = "https://contexer.ai/user"
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send("open:external:url", url)
    } else {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }
  const renderUserSection = () => {
    if (!isAuthenticated) {
      return (
        <div
          className="p-4 cursor-pointer hover:bg-neon-green/10 transition-all duration-300 rounded-lg mx-2 my-1 border border-transparent hover:border-neon-green/30"
          onClick={() => {
            openLoginModal()
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center text-black text-[16px] font-bold shadow-lg shadow-neon-green/25">
              ?
            </div>
            <div className="flex-1">
              <div className="text-white text-[15px] font-semibold">
                {t("login.title")}
              </div>
              <div className="text-[13px] text-neon-cyan">
                {t("login.click_to_login")}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        className="p-4 cursor-pointer hover:bg-neon-green/10 transition-all duration-300 rounded-lg mx-2 my-1 border border-transparent hover:border-neon-green/30"
        onClick={() => openSettings(TAB_KEYS.Quota)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`
          w-10 h-10 rounded-full
          flex items-center justify-center
          text-white text-sm font-bold
          ${user?.avatar ? "" : "bg-gradient-to-br from-neon-green to-neon-blue shadow-lg shadow-neon-green/25"}
        `}
            style={
              user?.avatar
                ? {
                    backgroundImage: `url(${user.avatar})`,
                    backgroundSize: "cover",
                  }
                : undefined
            }
          >
            {!user?.avatar && getInitials(user?.username || "?")}
          </div>
          <div className="flex-1">
            <div className="text-white text-[15px] font-semibold">
              {user?.username}
            </div>
            <div className="text-[13px] text-neon-cyan font-medium uppercase">
              {`${user?.userQuota?.tierType} plan`}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-neon-red transition-colors duration-300 p-2 rounded-lg hover:bg-neon-red/10"
          >
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return createPortal(
    <>
      <div
        className={`
          fixed top-0 left-0 h-full w-[300px]
          bg-dark-bg dark:bg-darker-bg z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col text-[14px]
          border-r-2 border-neon-green/20
          rounded-tr-2xl rounded-br-2xl
          overflow-hidden shadow-2xl shadow-neon-green/25
        `}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Logo */}
        <div className="p-4 border-b border-neon-green/20 bg-gradient-to-r from-neon-green/5 to-neon-blue/5">
          <h1 className="text-neon-green text-lg font-bold bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
            Contexer
          </h1>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => {
            if (onChatSelect) {
              onChatSelect("");
            } else {
              eventEmitter.emit("chat:select", "");
            }
          }}
          className="mx-4 my-3 p-3 flex items-center gap-3 text-white bg-gradient-to-r from-neon-green/20 to-neon-blue/20 hover:from-neon-green/30 hover:to-neon-blue/30 border-2 border-neon-green/30 hover:border-neon-green/50 rounded-xl transition-all duration-300 text-[14px] font-medium transform hover:scale-105 shadow-lg hover:shadow-neon-green/25"
        >
          <svg
            className="w-[18px] h-[18px] text-neon-green"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="translate">{t("sidebar.start_new_chat")}</span>
        </button>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder={t("sidebar.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card-bg text-white rounded-xl px-4 py-3 outline-none text-[14px] border-2 border-gray-700 focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 transition-all duration-300 placeholder-gray-400"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 px-3 mt-2 overflow-y-auto">
          {filteredHistory.map((chat) => (
            <div
              key={chat.uuid}
              onClick={() => {
                if (onChatSelect) {
                  onChatSelect(chat.uuid);
                } else {
                  eventEmitter.emit("chat:select", chat.uuid);
                }
              }}
              className="group flex items-center w-full text-left px-3 py-2.5 text-white hover:bg-neon-green/10 rounded-xl text-[14px] cursor-pointer transition-all duration-300 border border-transparent hover:border-neon-green/30 mb-2"
            >
              <span className="flex-1 truncate">
                {chat.title || "New Chat"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteChat(chat.uuid, e)
                }}
                className="hidden text-gray-400 group-hover:block hover:text-neon-red transition-colors duration-300 p-1 rounded-lg hover:bg-neon-red/10"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-auto border-t border-neon-green/20 bg-gradient-to-r from-neon-green/5 to-neon-blue/5">
          {/* Settings and Help */}
          <div className="border-b border-neon-green/20">
            <button
              onClick={() => openSettings("General")}
              className="flex items-center w-full gap-3 px-4 py-3 text-left text-white hover:bg-neon-green/10 transition-all duration-300 rounded-lg mx-2 my-1"
            >
              <svg
                className="w-[18px] h-[18px] text-neon-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="translate font-medium">{t("sidebar.settings")}</span>
            </button>

            <button
              onClick={() => {
                openUserCenter()
              }}
              className="flex items-center w-full gap-3 px-4 py-3 text-left text-white hover:bg-neon-green/10 transition-all duration-300 rounded-lg mx-2 my-1"
            >
              <svg
                className="w-[18px] h-[18px] text-neon-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span className="text-[14px] translate font-medium">
                {t("sidebar.my_subscription")}
              </span>
            </button>
          </div>

          {/* User Profile - 使用新的渲染方法 */}
          {renderUserSection()}
        </div>
      </div>

      <Settings
        isOpen={settingsState.isOpen}
        onClose={closeSettings}
        initialTab={settingsState.tab}
      />
    </>,
    document.body
  )
}
