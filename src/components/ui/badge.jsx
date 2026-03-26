import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({ className, variant = "default", ...props }) {
    return (
        <div className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
            {
                "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80": variant === "default",
                "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80": variant === "secondary",
                "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80": variant === "destructive",
                "text-slate-950": variant === "outline",
            },
            className
        )} {...props} />
    )
}

export { Badge }
