import { NextRequest, NextResponse } from 'next/server';
import { createRequestSupabase } from '@/lib/supabase';
import { 
  SaveContextRequest, 
  SaveContextResponse, 
  validateProjectContext,
  sanitizeProjectContext,
  ProjectContext 
} from '@/types/context';

export async function POST(request: NextRequest) {
  try {
    const body: SaveContextRequest = await request.json();
    const { project_id, context } = body;

    // Validate the context data
    const validation = validateProjectContext(context);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        errors: validation.errors
      } as SaveContextResponse, { status: 400 });
    }

    // Create Supabase client
    const supabase = createRequestSupabase(request);
    
    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        errors: ['Authentication required']
      } as SaveContextResponse, { status: 401 });
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        errors: ['Invalid authentication']
      } as SaveContextResponse, { status: 401 });
    }

    // Check if project exists and user owns it
    const { data: existingProject, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (projectError || !existingProject) {
      return NextResponse.json({
        success: false,
        errors: ['Project not found or access denied']
      } as SaveContextResponse, { status: 404 });
    }

    // Sanitize and prepare context with timestamps
    const sanitizedContext = sanitizeProjectContext(context);
    const contextWithTimestamps: ProjectContext = {
      ...sanitizedContext,
      created_at: context.created_at || new Date().toISOString(),
      version: context.version || '1.0.0'
    };

    // Update project with new context
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        context: contextWithTimestamps,
        updated_at: new Date().toISOString()
      })
      .eq('id', project_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project context:', updateError);
      return NextResponse.json({
        success: false,
        errors: ['Failed to save context']
      } as SaveContextResponse, { status: 500 });
    }

    // Check if a new context version was created (handled by database trigger)
    const { data: latestVersion } = await supabase
      .from('context_versions')
      .select('*')
      .eq('project_id', project_id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const versionCreated = latestVersion && 
      new Date(latestVersion.created_at).getTime() > new Date().getTime() - 5000; // Created in last 5 seconds

    return NextResponse.json({
      success: true,
      project: updatedProject,
      version_created: !!versionCreated
    } as SaveContextResponse);

  } catch (error) {
    console.error('Error in context save API:', error);
    return NextResponse.json({
      success: false,
      errors: ['Internal server error']
    } as SaveContextResponse, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
