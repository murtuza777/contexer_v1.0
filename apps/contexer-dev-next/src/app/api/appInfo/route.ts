import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const language = url.searchParams.get('language') || 'en';

  // Mock version information
  const versionInfo = {
    version: "1.0.0",
    content: language === 'zh' 
      ? "欢迎使用 Contexer Dev！这是一个功能强大的开发工具。"
      : "Welcome to Contexer Dev! This is a powerful development tool.",
    date: new Date().toISOString().split('T')[0],
  };

  return NextResponse.json({
    versionInfo,
    language,
    status: "ok"
  });
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new Response(null, { status: 200 });
}
