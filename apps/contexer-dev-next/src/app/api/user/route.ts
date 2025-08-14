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

    const token = authorization.split(" ")[1];
    
    // Mock user validation - in production, this would validate the JWT token
    if (token && token.startsWith("mock-jwt-token-")) {
      const mockUser = {
        id: "1",
        email: "user@example.com",
        username: "user",
        avatar: null,
      };

      return NextResponse.json(mockUser);
    }

    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
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
