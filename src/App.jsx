import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Pages/dashboard';
import AdminDashboard from './Pages/AdminDashboard';
import LinkedinTracker from './Pages/LinkedinTracker';
import MyProfile from './Pages/Myprofile';
import ExtensionJobHandler from './Pages/ExtensionJobHandler';
import Login from './Pages/Login';
import Analytics from './Pages/Analytics';
import MyAPIKey from './Pages/MyAPIKey';
import { Toaster } from "@/components/ui/toaster";
import MainLayout from './components/layout/MainLayout';

export default function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-50">
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/linkedin-tracker" element={<LinkedinTracker />} />
                        <Route path="/profile" element={<MyProfile />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/my-api-key" element={<MyAPIKey />} />
                    </Route>
                    <Route path="/extension-job" element={<ExtensionJobHandler />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Toaster />
            </div>
        </BrowserRouter>
    );
}
