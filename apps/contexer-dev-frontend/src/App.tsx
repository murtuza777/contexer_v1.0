import { useState } from "react";
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


function App() {
    const {mode, initOpen} = useChatModeStore();
    const {isLoginModalOpen, closeLoginModal, openLoginModal, isAuthenticated: isAuthenticatedFn} = useUserStore();
    const isAuthenticated = isAuthenticatedFn();
    const {isDarkMode} = useInit();
    const { active } = useFeatureNav();
    const [showLandingPage, setShowLandingPage] = useState(true);
    const [isGuestMode, setIsGuestMode] = useState(false);

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
                        <ContextComposer />
                      </div>
                    )}
                    {active === 'fixer' && (
                      <div className="flex-1 m-3 rounded-2xl border-2 border-neon-green/20 bg-card-bg overflow-hidden shadow-lg shadow-neon-green/10">
                        <ErrorFixer />
                      </div>
                    )}
                </div>
            </div>
            <UpdateTip/>
            <ChatHistorySlider />
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
