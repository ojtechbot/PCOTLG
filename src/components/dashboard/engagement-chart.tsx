
"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useAuth } from "@/hooks/use-auth"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useEffect, useState } from "react"
import { Skeleton } from "../ui/skeleton"

const chartConfig = {
  requests: {
    label: "Prayer Requests",
    color: "hsl(var(--chart-1))",
  },
  sermons: {
    label: "Sermons Watched",
    color: "hsl(var(--chart-2))",
  },
}

export function EngagementChart() {
    const { user } = useAuth();
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // This is a placeholder for real monthly data aggregation
        // In a real app, this would likely involve Cloud Functions to aggregate data monthly
        const prayerQuery = query(collection(db, "prayerRequests"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(prayerQuery, (snapshot) => {
            const now = new Date();
            const currentMonthName = now.toLocaleString('default', { month: 'long' });

            // Mocking data for the last 6 months for demonstration
            const data = Array.from({ length: 6 }).map((_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                return {
                    month: d.toLocaleString('default', { month: 'short' }),
                    requests: 0, // Start with 0
                    sermons: Math.floor(Math.random() * 20) + 5
                }
            }).reverse();

            // Aggregate real prayer request data by month
            snapshot.docs.forEach(doc => {
                const docDate = doc.data().createdAt?.toDate();
                if(docDate) {
                    const monthShort = docDate.toLocaleString('default', { month: 'short' });
                    const monthData = data.find(d => d.month === monthShort);
                    if(monthData) {
                        monthData.requests += 1;
                    }
                }
            });

            setChartData(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return <Skeleton className="w-full h-[300px]" />;
    }

    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <RechartsBarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="requests" fill="var(--color-requests)" radius={4} />
            <Bar dataKey="sermons" fill="var(--color-sermons)" radius={4} />
            </RechartsBarChart>
        </ChartContainer>
    )
}
