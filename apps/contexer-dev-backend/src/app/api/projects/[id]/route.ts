import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { 
  UpdateProjectRequest,
  validateProjectContext,
  sanitizeProjectContext
} from '@/types/context';

// GET - Get specific project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Create Supabase client
    const supabase = createSupabaseClient();
    
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        errors: ['Invalid authentication']
      }, { status: 401 });
    }

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({
        success: false,
        errors: ['Project not found or access denied']
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project
    });

  } catch (error) {
    console.error('Error in project GET API:', error);
    return NextResponse.json({
      success: false,
      errors: ['Internal server error']
    }, { status: 500 });
  }
}

// PUT - Update specific project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body: UpdateProjectRequest = await request.json();
    const { name, description, context, status } = body;

    // Validate context if provided
    if (context) {
      const validation = validateProjectContext(context);
      if (!validation.isValid) {
        return NextResponse.json({
          success: false,
          errors: validation.errors
        }, { status: 400 });
      }
    }

    // Create Supabase client
    const supabase = createSupabaseClient();
    
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        errors: ['Invalid authentication']
      }, { status: 401 });
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({
          success: false,
          errors: ['Project name cannot be empty']
        }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (context !== undefined) {
      const sanitizedContext = sanitizeProjectContext(context);
      updateData.context = sanitizedContext;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    // Handle new fields for state management
    if (body.generation_status !== undefined) {
      updateData.generation_status = body.generation_status;
    }
    
    if (body.project_path !== undefined) {
      updateData.project_path = body.project_path;
    }
    
    if (body.chat_uuid !== undefined) {
      updateData.chat_uuid = body.chat_uuid;
    }

    // Update project
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project:', updateError);
      return NextResponse.json({
        success: false,
        errors: ['Failed to update project']
      }, { status: 500 });
    }

    if (!updatedProject) {
      return NextResponse.json({
        success: false,
        errors: ['Project not found or access denied']
      }, { status: 404 });
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
    console.error('Error in project PUT API:', error);
    return NextResponse.json({
      success: false,
      errors: ['Internal server error']
    }, { status: 500 });
  }
}

// DELETE - Delete specific project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Create Supabase client
    const supabase = createSupabaseClient();
    
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        errors: ['Invalid authentication']
      }, { status: 401 });
    }

    // Delete project (cascading deletes will handle related records)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return NextResponse.json({
        success: false,
        errors: ['Failed to delete project']
      }, { status: 500 });
    }

    const res = NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    return res;

  } catch (error) {
    console.error('Error in project DELETE API:', error);
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
