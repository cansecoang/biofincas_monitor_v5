import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Verificar que la tarea existe antes de borrarla
      const checkQuery = 'SELECT task_id FROM tasks WHERE task_id = $1';
      const checkResult = await client.query(checkQuery, [parseInt(taskId)]);
      
      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      // Borrar la tarea
      const deleteQuery = 'DELETE FROM tasks WHERE task_id = $1';
      await client.query(deleteQuery, [parseInt(taskId)]);
      
      return NextResponse.json({
        success: true,
        message: 'Task deleted successfully'
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
