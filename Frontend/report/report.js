// Global variables
let capturedPhotos = [];
let cameraStream = null;
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', function() {
    if (window.lucide) lucide.createIcons();

    setupFormNavigation();
    setupFileUpload();
    setupGeolocation();
    setupFormSubmission();
    setupModalActions();
    checkPreviousSubmission();

    // Initialize date picker with max date as today
    const dateInput = document.getElementById('date');
    if (dateInput) setMaxDate(dateInput);
});

// Helper functions
function setMaxDate(dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.max = `${year}-${month}-${day}`;
}

async function detectStateFromGeolocation() {
    const locationInput = document.getElementById('location');
    const stateSelect = document.getElementById('state');
    
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        
                        if (data.address) {
                            if (data.display_name) {
                                locationInput.value = data.display_name.split(',')[0];
                            }
                            if (data.address.state) {
                                const stateOption = Array.from(stateSelect.options).find(
                                    opt => opt.text.toLowerCase().includes(data.address.state.toLowerCase()) || 
                                          opt.value.toLowerCase() === data.address.state.toLowerCase()
                                );
                                if (stateOption) stateOption.selected = true;
                            }
                        }
                        resolve(true);
                    } catch (error) {
                        console.error("Geocoding error:", error);
                        resolve(false);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    resolve(false);
                }
            );
        } else {
            resolve(false);
        }
    });
}

function openCameraModal() {
    const fileInput = document.getElementById('evidence');
    const totalFiles = (fileInput.files.length + capturedPhotos.length);
    if (totalFiles >= 5) {
        alert('Maximum 5 files allowed. Please delete some before adding more.');
        return;
    }

    const modalHTML = `
        <div class="camera-modal">
            <div class="camera-container">
                <video id="camera-view" autoplay playsinline></video>
                <div class="camera-controls">
                    <button id="capture-btn" class="btn-primary"><i data-lucide="camera"></i> Capture</button>
                    <button id="close-camera" class="btn-secondary"><i data-lucide="x"></i> Close</button>
                </div>
                ${capturedPhotos.length > 0 ? `
                <div class="camera-gallery">
                    ${capturedPhotos.map((photo, index) => `
                        <img src="${photo}" class="camera-thumbnail ${index === capturedPhotos.length - 1 ? 'active' : ''}" 
                             data-index="${index}" alt="Captured photo ${index + 1}">
                    `).join('')}
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    lucide.createIcons();
    
    startCamera();

    document.getElementById('capture-btn').addEventListener('click', capturePhoto);
    document.getElementById('close-camera').addEventListener('click', closeCameraModal);
    
    if (capturedPhotos.length > 0) {
        document.querySelectorAll('.camera-thumbnail').forEach(thumb => {
            thumb.addEventListener('click', function() {
                document.querySelectorAll('.camera-thumbnail').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
}

async function startCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' },
            audio: false 
        });
        const cameraView = document.getElementById('camera-view');
        cameraView.srcObject = cameraStream;
    } catch (err) {
        console.error("Camera error:", err);
        alert('Could not access camera. Please check permissions.');
        closeCameraModal();
    }
}

function capturePhoto() {
    const cameraView = document.getElementById('camera-view');
    const canvas = document.createElement('canvas');
    canvas.width = cameraView.videoWidth;
    canvas.height = cameraView.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraView, 0, 0, canvas.width, canvas.height);
    
    capturedPhotos.push(canvas.toDataURL('image/jpeg', 0.8));
    updateCameraGallery();
}

function updateCameraGallery() {
    const gallery = document.querySelector('.camera-gallery');
    if (!gallery) return;
    
    gallery.innerHTML = capturedPhotos.map((photo, index) => `
        <img src="${photo}" class="camera-thumbnail ${index === capturedPhotos.length - 1 ? 'active' : ''}" 
             data-index="${index}" alt="Captured photo ${index + 1}">
    `).join('');
    
    document.querySelectorAll('.camera-thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            document.querySelectorAll('.camera-thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function closeCameraModal() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    
    const modal = document.querySelector('.camera-modal');
    if (modal) modal.remove();

    const hiddenInput = document.getElementById('camera-images');
    if (hiddenInput) {
        hiddenInput.value = JSON.stringify(capturedPhotos);
    }
}

function setupFormNavigation() {
    document.addEventListener('click', function(e) {
        // Handle next buttons
        if (e.target.closest('.btn-next')) {
            const btn = e.target.closest('.btn-next');
            const currentSection = btn.dataset.current;
            const nextSection = btn.dataset.next;
            
            if (validateSection(currentSection)) {
                switchSection(currentSection, nextSection);
                
                // If going to review section, populate the review fields
                if (nextSection === 'section-review') {
                    populateReviewFields();
                }
            }
        }
        
        // Handle previous buttons
        if (e.target.closest('.btn-prev')) {
            const btn = e.target.closest('.btn-prev');
            const currentSection = btn.dataset.current;
            const prevSection = btn.dataset.prev;
            
            switchSection(currentSection, prevSection);
        }
    });
}

function validateSection(sectionId) {
    const section = document.getElementById(sectionId);
    const requiredFields = section.querySelectorAll('[required]');
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(msg => msg.remove());

    requiredFields.forEach(field => {
        field.classList.remove('error');

        // Check if field is empty
        if (!field.value.trim()) {
            markFieldAsInvalid(field, 'This field is required');
            isValid = false;
            return;
        }

        // Field-specific validations
        switch(field.id) {
            case 'name':
                if (!/^[A-Za-z\s]{3,50}$/.test(field.value)) {
                    markFieldAsInvalid(field, 'Please enter a valid name (letters only, 3-50 characters)');
                    isValid = false;
                }
                break;
                
            case 'email':
                if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(field.value)) {
                    markFieldAsInvalid(field, 'Please enter a valid email address');
                    isValid = false;
                }
                break;
                
            case 'phone':
                if (!/^[0-9]{10}$/.test(field.value)) {
                    markFieldAsInvalid(field, 'Please enter a 10-digit phone number');
                    isValid = false;
                }
                break;
                
            case 'date':
                const selectedDate = new Date(field.value);
                const today = new Date();

                // Reset both to midnight for fair comparison
                selectedDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                if (selectedDate > today) {
                    markFieldAsInvalid(field, 'Date cannot be in the future');
                    isValid = false;
                }
                break;
                
            case 'description':
                if (field.value.length < 20) {
                    markFieldAsInvalid(field, 'Description must be at least 20 characters');
                    isValid = false;
                }
                break;
        }
    });

    if (!isValid) {
        // Scroll to first error
        const firstError = section.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return isValid;
}

function markFieldAsInvalid(field, message) {
    field.classList.add('error');
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = message;
    field.parentNode.insertBefore(errorMsg, field.nextSibling);
}

function switchSection(currentId, nextId) {
    document.getElementById(currentId).classList.remove('active');
    document.getElementById(nextId).classList.add('active');
    updateProgressSteps(nextId);
    document.getElementById(nextId).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateProgressSteps(activeSection) {
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));
    
    switch(activeSection) {
        case 'section-personal':
            document.querySelector('.step[data-step="1"]').classList.add('active');
            break;
        case 'section-crime':
            document.querySelector('.step[data-step="1"]').classList.add('active');
            document.querySelector('.step[data-step="2"]').classList.add('active');
            break;
        case 'section-review':
            steps.forEach(step => step.classList.add('active'));
            break;
    }
}

function setupFileUpload() {
    const fileInput = document.getElementById('evidence');
    const filePreview = document.getElementById('file-preview');
    
    fileInput.addEventListener('change', function() {
        filePreview.innerHTML = '';
        
        if (this.files.length > 5) {
            alert('Maximum 5 files allowed. Only the first 5 will be uploaded.');
            this.value = '';
            return;
        }
        
        Array.from(this.files).forEach(file => {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert(`File "${file.name}" exceeds 10MB limit. Please choose smaller files.`);
                this.value = '';
                return;
            }
            
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                                 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                alert(`File "${file.name}" has invalid type. Only images, PDFs and Word docs are allowed.`);
                this.value = '';
                return;
            }
            
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item';
            
            const fileName = document.createElement('span');
            fileName.textContent = file.name;
            
            const fileSize = document.createElement('span');
            fileSize.textContent = `(${(file.size / 1024 / 1024).toFixed(2)}MB)`;
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i data-lucide="x"></i>';
            removeBtn.className = 'remove-file';
            removeBtn.onclick = () => removeFile(file.name);
            
            fileItem.appendChild(fileName);
            fileItem.appendChild(fileSize);
            fileItem.appendChild(removeBtn);
            filePreview.appendChild(fileItem);
        });
        
        if (window.lucide) {
            lucide.createIcons();
        }
    });
}

function removeFile(fileName) {
    const dt = new DataTransfer();
    const files = document.getElementById('evidence').files;
    
    for (let i = 0; i < files.length; i++) {
        if (files[i].name !== fileName) {
            dt.items.add(files[i]);
        }
    }
    
    document.getElementById('evidence').files = dt.files;
    document.getElementById('evidence').dispatchEvent(new Event('change'));
}

function setupGeolocation() {
    document.getElementById('getLocation').addEventListener('click', function() {
        const locationInput = document.getElementById('location');
        locationInput.placeholder = 'Locating...';
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    locationInput.value = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
                    locationInput.placeholder = 'Address or landmark';
                },
                error => {
                    console.error('Error getting location:', error);
                    locationInput.placeholder = 'Address or landmark';
                    alert('Unable to retrieve your location. Please enter it manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser. Please enter the location manually.');
        }
    });
}

function populateReviewFields() {
    document.getElementById('review-name').textContent = `Name: ${document.getElementById('name').value}`;
    document.getElementById('review-email').textContent = `Email: ${document.getElementById('email').value}`;
    document.getElementById('review-phone').textContent = `Phone: ${document.getElementById('phone').value}`;
    
    const crimeTypeSelect = document.getElementById('crimeType');
    document.getElementById('review-crimeType').textContent = `Crime Type: ${crimeTypeSelect.options[crimeTypeSelect.selectedIndex].text}`;
    
    document.getElementById('review-date').textContent = `Date: ${formatDate(document.getElementById('date').value)}`;
    document.getElementById('review-location').textContent = `Location: ${document.getElementById('location').value}`;
    document.getElementById('review-description').textContent = `Description: ${document.getElementById('description').value}`;
    
    const fileInput = document.getElementById('evidence');
    if (fileInput.files.length > 0) {
        document.getElementById('review-evidence').textContent = `Files Attached: ${fileInput.files.length}`;
    } else {
        document.getElementById('review-evidence').textContent = 'No files attached';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function setupFormSubmission() {
    const crimeForm = document.getElementById('crimeForm');
    const confirmation = document.getElementById('confirmation');

    crimeForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Final validation
        if (!validateSection('section-review')) {
            alert('Please correct the errors in the form');
            return;
        }

        if (!document.getElementById('consent').checked) {
            alert('Please confirm that the information is accurate before submitting.');
            return;
        }

        // Disable submit button
        const submitButton = crimeForm.querySelector('.btn-submit');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Submitting...';

        if (window.lucide) lucide.createIcons();

        try {
            const formData = new FormData(this);
            
            // Add captured photos to form data
            if (capturedPhotos.length > 0) {
                capturedPhotos.forEach((photo, index) => {
                    const blob = dataURLtoBlob(photo);
                    formData.append(`cameraImage_${index}`, blob, `camera_${index}.jpg`);
                });
            }

            // Debug: Log form data before sending
            for (let [key, value] of formData.entries()) {
                console.log('Form data:', key, value);
            }

            const response = await fetch('http://localhost:5000/api/reports/submit-report', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Submission successful:', data);
            
            // Store submission data
            sessionStorage.setItem('reportSubmitted', 'true');
            sessionStorage.setItem('reportId', data.reportId);

            // Update UI
            crimeForm.style.display = 'none';
            confirmation.classList.remove('hidden');
            document.getElementById('reportId').textContent = data.reportId;

        } catch (error) {
            console.error('Full error:', error);
            alert(`Submission failed: ${error.message}`);
            
            // Show form again
            crimeForm.style.display = 'block';
            confirmation.classList.add('hidden');
            
        } finally {
            isSubmitting = false;
            const submitButton = document.querySelector('.btn-submit');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Submit Report <i data-lucide="send"></i>';
                if (window.lucide) lucide.createIcons();
            }
        }
    });

    // Back button handler
    document.getElementById('goBack')?.addEventListener('click', function() {
        sessionStorage.removeItem('reportSubmitted');
        sessionStorage.removeItem('reportId');
        document.getElementById('confirmation').classList.add('hidden');
        document.getElementById('crimeForm').style.display = 'block';
        document.getElementById('crimeForm').reset();
        document.getElementById('section-review').classList.remove('active');
        document.getElementById('section-personal').classList.add('active');
        updateProgressSteps('section-personal');
        document.getElementById('file-preview').innerHTML = '';
        capturedPhotos = [];
    });
}

function checkPreviousSubmission() {
    const crimeForm = document.getElementById('crimeForm');
    const confirmation = document.getElementById('confirmation');
    
    if (sessionStorage.getItem('reportSubmitted')) {
        crimeForm.style.display = 'none';
        confirmation.classList.remove('hidden');
        document.getElementById('reportId').textContent = sessionStorage.getItem('reportId');
    }
}

function setupModalActions() {
    document.getElementById('openCamera')?.addEventListener('click', openCameraModal);
}

function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
}

// Add animation class to Lucide loader
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .animate-spin {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
`);