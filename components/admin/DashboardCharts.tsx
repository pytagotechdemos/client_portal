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
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

type Invoice = {
  totalAmount: number;
  status: string;
  createdAt: Date;
};

type Project = {
  status: string;
};

const PIE_COLORS = ["#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#64748B"];

export function RevenueChart({ invoices }: { invoices: Invoice[] }) {
  const data = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const chartData = months.map(month => ({ name: month, Revenue: 0 }));
    
    invoices.forEach(inv => {
      const date = new Date(inv.createdAt);
      if (date.getFullYear() === currentYear && inv.status === "PAID") {
        const monthIndex = date.getMonth();
        chartData[monthIndex].Revenue += inv.totalAmount;
      }
    });
    
    const currentMonth = new Date().getMonth();
    return chartData.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
  }, [invoices]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3F3F46" vertical={false} />
        <XAxis dataKey="name" stroke="#A1A1AA" tick={{fill: '#A1A1AA'}} tickLine={false} axisLine={false} />
        <YAxis stroke="#A1A1AA" tick={{fill: '#A1A1AA'}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
        <Tooltip cursor={{fill: '#3F3F46', opacity: 0.4}} contentStyle={{ backgroundColor: '#18181B', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff' }} formatter={(val: number) => [`$${val}`, 'Revenue']} />
        <Bar dataKey="Revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProjectStatusChart({ projects }: { projects: Project[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    // Map enum values to readable labels
    const statusLabels: Record<string, string> = {
      'ACTIVE': 'Active',
      'ON_HOLD': 'On Hold',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    };
    projects.forEach(p => {
      const label = statusLabels[p.status] || p.status;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [projects]);

  if (data.length === 0) return <div className="text-center text-muted mt-10">No projects data</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#18181B', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff' }} />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#A1A1AA' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function InvoiceStatusChart({ invoices }: { invoices: Invoice[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    // Map enum values to readable labels
    const statusLabels: Record<string, string> = {
      'DRAFT': 'Draft',
      'SENT': 'Sent',
      'PAID': 'Paid',
      'OVERDUE': 'Overdue'
    };
    invoices.forEach(i => {
      const label = statusLabels[i.status] || i.status;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  if (data.length === 0) return <div className="text-center text-muted mt-10">No invoices data</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#18181B', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff' }} />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#A1A1AA' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
