import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { subMonths, isAfter, format, startOfWeek, parseISO } from "date-fns";
import { TrendingUp, Target, Award, Send } from "lucide-react";

const STATUS_COLORS = {
    "To Apply": "#9ca3af",
    "Applied": "#3b82f6",
    "Interview": "#8b5cf6",
    "Offer": "#22c55e",
    "Rejected": "#ef4444",
};

export default function Analytics() {
    const [timeRange, setTimeRange] = useState("3M");

    const { data: jobs = [] } = useQuery({
        queryKey: ['jobs'],
        queryFn: () => base44.entities.JobApplication.list("-created_date"),
    });

    const cutoff = timeRange === "1M"
        ? subMonths(new Date(), 1)
        : timeRange === "3M"
        ? subMonths(new Date(), 3)
        : subMonths(new Date(), 12);

    const filtered = jobs.filter(j => {
        try { return isAfter(parseISO(j.created_date), cutoff); } catch { return false; }
    });

    const total = filtered.length;
    const interviews = filtered.filter(j => j.status === "Interview").length;
    const offers = filtered.filter(j => j.status === "Offer").length;
    const sentCount = filtered.filter(j => j.status !== "To Apply").length;
    const responseRate = sentCount > 0 ? Math.round((interviews / sentCount) * 100) : 0;

    const weeklyData = (() => {
        const weeks = {};
        filtered.forEach(j => {
            try {
                const week = format(startOfWeek(parseISO(j.created_date)), "MMM d");
                weeks[week] = (weeks[week] || 0) + 1;
            } catch {}
        });
        return Object.entries(weeks)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .slice(-8)
            .map(([week, count]) => ({ week, count }));
    })();

    const statusData = Object.entries(
        filtered.reduce((acc, j) => {
            acc[j.status] = (acc[j.status] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const companyCounts = filtered.reduce((acc, j) => {
        if (j.company) acc[j.company] = (acc[j.company] || 0) + 1;
        return acc;
    }, {});
    const topCompanies = Object.entries(companyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

    const typeCounts = filtered.reduce((acc, j) => {
        const t = j.job_type || "Other";
        acc[t] = (acc[t] || 0) + 1;
        return acc;
    }, {});
    const typeData = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

    const funnelSteps = [
        { label: "Sent", value: sentCount },
        { label: "Interview", value: interviews },
        { label: "Offer", value: offers },
    ];
    const funnelMax = funnelSteps[0]?.value || 1;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-sm text-gray-500">Track your job search performance</p>
                </div>
                <div className="flex gap-2">
                    {["1M", "3M", "1Y"].map(r => (
                        <Button
                            key={r}
                            variant={timeRange === r ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTimeRange(r)}
                            className={timeRange === r ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                        >
                            {r}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Applications", value: total, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Response Rate", value: `${responseRate}%`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Interviews", value: interviews, icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Offers", value: offers, icon: Send, color: "text-green-600", bg: "bg-green-50" },
                ].map(stat => (
                    <Card key={stat.label} className="border-none shadow-sm">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-xs text-gray-500">{stat.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">Applications per Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                                        {statusData.map((entry, i) => (
                                            <Cell key={i} fill={STATUS_COLORS[entry.name] || "#9ca3af"} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">Top Companies Applied To</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topCompanies} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">Contract Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={typeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-500">Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {funnelSteps.map((step, i) => (
                        <div key={step.label} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700">{step.label}</span>
                                <span className="text-gray-500">
                                    {step.value} ({funnelMax > 0 ? Math.round((step.value / funnelMax) * 100) : 0}%)
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${funnelMax > 0 ? (step.value / funnelMax) * 100 : 0}%`,
                                        backgroundColor: ["#6366f1", "#8b5cf6", "#22c55e"][i]
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
