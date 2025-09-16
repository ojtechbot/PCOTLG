
"use client"

import { Pie, PieChart, Cell } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from "@/components/ui/chart"

interface ChartData {
    name: string;
    value: number;
    fill: string;
}

interface ContentDistributionChartProps {
    data: ChartData[];
}

export function ContentDistributionChart({ data }: ContentDistributionChartProps) {
    return (
        <ChartContainer config={{}} className="mx-auto aspect-square h-[300px]">
            <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie data={data.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
            </PieChart>
        </ChartContainer>
    )
}
