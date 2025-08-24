import { ConfigProvider, theme } from "antd";
import { BaseChat } from "./chat";
import { ChatMode } from "@/types/chat";
import useChatModeStore from "@/stores/chatModeSlice";

const Independent: React.FC = () => {
  const { mode, initOpen } = useChatModeStore();


  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <div
        className={`bg-dark-bg dark:bg-darker-bg min-w-[400px] rounded-lg p-4 ml-1.5 mt-1.5 mb-1.5 border border-gray-800/50 shadow-lg ${
          initOpen ? 'flex items-center justify-center' : ''
        }`}
        style={{
          width: `${mode === ChatMode.Builder && !initOpen ? "300px" : "100%"}`,
        }}
      >
        <BaseChat />
      </div>
    </ConfigProvider>
  );
};
export default Independent;
