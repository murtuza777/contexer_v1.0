import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, email, password, language } = await request.json();

    // Mock registration - in production, this would save to a database
    if (username && email && password) {
      const mockUser = {
        id: Date.now().toString(),
        email,
        username,
        token: "mock-jwt-token-" + Date.now(),
      };

      return NextResponse.json({
        user: mockUser,
        token: mockUser.token,
        message: "Registration successful",
      });
    }

    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new Response(null, { status: 200 });
}
