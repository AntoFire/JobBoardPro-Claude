import React from 'react';
import { Trophy, Star, Zap } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function GamificationBadge({ gamificationData }) {
    if (!gamificationData) return null;

    const { level, total_points, current_streak } = gamificationData;
    const LEVELS = [0, 50, 150, 300, 500, 800, 1200];
    const nextLevelPoints = LEVELS[level] || 10000;
    const prevLevelPoints = LEVELS[level - 1] || 0;
    const progress = Math.min(100, Math.max(0, ((total_points - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100));

    return (
        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-indigo-100">
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {level}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white font-bold">
                    LVL
                </div>
            </div>

            <div className="flex flex-col min-w-[120px]">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700">{total_points} XP</span>
                    <span className="text-gray-400 text-[10px]">{nextLevelPoints} XP</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {current_streak > 0 && (
                <div className="flex items-center gap-1 pl-2 border-l border-gray-100 ml-1">
                    <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span className="text-sm font-bold text-gray-700">{current_streak}</span>
                </div>
            )}
        </div>
    );
}
