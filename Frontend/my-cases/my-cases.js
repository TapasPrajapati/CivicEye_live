// My Cases Page JavaScript
class MyCasesManager {
    constructor() {
        this.cases = [];
        this.filteredCases = [];
        this.currentFilters = {
            status: 'all',
            crimeType: 'all'
        };
        
        this.init();
    }
    
    async init() {
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Check if user is logged in
        const authData = this.getAuthData();
        
        if (!authData || !authData.token) {
            this.showLoginPrompt();
            return;
        }
        
        // Load user cases
        await this.loadUserCases();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    getAuthData() {
        const authData = sessionStorage.getItem('authData');
        return authData ? JSON.parse(authData) : null;
    }
    
    showLoginPrompt() {
        const casesList = document.getElementById('casesList');
        casesList.innerHTML = `
            <div class="no-cases">
                <div class="no-cases-icon">
                    <i data-lucide="log-in"></i>
                </div>
                <h3>Please Login</h3>
                <p>You need to be logged in to view your cases.</p>
                <button class="btn-report-new" onclick="window.location.href='/Frontend/landing/index.html'">
                    <i data-lucide="user"></i>
                    Go to Login
                </button>
            </div>
        `;
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    async loadUserCases() {
        try {
            const authData = this.getAuthData();
            
            const userEmail = authData.userData?.data?.email || authData.userData?.email || authData.data?.email;
            
            console.log('Auth data structure:', authData);
            console.log('User email being used:', userEmail);
            
            if (!userEmail) {
                this.showError('User email not found. Please login again.');
                return;
            }
            
            const response = await fetch(`http://localhost:5000/api/reports/user-cases?email=${encodeURIComponent(userEmail)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('API response:', data);
                this.cases = data.cases || [];
                this.filteredCases = [...this.cases];
                this.updateStats();
                this.renderCases();
            } else {
                console.error('Failed to load cases:', response.statusText);
                this.showError('Failed to load your cases. Please try again.');
            }
        } catch (error) {
            console.error('Error loading cases:', error);
            this.showError('Network error. Please check your connection.');
        }
    }
    
    updateStats() {
        const totalCases = this.cases.length;
        const pendingCases = this.cases.filter(case_ => 
            ['registered', 'approved', 'officer-assigned', 'investigating'].includes(case_.status)
        ).length;
        const resolvedCases = this.cases.filter(case_ => 
            case_.status === 'resolved'
        ).length;
        
        document.getElementById('totalCases').textContent = totalCases;
        document.getElementById('pendingCases').textContent = pendingCases;
        document.getElementById('resolvedCases').textContent = resolvedCases;
    }
    
    renderCases() {
        const casesList = document.getElementById('casesList');
        const noCases = document.getElementById('noCases');
        
        if (this.filteredCases.length === 0) {
            casesList.style.display = 'none';
            noCases.style.display = 'block';
            return;
        }
        
        casesList.style.display = 'grid';
        noCases.style.display = 'none';
        
        casesList.innerHTML = this.filteredCases.map(case_ => this.createCaseCard(case_)).join('');
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    createCaseCard(case_) {
        const statusClass = this.getStatusClass(case_.status);
        const crimeTypeLabel = this.getCrimeTypeLabel(case_.crimeType);
        const formattedDate = this.formatDate(case_.date);
        
        return `
            <div class="case-card">
                <div class="case-header">
                    <div class="case-title">
                        <h3>${crimeTypeLabel}</h3>
                        <span class="case-id">${case_.reportId}</span>
                    </div>
                    <span class="case-status ${statusClass}">${this.getStatusLabel(case_.status)}</span>
                </div>
                
                <div class="case-details">
                    <div class="case-detail">
                        <span class="case-detail-label">Date Filed</span>
                        <span class="case-detail-value">${formattedDate}</span>
                    </div>
                    <div class="case-detail">
                        <span class="case-detail-label">Location</span>
                        <span class="case-detail-value">${case_.location}</span>
                    </div>
                    <div class="case-detail">
                        <span class="case-detail-label">State</span>
                        <span class="case-detail-value">${case_.state}</span>
                    </div>
                    <div class="case-detail">
                        <span class="case-detail-label">Time</span>
                        <span class="case-detail-value">${case_.time}</span>
                    </div>
                </div>
                
                ${case_.description ? `
                <div class="case-description">
                    <p>${this.truncateText(case_.description, 150)}</p>
                </div>
                ` : ''}
                
                <div class="case-actions">
                    <a href="/Frontend/Track_case/track.html?caseId=${case_.reportId}" class="btn-case-action btn-track-case">
                        <i data-lucide="search"></i>
                        Track Case
                    </a>
                    <button class="btn-case-action btn-view-details" onclick="this.viewCaseDetails('${case_.reportId}')">
                        <i data-lucide="eye"></i>
                        View Details
                    </button>
                </div>
            </div>
        `;
    }
    
    getStatusClass(status) {
        const statusMap = {
            'registered': 'pending',
            'approved': 'pending',
            'officer-assigned': 'investigation',
            'investigating': 'investigation',
            'resolved': 'resolved'
        };
        return statusMap[status] || 'pending';
    }
    
    getStatusLabel(status) {
        const statusMap = {
            'registered': 'Registered',
            'approved': 'Approved',
            'officer-assigned': 'Officer Assigned',
            'investigating': 'Under Investigation',
            'resolved': 'Resolved'
        };
        return statusMap[status] || 'Registered';
    }
    
    getCrimeTypeLabel(crimeType) {
        const crimeTypeMap = {
            'theft': 'Theft/Burglary',
            'assault': 'Assault',
            'vandalism': 'Vandalism',
            'fraud': 'Fraud',
            'cyber': 'Cyber Crime',
            'other': 'Other'
        };
        return crimeTypeMap[crimeType] || 'Other';
    }
    
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    setupEventListeners() {
        // Status filter
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.applyFilters();
        });
        
        // Crime type filter
        document.getElementById('crimeTypeFilter').addEventListener('change', (e) => {
            this.currentFilters.crimeType = e.target.value;
            this.applyFilters();
        });
        
        // Clear filters
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });
    }
    
    applyFilters() {
        this.filteredCases = this.cases.filter(case_ => {
            const statusMatch = this.currentFilters.status === 'all' || case_.status === this.currentFilters.status;
            const crimeTypeMatch = this.currentFilters.crimeType === 'all' || case_.crimeType === this.currentFilters.crimeType;
            return statusMatch && crimeTypeMatch;
        });
        
        this.renderCases();
    }
    
    clearFilters() {
        this.currentFilters = {
            status: 'all',
            crimeType: 'all'
        };
        
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('crimeTypeFilter').value = 'all';
        
        this.filteredCases = [...this.cases];
        this.renderCases();
    }
    
    viewCaseDetails(caseId) {
        // This could open a modal or navigate to a detailed view
        alert(`Viewing details for case: ${caseId}`);
        // In the future, you could implement a detailed case view modal
    }
    
    showError(message) {
        const casesList = document.getElementById('casesList');
        casesList.innerHTML = `
            <div class="no-cases">
                <div class="no-cases-icon">
                    <i data-lucide="alert-circle"></i>
                </div>
                <h3>Error</h3>
                <p>${message}</p>
                <button class="btn-report-new" onclick="location.reload()">
                    <i data-lucide="refresh-cw"></i>
                    Try Again
                </button>
            </div>
        `;
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new MyCasesManager();
}); 