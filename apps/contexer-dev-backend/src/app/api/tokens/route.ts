import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("Authorization");
    
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    // Mock token/quota information
    const mockTokenData = {
      quota: {
        totalTokens: 10000,
        usedTokens: 2500,
        remainingTokens: 7500,
      },
      subscription: {
        plan: "free",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };

    return NextResponse.json(mockTokenData);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new Response(null, { status: 200 });
}
