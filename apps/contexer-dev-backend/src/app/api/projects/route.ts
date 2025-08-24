import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient, createRequestSupabase } from '@/lib/supabase';
import { 
  CreateProjectRequest, 
  UpdateProjectRequest,
  DEFAULT_PROJECT_CONTEXT,
  validateProjectContext,
  sanitizeProjectContext
} from '@/types/context';

// GET - List all projects for authenticated user
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/projects called');
    
    // Create per-request Supabase client (uses user's Authorization header)
    const supabase = createRequestSupabase(request);
    
    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('No authorization header found');
      return NextResponse.json({
        success: false,
        errors: ['Authentication required']
      }, { status: 401 });
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');
    console.log('Attempting to authenticate with token...');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Authentication failed:', authError?.message);
      return NextResponse.json({
        success: false,
        errors: ['Invalid authentication']
      }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    // Get all projects for the user
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json({
        success: false,
        errors: ['Failed to fetch projects']
      }, { status: 500 });
    }

    console.log('Projects fetched successfully:', projects?.length || 0);

    return NextResponse.json({
      success: true,
      projects: projects || []
    });

  } catch (error) {
    console.error('Error in projects GET API:', error);
    return NextResponse.json({
      success: false,
      errors: ['Internal server error']
    }, { status: 500 });
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/projects called');
    
    const body: CreateProjectRequest = await request.json();
    const { name, description, context } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        errors: ['Project name is required']
      }, { status: 400 });
    }

    // Validate context if provided
    const projectContext = context || DEFAULT_PROJECT_CONTEXT;
    const validation = validateProjectContext(projectContext);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        errors: validation.errors
      }, { status: 400 });
    }

    // Create per-request Supabase client (uses user's Authorization header)
    const supabase = createRequestSupabase(request);
    
    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        errors: ['Authentication required']
      }, { status: 401 });
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        errors: ['Invalid authentication']
      }, { status: 401 });
    }

    // Sanitize and prepare context with timestamps
    const sanitizedContext = sanitizeProjectContext(projectContext);
    const contextWithTimestamps = {
      ...sanitizedContext,
      created_at: new Date().toISOString(),
      version: projectContext.version || '1.0.0'
    };

    // Create new project
    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        context: contextWithTimestamps,
        status: 'draft'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating project:', createError);
      return NextResponse.json({
        success: false,
        errors: ['Failed to create project']
      }, { status: 500 });
    }

    console.log('Project created successfully:', newProject.id);

    return NextResponse.json({
      success: true,
      project: newProject
    }, { status: 201 });

  } catch (error) {
    console.error('Error in projects POST API:', error);
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
