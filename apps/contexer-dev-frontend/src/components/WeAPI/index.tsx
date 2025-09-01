import React, { useState, useRef, useEffect } from "react";
import { useFileStore } from "../WeIde/stores/fileStore";
import { Layout, Button, message, ConfigProvider, theme } from "antd";
import ApiList from "./components/ApiList";
import RequestEditor from "./components/RequestEditor";
import ResponseViewer from "./components/ResponseViewer";
import { EditOutlined } from "@ant-design/icons";
import { ApiItem, ApiCollection, ApiResponse, FolderItem } from "./types";
import useThemeStore from "@/stores/themeSlice";
import { useTranslation } from "react-i18next";


const { Sider, Content } = Layout;

const getMethodColor = (method: string): string => {
  const colors: Record<string, string> = {
    GET: "#61affe",
    POST: "#49cc90",
    PUT: "#fca130",
    DELETE: "#f93e3e",
    PATCH: "#50e3c2",
    HEAD: "#9012fe",
    OPTIONS: "#0d5aa7",
  };
  return colors[method] || "#999";
};

export default function WeAPI(): React.ReactElement {
  const { t } = useTranslation();
  const [apiList, setApiList] = useState<ApiCollection>({
    id: "root",
    name: t("weapi.api_collection"),
    type: "folder",
    children: [],
  });
  const [selectedApi, setSelectedApi] = useState<ApiItem | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const apiListRef = useRef<any>(null);
  const fileStore = useFileStore();
  const getCurrentFiles = useFileStore(state => state.getCurrentFiles);
  const isUpdatingRef = useRef<boolean>(false);

  const { isDarkMode, toggleTheme, setTheme } = useThemeStore();

  useEffect(() => {
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false;
      return;
    }

    const files = (getCurrentFiles && getCurrentFiles()) || {};
    const apiJsonStr = files && typeof files === 'object' ? files["api.json"] : undefined;
    try {
      if (apiJsonStr) {
        const parsedData = JSON.parse(apiJsonStr);
        setApiList(parsedData);
      }
    } catch (e) {
      console.warn("Failed to parse api.json:", e);
    }
  }, []);

  const saveToFile = async (newApiList: ApiCollection): Promise<boolean> => {
    try {
      isUpdatingRef.current = true;
      const apiJsonStr = JSON.stringify(newApiList, null, 2);
      const filePath = "api.json";
      await fileStore.updateContent(filePath, apiJsonStr);
      setApiList(newApiList);
      return true;
    } catch (e) {
      console.error("Failed to save api.json:", e);
      message.error(t("weapi.request_failed"));
      return false;
    }
  };

  const handleSendRequest = async () => {
    if (!selectedApi) return;

    try {
      const {
        method,
        url,
        headers = [],
        query = [],
        cookies = [],
        body,
        bodyType,
      } = selectedApi;

      // 构建URL和查询参数
      const queryString = query
        .filter((q) => q.key && q.value)
        .map(
          (q) => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`
        )
        .join("&");
      const fullUrl = queryString ? `${url}?${queryString}` : url;

      // 构建headers
      const headerObj: Record<string, string> = headers.reduce(
        (acc, h) => {
          if (h.key && h.value) acc[h.key] = h.value;
          return acc;
        },
        {} as Record<string, string>
      );

      // 构建cookies
      const cookieStr = cookies
        .filter((c) => c.key && c.value)
        .map((c) => `${c.key}=${c.value}`)
        .join("; ");
      if (cookieStr) {
        headerObj["Cookie"] = cookieStr;
      }

      // 构建body
      let bodyData: any = null;
      if (bodyType === "json" && body?.json) {
        try {
          bodyData = JSON.stringify(body.json);
          headerObj["Content-Type"] = "application/json";
        } catch (e) {
          throw new Error("Invalid JSON body");
        }
      } else if (bodyType === "formData" && body?.formData) {
        const formData = new FormData();
        body.formData.forEach((item) => {
          if (item.type === "file" && item.value) {
            formData.append(item.key, item.value);
          } else if (item.key && item.value) {
            formData.append(item.key, item.value);
          }
        });
        bodyData = formData;
      }

      const fetchResponse = await fetch(fullUrl, {
        method,
        headers: headerObj,
        body: bodyData,
      });

      const contentType = fetchResponse.headers.get("content-type") || "";
      let responseData: any;

      if (contentType.includes("application/json")) {
        responseData = await fetchResponse.json();
      } else if (
        contentType.includes("image/") ||
        contentType.includes("application/pdf")
      ) {
        responseData = await fetchResponse.blob();
      } else {
        responseData = await fetchResponse.text();
      }

      const result: ApiResponse = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: Object.fromEntries(fetchResponse.headers.entries()),
        data: responseData,
      };

      setResponse(result);
    } catch (error) {
      message.error(
        `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleApiSelect = (api: ApiItem) => {
    setSelectedApi(api);
  };

  const handleSave = async (updatedApi: ApiItem) => {
    if (!updatedApi) return;

    const updateApiInList = (
      list: (ApiItem | FolderItem)[]
    ): (ApiItem | FolderItem)[] => {
      return list.map((item) => {
        if (item.type === "folder" && "children" in item) {
          return {
            ...item,
            children: updateApiInList(item.children),
          };
        }
        if (item.id === updatedApi.id) {
          return { ...updatedApi, type: "api" };
        }
        return item;
      });
    };

    const newApiList = {
      ...apiList,
      children: updateApiInList(apiList.children),
    };

    const success = await saveToFile(newApiList);
    if (success) {
      setSelectedApi(updatedApi);
      message.success(t("weapi.api_saved"));
    }
  };

  const handleEdit = (api: ApiItem) => {
    if (apiListRef.current) {
      apiListRef.current.handleEdit(api);
    }
  };

  return (
    <div className="h-full bg-card-bg border-2 border-neon-green/20 rounded-2xl overflow-hidden">
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <div className="flex h-full rounded-2xl">
          <ApiList
            ref={apiListRef}
            apiList={apiList.children}
            onSelect={handleApiSelect}
            onImport={async (newApiList) => {
              const success = await saveToFile({
                ...apiList,
                children: newApiList,
              });
              if (success) {
                message.success(t("weapi.import_success"));
              }
            }}
          />
          <div className="flex-1 p-6 overflow-auto bg-dark-bg">
            {selectedApi && (
              <>
                <div className="flex justify-between items-center mb-6 bg-card-bg border-2 border-neon-green/20 p-5 rounded-xl shadow-lg shadow-neon-green/10">
                  <div className="flex items-center gap-4">
                    <div>
                      <span
                        className="px-3 py-1.5 rounded-lg font-bold text-sm text-white shadow-lg"
                        style={{
                          backgroundColor: getMethodColor(selectedApi.method),
                        }}
                      >
                        {t(`weapi.method.${selectedApi.method}`)}
                      </span>
                    </div>
                    <div>
                      <h2 className="m-0 text-white text-xl font-bold">{selectedApi.name}</h2>
                      <p className="mt-2 mb-0 text-neon-cyan font-mono">
                        {selectedApi.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(selectedApi)}
                      className="border-2 border-neon-green/30 hover:border-neon-green/50 hover:bg-neon-green/10 text-neon-green hover:text-white transition-all duration-300"
                    >
                      {t("weapi.edit")}
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => handleSave(selectedApi)}
                      className="bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/90 hover:to-neon-blue/90 text-black font-semibold shadow-lg shadow-neon-green/25 hover:shadow-neon-green/50 transition-all duration-300 transform hover:scale-105"
                    >
                      {t("weapi.save_changes")}
                    </Button>
                  </div>
                </div>
                <RequestEditor api={selectedApi} onUpdate={setSelectedApi} />
                <div className="mt-6">
                  <Button 
                    type="primary" 
                    onClick={handleSendRequest}
                    className="bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/90 hover:to-neon-blue/90 text-black font-semibold shadow-lg shadow-neon-green/25 hover:shadow-neon-green/50 transition-all duration-300 transform hover:scale-105 px-6 py-2 h-auto text-base"
                  >
                    {t("weapi.send_request")}
                  </Button>
                  <ResponseViewer response={response} />
                </div>
              </>
            )}
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
}
