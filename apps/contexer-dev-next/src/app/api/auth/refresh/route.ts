import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    // Refresh the session
    const { data: authData, error: authError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    if (!authData.session) {
      return NextResponse.json(
        { error: 'Failed to refresh session' },
        { status: 401 }
      )
    }

    // Return new session data
    return NextResponse.json({
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        username: authData.user?.user_metadata?.username || authData.user?.email?.split('@')[0],
        avatar: authData.user?.user_metadata?.avatar_url || null
      },
      session: authData.session,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      message: 'Token refreshed successfully'
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200 })
}
