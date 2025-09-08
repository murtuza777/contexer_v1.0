import { NextRequest, NextResponse } from 'next/server';
import { createRequestSupabase } from '@/lib/supabase';

// POST - Update project activity timestamp
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();
    const { last_activity } = body;

    console.log('POST /api/projects/[id]/activity called for project:', projectId);

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

    // Update project activity
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        last_chat_activity: last_activity || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project activity:', updateError);
      return NextResponse.json({
        success: false,
        errors: ['Failed to update project activity']
      }, { status: 500 });
    }

    const res = NextResponse.json({
      success: true,
      project: updatedProject
    });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    return res;

  } catch (error) {
    console.error('Error in activity POST API:', error);
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
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
