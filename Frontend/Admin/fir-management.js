// fir-management.js
async function fetchFIRs() {
    try {
        const response = await fetch('http://localhost:5000/api/reports');
        if (!response.ok) {
            throw new Error('Failed to fetch FIRs');
        }
        const reports = await response.json();
        
        // Transform data to match expected format
        return reports.map(report => ({
            id: report.firNumber,
            status: report.status,
            complainant: report.name,
            location: report.location,
            date: report.date,
            type: report.crimeType,
            description: report.description,
            officer: report.assignedOfficer,
            contact: report.phone,
            email: report.email,
            evidence: report.evidence.map(file => ({
                type: file.split('.').pop() === 'pdf' ? 'document' : 'image',
                name: file.split('/').pop(),
                path: file
            })),
            createdAt: report.createdAt
        }));
    } catch (error) {
        console.error('Error fetching FIRs:', error);
        return [];
    }
}

async function updateFIR(firId) {
    const status = document.getElementById('statusUpdate').value;
    const officer = document.getElementById('officerUpdate').value;
    
    try {
        // First find the report to get its database ID
        const allReports = await fetch('http://localhost:5000/api/reports')
            .then(res => res.json());
        
        const reportToUpdate = allReports.find(r => r.firNumber === firId);
        if (!reportToUpdate) {
            throw new Error('Report not found');
        }
        
        const response = await fetch(`http://localhost:5000/api/reports/${reportToUpdate._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                status, 
                assignedOfficer: officer 
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update FIR');
        }
        
        // Refresh the FIR list
        await initFIRList();
        document.getElementById('firDetailModal').style.display = 'none';
        
    } catch (error) {
        console.error('Error updating FIR:', error);
        alert('Failed to update FIR. Please try again.');
    }
}

// Modify the showFIRDetail function to include all fields
function showFIRDetail(fir) {
    const modal = document.getElementById("firDetailModal");
    const modalBody = modal.querySelector(".modal-body");

    modalBody.innerHTML = `
        <div class="fir-detail-section">
            <h3>Basic Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">FIR Number</span>
                    <span class="detail-value">${fir.id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">
                        <select id="statusUpdate" class="status-select status-${fir.status}">
                            <option value="pending" ${fir.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="investigating" ${fir.status === 'investigating' ? 'selected' : ''}>Under Investigation</option>
                            <option value="resolved" ${fir.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date Filed</span>
                    <span class="detail-value">${new Date(fir.createdAt).toLocaleString()}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Crime Type</span>
                    <span class="detail-value">${fir.type}</span>
                </div>
            </div>
        </div>

        <div class="fir-detail-section">
            <h3>Complainant Details</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${fir.complainant}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${fir.email || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Contact</span>
                    <span class="detail-value">${fir.contact}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${fir.location}</span>
                </div>
            </div>
        </div>

        <div class="fir-detail-section">
            <h3>Incident Details</h3>
            <div class="detail-grid">
                <div class="detail-item full-width">
                    <span class="detail-label">Date & Time</span>
                    <span class="detail-value">${new Date(fir.date).toLocaleString()}</span>
                </div>
                <div class="detail-item full-width">
                    <span class="detail-label">Description</span>
                    <p class="detail-value">${fir.description}</p>
                </div>
            </div>
        </div>

        <div class="fir-detail-section">
            <h3>Investigation Details</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Assigned Officer</span>
                    <span class="detail-value">
                        <input type="text" id="officerUpdate" value="${fir.officer || ''}" placeholder="Assign officer">
                    </span>
                </div>
            </div>
        </div>

        <div class="fir-detail-section">
            <h3>Evidence</h3>
            <div class="evidence-list">
                ${fir.evidence.map(item => `
                    <div class="evidence-item">
                        <i class="fas fa-${getEvidenceIcon(item.type)}"></i>
                        <span>${item.name}</span>
                        <a href="/uploads/${item.path.split('/').pop()}" target="_blank" class="view-evidence">View</a>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="modal-actions">
            <button class="btn btn-save" id="saveChanges" data-firid="${fir.id}">Save Changes</button>
            <button class="btn btn-close" id="closeModal">Close</button>
        </div>
    `;

    document.getElementById('saveChanges').addEventListener('click', () => updateFIR(fir.id));
    document.getElementById('closeModal').addEventListener('click', () => modal.style.display = 'none');
    
    modal.style.display = "block";
}
async function filterFIRs() {
    const status = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    try {
        let url = 'http://localhost:5000/api/reports';
        if (status !== 'all') {
            url += `?status=${status}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch filtered FIRs');
        }
        
        let reports = await response.json();
        
        // Apply date filtering
        if (dateFilter !== 'all') {
            const now = new Date();
            reports = reports.filter(report => {
                const reportDate = new Date(report.createdAt);
                
                switch (dateFilter) {
                    case 'today':
                        return reportDate.toDateString() === now.toDateString();
                    case 'week':
                        const oneWeekAgo = new Date(now);
                        oneWeekAgo.setDate(now.getDate() - 7);
                        return reportDate >= oneWeekAgo;
                    case 'month':
                        const oneMonthAgo = new Date(now);
                        oneMonthAgo.setMonth(now.getMonth() - 1);
                        return reportDate >= oneMonthAgo;
                    default:
                        return true;
                }
            });
        }
        
        // Transform data for display
        const firList = document.querySelector(".fir-list");
        firList.innerHTML = "";
        
        if (reports.length === 0) {
            firList.innerHTML = '<div class="no-results">No FIRs found matching your criteria</div>';
            return;
        }
        
        reports.forEach(report => {
            const firItem = createFIRListItem({
                id: report.firNumber,
                status: report.status,
                complainant: report.name,
                location: report.location,
                date: report.date,
                type: report.crimeType,
                description: report.description,
                officer: report.assignedOfficer,
                contact: report.phone,
                email: report.email,
                evidence: report.evidence.map(file => ({
                    type: file.split('.').pop() === 'pdf' ? 'document' : 'image',
                    name: file.split('/').pop(),
                    path: file
                })),
                createdAt: report.createdAt
            });
            firList.appendChild(firItem);
        });
        
    } catch (error) {
        console.error('Error filtering FIRs:', error);
        document.querySelector(".fir-list").innerHTML = 
            '<div class="error">Failed to load FIRs. Please try again.</div>';
    }
}
document.querySelector('.export-btn').addEventListener('click', async function() {
    try {
        const response = await fetch('http://localhost:5000/api/reports');
        if (!response.ok) {
            throw new Error('Failed to fetch reports for export');
        }
        
        const reports = await response.json();
        
        // Convert to CSV
        const csvContent = [
            ['FIR Number', 'Status', 'Complainant', 'Crime Type', 'Date', 'Location', 'Officer'],
            ...reports.map(report => [
                report.firNumber,
                report.status,
                report.name,
                report.crimeType,
                new Date(report.date).toLocaleDateString(),
                report.location,
                report.assignedOfficer || 'Unassigned'
            ])
        ].map(row => row.join(',')).join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `fir-reports-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export data. Please try again.');
    }
});