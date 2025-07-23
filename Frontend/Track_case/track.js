document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const trackBtn = document.getElementById('track-case-btn');
    const caseIdInput = document.getElementById('case-id-input');
    const errorMessage = document.getElementById('error-message');
    const caseStatusSection = document.getElementById('case-status-section');
    const backToSearchBtn = document.getElementById('back-to-search-btn');
    const downloadCaseBtn = document.getElementById('download-case-btn');
    const viewMapBtn = document.getElementById('view-map-btn');
    const locationText = document.getElementById('location-text');
    const progressBar = document.querySelector('.progress-bar');
    const timeline = document.getElementById('timeline');
    
    const progressSteps = {
        registered: document.getElementById('step-registered'),
        approved: document.getElementById('step-approved'),
        officerAssigned: document.getElementById('step-officer-assigned'),
        investigating: document.getElementById('step-investigating'),
        resolved: document.getElementById('step-resolved')
    };

    // API endpoints
    const API_BASE_URL = 'http://localhost:5000/api';
    const CASE_ENDPOINT = `${API_BASE_URL}/reports`;

    // Event listeners
    trackBtn.addEventListener('click', trackCase);
    caseIdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') trackCase();
    });
    
    backToSearchBtn.addEventListener('click', resetSearch);
    downloadCaseBtn.addEventListener('click', downloadCaseDetails);
    viewMapBtn.addEventListener('click', viewMap);

    // Main tracking function
    async function trackCase() {
        const caseId = sanitizeInput(caseIdInput.value.trim());
        if (!caseId) {
            showError('Please enter a case ID');
            animateError();
            return;
        }

        // Pulse animation on button click
        animateButton();

        // Show loading state
        trackBtn.classList.add('loading');
        errorMessage.classList.add('hidden');
        caseStatusSection.classList.add('hidden');

        try {
            const response = await fetch(`${CASE_ENDPOINT}/${encodeURIComponent(caseId)}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch case details');
            }

            const caseData = await response.json();
            
            if (!caseData || !caseData.success) {
                throw new Error(caseData.message || 'Invalid case data received');
            }

            updateCaseDetailsUI(caseData.data);
            showCaseStatus();
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Failed to load case details');
            animateError();
        } finally {
            trackBtn.classList.remove('loading');
        }
    }

    // Update UI with case data from backend
    function updateCaseDetailsUI(caseData) {
        // Basic info
        document.getElementById('display-case-id').textContent = caseData.reportId || 'N/A';
        document.getElementById('reporter-name').textContent = caseData.name || 'N/A';
        document.getElementById('crime-type').textContent = caseData.crimeType || 'N/A';
        
        // Format dates
        const reportedDate = caseData.createdAt ? new Date(caseData.createdAt) : null;
        document.getElementById('date-reported').textContent = reportedDate ? 
            reportedDate.toLocaleString() : 'N/A';
        
        // Location
        updateLocationDisplay(caseData);
        
        // Status
        const statusElement = document.getElementById('current-status');
        statusElement.textContent = formatStatus(caseData.status);
        statusElement.className = 'detail-value status-badge ' + getStatusClass(caseData.status);
        
        // Update progress steps with detailed information
        updateProgressSteps(caseData);
        
        // Update timeline with detailed history
        updateTimeline(caseData.history || generateDefaultHistory(caseData));
    }

    // Update location display with better formatting
    function updateLocationDisplay(caseData) {
        if (caseData.location) {
            locationText.textContent = caseData.location;
            viewMapBtn.classList.add('hidden');
        } else if (caseData.latitude && caseData.longitude) {
            locationText.textContent = `${caseData.latitude.toFixed(6)}, ${caseData.longitude.toFixed(6)}`;
            viewMapBtn.classList.remove('hidden');
        } else {
            locationText.textContent = 'Location not specified';
            viewMapBtn.classList.add('hidden');
        }
    }

    // Generate default history if none available
    function generateDefaultHistory(caseData) {
        const history = [];
        const now = new Date();
        
        // Add registration event
        history.push({
            timestamp: caseData.createdAt || now.toISOString(),
            description: 'Case registered in system',
            officer: 'System'
        });
        
        // Add current status event
        if (caseData.status !== 'registered') {
            history.push({
                timestamp: caseData.updatedAt || now.toISOString(),
                description: `Case status updated to ${formatStatus(caseData.status)}`,
                officer: caseData.assignedOfficer || 'System'
            });
        }
        
        return history;
    }

    // Update progress steps with detailed information
    function updateProgressSteps(caseData) {
        const statusOrder = ['registered', 'approved', 'officer-assigned', 'investigating', 'resolved'];
        const currentIndex = statusOrder.indexOf(caseData.status);
        
        // Reset all steps
        Object.values(progressSteps).forEach(step => {
            step.classList.remove('completed', 'current');
            const details = step.querySelector('.step-details');
            if (details) details.textContent = '';
        });
        
        if (currentIndex >= 0) {
            // Mark previous steps as completed with details
            for (let i = 0; i < currentIndex; i++) {
                const step = progressSteps[statusOrder[i]];
                if (step) {
                    step.classList.add('completed');
                    const details = step.querySelector('.step-details');
                    if (details) {
                        details.textContent = getStepDetails(statusOrder[i], caseData);
                    }
                }
            }
            
            // Mark current step
            const currentStep = progressSteps[caseData.status];
            if (currentStep) {
                currentStep.classList.add('current');
                const details = currentStep.querySelector('.step-details');
                if (details) {
                    details.textContent = getStepDetails(caseData.status, caseData);
                }
            }
            
            // Animate progress bar
            const progressPercentage = (currentIndex / (statusOrder.length - 1)) * 100;
            progressBar.style.width = `${progressPercentage}%`;
        }
    }

    // Get details for each progress step
    function getStepDetails(step, caseData) {
        const date = new Date(caseData.updatedAt || caseData.createdAt);
        const formattedDate = date.toLocaleDateString();
        
        switch(step) {
            case 'registered':
                return `Registered on ${formattedDate}`;
            case 'approved':
                return caseData.approvedBy ? 
                    `Approved by ${caseData.approvedBy}` : 
                    'Pending approval';
            case 'officer-assigned':
                return caseData.assignedOfficer ? 
                    `Assigned to ${caseData.assignedOfficer}` : 
                    'Awaiting assignment';
            case 'investigating':
                return caseData.investigationStarted ? 
                    `Investigation started on ${formattedDate}` : 
                    'Investigation pending';
            case 'resolved':
                return caseData.resolution ? 
                    `Resolved: ${caseData.resolution}` : 
                    'Resolution pending';
            default:
                return '';
        }
    }

    // Update timeline with status history
    function updateTimeline(history) {
        timeline.innerHTML = '';
        
        if (!history || history.length === 0) {
            timeline.innerHTML = '<div class="timeline-event">No history available</div>';
            return;
        }
        
        // Sort history by date (newest first)
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Add each event to timeline
        history.forEach((event, index) => {
            const eventDate = new Date(event.timestamp);
            const eventElement = document.createElement('div');
            eventElement.className = 'timeline-event';
            eventElement.style.animationDelay = `${index * 0.1}s`;
            
            eventElement.innerHTML = `
                <div class="timeline-date">${eventDate.toLocaleString()}</div>
                <div class="timeline-details">${event.description || 'Status updated'}</div>
                ${event.officer ? `<div class="timeline-officer">By: ${event.officer}</div>` : ''}
            `;
            
            timeline.appendChild(eventElement);
        });
    }

    // View map for location
    function viewMap() {
            // In a real implementation, this would open a map with the coordinates
            alert('Map view would open here with the case location');
        }

        // Download case details as PDF
        function downloadCaseDetails() {
        const caseId = sanitizeInput(caseIdInput.value.trim());
        if (!caseId) {
            showError('Case ID not found for download.');
            animateError();
            return;
        }

        const downloadUrl = `${API_BASE_URL}/reports/${encodeURIComponent(caseId)}/pdf`;

        // Trigger browser download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${caseId}.pdf`; // suggested filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Reset search form
    function resetSearch() {
        caseStatusSection.classList.add('hidden');
        caseIdInput.value = '';
        caseIdInput.focus();
    }

    // Format status for display
    function formatStatus(status) {
        const statusMap = {
            'registered': 'Registered',
            'approved': 'Approved',
            'officer-assigned': 'Officer Assigned',
            'investigating': 'Under Investigation',
            'resolved': 'Resolved'
        };
        return statusMap[status] || status || 'Unknown';
    }

    // Get CSS class for status badge
    function getStatusClass(status) {
        const statusClasses = {
            'registered': 'status-registered',
            'approved': 'status-approved',
            'officer-assigned': 'status-approved',
            'investigating': 'status-investigating',
            'resolved': 'status-resolved'
        };
        return statusClasses[status] || 'status-registered';
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    // Animate button on click
    function animateButton() {
        trackBtn.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            trackBtn.style.animation = '';
        }, 500);
    }

    // Animate error state
    function animateError() {
        caseIdInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            caseIdInput.style.animation = '';
        }, 500);
    }

    // Show case status with animation
    function showCaseStatus() {
        caseStatusSection.style.opacity = 0;
        caseStatusSection.classList.remove('hidden');
        setTimeout(() => {
            caseStatusSection.style.opacity = 1;
            caseStatusSection.style.transform = 'translateY(0)';
        }, 10);
    }

    // Sanitize input
    function sanitizeInput(input) {
        return input.replace(/[^a-zA-Z0-9-\/]/g, '');
    }
});