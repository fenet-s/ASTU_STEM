import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Ticket,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { analyticsService } from "../services/api";

const COLORS = ["#3B82F6", "#4ADE80", "#FBBF24", "#8B5CF6", "#F43F5E"];

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className="p-3 bg-brand-blue-light/30 rounded-xl text-brand-blue">
        <Icon size={24} />
      </div>
    </div>
    <div className="flex items-center gap-1">
      {trend === "up" ? (
        <TrendingUp size={16} className="text-emerald-500" />
      ) : (
        <TrendingDown size={16} className="text-rose-500" />
      )}
      <span className={trend === "up" ? "text-emerald-500" : "text-rose-500"}>
        {change}
      </span>
      <span className="text-slate-400 text-xs ml-1">vs last month</span>
    </div>
  </div>
);

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const stats = await analyticsService.getStats();
      setData(stats);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      // If it's a database connection error, we'll show that specifically
      if (error.message.includes("Database not connected")) {
        setData({
          error:
            "Database not connected. Please check your MONGO_URI configuration.",
        });
      } else {
        setData({ error: error.message || "Failed to load analytics data." });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center">
        <p className="text-rose-600 font-medium mb-2">Analytics Unavailable</p>
        <p className="text-rose-500 text-sm">{data.error}</p>
        <button
          onClick={() => {
            setLoading(true);
            fetchStats();
          }}
          className="mt-4 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-sm font-semibold hover:bg-rose-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Complaints"
          value={data.totalComplaints.toLocaleString()}
          change="8.5%"
          icon={Ticket}
          trend="up"
        />
        <StatCard
          title="Active Users"
          value={data.activeUsers.toLocaleString()}
          change="2.1%"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Avg Resolution Time"
          value={`${data.avgResolutionTime} Days`}
          change="-0.4 Days"
          icon={Clock}
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-slate-800 font-bold mb-8">
            Complaints by Category
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.categoryStats.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-slate-800 font-bold mb-8">
            Resolution Rates (Last 6 Months)
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.resolutionRates}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="rate"
                  fill="#7c8c7c"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                  label={{
                    position: "top",
                    fill: "#64748b",
                    fontSize: 12,
                    formatter: (val: number) => `${val}%`,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
