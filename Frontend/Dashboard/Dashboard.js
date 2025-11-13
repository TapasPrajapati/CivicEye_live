// Global variables
let crimeData = [];
let currentChartType = 'line';
let currentState = '';
let currentYear = '';
let currentCrimeType = '';
let currentMap = null;
let charts = {};

// Enhanced state information
const stateInfo = {
    "Rajasthan": {
        capital: "Jaipur",
        cm: "Bhajan Lal Sharma",
        formed: "1949-03-30",
        area: "342,239 km²",
        population: "68,548,437",
        density: "200/km²",
        officialLanguage: "Hindi",
        majorCities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
        touristAttractions: ["Hawa Mahal", "Amber Fort", "Ranthambore National Park", "City Palace", "Jaisalmer Fort"],
        policeStations: 1200,
        safetyIndex: 7.2,
        crimeRate: "245.3 per 100k",
        literacyRate: "66.1%",
        developmentIndex: "Medium"
    },
    "Gujarat": {
        capital: "Gandhinagar",
        cm: "Bhupendrabhai Patel",
        formed: "1960-05-01",
        area: "196,024 km²",
        population: "63,872,399",
        density: "308/km²",
        officialLanguage: "Gujarati",
        majorCities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
        touristAttractions: ["Statue of Unity", "Rann of Kutch", "Gir National Park", "Somnath Temple", "Dwarka"],
        policeStations: 950,
        safetyIndex: 7.8,
        crimeRate: "198.7 per 100k",
        literacyRate: "78.0%",
        developmentIndex: "High"
    },
    "Andhra Pradesh": {
        capital: "Amaravati",
        cm: "Y. S. Jagan Mohan Reddy",
        formed: "1956-11-01",
        area: "160,205 km²",
        population: "49,577,103",
        density: "303/km²",
        officialLanguage: "Telugu",
        majorCities: ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore"],
        touristAttractions: ["Tirumala Temple", "Araku Valley", "Borra Caves", "Charminar", "Golconda Fort"],
        policeStations: 1100,
        safetyIndex: 6.9,
        crimeRate: "267.8 per 100k",
        literacyRate: "67.4%",
        developmentIndex: "Medium"
    },
    "Maharashtra": {
        capital: "Mumbai",
        cm: "Eknath Shinde",
        formed: "1960-05-01",
        area: "307,713 km²",
        population: "112,372,972",
        density: "365/km²",
        officialLanguage: "Marathi",
        majorCities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
        touristAttractions: ["Gateway of India", "Ajanta & Ellora Caves", "Lonavala", "Mahabaleshwar", "Sanjay Gandhi National Park"],
        policeStations: 1500,
        safetyIndex: 7.5,
        crimeRate: "234.1 per 100k",
        literacyRate: "82.3%",
        developmentIndex: "High"
    },
    "Uttar Pradesh": {
        capital: "Lucknow",
        cm: "Yogi Adityanath",
        formed: "1950-01-26",
        area: "243,286 km²",
        population: "199,812,341",
        density: "828/km²",
        officialLanguage: "Hindi",
        majorCities: ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
        touristAttractions: ["Taj Mahal", "Varanasi Ghats", "Ayodhya", "Sarnath", "Fatehpur Sikri"],
        policeStations: 1800,
        safetyIndex: 6.5,
        crimeRate: "289.6 per 100k",
        literacyRate: "67.7%",
        developmentIndex: "Medium"
    },
    "Karnataka": {
        capital: "Bengaluru",
        cm: "Siddaramaiah",
        formed: "1956-11-01",
        area: "191,791 km²",
        population: "61,095,297",
        density: "319/km²",
        officialLanguage: "Kannada",
        majorCities: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi"],
        touristAttractions: ["Mysore Palace", "Hampi", "Coorg", "Gokarna", "Jog Falls"],
        policeStations: 1250,
        safetyIndex: 7.6,
        crimeRate: "215.4 per 100k",
        literacyRate: "75.4%",
        developmentIndex: "High"
    }
};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        showLoadingScreen();
        await loadData();
        populateDropdowns();
        initializeTheme();
        initializeEventListeners();
        renderDashboard();
        updateCurrentDate();
        hideLoadingScreen();
    } catch (error) {
        console.error("Error initializing dashboard:", error);
        showError("Failed to initialize dashboard. Please refresh the page.");
        hideLoadingScreen();
    }
}

function showLoadingScreen() {
    document.getElementById('loadingScreen').classList.remove('hidden');
}

function hideLoadingScreen() {
    document.getElementById('loadingScreen').classList.add('hidden');
}

function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button class="error-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
    
    // Close button functionality
    errorDiv.querySelector('.error-close').addEventListener('click', function() {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    });
}

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

async function loadData() {
    try {
        console.log("Loading crime data...");
        const response = await fetch('assets/crimeReport.xlsx');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Process the data (skip header row)
        crimeData = [];
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length >= 6) {
                crimeData.push({
                    state: row[0]?.toString().trim() || 'Unknown',
                    year: parseInt(row[1]) || 2023,
                    theft: parseInt(row[2]) || 0,
                    murder: parseInt(row[3]) || 0,
                    assault: parseInt(row[4]) || 0,
                    rape: parseInt(row[5]) || 0
                });
            }
        }
        
        console.log(`Loaded ${crimeData.length} crime records`);
        
        // If no data was loaded, create sample data for demonstration
        if (crimeData.length === 0) {
            console.warn("No data found in Excel file, generating sample data...");
            generateSampleData();
        }
        
    } catch (error) {
        console.error('Error loading Excel file:', error);
        console.warn("Generating sample data for demonstration...");
        generateSampleData();
    }
}

function generateSampleData() {
    const states = ["Rajasthan", "Gujarat", "Andhra Pradesh", "Maharashtra", "Uttar Pradesh", "Karnataka"];
    const years = [2020, 2021, 2022, 2023];
    
    crimeData = [];
    
    states.forEach(state => {
        years.forEach(year => {
            crimeData.push({
                state: state,
                year: year,
                theft: Math.floor(Math.random() * 5000) + 1000,
                murder: Math.floor(Math.random() * 500) + 50,
                assault: Math.floor(Math.random() * 3000) + 500,
                rape: Math.floor(Math.random() * 1000) + 100
            });
        });
    });
    
    console.log("Generated sample data:", crimeData.length, "records");
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function initializeEventListeners() {
    // Theme toggle
    document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
    
    // Filter controls
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('stateDropdown').addEventListener('change', handleStateChange);
    document.getElementById('yearDropdown').addEventListener('change', handleYearChange);
    document.getElementById('crimeTypeDropdown').addEventListener('change', handleCrimeTypeChange);
    
    // Chart type buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentChartType = this.getAttribute('data-chart');
            renderCharts();
        });
    });
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const view = this.getAttribute('data-view');
            toggleView(view);
        });
    });
    
    // Map layer buttons
    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // Implement map layer switching here
        });
    });
    
    // Search functionality
    document.getElementById('stateSearch').addEventListener('input', handleSearch);
    
    // Export button
    document.querySelector('.export-btn').addEventListener('click', exportData);
}

function populateDropdowns() {
    const stateDropdown = document.getElementById('stateDropdown');
    const yearDropdown = document.getElementById('yearDropdown');
    
    // Get unique states and years
    const states = [...new Set(crimeData.map(item => item.state))].sort();
    const years = [...new Set(crimeData.map(item => item.year))].sort((a, b) => b - a);
    
    // Clear existing options
    stateDropdown.innerHTML = '<option value="">All States</option>';
    yearDropdown.innerHTML = '<option value="">All Years</option>';
    
    // Populate state dropdown
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateDropdown.appendChild(option);
    });
    
    // Populate year dropdown
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearDropdown.appendChild(option);
    });
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

function applyFilters() {
    currentState = document.getElementById('stateDropdown').value;
    currentYear = document.getElementById('yearDropdown').value;
    currentCrimeType = document.getElementById('crimeTypeDropdown').value;
    
    renderDashboard();
}

function handleStateChange(e) {
    currentState = e.target.value;
    renderDashboard();
}

function handleYearChange(e) {
    currentYear = e.target.value;
    renderDashboard();
}

function handleCrimeTypeChange(e) {
    currentCrimeType = e.target.value;
    renderDashboard();
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tableRows = document.querySelectorAll('#crimeTable tbody tr');
    
    tableRows.forEach(row => {
        const stateName = row.cells[0].textContent.toLowerCase();
        if (stateName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function toggleView(view) {
    const mapView = document.getElementById('mapView');
    const tableView = document.getElementById('tableView');
    
    if (view === 'map') {
        mapView.classList.add('active');
        tableView.classList.remove('active');
        initializeMap();
    } else {
        mapView.classList.remove('active');
        tableView.classList.add('active');
        renderDataTable();
    }
}

function renderDashboard() {
    updateQuickStats();
    renderCharts();
    renderDataTable();
    updateStateDetails();
    
    if (document.getElementById('mapView').classList.contains('active')) {
        initializeMap();
    }
}

function updateQuickStats() {
    const filteredData = getFilteredData();
    
    const totals = {
        theft: filteredData.reduce((sum, item) => sum + item.theft, 0),
        murder: filteredData.reduce((sum, item) => sum + item.murder, 0),
        assault: filteredData.reduce((sum, item) => sum + item.assault, 0),
        rape: filteredData.reduce((sum, item) => sum + item.rape, 0)
    };
    
    document.getElementById('totalTheft').textContent = totals.theft.toLocaleString();
    document.getElementById('totalMurder').textContent = totals.murder.toLocaleString();
    document.getElementById('totalAssault').textContent = totals.assault.toLocaleString();
    document.getElementById('totalRape').textContent = totals.rape.toLocaleString();
}

function getFilteredData() {
    let filtered = [...crimeData];
    
    if (currentState) {
        filtered = filtered.filter(item => item.state === currentState);
    }
    
    if (currentYear) {
        filtered = filtered.filter(item => item.year.toString() === currentYear);
    }
    
    return filtered;
}

function renderCharts() {
    renderTrendChart();
    renderDistributionChart();
    renderComparisonChart();
}

function renderTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const filteredData = getFilteredData();
    
    // Destroy existing chart if it exists
    if (charts.trendChart) {
        charts.trendChart.destroy();
    }
    
    const years = [...new Set(filteredData.map(item => item.year))].sort();
    const states = [...new Set(filteredData.map(item => item.state))];
    
    let datasets = [];
    
    if (currentCrimeType) {
        // Show single crime type trend
        const crimeData = years.map(year => {
            return filteredData
                .filter(item => item.year === year)
                .reduce((sum, item) => sum + item[currentCrimeType], 0);
        });
        
        datasets = [{
            label: currentCrimeType.charAt(0).toUpperCase() + currentCrimeType.slice(1),
            data: crimeData,
            borderColor: getCrimeColor(currentCrimeType),
            backgroundColor: `${getCrimeColor(currentCrimeType)}20`,
            fill: currentChartType === 'area',
            tension: 0.4,
            borderWidth: 3
        }];
    } else {
        // Show all crime types
        const crimeTypes = ['theft', 'murder', 'assault', 'rape'];
        datasets = crimeTypes.map(type => {
            const data = years.map(year => {
                return filteredData
                    .filter(item => item.year === year)
                    .reduce((sum, item) => sum + item[type], 0);
            });
            
            return {
                label: type.charAt(0).toUpperCase() + type.slice(1),
                data: data,
                borderColor: getCrimeColor(type),
                backgroundColor: `${getCrimeColor(type)}20`,
                fill: currentChartType === 'area',
                tension: 0.4,
                borderWidth: 2
            };
        });
    }
    
    const chartType = currentChartType === 'bar' ? 'bar' : 
                     currentChartType === 'area' ? 'line' : 'line';
    
    charts.trendChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            elements: {
                point: {
                    radius: 4,
                    hoverRadius: 6
                }
            }
        }
    });
}

function renderDistributionChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    const filteredData = getFilteredData();
    
    if (charts.distributionChart) {
        charts.distributionChart.destroy();
    }
    
    const totals = {
        theft: filteredData.reduce((sum, item) => sum + item.theft, 0),
        murder: filteredData.reduce((sum, item) => sum + item.murder, 0),
        assault: filteredData.reduce((sum, item) => sum + item.assault, 0),
        rape: filteredData.reduce((sum, item) => sum + item.rape, 0)
    };
    
    // Fix for chart being cut off - adjust layout and padding
    charts.distributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Theft', 'Murder', 'Assault', 'Rape'],
            datasets: [{
                data: [totals.theft, totals.murder, totals.assault, totals.rape],
                backgroundColor: [
                    getCrimeColor('theft'),
                    getCrimeColor('murder'),
                    getCrimeColor('assault'),
                    getCrimeColor('rape')
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Changed to true for better proportions
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            },
            plugins: {
                legend: {
                    position: 'bottom', // Moved to bottom to prevent cutting
                    labels: {
                        font: {
                            size: 12
                        },
                        padding: 15,
                        boxWidth: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    bodyFont: {
                        size: 13
                    },
                    padding: 10,
                    cornerRadius: 8
                }
            },
            cutout: '50%' // Reduced cutout to make chart larger
        }
    });
}

function renderComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    const filteredData = getFilteredData();
    
    if (charts.comparisonChart) {
        charts.comparisonChart.destroy();
    }
    
    const states = [...new Set(filteredData.map(item => item.state))].sort();
    
    let datasets = [];
    
    if (currentCrimeType) {
        const data = states.map(state => {
            return filteredData
                .filter(item => item.state === state)
                .reduce((sum, item) => sum + item[currentCrimeType], 0);
        });
        
        datasets = [{
            label: currentCrimeType.charAt(0).toUpperCase() + currentCrimeType.slice(1),
            data: data,
            backgroundColor: getCrimeColor(currentCrimeType),
            borderColor: getCrimeColor(currentCrimeType),
            borderWidth: 1
        }];
    } else {
        const crimeTypes = ['theft', 'murder', 'assault', 'rape'];
        datasets = crimeTypes.map(type => {
            const data = states.map(state => {
                return filteredData
                    .filter(item => item.state === state)
                    .reduce((sum, item) => sum + item[type], 0);
            });
            
            return {
                label: type.charAt(0).toUpperCase() + type.slice(1),
                data: data,
                backgroundColor: getCrimeColor(type),
                borderColor: getCrimeColor(type),
                borderWidth: 1
            };
        });
    }
    
    charts.comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: states,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    bodyFont: {
                        size: 13
                    },
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function getCrimeColor(crimeType) {
    const colors = {
        theft: '#4361ee',
        murder: '#f72585',
        assault: '#f8961e',
        rape: '#560bad'
    };
    return colors[crimeType] || '#4361ee';
}

function renderDataTable() {
    const tableBody = document.querySelector('#crimeTable tbody');
    const filteredData = getFilteredData();
    
    // Group by state
    const stateData = {};
    filteredData.forEach(item => {
        if (!stateData[item.state]) {
            stateData[item.state] = {
                theft: 0,
                murder: 0,
                assault: 0,
                rape: 0
            };
        }
        stateData[item.state].theft += item.theft;
        stateData[item.state].murder += item.murder;
        stateData[item.state].assault += item.assault;
        stateData[item.state].rape += item.rape;
    });
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Populate table
    Object.entries(stateData).forEach(([state, data]) => {
        const total = data.theft + data.murder + data.assault + data.rape;
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${state}</td>
            <td>${data.theft.toLocaleString()}</td>
            <td>${data.murder.toLocaleString()}</td>
            <td>${data.assault.toLocaleString()}</td>
            <td>${data.rape.toLocaleString()}</td>
            <td>${total.toLocaleString()}</td>
            <td>
                <span class="trend-indicator ${getTrendClass(total)}">
                    <i class="fas fa-arrow-${getTrendIcon(total)}"></i>
                </span>
            </td>
        `;
        
        row.addEventListener('click', () => {
            document.getElementById('stateDropdown').value = state;
            currentState = state;
            renderDashboard();
            document.getElementById('stateDetails').scrollIntoView({ behavior: 'smooth' });
        });
        
        tableBody.appendChild(row);
    });
}

function getTrendClass(total) {
    // Simple trend calculation based on total crimes
    return total > 10000 ? 'up' : 'down';
}

function getTrendIcon(total) {
    return total > 10000 ? 'up' : 'down';
}

function initializeMap() {
    const mapContainer = document.getElementById('indiaMap');
    
    if (!mapContainer) return;
    
    // Initialize Leaflet map
    if (currentMap) {
        currentMap.remove();
    }
    
    currentMap = L.map('indiaMap').setView([20.5937, 78.9629], 5);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(currentMap);
    
    // Calculate total crimes per state from actual data
    const stateData = {};
    crimeData.forEach(item => {
        if (!stateData[item.state]) {
            stateData[item.state] = 0;
        }
        stateData[item.state] += item.theft + item.murder + item.assault + item.rape;
    });
    
    // Find the maximum crime value for color scaling
    const maxCrime = Math.max(...Object.values(stateData));
    
    // Add markers for states with coordinates
    const stateCoordinates = {
        "Andhra Pradesh": [15.9129, 79.7400],
        "Arunachal Pradesh": [28.2180, 94.7278],
        "Assam": [26.2006, 92.9376],
        "Bihar": [25.0961, 85.3131],
        "Chhattisgarh": [21.2787, 81.8661],
        "Goa": [15.2993, 74.1240],
        "Gujarat": [22.2587, 71.1924],
        "Haryana": [29.0588, 76.0856],
        "Himachal Pradesh": [31.1048, 77.1734],
        "Jharkhand": [23.6102, 85.2799],
        "Karnataka": [15.3173, 75.7139],
        "Kerala": [10.8505, 76.2711],
        "Madhya Pradesh": [22.9734, 78.6569],
        "Maharashtra": [19.7515, 75.7139],
        "Manipur": [24.6637, 93.9063],
        "Meghalaya": [25.4670, 91.3662],
        "Mizoram": [23.1645, 92.9376],
        "Nagaland": [26.1584, 94.5624],
        "Odisha": [20.9517, 85.0985],
        "Punjab": [31.1471, 75.3412],
        "Rajasthan": [26.9124, 75.7873],
        "Sikkim": [27.5330, 88.5122],
        "Tamil Nadu": [11.1271, 78.6569],
        "Telangana": [18.1124, 79.0193],
        "Tripura": [23.9408, 91.9882],
        "Uttar Pradesh": [26.8467, 80.9462],
        "Uttarakhand": [30.0668, 79.0193],
        "West Bengal": [22.9868, 87.8550],
        // Union Territories
        "Delhi": [28.6139, 77.2090],
        "Puducherry": [11.9416, 79.8083],
        "Chandigarh": [30.7333, 76.7794],
        "Jammu and Kashmir": [33.7782, 76.5762],
        "Ladakh": [34.2996, 78.2932],
        "Lakshadweep": [10.5667, 72.6417],
        "Andaman and Nicobar Islands": [11.7401, 92.6586]
    };
    
    Object.entries(stateCoordinates).forEach(([state, coords]) => {
        const totalCrimes = stateData[state] || 0;
        
        // Calculate color based on crime intensity (red for high crime)
        const intensity = totalCrimes / maxCrime;
        let color;
        
        if (intensity > 0.8) {
            color = '#ff0000'; // Red for highest crime
        } else if (intensity > 0.6) {
            color = '#ff4d4d'; // Light red
        } else if (intensity > 0.4) {
            color = '#ff9999'; // Lighter red
        } else if (intensity > 0.2) {
            color = '#ffcccc'; // Very light red
        } else {
            color = '#ffe6e6'; // Lightest red
        }
        
        // Calculate radius based on crime intensity
        const radius = Math.max(Math.min(totalCrimes / 1000, 30), 8);
        
        const circle = L.circleMarker(coords, {
            color: '#ff0000',
            fillColor: color,
            fillOpacity: 0.7,
            radius: radius,
            weight: 2
        }).addTo(currentMap);
        
        circle.bindPopup(`
            <div class="map-popup">
                <h4>${state}</h4>
                <p><strong>Total Crimes:</strong> ${totalCrimes.toLocaleString()}</p>
                <p><strong>Crime Intensity:</strong> ${Math.round(intensity * 100)}%</p>
                <button onclick="selectStateFromMap('${state}')" class="map-details-btn">
                    View Details
                </button>
            </div>
        `);
    });
    
    // Update map legend to reflect crime intensity
    const legend = document.querySelector('.map-legend');
    if (legend) {
        legend.innerHTML = `
            <span>Low Crime</span>
            <div class="legend-gradient" style="background: linear-gradient(90deg, #ffe6e6, #ffcccc, #ff9999, #ff4d4d, #ff0000)"></div>
            <span>High Crime</span>
        `;
    }
}

function selectStateFromMap(state) {
    document.getElementById('stateDropdown').value = state;
    currentState = state;
    renderDashboard();
    document.getElementById('stateDetails').scrollIntoView({ behavior: 'smooth' });
}

function updateStateDetails() {
    const container = document.getElementById('stateDetails');
    
    if (!currentState) {
        container.innerHTML = `
            <div class="no-state-selected">
                <div class="no-state-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <h3>Select a State</h3>
                <p>Choose a state from the dropdown or click on the map to view detailed crime statistics and information.</p>
            </div>
        `;
        return;
    }
    
    const stateData = crimeData.filter(item => item.state === currentState);
    const info = stateInfo[currentState] || getDefaultStateInfo(currentState);
    
    const totals = {
        theft: stateData.reduce((sum, item) => sum + item.theft, 0),
        murder: stateData.reduce((sum, item) => sum + item.murder, 0),
        assault: stateData.reduce((sum, item) => sum + item.assault, 0),
        rape: stateData.reduce((sum, item) => sum + item.rape, 0)
    };
    
    const totalCrimes = totals.theft + totals.murder + totals.assault + totals.rape;
    const population = parseInt(info.population?.replace(/,/g, '')) || 1000000;
    const crimeRate = ((totalCrimes / population) * 100000).toFixed(1);
    
    container.innerHTML = `
        <div class="state-details-card">
            <div class="state-header">
                <h2>${currentState}</h2>
                <p>Comprehensive Crime Statistics and State Information</p>
            </div>
            <div class="state-content">
                <div class="state-info">
                    <h3>State Overview</h3>
                    <div class="state-info-grid">
                        <div class="info-item">
                            <strong>Capital City</strong>
                            <span>${info.capital}</span>
                        </div>
                        <div class="info-item">
                            <strong>Chief Minister</strong>
                            <span>${info.cm}</span>
                        </div>
                        <div class="info-item">
                            <strong>Formation Date</strong>
                            <span>${info.formed}</span>
                        </div>
                        <div class="info-item">
                            <strong>Geographical Area</strong>
                            <span>${info.area}</span>
                        </div>
                        <div class="info-item">
                            <strong>Population</strong>
                            <span>${info.population}</span>
                        </div>
                        <div class="info-item">
                            <strong>Population Density</strong>
                            <span>${info.density}</span>
                        </div>
                        <div class="info-item">
                            <strong>Official Language</strong>
                            <span>${info.officialLanguage}</span>
                        </div>
                        <div class="info-item">
                            <strong>Literacy Rate</strong>
                            <span>${info.literacyRate}</span>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4>Major Cities</h4>
                        <div class="cities-list">
                            ${info.majorCities.map(city => `<span class="city-tag">${city}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4>Tourist Attractions</h4>
                        <div class="attractions-list">
                            ${info.touristAttractions.map(attr => `<span class="attraction-tag">${attr}</span>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="state-stats">
                    <h3>Crime Statistics</h3>
                    <div class="state-stats-grid">
                        <div class="stat-item">
                            <h4>${totalCrimes.toLocaleString()}</h4>
                            <p>Total Crimes</p>
                        </div>
                        <div class="stat-item">
                            <h4>${crimeRate}</h4>
                            <p>Crime Rate (per 100k)</p>
                        </div>
                        <div class="stat-item">
                            <h4>${info.policeStations}</h4>
                            <p>Police Stations</p>
                        </div>
                        <div class="stat-item">
                            <h4>${info.safetyIndex}/10</h4>
                            <p>Safety Index</p>
                        </div>
                    </div>
                    
                    <div class="crime-breakdown">
                        <h4>Crime Distribution</h4>
                        <div class="crime-bars">
                            <div class="crime-bar">
                                <div class="crime-label">Theft</div>
                                <div class="crime-bar-container">
                                    <div class="crime-bar-fill theft" style="width: ${(totals.theft / totalCrimes) * 100}%"></div>
                                </div>
                                <div class="crime-value">${totals.theft.toLocaleString()}</div>
                            </div>
                            <div class="crime-bar">
                                <div class="crime-label">Murder</div>
                                <div class="crime-bar-container">
                                    <div class="crime-bar-fill murder" style="width: ${(totals.murder / totalCrimes) * 100}%"></div>
                                </div>
                                <div class="crime-value">${totals.murder.toLocaleString()}</div>
                            </div>
                            <div class="crime-bar">
                                <div class="crime-label">Assault</div>
                                <div class="crime-bar-container">
                                    <div class="crime-bar-fill assault" style="width: ${(totals.assault / totalCrimes) * 100}%"></div>
                                </div>
                                <div class="crime-value">${totals.assault.toLocaleString()}</div>
                            </div>
                            <div class="crime-bar">
                                <div class="crime-label">Rape</div>
                                <div class="crime-bar-container">
                                    <div class="crime-bar-fill rape" style="width: ${(totals.rape / totalCrimes) * 100}%"></div>
                                </div>
                                <div class="crime-value">${totals.rape.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="yearly-trend">
                        <h4>Yearly Crime Trend</h4>
                        <div class="trend-chart-container">
                            <canvas id="stateTrendChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Render state trend chart
    renderStateTrendChart();
}

function getDefaultStateInfo(state) {
    return {
        capital: "Data not available",
        cm: "Data not available",
        formed: "Data not available",
        area: "Data not available",
        population: "Data not available",
        density: "Data not available",
        officialLanguage: "Data not available",
        majorCities: ["Data not available"],
        touristAttractions: ["Data not available"],
        policeStations: "Data not available",
        safetyIndex: "Data not available",
        crimeRate: "Data not available",
        literacyRate: "Data not available",
        developmentIndex: "Data not available"
    };
}

function renderStateTrendChart() {
    const ctx = document.getElementById('stateTrendChart').getContext('2d');
    const stateData = crimeData.filter(item => item.state === currentState);
    const years = [...new Set(stateData.map(item => item.year))].sort();
    
    const datasets = [
        {
            label: 'Theft',
            data: years.map(year => stateData.filter(item => item.year === year).reduce((sum, item) => sum + item.theft, 0)),
            borderColor: getCrimeColor('theft'),
            backgroundColor: `${getCrimeColor('theft')}20`,
            tension: 0.4,
            fill: true,
            borderWidth: 2
        },
        {
            label: 'Murder',
            data: years.map(year => stateData.filter(item => item.year === year).reduce((sum, item) => sum + item.murder, 0)),
            borderColor: getCrimeColor('murder'),
            backgroundColor: `${getCrimeColor('murder')}20`,
            tension: 0.4,
            fill: true,
            borderWidth: 2
        },
        {
            label: 'Assault',
            data: years.map(year => stateData.filter(item => item.year === year).reduce((sum, item) => sum + item.assault, 0)),
            borderColor: getCrimeColor('assault'),
            backgroundColor: `${getCrimeColor('assault')}20`,
            tension: 0.4,
            fill: true,
            borderWidth: 2
        },
        {
            label: 'Rape',
            data: years.map(year => stateData.filter(item => item.year === year).reduce((sum, item) => sum + item.rape, 0)),
            borderColor: getCrimeColor('rape'),
            backgroundColor: `${getCrimeColor('rape')}20`,
            tension: 0.4,
            fill: true,
            borderWidth: 2
        }
    ];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function exportData() {
    const filteredData = getFilteredData();
    
    // Create CSV content
    let csvContent = "State,Year,Theft,Murder,Assault,Rape\n";
    
    filteredData.forEach(item => {
        csvContent += `${item.state},${item.year},${item.theft},${item.murder},${item.assault},${item.rape}\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `crime-data-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Make function available globally for map popups
window.selectStateFromMap = selectStateFromMap;