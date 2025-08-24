import { NextRequest, NextResponse } from 'next/server';
import { createRequestSupabase } from '@/lib/supabase';
import { GetContextResponse } from '@/types/context';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const include_versions = searchParams.get('include_versions') === 'true';

    if (!project_id) {
      return NextResponse.json({
        success: false,
        errors: ['Project ID is required']
      } as GetContextResponse, { status: 400 });
    }

    // Create Supabase client
    const supabase = createRequestSupabase(request);
    
    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        errors: ['Authentication required']
      } as GetContextResponse, { status: 401 });
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        errors: ['Invalid authentication']
      } as GetContextResponse, { status: 401 });
    }

    // Get project with context
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('context')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({
        success: false,
        errors: ['Project not found or access denied']
      } as GetContextResponse, { status: 404 });
    }

    let versions = undefined;
    
    // Get context versions if requested
    if (include_versions) {
      const { data: versionData, error: versionError } = await supabase
        .from('context_versions')
        .select('*')
        .eq('project_id', project_id)
        .order('version_number', { ascending: false })
        .limit(10);

      if (!versionError && versionData) {
        versions = versionData;
      }
    }

    return NextResponse.json({
      success: true,
      context: project.context,
      versions
    } as GetContextResponse);

  } catch (error) {
    console.error('Error in context get API:', error);
    return NextResponse.json({
      success: false,
      errors: ['Internal server error']
    } as GetContextResponse, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
