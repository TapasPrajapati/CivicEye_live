// Mock FIR data
const mockFIRs = [
  {
    id: "FIR2024001",
    status: "pending",
    complainant: "Aditya Kapoor",
    location: "123 Main St, City",
    date: "2024-02-20",
    type: "Theft",
    description: "Mobile phone theft at shopping mall",
    officer: "Rahul Sharma",
    contact: "+1234567890",
    evidence: [
      { type: "image", name: "crime_scene.jpg" },
      { type: "document", name: "witness_statement.pdf" },
    ],
  },
  {
    id: "FIR2024002",
    status: "investigating",
    complainant: "Sneha Das",
    location: "456 Park Ave, City",
    date: "2024-02-19",
    type: "Assault",
    description: "Physical assault in parking lot",
    officer: "Karthik Nair",
    contact: "+1234567891",
    evidence: [
      { type: "video", name: "cctv_footage.mp4" },
      { type: "document", name: "medical_report.pdf" },
    ],
  },
  {
    id: "FIR2024003",
    status: "resolved",
    complainant: "Arjun Reddy",
    location: "789 Oak Rd, City",
    date: "2024-02-18",
    type: "Vandalism",
    description: "Property damage to store front",
    officer: "Ananya Joshi",
    contact: "+1234567892",
    evidence: [{ type: "image", name: "damage_photo.jpg" }],
  },
];

// Initialize FIR list
function initFIRList() {
  const firList = document.querySelector(".fir-list");
  firList.innerHTML = ""; // Clear existing items

  mockFIRs.forEach((fir) => {
    const firItem = createFIRListItem(fir);
    firList.appendChild(firItem);
  });
}

// Create FIR list item
function createFIRListItem(fir) {
  const div = document.createElement("div");
  div.className = "fir-item";
  div.innerHTML = `
        <div class="fir-item-header">
            <span class="fir-number">${fir.id}</span>
            <span class="fir-status status-${
              fir.status
            }">${capitalizeFirstLetter(fir.status)}</span>
        </div>
        <div class="fir-item-content">
            <div class="fir-info-group">
                <span class="fir-info-label">Complainant</span>
                <span class="fir-info-value">${fir.complainant}</span>
            </div>
            <div class="fir-info-group">
                <span class="fir-info-label">Type</span>
                <span class="fir-info-value">${fir.type}</span>
            </div>
            <div class="fir-info-group">
                <span class="fir-info-label">Date</span>
                <span class="fir-info-value">${formatDate(fir.date)}</span>
            </div>
        </div>
    `;

  div.addEventListener("click", () => showFIRDetail(fir));
  return div;
}

// Show FIR detail modal
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
                    <span class="detail-value">${capitalizeFirstLetter(
                      fir.status
                    )}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date Filed</span>
                    <span class="detail-value">${formatDate(fir.date)}</span>
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
            <h3>Case Details</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Description</span>
                    <span class="detail-value">${fir.description}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Assigned Officer</span>
                    <span class="detail-value">${fir.officer}</span>
                </div>
            </div>
        </div>

        <div class="fir-detail-section">
            <h3>Evidence</h3>
            <div class="evidence-list">
                ${fir.evidence
                  .map(
                    (item) => `
                    <div class="evidence-item">
                        <i class="fas fa-${getEvidenceIcon(item.type)}"></i>
                        <span>${item.name}</span>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

  modal.style.display = "block";
}

// Helper functions
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function getEvidenceIcon(type) {
  switch (type) {
    case "image":
      return "image";
    case "video":
      return "video";
    case "document":
      return "file-alt";
    default:
      return "file";
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  initFIRList();

  // Close modal
  const closeModal = document.querySelector(".close-modal");
  const modal = document.getElementById("firDetailModal");

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Filter handling
  const statusFilter = document.getElementById("statusFilter");
  const dateFilter = document.getElementById("dateFilter");

  statusFilter.addEventListener("change", filterFIRs);
  dateFilter.addEventListener("change", filterFIRs);
});

// Filter FIRs
function filterFIRs() {
  const status = document.getElementById("statusFilter").value;
  const date = document.getElementById("dateFilter").value;

  let filteredFIRs = [...mockFIRs];

  if (status !== "all") {
    filteredFIRs = filteredFIRs.filter((fir) => fir.status === status);
  }

  // Add date filtering logic here
  // This is a simplified version - you would need to implement proper date filtering based on your requirements

  const firList = document.querySelector(".fir-list");
  firList.innerHTML = "";
  filteredFIRs.forEach((fir) => {
    const firItem = createFIRListItem(fir);
    firList.appendChild(firItem);
  });
}
