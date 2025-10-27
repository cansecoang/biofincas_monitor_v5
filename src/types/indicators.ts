export interface IndicatorPerformance {
  indicator_id: number;
  indicator_code: string;
  indicator_name: string;
  indicator_description: string;
  workpackage_id: number;
  workpackage_name: string;
  output_number: number;
  output_name: string;
  assigned_products_count: number;
  assigned_products: {
    product_id: number;
    product_name: string;
    country_name: string;
    workpackage_name: string;
  }[];
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  overdue_tasks: number;
  status_distribution: { status_name: string; count: number; percentage: number }[];
  trend: 'up' | 'down' | 'stable';
  performance_rating: 'excellent' | 'good' | 'warning' | 'critical';
}
