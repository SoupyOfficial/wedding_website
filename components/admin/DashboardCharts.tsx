"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend,
} from "recharts";

interface MealCount { name: string; count: number }
interface TrendPoint { date: string; cumulative: number }
interface DietaryCount { name: string; count: number }

interface Props {
  mealData: MealCount[];
  trendData: TrendPoint[];
  dietaryData: DietaryCount[];
}

const GOLD = "#C9A84C";
const COLORS = ["#C9A84C", "#7C5C9E", "#3A7D44", "#C94C4C", "#4C7BC9", "#C97A4C"];

const TooltipStyle = {
  contentStyle: { background: "#0d0d2b", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "8px", color: "#e8e0d0" },
  labelStyle: { color: "#C9A84C" },
  itemStyle: { color: "#e8e0d0" },
};

export default function DashboardCharts({ mealData, trendData, dietaryData }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Meal Breakdown */}
      {mealData.length > 0 && (
        <div className="bg-royal/20 border border-gold/10 rounded-lg p-6">
          <h3 className="text-gold font-serif text-lg mb-4">Meal Selections</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={mealData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {mealData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...TooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Dietary Needs */}
      {dietaryData.length > 0 && (
        <div className="bg-royal/20 border border-gold/10 rounded-lg p-6">
          <h3 className="text-gold font-serif text-lg mb-4">Dietary Needs</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dietaryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: "#e8e0d080", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#e8e0d080", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TooltipStyle} />
              <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* RSVP Trend */}
      {trendData.length > 0 && (
        <div className="bg-royal/20 border border-gold/10 rounded-lg p-6 md:col-span-2">
          <h3 className="text-gold font-serif text-lg mb-4">RSVP Response Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <XAxis dataKey="date" tick={{ fill: "#e8e0d080", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#e8e0d080", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TooltipStyle} />
              <Line type="monotone" dataKey="cumulative" stroke={GOLD} strokeWidth={2} dot={false} name="Total Responses" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
