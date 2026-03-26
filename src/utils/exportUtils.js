export function exportJobsToCSV(jobs) {
    if (!jobs || jobs.length === 0) return;

    const headers = ['Title', 'Company', 'Location', 'Status', 'Job Type', 'Applied Date', 'Deadline', 'Job Link', 'Notes'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const rows = jobs.map(j => [
        esc(j.title), esc(j.company), esc(j.location),
        esc(j.status === 'To Apply' ? 'Wishlist' : j.status),
        esc(j.job_type),
        esc(j.created_date ? new Date(j.created_date).toLocaleDateString() : ''),
        esc(j.deadline), esc(j.job_link), esc(j.notes),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
