import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    User,
    Shield,
    LogOut,
    Menu,
    X,
    BarChart2,
    Key
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/analytics', label: 'Analytics', icon: BarChart2 },
    { path: '/linkedin-tracker', label: 'LinkedIn Tracker', icon: Briefcase },
    { path: '/profile', label: 'My Profile', icon: User },
    { path: '/my-api-key', label: 'API Key', icon: Key },
    { path: '/admin', label: 'Admin', icon: Shield },
];

const NavLinks = ({ onNavigate }) => (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
            <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
            >
                <item.icon className="w-5 h-5" />
                {item.label}
            </NavLink>
        ))}
    </nav>
);

const MainLayout = () => {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await base44.auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                        <Briefcase className="w-7 h-7" />
                        JobBoard<span className="text-gray-900">Pro</span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Career management platform</p>
                </div>
                <NavLinks onNavigate={undefined} />
                <div className="p-4 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-20 px-4 h-14 flex items-center justify-between">
                <h1 className="text-lg font-bold text-indigo-600">JobBoardPro</h1>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
                    <Menu className="w-6 h-6" />
                </Button>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <>
                    <div
                        className="md:hidden fixed inset-0 bg-black/40 z-30"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="md:hidden fixed top-0 left-0 h-full w-72 bg-white z-40 flex flex-col shadow-xl">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-indigo-600">JobBoardPro</h1>
                            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <NavLinks onNavigate={() => setMobileOpen(false)} />
                        <div className="p-4 border-t border-gray-100">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Sign Out
                            </Button>
                        </div>
                    </aside>
                </>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 pt-14 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
