import { NextRequest, NextResponse } from 'next/server';
import { createRequestSupabase } from '@/lib/supabase';

// GET - Load chat messages for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    console.log('GET /api/projects/[id]/chat called for project:', projectId);

    // Create per-request Supabase client
    const supabase = createRequestSupabase(request);
    
    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        errors: ['Authentication required']
      }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        errors: ['Invalid authentication']
      }, { status: 401 });
    }

    // Get project and verify ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, chat_messages, last_chat_activity')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({
        success: false,
        errors: ['Project not found']
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      messages: project.chat_messages || [],
      last_activity: project.last_chat_activity
    });

  } catch (error) {
    console.error('Error in chat GET API:', error);
    return NextResponse.json({
      success: false,
      errors: ['Internal server error']
    }, { status: 500 });
  }
}

// POST - Save chat messages for a project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();
    const { messages } = body;

    console.log('POST /api/projects/[id]/chat called for project:', projectId);

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({
        success: false,
        errors: ['Messages array is required']
      }, { status: 400 });
    }

    // Create per-request Supabase client
    const supabase = createRequestSupabase(request);
    
    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        errors: ['Authentication required']
      }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        errors: ['Invalid authentication']
      }, { status: 401 });
    }

    // Update project with chat messages
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        chat_messages: messages,
        last_chat_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project chat messages:', updateError);
      return NextResponse.json({
        success: false,
        errors: ['Failed to save chat messages']
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      project: updatedProject
    });

  } catch (error) {
    console.error('Error in chat POST API:', error);
    return NextResponse.json({
      success: false,
      errors: ['Internal server error']
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
