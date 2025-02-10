// Add this at the bottom of your existing script.js
// Case Tracking Functionality
function trackCase() {
    const caseId = document.getElementById('caseId').value.trim();
    const caseStatus = document.getElementById('caseStatus');

    if (!caseId) {
        alert('Please enter a valid Case ID');
        return;
    }
    document.getElementById('displayCaseId').textContent = '';
    document.getElementById('caseDate').textContent = '';
    document.getElementById('crimeTypeDisplay').textContent = '';

    // Simulated database (replace with real API calls)
    const cases = {
        'CR-123456': {
            date: '2023-08-15',
            type: 'Theft/Burglary',
            status: 'investigation' // Change this to test different statuses
        },
        'CR-789012': {
            date: '2023-08-16',
            type: 'Cyber Crime',
            status: 'resolved'
        }
    };

    if (!cases[caseId]) {
        alert('Case ID not found!');
        return;
    }

    // Update display
    document.getElementById('displayCaseId').textContent = caseId;
    document.getElementById('caseDate').textContent = cases[caseId].date;
    document.getElementById('crimeTypeDisplay').textContent = cases[caseId].type;

    // Reset all status steps
    document.querySelectorAll('.status-step').forEach(step => {
        step.classList.remove('active');
    });

    // Activate appropriate steps
    const statusOrder = ['filed', 'review', 'investigation', 'resolved'];
    const currentStatusIndex = statusOrder.indexOf(cases[caseId].status);
    
    statusOrder.forEach((status, index) => {
        if (index <= currentStatusIndex) {
            document.querySelector(`.status-${status}`).classList.add('active');
        }
    });

    // Update progress line
    const progressLine = document.querySelector('.progress-line');
    const progressPercentage = (currentStatusIndex / (statusOrder.length - 1)) * 100;
    progressLine.style.background = `linear-gradient(to right, #3498db ${progressPercentage}%, #eee ${progressPercentage}%)`;

    caseStatus.classList.add('visible');
    // Show results
    caseStatus.classList.remove('hidden');
}