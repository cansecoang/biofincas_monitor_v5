import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    // Total de productos
    const productsQuery = `
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN delivery_date >= CURRENT_DATE THEN 1 END) as active,
             COUNT(CASE WHEN delivery_date < CURRENT_DATE THEN 1 END) as completed
      FROM products
    `;
    const productsResult = await pool.query(productsQuery);
    const productsStats = productsResult.rows[0];

    // Total de tareas y su distribución por estado
    const tasksQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN s.status_name = 'Completed' THEN 1 END) as completed,
        COUNT(CASE WHEN s.status_name IN ('In Progress', 'Started') THEN 1 END) as in_progress,
        COUNT(CASE WHEN s.status_name NOT IN ('Completed', 'Cancelled') THEN 1 END) as pending
      FROM tasks t
      LEFT JOIN status s ON t.status_id = s.status_id
    `;
    const tasksResult = await pool.query(tasksQuery);
    const tasksStats = tasksResult.rows[0];

    // Total de indicadores y su progreso
    const indicatorsQuery = `
      SELECT 
        COUNT(DISTINCT i.indicator_id) as total,
        COUNT(DISTINCT CASE WHEN pi.product_id IS NOT NULL THEN i.indicator_id END) as assigned,
        ROUND(AVG(
          CASE 
            WHEN total_tasks > 0 THEN (completed_tasks::numeric / total_tasks * 100)
            ELSE 0
          END
        ), 2) as avg_progress
      FROM indicators i
      LEFT JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
      LEFT JOIN (
        SELECT 
          pi2.indicator_id,
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN s.status_name = 'Completed' THEN 1 END) as completed_tasks
        FROM product_indicators pi2
        JOIN tasks t ON t.product_id = pi2.product_id
        LEFT JOIN status s ON t.status_id = s.status_id
        GROUP BY pi2.indicator_id
      ) task_stats ON i.indicator_id = task_stats.indicator_id
    `;
    const indicatorsResult = await pool.query(indicatorsQuery);
    const indicatorsStats = indicatorsResult.rows[0];

    // Notificaciones de check-in próximas (30 días) - cuenta cada check-in individualmente
    const notificationsQuery = `
      SELECT 
        (COUNT(CASE 
          WHEN t.checkin_oro_verde >= CURRENT_DATE 
               AND t.checkin_oro_verde <= CURRENT_DATE + INTERVAL '30 days' 
          THEN 1 
        END) +
        COUNT(CASE 
          WHEN t.checkin_user >= CURRENT_DATE 
               AND t.checkin_user <= CURRENT_DATE + INTERVAL '30 days' 
          THEN 1 
        END) +
        COUNT(CASE 
          WHEN t.checkin_communication >= CURRENT_DATE 
               AND t.checkin_communication <= CURRENT_DATE + INTERVAL '30 days' 
          THEN 1 
        END) +
        COUNT(CASE 
          WHEN t.checkin_gender >= CURRENT_DATE 
               AND t.checkin_gender <= CURRENT_DATE + INTERVAL '30 days' 
          THEN 1 
        END)) as upcoming_checkins
      FROM tasks t
    `;
    const notificationsResult = await pool.query(notificationsQuery);
    const notificationsStats = notificationsResult.rows[0];

    // Actividad reciente - últimos productos creados o actualizados
    const recentActivityQuery = `
      SELECT 
        p.product_id,
        p.product_name,
        p.delivery_date,
        c.country_name,
        w.workpackage_name,
        (
          SELECT COUNT(*)
          FROM tasks t
          LEFT JOIN status s ON t.status_id = s.status_id
          WHERE t.product_id = p.product_id 
            AND s.status_name NOT IN ('Completed', 'Cancelled')
        ) as pending_tasks
      FROM products p
      LEFT JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN workpackages w ON p.workpackage_id = w.workpackage_id
      ORDER BY p.product_id DESC
      LIMIT 5
    `;
    const recentActivityResult = await pool.query(recentActivityQuery);

    // Distribución de productos por workpackage
    const workpackageDistributionQuery = `
      SELECT 
        w.workpackage_name,
        COUNT(p.product_id) as product_count
      FROM workpackages w
      LEFT JOIN products p ON w.workpackage_id = p.workpackage_id
      GROUP BY w.workpackage_id, w.workpackage_name
      ORDER BY product_count DESC
    `;
    const workpackageDistributionResult = await pool.query(workpackageDistributionQuery);

    return NextResponse.json({
      success: true,
      stats: {
        products: {
          total: parseInt(productsStats.total || '0'),
          active: parseInt(productsStats.active || '0'),
          completed: parseInt(productsStats.completed || '0')
        },
        tasks: {
          total: parseInt(tasksStats.total || '0'),
          completed: parseInt(tasksStats.completed || '0'),
          in_progress: parseInt(tasksStats.in_progress || '0'),
          pending: parseInt(tasksStats.pending || '0')
        },
        indicators: {
          total: parseInt(indicatorsStats.total || '0'),
          assigned: parseInt(indicatorsStats.assigned || '0'),
          avg_progress: parseFloat(indicatorsStats.avg_progress || '0')
        },
        notifications: {
          upcoming_checkins: parseInt(notificationsStats.upcoming_checkins || '0')
        }
      },
      recentActivity: recentActivityResult.rows,
      workpackageDistribution: workpackageDistributionResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
