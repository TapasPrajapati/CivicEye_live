// Global variables
let capturedPhotos = [];
let cameraStream = null;
let isSubmitting = false;

// Helper functions
function setMaxDate(dateInput) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  dateInput.max = `${year}-${month}-${day}`;
}

function setMaxTime(timeInput) {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  timeInput.max = `${hours}:${minutes}`;
}

function updateTimeMaxValue() {
  const timeInput = document.getElementById("time");
  const dateInput = document.getElementById("date");

  if (timeInput && dateInput) {
    const selectedDate = new Date(dateInput.value);
    const today = new Date();

    if (selectedDate.toDateString() === today.toDateString()) {
      setMaxTime(timeInput);
    } else {
      timeInput.max = "";
    }
  }
}

async function detectStateFromGeolocation() {
  const locationInput = document.getElementById("location");
  const stateSelect = document.getElementById("state");

  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();

            if (data.address) {
              if (data.display_name) {
                locationInput.value = data.display_name.split(",")[0];
              }
              if (data.address.state) {
                const stateOption = Array.from(stateSelect.options).find(
                  (opt) =>
                    opt.text
                      .toLowerCase()
                      .includes(data.address.state.toLowerCase()) ||
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
  const fileInput = document.getElementById("evidence");
  const totalFiles = fileInput.files.length + capturedPhotos.length;
  if (totalFiles >= 5) {
    alert("Maximum 5 files allowed. Please delete some before adding more.");
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
                ${capturedPhotos.length > 0
      ? `
                <div class="camera-gallery">
                    ${capturedPhotos
        .map(
          (photo, index) => `
                        <img src="${photo}" class="camera-thumbnail ${index === capturedPhotos.length - 1 ? "active" : ""
            }" 
                             data-index="${index}" alt="Captured photo ${index + 1
            }">
                    `
        )
        .join("")}
                </div>
                `
      : ""
    }
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  lucide.createIcons();

  startCamera();

  document
    .getElementById("capture-btn")
    .addEventListener("click", capturePhoto);
  document
    .getElementById("close-camera")
    .addEventListener("click", closeCameraModal);

  if (capturedPhotos.length > 0) {
    document.querySelectorAll(".camera-thumbnail").forEach((thumb) => {
      thumb.addEventListener("click", function () {
        document
          .querySelectorAll(".camera-thumbnail")
          .forEach((t) => t.classList.remove("active"));
        this.classList.add("active");
      });
    });
  }
}

async function startCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    const cameraView = document.getElementById("camera-view");
    cameraView.srcObject = cameraStream;
  } catch (err) {
    console.error("Camera error:", err);
    alert("Could not access camera. Please check permissions.");
    closeCameraModal();
  }
}

function capturePhoto() {
  const cameraView = document.getElementById("camera-view");
  const canvas = document.createElement("canvas");
  
  if (!cameraView.videoWidth || !cameraView.videoHeight) {
    alert("Camera not ready. Please wait a moment and try again.");
    return;
  }
  
  canvas.width = cameraView.videoWidth;
  canvas.height = cameraView.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(cameraView, 0, 0, canvas.width, canvas.height);

  const dataURL = canvas.toDataURL("image/jpeg", 0.8);
  
  const sizeInBytes = Math.round(dataURL.length * 0.75);
  if (sizeInBytes > 5 * 1024 * 1024) {
    alert("Image too large. Please try again with better lighting or closer to subject.");
    return;
  }
  
  capturedPhotos.push(dataURL);
  updateCameraGallery();
  
  console.log(`Captured photo ${capturedPhotos.length}, size: ~${(sizeInBytes/1024/1024).toFixed(2)}MB`);
}

function updateCameraGallery() {
  const gallery = document.querySelector(".camera-gallery");
  if (!gallery) return;

  gallery.innerHTML = capturedPhotos
    .map(
      (photo, index) => `
        <img src="${photo}" class="camera-thumbnail ${index === capturedPhotos.length - 1 ? "active" : ""
        }" 
             data-index="${index}" alt="Captured photo ${index + 1}">
    `
    )
    .join("");

  document.querySelectorAll(".camera-thumbnail").forEach((thumb) => {
    thumb.addEventListener("click", function () {
      document
        .querySelectorAll(".camera-thumbnail")
        .forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

function closeCameraModal() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
  }

  const modal = document.querySelector(".camera-modal");
  if (modal) modal.remove();

  const hiddenInput = document.getElementById("camera-images");
  if (hiddenInput) {
    hiddenInput.value = JSON.stringify(capturedPhotos);
  }
}

function setupFormNavigation() {
  document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-next")) {
      const btn = e.target.closest(".btn-next");
      const currentSection = btn.dataset.current;
      const nextSection = btn.dataset.next;

      if (validateSection(currentSection)) {
        switchSection(currentSection, nextSection);

        if (nextSection === "section-review") {
          populateReviewFields();
        }
      }
    }

    if (e.target.closest(".btn-prev")) {
      const btn = e.target.closest(".btn-prev");
      const currentSection = btn.dataset.current;
      const prevSection = btn.dataset.prev;

      switchSection(currentSection, prevSection);
    }
  });
}

function validateSection(sectionId) {
  const section = document.getElementById(sectionId);
  const requiredFields = section.querySelectorAll("[required]");
  let isValid = true;

  document.querySelectorAll(".error-message").forEach((msg) => msg.remove());

  requiredFields.forEach((field) => {
    field.classList.remove("error");

    if (!field.value.trim()) {
      markFieldAsInvalid(field, "This field is required");
      isValid = false;
      return;
    }

    switch (field.id) {
      case "name":
        if (!/^[A-Za-z\s]{3,50}$/.test(field.value)) {
          markFieldAsInvalid(
            field,
            "Please enter a valid name (letters only, 3-50 characters)"
          );
          isValid = false;
        }
        break;

      case "email":
        if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(field.value)) {
          markFieldAsInvalid(field, "Please enter a valid email address");
          isValid = false;
        }
        break;

      case "phone":
        if (!/^[0-9]{10}$/.test(field.value)) {
          markFieldAsInvalid(field, "Please enter a 10-digit phone number");
          isValid = false;
        }
        break;

      case "date":
        const selectedDate = new Date(field.value);
        const today = new Date();

        selectedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (selectedDate > today) {
          markFieldAsInvalid(field, "Date cannot be in the future");
          isValid = false;
        }
        break;

      case "time":
        const timeInput = field;
        const dateInput = document.getElementById("date");

        if (dateInput && dateInput.value) {
          const selectedDate = new Date(dateInput.value);
          const selectedTime = timeInput.value;

          const [hours, minutes] = selectedTime.split(":");
          const combinedDateTime = new Date(selectedDate);
          combinedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          const now = new Date();

          const isToday = selectedDate.toDateString() === now.toDateString();

          if (isToday && combinedDateTime > now) {
            markFieldAsInvalid(field, "Time cannot be in the future");
            isValid = false;
          }
        }
        break;

      case "description":
        if (field.value.length < 20) {
          markFieldAsInvalid(
            field,
            "Description must be at least 20 characters"
          );
          isValid = false;
        }
        break;
    }
  });

  if (!isValid) {
    const firstError = section.querySelector(".error");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return isValid;
}

function markFieldAsInvalid(field, message) {
  field.classList.add("error");
  const errorMsg = document.createElement("div");
  errorMsg.className = "error-message";
  errorMsg.textContent = message;
  field.parentNode.insertBefore(errorMsg, field.nextSibling);
}


function switchSection(currentId, nextId) {
  document.getElementById(currentId).classList.remove("active");
  document.getElementById(nextId).classList.add("active");
  updateProgressSteps(nextId);
  document
    .getElementById(nextId)
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateProgressSteps(activeSection) {
  const steps = document.querySelectorAll(".step");
  steps.forEach((step) => step.classList.remove("active"));

  switch (activeSection) {
    case "section-personal":
      document.querySelector('.step[data-step="1"]').classList.add("active");
      break;
    case "section-crime":
      document.querySelector('.step[data-step="1"]').classList.add("active");
      document.querySelector('.step[data-step="2"]').classList.add("active");
      break;
    case "section-review":
      steps.forEach((step) => step.classList.add("active"));
      break;
  }
}

function setupFileUpload() {
  const fileInput = document.getElementById("evidence");
  const filePreview = document.getElementById("file-preview");

  fileInput.addEventListener("change", function () {
    filePreview.innerHTML = "";

    if (this.files.length > 5) {
      alert("Maximum 5 files allowed. Only the first 5 will be uploaded.");
      this.value = "";
      return;
    }

    Array.from(this.files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(
          `File "${file.name}" exceeds 10MB limit. Please choose smaller files.`
        );
        this.value = "";
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(
          `File "${file.name}" has invalid type. Only images, PDFs and Word docs are allowed.`
        );
        this.value = "";
        return;
      }

      const fileItem = document.createElement("div");
      fileItem.className = "file-preview-item";

      const fileName = document.createElement("span");
      fileName.textContent = file.name;

      const fileSize = document.createElement("span");
      fileSize.textContent = `(${(file.size / 1024 / 1024).toFixed(2)}MB)`;

      const removeBtn = document.createElement("button");
      removeBtn.innerHTML = '<i data-lucide="x"></i>';
      removeBtn.className = "remove-file";
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
  const files = document.getElementById("evidence").files;

  for (let i = 0; i < files.length; i++) {
    if (files[i].name !== fileName) {
      dt.items.add(files[i]);
    }
  }

  document.getElementById("evidence").files = dt.files;
  document.getElementById("evidence").dispatchEvent(new Event("change"));
}

function setupGeolocation() {
  document.getElementById("getLocation")?.addEventListener("click", function () {
    const locationInput = document.getElementById("location");
    locationInput.placeholder = "Locating...";

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          locationInput.value = `Lat: ${latitude.toFixed(
            6
          )}, Long: ${longitude.toFixed(6)}`;
          locationInput.placeholder = "Address or landmark";
        },
        (error) => {
          console.error("Error getting location:", error);
          locationInput.placeholder = "Address or landmark";
          alert("Unable to retrieve your location. Please enter it manually.");
        }
      );
    } else {
      alert(
        "Geolocation is not supported by your browser. Please enter the location manually."
      );
    }
  });
}

function populateReviewFields() {
  document.getElementById("review-name").textContent = `Name: ${document.getElementById("name").value}`;
  document.getElementById("review-email").textContent = `Email: ${document.getElementById("email").value}`;
  document.getElementById("review-phone").textContent = `Phone: ${document.getElementById("phone").value}`;

  const crimeTypeSelect = document.getElementById("crimeType");
  document.getElementById("review-crimeType").textContent = `Crime Type: ${crimeTypeSelect.options[crimeTypeSelect.selectedIndex].text}`;

  document.getElementById("review-date").textContent = `Date: ${formatDate(
    document.getElementById("date").value
  )}`;
  document.getElementById("review-location").textContent = `Location: ${document.getElementById("location").value}`;
  document.getElementById("review-description").textContent = `Description: ${document.getElementById("description").value}`;

  const fileInput = document.getElementById("evidence");
  const totalFiles = fileInput.files.length + capturedPhotos.length;
  
  if (totalFiles > 0) {
    document.getElementById("review-evidence").textContent = `Files Attached: ${totalFiles} (${fileInput.files.length} uploaded, ${capturedPhotos.length} camera photos)`;
  } else {
    document.getElementById("review-evidence").textContent = "No files attached";
  }
}

function formatDate(dateString) {
  if (!dateString) return "Not specified";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// UPDATED FORM SUBMISSION FUNCTION
function setupFormSubmission() {
  const crimeForm = document.getElementById("crimeForm");

  crimeForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    console.log("Form submission started");

    const submitButton = this.querySelector(".btn-submit");
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Submitting...';
    lucide.createIcons();

    let timeoutId;
    let controller;

    try {
      // Create FormData - MINIMIZE payload size
      const formData = new FormData(this);

      // OPTIMIZATION 1: Only add small camera images to main request
      console.log('Captured photos count:', capturedPhotos.length);
      
      const smallPhotos = [];
      const largePhotos = [];
      
      // Separate small and large images
      capturedPhotos.forEach((photo, index) => {
        const sizeInBytes = Math.round(photo.length * 0.75);
        if (sizeInBytes < 1024 * 1024) { // Less than 1MB
          smallPhotos.push(photo);
        } else {
          largePhotos.push(photo);
        }
      });

      // Add only small photos to main request
      if (smallPhotos.length > 0) {
        smallPhotos.forEach((photo, index) => {
          try {
            const blob = dataURLtoBlob(photo);
            formData.append(`photo_${index}`, blob, `camera_${Date.now()}_${index}.jpg`);
          } catch (photoError) {
            console.error(`Error processing photo ${index}:`, photoError);
          }
        });
      }

      // Add large photos as JSON for server-side processing
      if (largePhotos.length > 0) {
        formData.set('camera-images', JSON.stringify(largePhotos));
        console.log(`${largePhotos.length} large photos will be processed server-side`);
      } else {
        formData.set('camera-images', '[]');
      }

      // OPTIMIZATION 2: Progressive timeout with retry logic
      const submitWithRetry = async (attempt = 1, maxAttempts = 2) => {
        controller = new AbortController();
        
        // Progressive timeout: 60s first attempt, 90s retry
        const timeoutDuration = attempt === 1 ? 60000 : 90000;
        
        timeoutId = setTimeout(() => {
          console.log(`Timeout ${timeoutDuration/1000}s reached for attempt ${attempt}`);
          controller.abort();
        }, timeoutDuration);

        try {
          console.log(`Attempt ${attempt}: Sending request to server...`);
          
          const response = await fetch(
            "https://civiceye-4-q1te.onrender.com/api/reports/submit-report",
            {
              method: "POST",
              body: formData,
              signal: controller.signal
            }
          );

          clearTimeout(timeoutId);
          
          console.log(`Attempt ${attempt}: Response received:`, response.status);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server returned ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          return data;

        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          // Retry logic for specific errors
          if ((fetchError.name === 'AbortError' || fetchError.message.includes('Failed to fetch')) 
              && attempt < maxAttempts) {
            console.log(`Attempt ${attempt} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
            return submitWithRetry(attempt + 1, maxAttempts);
          }
          
          throw fetchError;
        }
      };

      // Execute submission with retry
      const data = await submitWithRetry();

      console.log('Success response data:', data);

      if (data.success) {
        console.log('Report submitted successfully');
        
        // Store submission data
        sessionStorage.setItem(
          "lastSubmission",
          JSON.stringify({
            id: data.reportId,
            time: new Date().toISOString(),
            evidenceCount: data.evidenceCount || 0
          })
        );

        // Show confirmation modal
        showConfirmationModal(data.reportId, data.evidenceCount || 0);
        
      } else {
        throw new Error(data.message || 'Submission failed');
      }

    } catch (error) {
      console.error("Form submission error:", error);
      
      let errorMessage = "Report submission failed.";
      let shouldRetry = false;
      
      if (error.name === 'AbortError') {
        errorMessage = "Request timed out. This might be due to server startup delay.";
        shouldRetry = true;
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "Network connection error.";
        shouldRetry = true;
      } else if (error.message.includes('500')) {
        errorMessage = "Server error occurred.";
        shouldRetry = true;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Enhanced error handling with user options
      const userChoice = confirm(
        `${errorMessage}\n\n` +
        (shouldRetry ? 
          "The report might have been saved successfully despite the error.\n" +
          "Click OK to check your dashboard, or Cancel to try again." :
          "Click OK to try again, or Cancel to go to dashboard.")
      );
      
      if (userChoice && shouldRetry) {
        // Redirect to dashboard to check if report was saved
        window.location.href = '/Frontend/Dashboard/dashboard.html';
      } else if (userChoice && !shouldRetry) {
        // Reset and allow retry
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        return; // Don't execute finally block
      }
      
    } finally {
      // Cleanup
      if (timeoutId) clearTimeout(timeoutId);
      if (controller && !controller.signal.aborted) {
        // Don't abort if request completed successfully
      }
      
      // Reset button state
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
      lucide.createIcons();
      isSubmitting = false;
      console.log("Form submission completed");
    }
  });
}

// Add this function to test backend connectivity
async function checkBackendHealth() {
  try {
    const response = await fetch("https://civiceye-4-q1te.onrender.com/health", {
      method: "GET",
      signal: AbortSignal.timeout(10000) // 10s timeout for health check
    });
    
    if (response.ok) {
      console.log("Backend is healthy");
      return true;
    }
  } catch (error) {
    console.warn("Backend health check failed:", error.message);
  }
  return false;
}

// Call before form submission

// Enhanced dataURLtoBlob function
function dataURLtoBlob(dataURL) {
  try {
    if (!dataURL || !dataURL.includes('data:image/')) {
      throw new Error('Invalid data URL');
    }
    
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);

    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new Blob([u8arr], { type: mime });
  } catch (error) {
    console.error('Error converting dataURL to blob:', error);
    throw new Error('Failed to process image: ' + error.message);
  }
}

function checkPreviousSubmission() {
  const crimeForm = document.getElementById("crimeForm");
  const confirmationModal = document.getElementById("confirmation-modal");

  if (!crimeForm || !confirmationModal) return;

  const lastSubmission = sessionStorage.getItem("lastSubmission");
  if (lastSubmission) {
    const data = JSON.parse(lastSubmission);
    crimeForm.classList.add("hidden");
    confirmationModal.classList.remove("hidden");
    confirmationModal.classList.add("active");
    const reportIdElement = document.getElementById("reportId");
    if (reportIdElement) {
      reportIdElement.textContent = data.id;
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.lucide) lucide.createIcons();

  checkPreviousSubmission();

  const dateInput = document.getElementById("date");
  if (dateInput) {
    setMaxDate(dateInput);
    dateInput.addEventListener("change", updateTimeMaxValue);
  }

  const timeInput = document.getElementById("time");
  if (timeInput) {
    updateTimeMaxValue();
    timeInput.addEventListener("change", function () {
      const dateInput = document.getElementById("date");
      if (dateInput && dateInput.value) {
        const selectedDate = new Date(dateInput.value);
        const selectedTime = this.value;

        const [hours, minutes] = selectedTime.split(":");
        const combinedDateTime = new Date(selectedDate);
        combinedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const now = new Date();
        const isToday = selectedDate.toDateString() === now.toDateString();

        this.classList.remove("error");
        const existingError = this.parentNode.querySelector(".error-message");
        if (existingError) existingError.remove();

        if (isToday && combinedDateTime > now) {
          markFieldAsInvalid(this, "Time cannot be in the future");
        }
      }
    });
  }

  setupFormNavigation();
  setupFileUpload();
  setupGeolocation();
  setupFormSubmission();
  setupModalActions();

  document
    .getElementById("openCamera")
    ?.addEventListener("click", openCameraModal);
});

// ENHANCED MODAL ACTION SETUP
function setupModalActions() {
  document.getElementById("printReport")?.addEventListener("click", () => {
    window.print();
  });

  document.getElementById("newReport")?.addEventListener("click", () => {
    resetForm();
  });

  document.getElementById("goDashboard")?.addEventListener("click", () => {
    // Update this path according to your dashboard location
    window.location.href = "/Frontend/Dashboard/dashboard.html";
  });

  // Close modal when clicking outside
  const modal = document.getElementById("confirmation-modal");
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      resetForm();
    }
  });
}

// ENHANCED MODAL DISPLAY FUNCTION
function showConfirmationModal(reportId, evidenceCount = 0) {
  console.log('showConfirmationModal called:', reportId);
  
  const crimeForm = document.getElementById("crimeForm");
  const modal = document.getElementById("confirmation-modal");
  const reportIdElement = document.getElementById("reportId");
  
  if (!modal) {
    console.error('Modal not found, using fallback');
    alert(`✅ Report Submitted Successfully!\n\nReport ID: ${reportId}\nEvidence Files: ${evidenceCount}\n\nCheck your email for confirmation.`);
    
    // Fallback redirect
    setTimeout(() => {
      if (confirm('Would you like to go to your dashboard?')) {
        window.location.href = '/Frontend/Dashboard/dashboard.html';
      } else {
        resetForm();
      }
    }, 2000);
    return;
  }

  // Hide form and show modal
  if (crimeForm) crimeForm.style.display = 'none';
  
  // Set report ID
  if (reportIdElement) {
    reportIdElement.textContent = reportId;
  }
  
  // Show modal with force display
  modal.classList.remove('hidden');
  modal.classList.add('active');
  modal.style.display = 'flex';
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'all';
  modal.style.zIndex = '9999';
  
  // Add details section
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    let detailsSection = modalContent.querySelector('.report-details');
    if (!detailsSection) {
      detailsSection = document.createElement('div');
      detailsSection.className = 'report-details';
      const actionsSection = modalContent.querySelector('.modal-actions');
      if (actionsSection) {
        modalContent.insertBefore(detailsSection, actionsSection);
      }
    }
    
    detailsSection.innerHTML = `
      <div style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
        <p><strong>📋 Report Details:</strong></p>
        <p>🆔 Report ID: <strong>${reportId}</strong></p>
        <p>📎 Evidence Files: <strong>${evidenceCount}</strong></p>
        <p>📅 Submitted: <strong>${new Date().toLocaleString()}</strong></p>
        <p style="color: #28a745; font-weight: 500;">✅ Report successfully saved to database</p>
      </div>
    `;
  }
  
  // Ensure icons are rendered
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // Scroll to top
  window.scrollTo(0, 0);
  
  console.log('Modal displayed successfully');
}

// ENHANCED RESET FUNCTION
function resetForm() {
  console.log('Resetting form');
  
  const confirmationModal = document.getElementById("confirmation-modal");
  const crimeForm = document.getElementById("crimeForm");
  
  if (confirmationModal) {
    confirmationModal.classList.remove("active");
    confirmationModal.classList.add("hidden");
    confirmationModal.style.display = 'none';
  }

  if (crimeForm) {
    crimeForm.reset();
    crimeForm.style.display = 'block';
  }

  // Reset to first section
  const sectionReview = document.getElementById("section-review");
  const sectionPersonal = document.getElementById("section-personal");
  
  document.querySelectorAll('.form-section').forEach(section => {
    section.classList.remove('active');
  });
  
  if (sectionPersonal) {
    sectionPersonal.classList.add("active");
  }
  
  updateProgressSteps("section-personal");

  // Clear file preview
  const filePreview = document.getElementById("file-preview");
  if (filePreview) {
    filePreview.innerHTML = "";
  }
  
  // Clear captured photos
  capturedPhotos = [];

  // Clear file inputs
  const evidenceInput = document.getElementById("evidence");
  if (evidenceInput) {
    evidenceInput.value = "";
  }
  
  // Clear session storage
  sessionStorage.removeItem("lastSubmission");
  
  console.log("Form reset completed");
}

// Add animation styles
document.head.insertAdjacentHTML(
  "beforeend",
  `
    <style>
        .animate-spin {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
`
);