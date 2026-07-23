import React from "react";
import { Briefcase, Send, MessageSquare, Gift, XCircle, TrendingUp } from "lucide-react";

const statConfig = [
    { key: "total", label: "Total", icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
    { key: "applied", label: "Applied", icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
    { key: "interviews", label: "Interviews", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
    { key: "offers", label: "Offers", icon: Gift, color: "text-green-600", bg: "bg-green-50" },
    { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { key: "rate", label: "Response Rate", icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" },
];

export default function StatsBar({ jobs }) {
    const total = jobs.length;
    const applied = jobs.filter(j => j.status === "Applied").length;
    const interviews = jobs.filter(j => j.status === "Interview").length;
    const offers = jobs.filter(j => j.status === "Offer").length;
    const rejected = jobs.filter(j => j.status === "Rejected").length;
    const sentCount = jobs.filter(j => j.status !== "To Apply").length;
    const rate = sentCount > 0 ? `${Math.round((interviews / sentCount) * 100)}%` : "—";

    const values = { total, applied, interviews, offers, rejected, rate };

    return (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {statConfig.map(stat => (
                <div key={stat.key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">{values[stat.key]}</div>
                        <div className="text-[10px] text-gray-500 leading-tight">{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
