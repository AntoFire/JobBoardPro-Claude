import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Briefcase, Activity, Calendar, MapPin, Building2,
  Search, ChevronRight, X, Mail, Globe, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from "recharts";
import AdminStudentDetail from "@/components/admin/AdminStudentDetail";

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        if (user.role !== 'admin') {
          console.warn("User is not admin");
        }
      } catch (error) {
        window.location.href = '/';
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const { data: allJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => base44.entities.JobApplication.listAll(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: () => base44.entities.LinkedInProfile.listAll(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: currentUser?.role === 'admin',
  });

  const DEMO_USERS = [
    { email: 'alice@example.com', full_name: 'Alice Wonder', role: 'user', skills: ['React', 'UX'], preferred_industries: ['Tech'], lastActive: new Date().toISOString() },
    { email: 'bob@example.com', full_name: 'Bob Builder', role: 'user', skills: ['Python', 'DevOps'], preferred_industries: ['Engineering'], lastActive: new Date().toISOString() },
  ];
  const DEMO_JOBS = [
    { id: 'd1', created_by: 'alice@example.com', title: 'Frontend Dev', company: 'Google', status: 'Offer', location: 'Remote', created_date: new Date().toISOString() },
    { id: 'd2', created_by: 'bob@example.com', title: 'Backend Eng', company: 'Amazon', status: 'Interview', location: 'Seattle', created_date: new Date().toISOString() },
  ];

  const students = useMemo(() => {
    let users = allUsers;
    let jobs = [...allJobs];
    let profiles = [...allProfiles];
    if (demoMode) {
      const existingEmails = new Set(users.map(u => u.email));
      users = [...users, ...DEMO_USERS.filter(u => !existingEmails.has(u.email))];
      jobs = [...jobs, ...DEMO_JOBS];
    }
    return users.map(student => {
      const studentJobs = jobs.filter(j => j.uid === student.id || j.created_by === student.email);
      const statusCounts = studentJobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {});
      return {
        ...student,
        jobs: studentJobs,
        profiles: profiles.filter(p => p.uid === student.id || p.created_by === student.email),
        stats: {
          totalApplications: studentJobs.length,
          interviews: studentJobs.filter(j => j.status === 'Interview').length,
          offers: studentJobs.filter(j => j.status === 'Offer').length,
          statusCounts
        },
        hasActivity: studentJobs.length > 0,
        lastActive: studentJobs.length > 0 ? studentJobs[0].created_date : (student.created_date || student.lastActive)
      };
    }).sort((a, b) => b.stats.offers - a.stats.offers || b.stats.totalApplications - a.stats.totalApplications);
  }, [allUsers, allJobs, allProfiles, demoMode]);

  const filteredStudents = students.filter(s =>
    !searchTerm || s.email?.toLowerCase().includes(searchTerm.toLowerCase()) || s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = useMemo(() => {
    if (!selectedStudent) return [];
    return [
      { name: 'Applied', value: selectedStudent.stats.statusCounts['Applied'] || 0, color: '#3b82f6' },
      { name: 'Interview', value: selectedStudent.stats.statusCounts['Interview'] || 0, color: '#9333ea' },
      { name: 'Offer', value: selectedStudent.stats.statusCounts['Offer'] || 0, color: '#22c55e' },
      { name: 'Rejected', value: selectedStudent.stats.statusCounts['Rejected'] || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [selectedStudent]);

  if (isCheckingAuth || jobsLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row h-screen overflow-hidden">
      <div className={`w-full md:w-[320px] bg-white border-r border-gray-200 flex flex-col ${selectedStudent ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" /> Admin
              </h1>
              <p className="text-xs text-slate-500 mt-1">{students.filter(s => s.hasActivity).length} active • {allJobs.length} apps</p>
            </div>
            <Button
              variant={demoMode ? "secondary" : "outline"}
              size="sm"
              className={`h-7 text-xs ${demoMode ? 'bg-indigo-100 text-indigo-700' : 'border-dashed'}`}
              onClick={() => setDemoMode(!demoMode)}
            >
              {demoMode ? "Hide Demo" : "+ Demo"}
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-slate-50" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredStudents.map(student => (
            <div
              key={student.email}
              onClick={() => setSelectedStudent(student)}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-50 group ${selectedStudent?.email === student.email ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-white'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${selectedStudent?.email === student.email ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {(student.full_name || student.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-900">{student.full_name || "Unknown"}</h3>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
              <div className="mt-3 flex gap-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">{student.stats.totalApplications} Apps</Badge>
                {student.stats.interviews > 0 && <Badge variant="secondary" className="bg-purple-50 text-purple-700">{student.stats.interviews} Int.</Badge>}
                {student.stats.offers > 0 && <Badge variant="secondary" className="bg-green-50 text-green-700">{student.stats.offers} Offer</Badge>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto bg-slate-50/50 p-6 ${!selectedStudent ? 'hidden md:flex items-center justify-center' : ''}`}>
        {!selectedStudent ? (
          <div className="text-center text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Select a student to view details</p>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <Button variant="ghost" className="md:hidden mb-4 pl-0" onClick={() => setSelectedStudent(null)}>← Back to List</Button>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    {(selectedStudent.full_name || selectedStudent.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedStudent.full_name || "Anonymous"}</h1>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedStudent.email}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{selectedStudent.stats.totalApplications}</div>
                  <div className="text-sm text-gray-500">Applications</div>
                  <Button variant="outline" size="sm" className="mt-2 gap-2 text-indigo-600 border-indigo-200" onClick={() => setShowFullProfile(true)}>
                    <Users className="w-4 h-4" /> Full Profile
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedStudent.skills?.slice(0, 5).map(skill => (
                  <Badge key={skill} variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">{skill}</Badge>
                ))}
              </div>
            </div>

            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Application Status</CardTitle></CardHeader>
              <CardContent>
                <div className="h-48">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                          {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Briefcase className="w-5 h-5" /> Applications ({selectedStudent.jobs.length})</h2>
              {selectedStudent.jobs.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">No applications found.</div>
              ) : (
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {["To Apply", "Applied", "Interview", "Offer", "Rejected"].map(status => {
                    const statusJobs = selectedStudent.jobs.filter(j => j.status === status);
                    if (!statusJobs.length) return null;
                    return (
                      <div key={status} className="min-w-[240px] flex flex-col gap-3">
                        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${status === 'Offer' ? 'bg-green-500' : status === 'Rejected' ? 'bg-red-500' : status === 'Interview' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                          {status === "To Apply" ? "Wishlist" : status} ({statusJobs.length})
                        </h4>
                        {statusJobs.map(job => (
                          <div key={job.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-start">
                              <h5 className="font-bold text-gray-900 text-sm">{job.title}</h5>
                              {job.job_link && <a href={job.job_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600"><ExternalLink className="w-4 h-4" /></a>}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{job.company}</div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location || "Remote"}</span>
                              <span className="flex items-center gap-1 ml-auto"><Calendar className="w-3 h-3" />{format(new Date(job.created_date), "MMM d")}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showFullProfile && selectedStudent && (
        <AdminStudentDetail student={selectedStudent} onClose={() => setShowFullProfile(false)} />
      )}
    </div>
  );
}
