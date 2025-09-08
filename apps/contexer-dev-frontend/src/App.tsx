import { useState, useEffect } from "react";
import useUserStore from "./stores/userSlice";
import useChatModeStore from "./stores/chatModeSlice";
import {GlobalLimitModal} from "./components/UserModal";
import Header from "./components/Header";
import AiChat from "./components/AiChat";
import Login from "./components/Login";
import LandingPage from "./components/LandingPage";
import EditorPreviewTabs from "./components/EditorPreviewTabs";
import { useFeatureNav } from "./stores/featureNavSlice";
import { ContextComposer } from "./components/WeIde/components/IDEContent/ContextComposer";
import { ErrorFixer } from "./components/WeIde/components/IDEContent/ErrorFixer";
import "./utils/i18";
import classNames from "classnames";
import {ChatMode} from "./types/chat";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {UpdateTip} from "./components/UpdateTip"
import useInit from "./hooks/useInit";

import TopViewContainer from "./components/TopView";
import ChatHistorySlider from "./components/ChatHistorySlider";
import { VisualObserver } from "./components/WeIde/components/VisualObserver";
import { useTerminalSessionTracker } from "./hooks/useTerminalSessionTracker";
import { StateRecoveryNotification } from "./components/StateRecoveryNotification";


function App() {
    const {mode, initOpen} = useChatModeStore();
    const {isLoginModalOpen, closeLoginModal, openLoginModal, isAuthenticated: isAuthenticatedFn} = useUserStore();
    const isAuthenticated = isAuthenticatedFn();
    const {isDarkMode} = useInit();
    const { active } = useFeatureNav();
    const { getActiveSession } = useTerminalSessionTracker();
    
    const [showLandingPage, setShowLandingPage] = useState(true);
    const [isGuestMode, setIsGuestMode] = useState(false);

    // Track feature activation (simplified to avoid infinite loops)
    useEffect(() => {
        console.log(`🎯 [App] Feature changed to: ${active}`);
        // Let individual feature lifecycle managers handle their own activation
    }, [active]);

    // Handle guest access - sets a temporary authenticated state
    const handleGuestAccess = () => {
        setShowLandingPage(false);
        setIsGuestMode(true);
    };

    // Show landing page if not authenticated and landing page is active and not in guest mode
    if (showLandingPage && !isAuthenticated && !isGuestMode) {
        return (
            <TopViewContainer>
                <LandingPage onGuestAccess={handleGuestAccess} />
                <ToastContainer
                    position="top-center"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                    style={{
                        zIndex: 100000,
                    }}
                />
            </TopViewContainer>
        );
    }

    // Show builder interface (for authenticated users or guest access)
    return (
        <TopViewContainer>
            <GlobalLimitModal onLogin={openLoginModal}/>
            <Login isOpen={isLoginModalOpen} onClose={closeLoginModal}/>
            <div
                className={classNames(
                    "h-screen w-screen flex flex-col overflow-hidden bg-dark-bg",
                    { dark: isDarkMode }
                )}
            >
                <Header/>
                <div className="flex flex-row w-full h-full max-h-[calc(100%-64px)] bg-dark-bg dark:bg-darker-bg">
                        {active === 'chat' && (
                          <>
                            <AiChat/>
                            {mode === ChatMode.Builder && !initOpen && <EditorPreviewTabs/>}
                          </>
                        )}
                        {active === 'context' && (
                          <div className="flex-1 m-3 rounded-2xl border-2 border-neon-green/20 bg-card-bg overflow-hidden shadow-lg shadow-neon-green/10">
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                              <p>Context Composer is now available as a tab in Chat/Builder</p>
                              <p className="text-sm mt-2">Switch to Chat/Builder and look for the "Context" tab</p>
                            </div>
                          </div>
                        )}
                        {active === 'fixer' && (
                          <div className="flex-1 m-3 rounded-2xl border-2 border-neon-green/20 bg-card-bg overflow-hidden shadow-lg shadow-neon-green/10">
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                              <p>Error Fixer is now available as a tab in Chat/Builder</p>
                              <p className="text-sm mt-2">Switch to Chat/Builder and look for the "Error Fixer" tab</p>
                            </div>
                          </div>
                        )}
                        {active === 'visual' && (
                          <div className="flex-1 m-3 rounded-2xl border-2 border-neon-green/20 bg-card-bg overflow-hidden shadow-lg shadow-neon-green/10">
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                              <p>Visual Observer is now available as a tab in Chat/Builder</p>
                              <p className="text-sm mt-2">Switch to Chat/Builder and look for the "Visual Observer" tab</p>
                            </div>
                          </div>
                        )}
                </div>
            </div>
            <UpdateTip/>
            <ChatHistorySlider />
            <StateRecoveryNotification />
            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                style={{
                    zIndex: 100000,
                }}
            />
        </TopViewContainer>
    );
}

export default App;
