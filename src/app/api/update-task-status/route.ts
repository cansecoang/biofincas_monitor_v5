import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const { taskId, statusId } = await request.json();

    if (!taskId || !statusId) {
      return NextResponse.json(
        { success: false, error: 'taskId and statusId are required' },
        { status: 400 }
      );
    }

    // Update task status
    const updateQuery = `
      UPDATE tasks 
      SET status_id = $1
      WHERE task_id = $2
      RETURNING task_id
    `;
    
    const result = await pool.query(updateQuery, [statusId, taskId]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task status updated successfully'
    });

  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task status' },
      { status: 500 }
    );
  }
}
