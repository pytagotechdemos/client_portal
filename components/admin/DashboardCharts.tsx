"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Invoice = {
  amount: number;
  status: string;
  createdAt: Date;
};

export function DashboardCharts({ invoices }: { invoices: Invoice[] }) {
  const data = useMemo(() => {
    // Group revenue by month
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    // Initialize data array with 12 months
    const chartData = months.map(month => ({ name: month, Revenue: 0 }));
    
    invoices.forEach(inv => {
      const date = new Date(inv.createdAt);
      if (date.getFullYear() === currentYear && inv.status === "PAID") {
        const monthIndex = date.getMonth();
        chartData[monthIndex].Revenue += inv.amount;
      }
    });
    
    // Return only the months up to current month for better UX
    const currentMonth = new Date().getMonth();
    return chartData.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
  }, [invoices]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#3F3F46" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#A1A1AA" 
          tick={{fill: '#A1A1AA'}}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#A1A1AA" 
          tick={{fill: '#A1A1AA'}}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          cursor={{fill: '#3F3F46', opacity: 0.4}}
          contentStyle={{ backgroundColor: '#18181B', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff' }}
          formatter={(value: number) => [`$${value}`, 'Revenue']}
        />
        <Bar dataKey="Revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
