import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // 'oro_verde', 'user', 'communication', 'gender', o null para todos

    // Query para obtener todos los check-ins de todas las tareas
    const query = `
      SELECT 
        t.task_id,
        t.task_name,
        t.checkin_oro_verde,
        t.checkin_user,
        t.checkin_communication,
        t.checkin_gender,
        t.product_id,
        p.product_name,
        p.country_id,
        c.country_name,
        p.product_owner_id,
        org.organization_name as product_owner_name,
        t.responsable_id,
        resp_org.organization_name as responsable_name
      FROM tasks t
      INNER JOIN products p ON t.product_id = p.product_id
      LEFT JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN organizations org ON p.product_owner_id = org.organization_id
      LEFT JOIN organizations resp_org ON t.responsable_id = resp_org.organization_id
      WHERE 
        t.checkin_oro_verde IS NOT NULL 
        OR t.checkin_user IS NOT NULL 
        OR t.checkin_communication IS NOT NULL 
        OR t.checkin_gender IS NOT NULL
      ORDER BY 
        GREATEST(
          COALESCE(t.checkin_oro_verde, '1970-01-01'::timestamp),
          COALESCE(t.checkin_user, '1970-01-01'::timestamp),
          COALESCE(t.checkin_communication, '1970-01-01'::timestamp),
          COALESCE(t.checkin_gender, '1970-01-01'::timestamp)
        ) DESC
    `;

    const result = await pool.query(query);

    // Transformar los datos en un array de notificaciones individuales por cada check-in
    const notifications: any[] = [];

    result.rows.forEach((row) => {
      // Check-in Oro Verde
      if (row.checkin_oro_verde) {
        notifications.push({
          id: `${row.task_id}-oro_verde`,
          task_id: row.task_id,
          product_id: row.product_id,
          category: 'Oro Verde',
          category_key: 'oro_verde',
          checkin_date: row.checkin_oro_verde,
          task_name: row.task_name,
          product_name: row.product_name,
          country_name: row.country_name,
          product_owner_name: row.product_owner_name,
          responsable_name: row.responsable_name
        });
      }

      // Check-in User
      if (row.checkin_user) {
        notifications.push({
          id: `${row.task_id}-user`,
          task_id: row.task_id,
          product_id: row.product_id,
          category: 'User',
          category_key: 'user',
          checkin_date: row.checkin_user,
          task_name: row.task_name,
          product_name: row.product_name,
          country_name: row.country_name,
          product_owner_name: row.product_owner_name,
          responsable_name: row.responsable_name
        });
      }

      // Check-in Communication
      if (row.checkin_communication) {
        notifications.push({
          id: `${row.task_id}-communication`,
          task_id: row.task_id,
          product_id: row.product_id,
          category: 'Communication',
          category_key: 'communication',
          checkin_date: row.checkin_communication,
          task_name: row.task_name,
          product_name: row.product_name,
          country_name: row.country_name,
          product_owner_name: row.product_owner_name,
          responsable_name: row.responsable_name
        });
      }

      // Check-in Gender
      if (row.checkin_gender) {
        notifications.push({
          id: `${row.task_id}-gender`,
          task_id: row.task_id,
          product_id: row.product_id,
          category: 'Gender',
          category_key: 'gender',
          checkin_date: row.checkin_gender,
          task_name: row.task_name,
          product_name: row.product_name,
          country_name: row.country_name,
          product_owner_name: row.product_owner_name,
          responsable_name: row.responsable_name
        });
      }
    });

    // Ordenar todas las notificaciones por fecha (más reciente primero)
    notifications.sort((a, b) => {
      const dateA = new Date(a.checkin_date).getTime();
      const dateB = new Date(b.checkin_date).getTime();
      return dateB - dateA;
    });

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
