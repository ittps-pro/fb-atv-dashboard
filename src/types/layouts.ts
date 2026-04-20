import type { WidgetVisibility } from '@/store/use-dashboard-store';

export interface LayoutTemplate {
  id: string;
  name: string;
  layout: (keyof WidgetVisibility)[];
}
