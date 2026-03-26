import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef(({ className, defaultValue, children, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue)
    return (
        <div ref={ref} className={cn("", className)} {...props}>
            {React.Children.map(children, child =>
                React.isValidElement(child) ? React.cloneElement(child, { value, setValue }) : child
            )}
        </div>
    )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, value, setValue, ...props }, ref) => (
    <div ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500", className)} {...props}>
        {React.Children.map(props.children, child =>
            React.isValidElement(child) ? React.cloneElement(child, { selectedValue: value, setValue }) : child
        )}
    </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, selectedValue, setValue, ...props }, ref) => (
    <button ref={ref} type="button" onClick={() => setValue && setValue(value)}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            selectedValue === value ? "bg-white text-slate-950 shadow-sm" : "hover:bg-slate-200/50",
            className
        )} {...props} />
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value: contentValue, value, selectedValue, ...props }, ref) => {
    const active = selectedValue !== undefined ? selectedValue === contentValue : true
    if (!active) return null
    return <div ref={ref} className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2", className)} {...props} />
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
