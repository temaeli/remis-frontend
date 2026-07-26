import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Configure and export echarts instance
export function getConfiguredECharts() {
  echarts.use([
    BarChart,
    LineChart,
    PieChart,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    TitleComponent,
    CanvasRenderer,
  ]);

  return echarts;
}
