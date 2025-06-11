    // Mock Officers data
const mockOfficers = [
  {
    id: "OFF001",
    name: "Rahul Sharma",
    badge: "B12345",
    rank: "inspector",
    status: "active",
    photo: "https://www.flaticon.com/free-icons/police",
    department: "Criminal Investigation",
    contact: "+1234567890",
    email: "Rahul.Sharma@police.gov",
    joinDate: "2020-05-15",
    performance: {
      casesResolved: 45,
      activeInvestigations: 8,
      responseTime: "2.5 hours",
    },
    assignedCases: [
      { id: "FIR2024001", type: "Theft", date: "2024-02-20" },
      { id: "FIR2024005", type: "Assault", date: "2024-02-18" },
    ],
  },
  {
    id: "OFF002",
    name: "Ananya Joshi",
    badge: "B12346",
    rank: "subInspector",
    status: "active",
    photo: ".Frontend/Assets/Male_police.png",
    department: "Cyber Crime",
    contact: "+1234567891",
    email: "Ananya.Joshi@police.gov",
    joinDate: "2021-03-10",
    performance: {
      casesResolved: 32,
      activeInvestigations: 5,
      responseTime: "1.8 hours",
    },
    assignedCases: [
      { id: "FIR2024002", type: "Cybercrime", date: "2024-02-19" },
    ],
  },
  {
    id: "OFF003",
    name: "Karthik Nair",
    badge: "B12347",
    rank: "constable",
    status: "onLeave",
    photo: "https://via.placeholder.com/60",
    department: "Traffic",
    contact: "+1234567892",
    email: "Karthik.Nair@police.gov",
    joinDate: "2022-01-20",
    performance: {
      casesResolved: 28,
      activeInvestigations: 0,
      responseTime: "2.1 hours",
    },
    assignedCases: [],
  },
];

// Initialize Officers list
function initOfficersList() {
    const officersList = document.querySelector('.officers-list');
    officersList.innerHTML = ''; // Clear existing items

    mockOfficers.forEach(officer => {
        const officerCard = createOfficerCard(officer);
        officersList.appendChild(officerCard);
    });
}

// Create Officer card
function createOfficerCard(officer) {
    const div = document.createElement('div');
    div.className = 'officer-card';
    div.innerHTML = `
        <div class="officer-header">
            <img src="${officer.photo}" alt="${officer.name}" class="officer-avatar">
            <div class="officer-basic-info">
                <div class="officer-name">${officer.name}</div>
                <div class="officer-badge">${officer.badge}</div>
            </div>
            <span class="officer-status status-${officer.status}">${capitalizeFirstLetter(officer.status)}</span>
        </div>
        <div class="officer-info">
            <div class="info-item">
                <span class="info-label">Rank</span>
                <span class="info-value">${capitalizeFirstLetter(officer.rank)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Department</span>
                <span class="info-value">${officer.department}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Active Cases</span>
                <span class="info-value">${officer.performance.activeInvestigations}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Cases Resolved</span>
                <span class="info-value">${officer.performance.casesResolved}</span>
            </div>
        </div>
    `;

    div.addEventListener('click', () => showOfficerDetail(officer));
    return div;
}

// Show Officer detail modal
function showOfficerDetail(officer) {
    const modal = document.getElementById('officerDetailModal');
    const modalBody = modal.querySelector('.modal-body');

    modalBody.innerHTML = `
        <div class="detail-section">
            <h3>Personal Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${officer.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Badge Number</span>
                    <span class="detail-value">${officer.badge}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Rank</span>
                    <span class="detail-value">${capitalizeFirstLetter(officer.rank)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Department</span>
                    <span class="detail-value">${officer.department}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Join Date</span>
                    <span class="detail-value">${formatDate(officer.joinDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">${capitalizeFirstLetter(officer.status)}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Contact Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${officer.contact}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${officer.email}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Performance Metrics</h3>
            <div class="performance-metrics">
                <div class="metric-card">
                    <div class="metric-value">${officer.performance.casesResolved}</div>
                    <div class="metric-label">Cases Resolved</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${officer.performance.activeInvestigations}</div>
                    <div class="metric-label">Active Cases</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${officer.performance.responseTime}</div>
                    <div class="metric-label">Avg. Response Time</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Assigned Cases</h3>
            <div class="assigned-cases">
                ${officer.assignedCases.length > 0 ? 
                    officer.assignedCases.map(caseItem => `
                        <div class="case-item">
                            <span>${caseItem.id} - ${caseItem.type}</span>
                            <span>${formatDate(caseItem.date)}</span>
                        </div>
                    `).join('') : 
                    '<p>No cases currently assigned</p>'
                }
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// Helper functions
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initOfficersList();

    // Close modal
    const closeModal = document.querySelector('.close-modal');
    const modal = document.getElementById('officerDetailModal');

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Filter handling
    const rankFilter = document.getElementById('rankFilter');
    const statusFilter = document.getElementById('statusFilter');

    rankFilter.addEventListener('change', filterOfficers);
    statusFilter.addEventListener('change', filterOfficers);

    // Add new officer button
    const addOfficerBtn = document.querySelector('.add-officer-btn');
    addOfficerBtn.addEventListener('click', () => {
        alert('Add new officer functionality will be implemented here');
    });
});

// Filter Officers
function filterOfficers() {
    const rank = document.getElementById('rankFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    let filteredOfficers = [...mockOfficers];

    if (rank !== 'all') {
        filteredOfficers = filteredOfficers.filter(officer => officer.rank === rank);
    }

    if (status !== 'all') {
        filteredOfficers = filteredOfficers.filter(officer => officer.status === status);
    }

    const officersList = document.querySelector('.officers-list');
    officersList.innerHTML = '';
    filteredOfficers.forEach(officer => {
        const officerCard = createOfficerCard(officer);
        officersList.appendChild(officerCard);
    });
}