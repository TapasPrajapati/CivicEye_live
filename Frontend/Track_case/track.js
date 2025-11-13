document.addEventListener("DOMContentLoaded", function () {
    // DOM elements
    const trackBtn = document.getElementById("track-case-btn");
    const caseIdInput = document.getElementById("case-id-input");
    const errorMessage = document.getElementById("error-message");
    const caseStatusSection = document.getElementById("case-status-section");
    const backToSearchBtn = document.getElementById("back-to-search-btn");
    const downloadCaseBtn = document.getElementById("download-case-btn");
    const viewMapBtn = document.getElementById("view-map-btn");
    const locationText = document.getElementById("location-text");
    const progressBar = document.querySelector(".progress-bar");
    const timeline = document.getElementById("timeline");

    const progressSteps = {
        registered: document.getElementById("step-registered"),
        approved: document.getElementById("step-approved"),
        officerAssigned: document.getElementById("step-officer-assigned"),
        investigating: document.getElementById("step-investigating"),
        resolved: document.getElementById("step-resolved"),
    };

    // API endpoints
    const API_BASE_URL = "https://civiceye-4-q1te.onrender.com/api";
    const CASE_ENDPOINT = `${API_BASE_URL}/reports`;

    // Event listeners
    trackBtn.addEventListener("click", trackCase);
    caseIdInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") trackCase();
    });

    backToSearchBtn.addEventListener("click", resetSearch);
    downloadCaseBtn.addEventListener("click", downloadCaseDetails);
    viewMapBtn.addEventListener("click", viewMap);

    // Main tracking function
    async function trackCase() {
        const caseId = sanitizeInput(caseIdInput.value.trim());
        if (!caseId) {
            showError("Please enter a case ID");
            animateError();
            return;
        }

        // Pulse animation on button click
        animateButton();

        // Show loading state
        trackBtn.classList.add("loading");
        errorMessage.classList.add("hidden");
        caseStatusSection.classList.add("hidden");

        try {
            const response = await fetch(
                `${CASE_ENDPOINT}/${encodeURIComponent(caseId)}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch case details");
            }

            const caseData = await response.json();

            if (!caseData || !caseData.success) {
                throw new Error(caseData.message || "Invalid case data received");
            }

            updateCaseDetailsUI(caseData.data);
            showCaseStatus();
        } catch (error) {
            console.error("Error:", error);
            showError(error.message || "Failed to load case details");
            animateError();
        } finally {
            trackBtn.classList.remove("loading");
        }
    }

    // Update UI with case data from backend
    function updateCaseDetailsUI(caseData) {
        // Basic info
        document.getElementById("display-case-id").textContent =
            caseData.reportId || "N/A";
        document.getElementById("reporter-name").textContent =
            caseData.name || "N/A";
        document.getElementById("crime-type").textContent =
            caseData.crimeType || "N/A";

        // Format dates
        const reportedDate = caseData.createdAt
            ? new Date(caseData.createdAt)
            : null;
        document.getElementById("date-reported").textContent = reportedDate
            ? reportedDate.toLocaleString()
            : "N/A";

        // Location
        updateLocationDisplay(caseData);

        // Status
        const statusElement = document.getElementById("current-status");
        statusElement.textContent = formatStatus(caseData.status);
        statusElement.className =
            "detail-value status-badge " + getStatusClass(caseData.status);

        // Update progress steps with detailed information
        updateProgressSteps(caseData);

        // Update timeline with detailed history
        updateTimeline(caseData.history || generateDefaultHistory(caseData));
    }

    // Update location display with better formatting
    function updateLocationDisplay(caseData) {
        if (caseData.location) {
            locationText.textContent = caseData.location;
            viewMapBtn.classList.add("hidden");
        } else if (caseData.latitude && caseData.longitude) {
            locationText.textContent = `${caseData.latitude.toFixed(
                6
            )}, ${caseData.longitude.toFixed(6)}`;
            viewMapBtn.classList.remove("hidden");
        } else {
            locationText.textContent = "Location not specified";
            viewMapBtn.classList.add("hidden");
        }
    }

    // Generate default history if none available
    function generateDefaultHistory(caseData) {
        const history = [];
        const now = new Date();

        // Add registration event
        history.push({
            timestamp: caseData.createdAt || now.toISOString(),
            description: "Case registered in system",
            officer: "System",
        });

        // Add current status event
        if (caseData.status !== "registered") {
            history.push({
                timestamp: caseData.updatedAt || now.toISOString(),
                description: `Case status updated to ${formatStatus(caseData.status)}`,
                officer: caseData.assignedOfficer || "System",
            });
        }

        return history;
    }

    // Update progress steps with professional animation
    function updateProgressSteps(caseData) {
        const statusOrder = [
            "registered",
            "approved",
            "Officer Assigned", 
            "investigating",
            "resolved",
        ];
        
        // Map backend status to our step identifiers
        const statusMapping = {
            "registered": "registered",
            "approved": "approved", 
            "Officer Assigned": "officerAssigned",
            "investigating": "investigating",
            "resolved": "resolved"
        };

        const currentStatusKey = statusMapping[caseData.status] || caseData.status;
        const currentIndex = statusOrder.indexOf(caseData.status);

        console.log("🔄 Progress Update:", {
            status: caseData.status,
            currentIndex: currentIndex,
            currentKey: currentStatusKey
        });

        // Reset all steps first
        Object.values(progressSteps).forEach((step, index) => {
            step.classList.remove("completed", "current", "pending");
            step.classList.add("pending");
            
            const icon = step.querySelector(".step-icon");
            const details = step.querySelector(".step-details");
            
            if (icon) {
                icon.style.transform = "scale(0.95)";
            }
            if (details) {
                details.textContent = "";
                details.style.opacity = "0.6";
            }
        });

        if (currentIndex >= 0) {
            // Mark all previous steps as completed
            for (let i = 0; i < currentIndex; i++) {
                const stepKey = statusMapping[statusOrder[i]];
                const step = progressSteps[stepKey];
                
                if (step) {
                    step.classList.remove("pending");
                    step.classList.add("completed");
                    
                    const icon = step.querySelector(".step-icon");
                    const details = step.querySelector(".step-details");
                    
                    if (icon) {
                        setTimeout(() => {
                            icon.style.transform = "scale(1.05)";
                        }, i * 200);
                    }
                    
                    if (details) {
                        details.textContent = getStepDetails(statusOrder[i], caseData);
                        details.style.opacity = "1";
                    }
                    
                    // Animate connector
                    const connector = step.querySelector(".step-connector");
                    if (connector) {
                        setTimeout(() => {
                            connector.style.background = "var(--completed)";
                        }, i * 200);
                    }
                }
            }

            // Mark current step
            const currentStep = progressSteps[currentStatusKey];
            if (currentStep) {
                currentStep.classList.remove("pending");
                currentStep.classList.add("current");
                
                const icon = currentStep.querySelector(".step-icon");
                const details = currentStep.querySelector(".step-details");
                
                if (icon) {
                    setTimeout(() => {
                        icon.style.transform = "scale(1.1)";
                    }, currentIndex * 200);
                }
                
                if (details) {
                    details.textContent = getStepDetails(caseData.status, caseData);
                    details.style.opacity = "1";
                }
            }

            // Mark future steps as pending
            for (let i = currentIndex + 1; i < statusOrder.length; i++) {
                const stepKey = statusMapping[statusOrder[i]];
                const step = progressSteps[stepKey];
                
                if (step) {
                    step.classList.add("pending");
                    
                    const details = step.querySelector(".step-details");
                    if (details) {
                        details.textContent = getStepDetails(statusOrder[i], caseData);
                        details.style.opacity = "0.6";
                    }
                }
            }
        }
    }

   // Enhanced step details with better formatting
    function getStepDetails(step, caseData) {
        const date = new Date(caseData.updatedAt || caseData.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        switch (step) {
            case "registered":
                return `Registered • ${formattedDate}`;
            case "approved":
                return caseData.approvedBy ? 
                    `Approved by ${caseData.approvedBy}` : 
                    "Approved • Ready for assignment";
            case "Officer Assigned":
                return caseData.assignedOfficer ? 
                    `Assigned to ${caseData.assignedOfficer}` : 
                    "Officer assigned • Investigation pending";
            case "investigating":
                return caseData.investigationStarted ? 
                    `Investigation in progress` : 
                    "Under investigation • Gathering evidence";
            case "resolved":
                return caseData.resolution ? 
                    `Case resolved • ${caseData.resolution}` : 
                    "Case closed • Resolution completed";
            default:
                return "Status updated";
        }
    }


    // Update timeline with status history
    function updateTimeline(history) {
        timeline.innerHTML = "";

        if (!history || history.length === 0) {
            timeline.innerHTML =
                '<div class="timeline-event">No history available</div>';
            return;
        }

        // Sort history by date (newest first)
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Add each event to timeline
        history.forEach((event, index) => {
            const eventDate = new Date(event.timestamp);
            const eventElement = document.createElement("div");
            eventElement.className = "timeline-event";
            eventElement.style.animationDelay = `${index * 0.1}s`;

            eventElement.innerHTML = `
                <div class="timeline-date">${eventDate.toLocaleString()}</div>
                <div class="timeline-details">${event.description || "Status updated"
                }</div>
                ${event.officer
                    ? `<div class="timeline-officer">By: ${event.officer}</div>`
                    : ""
                }
            `;

            timeline.appendChild(eventElement);
        });
    }

    // View map for location
    function viewMap() {
        // In a real implementation, this would open a map with the coordinates
        alert("Map view would open here with the case location");
    }

    // Download case details as PDF
    async function downloadCaseDetails() {
        const caseId = sanitizeInput(caseIdInput.value.trim());
        if (!caseId) {
            showError("Please track a case first before downloading.");
            animateError();
            return;
        }

        // Show loading state
        const originalContent = downloadCaseBtn.innerHTML;
        downloadCaseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        downloadCaseBtn.disabled = true;

        try {
            // Get current case data
            const caseData = await getCurrentCaseData();
            if (!caseData) {
                throw new Error('No case data available for PDF generation');
            }

            // Generate PDF
            await generatePDFWithFallback(caseData, caseId);
            
        } catch (error) {
            console.error('PDF generation failed:', error);
            showError('Failed to generate PDF. Please try again later.');
        } finally {
            // Reset button after delay
            setTimeout(() => {
                downloadCaseBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
                downloadCaseBtn.disabled = false;
            }, 2000);
        }
    }

    // Get current case data for PDF
    async function getCurrentCaseData() {
        const caseId = sanitizeInput(caseIdInput.value.trim());
        try {
            const response = await fetch(`${CASE_ENDPOINT}/${encodeURIComponent(caseId)}`);
            if (response.ok) {
                const result = await response.json();
                return result.data || result;
            }
        } catch (error) {
            console.error('Failed to fetch case data:', error);
        }
        
        // Fallback: Extract data from current UI
        return extractDataFromUI();
    }

    // Extract data from current UI as fallback
    function extractDataFromUI() {
        return {
            reportId: document.getElementById('display-case-id')?.textContent || '',
            name: document.getElementById('reporter-name')?.textContent || '',
            crimeType: document.getElementById('crime-type')?.textContent || '',
            status: document.getElementById('current-status')?.textContent || '',
            createdAt: document.getElementById('date-reported')?.textContent || new Date().toISOString(),
            location: document.getElementById('location-text')?.textContent || '',
            history: extractTimelineFromUI()
        };
    }

    // Extract timeline from UI
    function extractTimelineFromUI() {
        const timelineEvents = document.querySelectorAll('.timeline-event');
        const history = [];
        
        timelineEvents.forEach(event => {
            const dateElement = event.querySelector('.timeline-date');
            const detailsElement = event.querySelector('.timeline-details');
            const officerElement = event.querySelector('.timeline-officer');
            
            if (dateElement && detailsElement) {
                history.push({
                    timestamp: new Date().toISOString(), // Fallback to current time
                    description: detailsElement.textContent || 'Status updated',
                    officer: officerElement ? officerElement.textContent.replace('By: ', '') : 'System'
                });
            }
        });
        
        return history.length > 0 ? history : generateDefaultHistory(extractDataFromUI());
    }

    // Generate PDF using jsPDF
    function generatePDFWithJSPDF(caseData, caseId) {
        return new Promise((resolve, reject) => {
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                
                // Set PDF properties
                pdf.setProperties({
                    title: `Case Report - ${caseId}`,
                    subject: 'CivicEye Case Report',
                    author: 'CivicEye System',
                    keywords: 'case, report, civic',
                    creator: 'CivicEye'
                });

                let yPos = 20;
                const pageWidth = pdf.internal.pageSize.getWidth();
                const margin = 20;

                // Header
                pdf.setFillColor(67, 97, 238);
                pdf.rect(0, 0, pageWidth, 25, 'F');
                
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(20);
                pdf.setFont('helvetica', 'bold');
                pdf.text('CivicEye Case Report', pageWidth / 2, 15, { align: 'center' });

                yPos = 35;

                // Case Information Section
                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Case Information', margin, yPos);
                yPos += 10;

                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                
                // Case Details
                const details = [
                    ['Case ID:', caseId],
                    ['Reporter Name:', caseData.name || 'N/A'],
                    ['Crime Type:', caseData.crimeType || 'N/A'],
                    ['Date Reported:', caseData.createdAt ? new Date(caseData.createdAt).toLocaleString() : 'N/A'],
                    ['Current Status:', formatStatus(caseData.status) || 'N/A'],
                    ['Location:', caseData.location || (caseData.latitude && caseData.longitude ? 
                        `Lat: ${caseData.latitude}, Long: ${caseData.longitude}` : 'N/A')]
                ];

                details.forEach(([label, value]) => {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(label, margin, yPos);
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(value, margin + 40, yPos);
                    yPos += 6;
                });

                yPos += 10;

                // Status History Section
                if (yPos > 200) {
                    pdf.addPage();
                    yPos = 20;
                }

                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Status History', margin, yPos);
                yPos += 10;

                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');

                const statusHistory = caseData.history || generateDefaultHistory(caseData);
                statusHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                statusHistory.forEach(event => {
                    if (yPos > 270) {
                        pdf.addPage();
                        yPos = 20;
                    }

                    const eventDate = new Date(event.timestamp);
                    
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`• ${eventDate.toLocaleString()}`, margin, yPos);
                    yPos += 5;
                    
                    pdf.setFont('helvetica', 'normal');
                    const description = event.description || 'Status updated';
                    // Split long text
                    const lines = pdf.splitTextToSize(`  ${description}`, pageWidth - 2 * margin - 10);
                    lines.forEach(line => {
                        pdf.text(line, margin + 5, yPos);
                        yPos += 5;
                    });
                    
                    if (event.officer) {
                        pdf.setFont('helvetica', 'italic');
                        pdf.text(`  By: ${event.officer}`, margin + 5, yPos);
                        yPos += 5;
                    }
                    
                    yPos += 3;
                });

                // Footer
                pdf.setFontSize(8);
                pdf.setTextColor(128, 128, 128);
                pdf.text(`Generated on ${new Date().toLocaleString()} - CivicEye Case Management System`, 
                        pageWidth / 2, 290, { align: 'center' });

                // Save the PDF
                pdf.save(`${caseId}_case_report.pdf`);
                showDownloadSuccess();
                resolve();
                
            } catch (error) {
                console.error('PDF generation error:', error);
                reject(error);
            }
        });
    }

    // Main PDF generation with fallback
    async function generatePDFWithFallback(caseData, caseId) {
        // Check if jsPDF is available
        if (window.jspdf && window.jspdf.jsPDF) {
            await generatePDFWithJSPDF(caseData, caseId);
        } else {
            // Fallback: Try to load jsPDF
            await loadJSPDFLibrary()
                .then(() => generatePDFWithJSPDF(caseData, caseId))
                .catch(error => {
                    console.error('Failed to load PDF library:', error);
                    // Final fallback: Simple text download
                    downloadAsText(caseData, caseId);
                });
        }
    }

    // Load jsPDF library dynamically
    function loadJSPDFLibrary() {
        return new Promise((resolve, reject) => {
            if (window.jspdf && window.jspdf.jsPDF) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                // Wait a bit for the library to initialize
                setTimeout(resolve, 100);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Load script dynamically
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Fallback: Download as text file
    function downloadAsText(caseData, caseId) {
        const textContent = generateTextReport(caseData, caseId);
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${caseId}_case_report.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showDownloadSuccess();
    }

    // Generate text report for fallback
    function generateTextReport(caseData, caseId) {
        let report = `CIVICEYE CASE REPORT\n`;
        report += `===================\n\n`;
        report += `Case ID: ${caseId}\n`;
        report += `Reporter Name: ${caseData.name || 'N/A'}\n`;
        report += `Crime Type: ${caseData.crimeType || 'N/A'}\n`;
        report += `Date Reported: ${caseData.createdAt ? new Date(caseData.createdAt).toLocaleString() : 'N/A'}\n`;
        report += `Status: ${formatStatus(caseData.status) || 'N/A'}\n`;
        report += `Location: ${caseData.location || (caseData.latitude && caseData.longitude ? 
            `Lat: ${caseData.latitude}, Long: ${caseData.longitude}` : 'N/A')}\n\n`;
        
        report += `STATUS HISTORY:\n`;
        report += `===============\n`;
        
        const statusHistory = caseData.history || generateDefaultHistory(caseData);
        statusHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        statusHistory.forEach(event => {
            const eventDate = new Date(event.timestamp);
            report += `• ${eventDate.toLocaleString()}\n`;
            report += `  ${event.description || 'Status updated'}\n`;
            if (event.officer) {
                report += `  By: ${event.officer}\n`;
            }
            report += '\n';
        });
        
        report += `\nGenerated on ${new Date().toLocaleString()} - CivicEye Case Management System`;
        return report;
    }

    function showDownloadSuccess() {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--completed);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.5s ease-out;
        `;
        successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Report downloaded successfully!';
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
        }, 3000);
    }

    // Enhanced download with better error handling
    async function downloadWithFallback(caseId) {
        try {
            // Method 1: Direct download
            const response = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(caseId)}/pdf`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/pdf',
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${caseId}_case_report.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                return true;
            }
        } catch (error) {
            console.warn('Method 1 failed, trying fallback...');
            
            // Method 2: Open in new tab
            try {
                window.open(`${API_BASE_URL}/reports/${encodeURIComponent(caseId)}/pdf`, '_blank');
                return true;
            } catch (fallbackError) {
                console.error('All download methods failed:', fallbackError);
                return false;
            }
        }
    }
    // Reset search form
    function resetSearch() {
        caseStatusSection.classList.add("hidden");
        caseIdInput.value = "";
        caseIdInput.focus();
    }

    // Format status for display
    function formatStatus(status) {
        const statusMap = {
            registered: "Registered",
            approved: "Approved",
            "Officer Assigned": "Officer Assigned",
            investigating: "Under Investigation",
            resolved: "Resolved",
        };
        return statusMap[status] || status || "Unknown";
    }

    // Get CSS class for status badge
    function getStatusClass(status) {
        const statusClasses = {
            registered: "status-registered",
            approved: "status-approved",
            "Officer Assigned": "status-approved",
            investigating: "status-investigating",
            resolved: "status-resolved",
        };
        return statusClasses[status] || "status-registered";
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove("hidden");
    }

    // Animate button on click
    function animateButton() {
        trackBtn.style.animation = "pulse 0.5s ease";
        setTimeout(() => {
            trackBtn.style.animation = "";
        }, 500);
    }

    // Animate error state
    function animateError() {
        caseIdInput.style.animation = "shake 0.5s";
        setTimeout(() => {
            caseIdInput.style.animation = "";
        }, 500);
    }

    // Show case status with animation
    function showCaseStatus() {
        caseStatusSection.style.opacity = 0;
        caseStatusSection.classList.remove("hidden");
        setTimeout(() => {
            caseStatusSection.style.opacity = 1;
            caseStatusSection.style.transform = "translateY(0)";
        }, 10);
    }

    // Sanitize input
    function sanitizeInput(input) {
        return input.replace(/[^a-zA-Z0-9-\/]/g, "");
    }

    // Helper function to map backend status to our progress steps
    function mapStatusToStep(status) {
        const statusMap = {
            "registered": "registered",
            "approved": "approved",
            "Officer Assigned": "officerAssigned", 
            "investigating": "investigating",
            "resolved": "resolved"
        };
        return statusMap[status] || status;
    }
});
