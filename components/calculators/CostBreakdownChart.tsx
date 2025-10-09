// ./components/calculators/CostBreakdownChart.tsx

'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
} from 'recharts';

// Define the shape of the data prop
interface ChartData {
  name: string;
  value: number;
}

interface CostBreakdownChartProps {
  data: ChartData[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ data }) => {
  // Don't render the chart if there's no data to display
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-500">Enter values to see cost breakdown.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <ChartTooltip formatter={(value: number) => `${value.toFixed(4)} ETH`} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CostBreakdownChart;