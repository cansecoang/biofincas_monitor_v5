import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const phaseId = searchParams.get('phaseId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'start_planned';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const offset = (page - 1) * limit;
    
    // Mapeo de columnas del frontend a las columnas reales de la BD (whitelist para prevenir SQL injection)
    const columnMapping: { [key: string]: string } = {
      'name': 't.task_name',
      'start_planned': 't.start_date_planned',
      'end_planned': 't.end_date_planned',
      'status_name': 's.status_name',
      'phase_name': 'p.phase_name',
      'org_name': 'o.organization_name'
    };
    
    const orderByColumn = columnMapping[sortBy] || 't.start_date_planned';
    
    // Validar sortOrder para prevenir SQL injection
    const validSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    
    // Query para obtener las tareas del producto
    const query = `
      SELECT
        t.task_id               AS id,
        t.task_name             AS name,
        t.task_detail           AS detail,
        t.start_date_planned    AS start_planned,
        t.end_date_planned      AS end_planned,
        t.start_date_actual     AS start_actual,
        t.end_date_actual       AS end_actual,
        t.checkin_oro_verde     AS checkin_oro_verde,
        t.checkin_user          AS checkin_user,
        t.checkin_communication AS checkin_communication,
        t.checkin_gender        AS checkin_gender,
        t.phase_id              AS phase_id,
        p.phase_name            AS phase_name,
        t.status_id             AS status_id,
        s.status_name           AS status_name,
        t.responsable_id        AS org_id,
        o.organization_name     AS org_name,
        t.product_id            AS product_id,
        z.product_name          AS product_name,
        t.created_at,
        t.updated_at
      FROM tasks t
      LEFT JOIN phases        p ON p.phase_id        = t.phase_id
      LEFT JOIN status        s ON s.status_id       = t.status_id
      LEFT JOIN organizations o ON o.organization_id = t.responsable_id
      LEFT JOIN products      z ON z.product_id      = t.product_id
      WHERE t.product_id = $1 ${phaseId ? 'AND t.phase_id = $3' : ''}
      ORDER BY ${orderByColumn} ${validSortOrder} NULLS LAST, t.task_id
      LIMIT $2 OFFSET ${phaseId ? '$4' : '$3'}
    `;
    
    // Query para contar el total de tareas
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tasks t
      WHERE t.product_id = $1 ${phaseId ? 'AND t.phase_id = $2' : ''}
    `;
    
    // Preparar parámetros según si hay filtro de fase o no
    const taskParams = phaseId 
      ? [productId, limit, phaseId, offset]
      : [productId, limit, offset];
    
    const countParams = phaseId 
      ? [productId, phaseId]
      : [productId];
    
    const [tasksResult, countResult] = await Promise.all([
      pool.query(query, taskParams),
      pool.query(countQuery, countParams)
    ]);
    
    const totalTasks = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalTasks / limit);
    
    return NextResponse.json({
      tasks: tasksResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalTasks,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
