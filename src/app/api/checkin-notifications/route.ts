import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // nombre de la organización para filtrar, o null para todos

    // Query para obtener todos los check-ins de la tabla checkins
    // Filtra solo check-ins que están dentro de los próximos 30 días
    const query = `
      SELECT 
        c.checkin_id,
        c.checkin_date,
        c.checkin_description,
        c.task_id,
        t.task_name,
        t.product_id,
        p.product_name,
        org_with.organization_name as checkin_with_name,
        org_owner.organization_name as product_owner_name
      FROM checkins c
      INNER JOIN tasks t ON c.task_id = t.task_id
      INNER JOIN products p ON t.product_id = p.product_id
      LEFT JOIN organizations org_with ON c.checkin_with_id = org_with.organization_id
      LEFT JOIN organizations org_owner ON p.product_owner_id = org_owner.organization_id
      WHERE c.checkin_date >= CURRENT_DATE 
        AND c.checkin_date <= CURRENT_DATE + INTERVAL '30 days'
      ORDER BY c.checkin_date ASC
    `;

    const result = await pool.query(query);

    // Transformar los datos en notificaciones
    const notifications = result.rows.map((row) => ({
      id: `checkin-${row.checkin_id}`,
      checkin_id: row.checkin_id,
      task_id: row.task_id,
      product_id: row.product_id,
      category: row.checkin_with_name || 'General',
      category_key: row.checkin_with_name?.toLowerCase().replace(/\s+/g, '_') || 'general',
      checkin_date: row.checkin_date,
      checkin_description: row.checkin_description,
      task_name: row.task_name,
      product_name: row.product_name,
      organization_name: row.checkin_with_name,
      product_owner_name: row.product_owner_name
    }));

    // Filtrar por categoría si se proporciona
    const filteredNotifications = category && category !== 'all'
      ? notifications.filter(n => n.category_key === category)
      : notifications;

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications,
      total_count: notifications.length,
      filtered_count: filteredNotifications.length
    });

  } catch (error) {
    console.error('Error fetching check-in notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
