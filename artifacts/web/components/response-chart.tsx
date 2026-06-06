"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ChartPoint {
  time: string;
  ms: number | null;
  status: string;
}

interface ResponseChartProps {
  data: ChartPoint[];
}

export function ResponseChart({ data }: ResponseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="msGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="time" tick={{ fill: "hsl(218 14% 42%)", fontSize: 10, fontFamily: "monospace" }} interval="preserveStartEnd" tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: "hsl(218 14% 42%)", fontSize: 10, fontFamily: "monospace" }} tickLine={false} axisLine={false} unit="ms" />
        <Tooltip
          contentStyle={{ background: "hsl(222 47% 7%)", border: "1px solid hsl(220 30% 18%)", borderRadius: 8, fontSize: 12, fontFamily: "monospace" }}
          labelStyle={{ color: "hsl(218 14% 52%)" }}
          itemStyle={{ color: "hsl(217 91% 70%)" }}
          formatter={(v: number) => [`${v}ms`, "Response"]}
        />
        <Area type="monotone" dataKey="ms" stroke="hsl(217 91% 60%)" strokeWidth={2} fill="url(#msGradient)" connectNulls={false} dot={false} activeDot={{ r: 3, fill: "hsl(217 91% 60%)", strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
