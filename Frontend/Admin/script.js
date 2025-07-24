// Mock Data
const mockFIRs = [
  {
    id: 1001,
    type: "Theft",
    location: "Downtown Market",
    reporter: "John Smith",
    date: "2024-01-15",
    status: "Under Investigation",
  },
  {
    id: 1002,
    type: "Assault",
    location: "Park Avenue",
    reporter: "Sarah Johnson",
    date: "2024-01-14",
    status: "Reported",
  },
  {
    id: 1003,
    type: "Fraud",
    location: "Business District",
    reporter: "Mike Wilson",
    date: "2024-01-13",
    status: "Resolved",
  },
  {
    id: 1004,
    type: "Vandalism",
    location: "School Zone",
    reporter: "Lisa Brown",
    date: "2024-01-12",
    status: "Under Investigation",
  },
  {
    id: 1005,
    type: "Theft",
    location: "Shopping Mall",
    reporter: "David Lee",
    date: "2024-01-11",
    status: "Reported",
  },
  {
    id: 1006,
    type: "Assault",
    location: "Residential Area",
    reporter: "Emma Davis",
    date: "2024-01-10",
    status: "Resolved",
  },
  {
    id: 1007,
    type: "Fraud",
    location: "Bank Street",
    reporter: "Robert Taylor",
    date: "2024-01-09",
    status: "Under Investigation",
  },
  {
    id: 1008,
    type: "Vandalism",
    location: "Public Park",
    reporter: "Jennifer White",
    date: "2024-01-08",
    status: "Reported",
  },
];

const mockUsers = [
  {
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1-555-0101",
    registrationDate: "2023-06-15",
    status: "Active",
  },
  {
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1-555-0102",
    registrationDate: "2023-07-20",
    status: "Active",
  },
  {
    name: "Mike Wilson",
    email: "mike.wilson@email.com",
    phone: "+1-555-0103",
    registrationDate: "2023-08-10",
    status: "Suspended",
  },
  {
    name: "Lisa Brown",
    email: "lisa.brown@email.com",
    phone: "+1-555-0104",
    registrationDate: "2023-09-05",
    status: "Active",
  },
  {
    name: "David Lee",
    email: "david.lee@email.com",
    phone: "+1-555-0105",
    registrationDate: "2023-10-12",
    status: "Active",
  },
  {
    name: "Emma Davis",
    email: "emma.davis@email.com",
    phone: "+1-555-0106",
    registrationDate: "2023-11-18",
    status: "Active",
  },
  {
    name: "Robert Taylor",
    email: "robert.t@email.com",
    phone: "+1-555-0107",
    registrationDate: "2023-12-03",
    status: "Suspended",
  },
  {
    name: "Jennifer White",
    email: "jennifer.w@email.com",
    phone: "+1-555-0108",
    registrationDate: "2024-01-08",
    status: "Active",
  },
];

const mockOfficers = [
  {
    badge: "B001",
    name: "Officer Smith",
    rank: "Sergeant",
    department: "Patrol",
    status: "On Duty",
  },
  {
    badge: "B002",
    name: "Officer Johnson",
    rank: "Constable",
    department: "Investigation",
    status: "Off Duty",
  },
  {
    badge: "B003",
    name: "Officer Wilson",
    rank: "Inspector",
    department: "Traffic",
    status: "On Duty",
  },
  {
    badge: "B004",
    name: "Officer Brown",
    rank: "Constable",
    department: "Patrol",
    status: "On Duty",
  },
  {
    badge: "B005",
    name: "Officer Lee",
    rank: "Sergeant",
    department: "Investigation",
    status: "Off Duty",
  },
  {
    badge: "B006",
    name: "Officer Davis",
    rank: "Constable",
    department: "Traffic",
    status: "On Duty",
  },
];

const mockLogs = [
  {
    timestamp: "2024-01-15 14:30:25",
    user: "admin",
    action: "User Login",
    type: "Login",
    level: "Info",
    details: "Successful login from IP 192.168.1.100",
  },
  {
    timestamp: "2024-01-15 14:25:10",
    user: "officer.smith",
    action: "FIR Access",
    type: "Data Access",
    level: "Info",
    details: "Accessed FIR #1001",
  },
  {
    timestamp: "2024-01-15 14:20:45",
    user: "system",
    action: "Database Backup",
    type: "System",
    level: "Info",
    details: "Automated backup completed successfully",
  },
  {
    timestamp: "2024-01-15 14:15:30",
    user: "admin",
    action: "User Creation",
    type: "Data Access",
    level: "Warning",
    details: "New user account created for john.doe",
  },
  {
    timestamp: "2024-01-15 14:10:15",
    user: "officer.johnson",
    action: "Case Update",
    type: "Data Access",
    level: "Info",
    details: "Updated status for Case #1002",
  },
  {
    timestamp: "2024-01-15 14:05:00",
    user: "system",
    action: "Login Failure",
    type: "Error",
    level: "Error",
    details: "Failed login attempt from IP 10.0.0.50",
  },
];

// Global Variables
let currentPage = 1;
const itemsPerPage = 10;
let currentSortColumn = -1;
let currentSortDirection = "asc";

// DOM Elements
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");
const menuToggle = document.getElementById("menuToggle");

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  populateTables();
  setupEventListeners();
  setupDateInputs();
});

function initializeApp() {
  // Set default dates
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");

  if (startDate) startDate.value = thirtyDaysAgo.toISOString().split("T")[0];
  if (endDate) endDate.value = today.toISOString().split("T")[0];
}

function setupEventListeners() {
  // Menu toggle
  menuToggle.addEventListener("click", toggleSidebar);

  // Search functionality
  const firSearch = document.getElementById("firSearch");
  const userSearch = document.getElementById("userSearch");
  const logSearch = document.getElementById("logSearch");

  if (firSearch) firSearch.addEventListener("input", filterFIRs);
  if (userSearch) userSearch.addEventListener("input", filterUsers);
  if (logSearch) logSearch.addEventListener("input", filterLogs);

  // Filter functionality
  const statusFilter = document.getElementById("statusFilter");
  const typeFilter = document.getElementById("typeFilter");
  const userStatusFilter = document.getElementById("userStatusFilter");
  const logTypeFilter = document.getElementById("logTypeFilter");
  const logLevelFilter = document.getElementById("logLevelFilter");
  const logDateFilter = document.getElementById("logDateFilter");

  if (statusFilter) statusFilter.addEventListener("change", filterFIRs);
  if (typeFilter) typeFilter.addEventListener("change", filterFIRs);
  if (userStatusFilter)
    userStatusFilter.addEventListener("change", filterUsers);
  if (logTypeFilter) logTypeFilter.addEventListener("change", filterLogs);
  if (logLevelFilter) logLevelFilter.addEventListener("change", filterLogs);
  if (logDateFilter) logDateFilter.addEventListener("change", filterLogs);

  // Theme switcher
  const themeOptions = document.querySelectorAll(".theme-option");
  themeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      themeOptions.forEach((opt) => opt.classList.remove("active"));
      this.classList.add("active");

      const theme = this.dataset.theme;
      if (theme === "dark") {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
    });
  });

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("confirmModal");
    if (event.target === modal) {
      closeModal();
    }
  });
}

function setupDateInputs() {
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split("T")[0];

  dateInputs.forEach((input) => {
    if (!input.value) {
      input.value = today;
    }
  });
}

// Navigation Functions
function toggleSidebar() {
  sidebar.classList.toggle("open");
  mainContent.classList.toggle("shifted");
}

function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.remove("active"));

  // Show selected page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add("active");
  }

  // Update active menu item
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => item.classList.remove("active"));

  const activeMenuItem = document.querySelector(`[data-page="${pageId}"]`);
  if (activeMenuItem) {
    activeMenuItem.classList.add("active");
  }

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    sidebar.classList.remove("open");
    mainContent.classList.remove("shifted");
  }
}

// Table Population Functions
function populateTables() {
  populateFIRTable();
  populateUserTable();
  populateOfficerTable();
  populateLogTable();
}

function populateFIRTable() {
  const tbody = document.getElementById("firTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  mockFIRs.forEach((fir) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>#${fir.id}</td>
            <td>${fir.type}</td>
            <td>${fir.location}</td>
            <td>${fir.reporter}</td>
            <td>${fir.date}</td>
            <td><span class="status-badge ${fir.status
              .toLowerCase()
              .replace(" ", "")}">${fir.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewFIR(${
                      fir.id
                    })" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editFIR(${
                      fir.id
                    })" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteFIR(${
                      fir.id
                    })" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function populateUserTable() {
  const tbody = document.getElementById("userTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = mockUsers.slice(startIndex, endIndex);

  paginatedUsers.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.registrationDate}</td>
            <td><span class="status-badge ${user.status.toLowerCase()}">${
      user.status
    }</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewUser('${
                      user.email
                    }')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editUser('${
                      user.email
                    }')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <div class="toggle-switch">
                        <input type="checkbox" id="user-${user.email}" ${
      user.status === "Active" ? "checked" : ""
    } 
                               onchange="toggleUserStatus('${user.email}')">
                        <label for="user-${
                          user.email
                        }" class="toggle-label"></label>
                    </div>
                </div>
            </td>
        `;
    tbody.appendChild(row);
  });

  updatePaginationInfo();
}

function populateOfficerTable() {
  const tbody = document.getElementById("officerTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  mockOfficers.forEach((officer) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${officer.badge}</td>
            <td>${officer.name}</td>
            <td>${officer.rank}</td>
            <td>${officer.department}</td>
            <td><span class="status-badge ${officer.status
              .toLowerCase()
              .replace(" ", "")}">${officer.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewOfficer('${
                      officer.badge
                    }')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editOfficer('${
                      officer.badge
                    }')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function populateLogTable() {
  const tbody = document.getElementById("logTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  mockLogs.forEach((log) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${log.timestamp}</td>
            <td>${log.user}</td>
            <td>${log.action}</td>
            <td>${log.type}</td>
            <td><span class="status-badge ${log.level.toLowerCase()}">${
      log.level
    }</span></td>
            <td>
                <button class="btn-secondary" onclick="viewLogDetails('${
                  log.timestamp
                }')">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

// Filter Functions
function filterFIRs() {
  const searchTerm = document.getElementById("firSearch").value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;
  const typeFilter = document.getElementById("typeFilter").value;

  const filteredFIRs = mockFIRs.filter((fir) => {
    const matchesSearch =
      fir.id.toString().includes(searchTerm) ||
      fir.reporter.toLowerCase().includes(searchTerm) ||
      fir.location.toLowerCase().includes(searchTerm);
    const matchesStatus = !statusFilter || fir.status === statusFilter;
    const matchesType = !typeFilter || fir.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  updateFIRTable(filteredFIRs);
}

function filterUsers() {
  const searchTerm = document.getElementById("userSearch").value.toLowerCase();
  const statusFilter = document.getElementById("userStatusFilter").value;

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.phone.includes(searchTerm);
    const matchesStatus = !statusFilter || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  updateUserTable(filteredUsers);
}

function filterLogs() {
  const searchTerm = document.getElementById("logSearch").value.toLowerCase();
  const typeFilter = document.getElementById("logTypeFilter").value;
  const levelFilter = document.getElementById("logLevelFilter").value;
  const dateFilter = document.getElementById("logDateFilter").value;

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm) ||
      log.action.toLowerCase().includes(searchTerm);
    const matchesType = !typeFilter || log.type === typeFilter;
    const matchesLevel = !levelFilter || log.level === levelFilter;
    const matchesDate = !dateFilter || log.timestamp.startsWith(dateFilter);

    return matchesSearch && matchesType && matchesLevel && matchesDate;
  });

  updateLogTable(filteredLogs);
}

function updateFIRTable(data) {
  const tbody = document.getElementById("firTableBody");
  tbody.innerHTML = "";

  data.forEach((fir) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>#${fir.id}</td>
            <td>${fir.type}</td>
            <td>${fir.location}</td>
            <td>${fir.reporter}</td>
            <td>${fir.date}</td>
            <td><span class="status-badge ${fir.status
              .toLowerCase()
              .replace(" ", "")}">${fir.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewFIR(${
                      fir.id
                    })" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editFIR(${
                      fir.id
                    })" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteFIR(${
                      fir.id
                    })" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function updateUserTable(data) {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  data.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.registrationDate}</td>
            <td><span class="status-badge ${user.status.toLowerCase()}">${
      user.status
    }</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewUser('${
                      user.email
                    }')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editUser('${
                      user.email
                    }')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <div class="toggle-switch">
                        <input type="checkbox" id="user-${user.email}" ${
      user.status === "Active" ? "checked" : ""
    } 
                               onchange="toggleUserStatus('${user.email}')">
                        <label for="user-${
                          user.email
                        }" class="toggle-label"></label>
                    </div>
                </div>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function updateLogTable(data) {
  const tbody = document.getElementById("logTableBody");
  tbody.innerHTML = "";

  data.forEach((log) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${log.timestamp}</td>
            <td>${log.user}</td>
            <td>${log.action}</td>
            <td>${log.type}</td>
            <td><span class="status-badge ${log.level.toLowerCase()}">${
      log.level
    }</span></td>
            <td>
                <button class="btn-secondary" onclick="viewLogDetails('${
                  log.timestamp
                }')">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

// Sorting Functions
function sortTable(tableId, columnIndex) {
  const table = document.getElementById(tableId);
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  // Determine sort direction
  if (currentSortColumn === columnIndex) {
    currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
  } else {
    currentSortDirection = "asc";
    currentSortColumn = columnIndex;
  }

  // Sort rows
  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].textContent.trim();
    const bValue = b.cells[columnIndex].textContent.trim();

    // Handle numeric values
    if (!isNaN(aValue) && !isNaN(bValue)) {
      return currentSortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Handle text values
    if (currentSortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Update table
  tbody.innerHTML = "";
  rows.forEach((row) => tbody.appendChild(row));

  // Update sort indicators
  const headers = table.querySelectorAll("th");
  headers.forEach((header, index) => {
    const icon = header.querySelector("i");
    if (icon) {
      if (index === columnIndex) {
        icon.className =
          currentSortDirection === "asc"
            ? "fas fa-sort-up"
            : "fas fa-sort-down";
      } else {
        icon.className = "fas fa-sort";
      }
    }
  });
}

// Pagination Functions
function changePage(direction) {
  const totalPages = Math.ceil(mockUsers.length / itemsPerPage);

  if (direction === 1 && currentPage < totalPages) {
    currentPage++;
  } else if (direction === -1 && currentPage > 1) {
    currentPage--;
  }

  populateUserTable();
}

function updatePaginationInfo() {
  const totalPages = Math.ceil(mockUsers.length / itemsPerPage);
  const pageInfo = document.getElementById("pageInfo");
  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }
}

// Action Functions
function viewFIR(id) {
  showModal("View FIR", `Viewing details for FIR #${id}`, () => {
    console.log(`Viewing FIR ${id}`);
  });
}

function editFIR(id) {
  showModal("Edit FIR", `Edit FIR #${id}?`, () => {
    console.log(`Editing FIR ${id}`);
  });
}

function deleteFIR(id) {
  showModal("Delete FIR", `Are you sure you want to delete FIR #${id}?`, () => {
    console.log(`Deleting FIR ${id}`);
    // Remove from mock data and refresh table
    const index = mockFIRs.findIndex((fir) => fir.id === id);
    if (index > -1) {
      mockFIRs.splice(index, 1);
      populateFIRTable();
    }
  });
}

function viewUser(email) {
  showModal("View User", `Viewing details for user: ${email}`, () => {
    console.log(`Viewing user ${email}`);
  });
}

function editUser(email) {
  showModal("Edit User", `Edit user: ${email}?`, () => {
    console.log(`Editing user ${email}`);
  });
}

function toggleUserStatus(email) {
  const user = mockUsers.find((u) => u.email === email);
  if (user) {
    user.status = user.status === "Active" ? "Suspended" : "Active";
    populateUserTable();
  }
}

function viewOfficer(badge) {
  showModal("View Officer", `Viewing details for Officer ${badge}`, () => {
    console.log(`Viewing officer ${badge}`);
  });
}

function editOfficer(badge) {
  showModal("Edit Officer", `Edit Officer ${badge}?`, () => {
    console.log(`Editing officer ${badge}`);
  });
}

function viewLogDetails(timestamp) {
  const log = mockLogs.find((l) => l.timestamp === timestamp);
  if (log) {
    showModal("Log Details", log.details, () => {
      console.log(`Viewing log details for ${timestamp}`);
    });
  }
}

// Modal Functions
function showModal(title, message, callback) {
  const modal = document.getElementById("confirmModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const confirmButton = document.getElementById("confirmButton");

  modalTitle.textContent = title;
  modalMessage.textContent = message;

  confirmButton.onclick = () => {
    if (callback) callback();
    closeModal();
  };

  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("confirmModal");
  modal.classList.remove("show");
}

// Accordion Functions
function toggleAccordion(header) {
  const item = header.parentElement;
  const isActive = item.classList.contains("active");

  // Close all accordion items
  const allItems = document.querySelectorAll(".accordion-item");
  allItems.forEach((item) => item.classList.remove("active"));

  // Open clicked item if it wasn't active
  if (!isActive) {
    item.classList.add("active");
  }
}

// Form Validation
function validateForm(formElement) {
  const inputs = formElement.querySelectorAll(
    "input[required], select[required], textarea[required]"
  );
  let isValid = true;

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.style.borderColor = "var(--danger)";
      isValid = false;
    } else {
      input.style.borderColor = "#d1d5db";
    }
  });

  return isValid;
}

// Event Handlers for Forms
document.addEventListener("submit", (e) => {
  if (e.target.classList.contains("ticket-form")) {
    e.preventDefault();

    if (validateForm(e.target)) {
      showModal("Success", "Support ticket submitted successfully!", () => {
        e.target.reset();
      });
    } else {
      showModal("Error", "Please fill in all required fields.");
    }
  }
});

// Responsive Sidebar Behavior
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.add("open");
    mainContent.classList.add("shifted");
  } else {
    sidebar.classList.remove("open");
    mainContent.classList.remove("shifted");
  }
});

// Initialize responsive behavior
if (window.innerWidth > 768) {
  sidebar.classList.add("open");
  mainContent.classList.add("shifted");
}

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    const activeSearch = document.querySelector(
      ".page.active .search-bar input"
    );
    if (activeSearch) {
      activeSearch.focus();
    }
  }

  // Escape to close modal
  if (e.key === "Escape") {
    closeModal();
  }
});

// Auto-save functionality for forms
function setupAutoSave() {
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        // Simulate auto-save
        console.log("Auto-saving form data...");
      });
    });
  });
}

// Initialize auto-save
setupAutoSave();

// Performance monitoring
function logPerformance() {
  if (performance.mark) {
    performance.mark("app-loaded");
    console.log("Application loaded successfully");
  }
}

// Call performance logging
logPerformance();
