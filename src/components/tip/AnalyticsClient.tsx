// src/components/tip/AnalyticsClient.tsx
"use client";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { TrendingUp, DollarSign, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAmount } from "@/lib/utils";

interface Props {
  dailyData: Array<{ date: string; amount: number; count: number }>;
  tokenData: Array<{ token: string; amount: number }>;
  totalTips: number;
  totalAmount: number;
}

const COLORS = ["#0066FF", "#00FF94", "#FF0099", "#FFE500", "#7C3AED"];

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{formatDate(label)}</p>
      <p className="font-display font-bold text-sm">${formatAmount(payload[0].value)}</p>
      <p className="text-xs text-muted-foreground">{payload[1]?.value || 0} tips</p>
    </div>
  );
};

export function AnalyticsClient({ dailyData, tokenData, totalTips, totalAmount }: Props) {
  const avgTip = totalTips > 0 ? totalAmount / totalTips : 0;
  const peakDay = dailyData.reduce((best, d) => d.amount > best.amount ? d : best, dailyData[0] || { amount: 0, date: "" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl">Analytics</h1>
        <p className="text-muted-foreground mt-1">30-day tip performance</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total received", value: `$${formatAmount(totalAmount)}`, icon: DollarSign, color: "text-neon-green", bg: "bg-green-500/10" },
          { label: "Total tips", value: totalTips.toString(), icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Average tip", value: `$${formatAmount(avgTip)}`, icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="font-display font-black text-2xl mb-0.5">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Daily chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily tips (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return d.getDate() % 5 === 0 ? formatDate(v) : "";
                }}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#0066FF"
                strokeWidth={2}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Token breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Token breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {tokenData.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={tokenData}
                    dataKey="amount"
                    nameKey="token"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {tokenData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Peak day */}
        <Card>
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Best day (30d)</p>
              <p className="font-display font-bold text-xl">${formatAmount(peakDay?.amount || 0)}</p>
              {peakDay?.date && <p className="text-sm text-muted-foreground">{formatDate(peakDay.date)}</p>}
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Days with tips</p>
              <p className="font-display font-bold text-xl">
                {dailyData.filter((d) => d.count > 0).length}
                <span className="text-muted-foreground font-normal text-base"> / 30</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">7-day trend</p>
              <p className="font-display font-bold text-xl">
                ${formatAmount(dailyData.slice(-7).reduce((s, d) => s + d.amount, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
