import * as React from "react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext({})

const Select = ({ children, value, onValueChange }) => {
    const [open, setOpen] = React.useState(false)
    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative">{children}</div>
        </SelectContext.Provider>
    )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
    const { setOpen, open } = React.useContext(SelectContext)
    return (
        <button ref={ref} type="button" onClick={() => setOpen(!open)}
            className={cn("flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
            {children}
            <span className="h-4 w-4 opacity-50">▼</span>
        </button>
    )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ className, placeholder, ...props }, ref) => {
    const { value } = React.useContext(SelectContext)
    return <span ref={ref} className={cn("block truncate", className)} {...props}>{value || placeholder}</span>
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
    const { open } = React.useContext(SelectContext)
    if (!open) return null
    return (
        <div ref={ref} className={cn("absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in-80 mt-1 w-full", className)} {...props}>
            <div className="p-1">{children}</div>
        </div>
    )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value: itemValue, ...props }, ref) => {
    const { onValueChange, setOpen } = React.useContext(SelectContext)
    return (
        <div ref={ref}
            className={cn("relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100", className)}
            onClick={() => { onValueChange(itemValue); setOpen(false); }} {...props}>
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"></span>
            <span className="truncate">{children}</span>
        </div>
    )
})
SelectItem.displayName = "SelectItem"

const SelectGroup = ({ children }) => <>{children}</>;
const SelectLabel = ({ children }) => <div className="px-2 py-1.5 text-sm font-semibold">{children}</div>;
const SelectSeparator = () => <div className="-mx-1 my-1 h-px bg-slate-100" />;

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator }
