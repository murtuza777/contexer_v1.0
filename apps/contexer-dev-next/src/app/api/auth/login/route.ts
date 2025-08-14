import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { email, password, language } = await request.json();

    // Mock authentication - in production, this would validate against a database
    if (email && password) {
      const mockUser = {
        id: "1",
        email,
        username: email.split('@')[0],
        token: "mock-jwt-token-" + Date.now(),
      };

      return NextResponse.json({
        user: mockUser,
        token: mockUser.token,
        message: "Login successful",
      });
    }

    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
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
