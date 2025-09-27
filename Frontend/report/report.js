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

    try {
      // Create FormData from form
      const formData = new FormData(this);

      // Add captured photos if any
      console.log('Captured photos count:', capturedPhotos.length);
      
      if (capturedPhotos.length > 0) {
        // Add photos as individual files with proper naming
        capturedPhotos.forEach((photo, index) => {
          try {
            const blob = dataURLtoBlob(photo);
            formData.append(`photo_${index}`, blob, `camera_${Date.now()}_${index}.jpg`);
            console.log(`Added photo_${index} to FormData`);
          } catch (photoError) {
            console.error(`Error processing photo ${index}:`, photoError);
          }
        });

        // Also add as JSON string for backend fallback
        formData.set('camera-images', JSON.stringify(capturedPhotos));
      } else {
        formData.set('camera-images', '[]');
      }

      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File || value instanceof Blob) {
          console.log(`${key}: File/Blob - ${value.name || 'unnamed'} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${typeof value === 'string' && value.length > 100 ? value.substring(0, 100) + '...' : value}`);
        }
      }

      // Submit to server
      console.log('Sending request to server...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
      
      const response = await fetch(
        "https://civiceye-4-q1te.onrender.com/api/reports/submit-report",
        {
          method: "POST",
          body: formData,
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      
      console.log('Response received:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Success response data:', data);

      if (data.success) {
        alert(`Report submitted successfully!\n\nReport ID: ${data.reportId}\nEvidence files: ${data.evidenceCount || 0}`);
        
        // Try to show confirmation modal
        try {
          showConfirmationModal(data.reportId);
        } catch (modalError) {
          console.error('Error showing modal:', modalError);
          // Fallback behavior
          if (confirm('Would you like to submit another report?')) {
            resetForm();
          } else {
            window.location.href = '/Frontend/Dashboard/dashboard.html';
          }
        }

        // Store submission data
        sessionStorage.setItem(
          "lastSubmission",
          JSON.stringify({
            id: data.reportId,
            time: new Date().toISOString(),
            evidenceCount: data.evidenceCount || 0
          })
        );

      } else {
        throw new Error(data.message || 'Submission failed');
      }

    } catch (error) {
      console.error("Form submission error:", error);
      
      let errorMessage = "Report submission failed. Please try again.";
      
      if (error.name === 'AbortError') {
        errorMessage = "Request timed out. Please check your internet connection and try again.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message.includes('500')) {
        errorMessage = "Server error. Please try again in a few moments.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
      
    } finally {
      // Reset button state
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
      lucide.createIcons();
      isSubmitting = false;
      console.log("Form submission completed");
    }
  });
}

// Enhanced dataURLtoBlob function
function dataURLtoBlob(dataURL) {
  try {
    if (!dataURL || !dataURL.includes('data:image/')) {
      throw new Error('Invalid data URL');
    }
    
    const arr = dataURL.split(",");
    if (arr.length < 2) {
      throw new Error('Malformed data URL');
    }
    
    const mime = arr[0].match(/:(.*?);/);
    if (!mime) {
      throw new Error('Cannot determine MIME type');
    }
    
    const mimeType = mime[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mimeType });
  } catch (error) {
    console.error('Error converting dataURL to blob:', error);
    throw new Error('Failed to process captured image: ' + error.message);
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

function setupModalActions() {
  document.getElementById("printReport")?.addEventListener("click", () => {
    window.print();
  });

  document.getElementById("newReport")?.addEventListener("click", () => {
    resetForm();
  });

  document.getElementById("goDashboard")?.addEventListener("click", () => {
    window.location.href = "/Frontend/landing/index.html";
  });

  const modal = document.getElementById("confirmation-modal");
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      resetForm();
    }
  });
}

function showConfirmationModal(reportId) {
  const crimeForm = document.getElementById("crimeForm");
  const modal = document.getElementById("confirmation-modal");
  const reportIdElement = document.getElementById("reportId");
  
  if (crimeForm) {
    crimeForm.classList.add("hidden");
  }
  
  if (reportIdElement) {
    reportIdElement.textContent = reportId;
  }
  
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("active");
    
    const lastSubmission = sessionStorage.getItem("lastSubmission");
    if (lastSubmission) {
      const data = JSON.parse(lastSubmission);
      const detailsSection = modal.querySelector(".report-details");
      if (detailsSection) {
        detailsSection.innerHTML = `
          <strong>Report Details:</strong><br>
          Report ID: ${reportId}<br>
          Evidence Files: ${data.evidenceCount || 0}<br>
          Submitted: ${new Date(data.time).toLocaleString()}
        `;
      }
    }
  }
  
  console.log('Confirmation modal shown for report:', reportId);
}

function resetForm() {
  const confirmationModal = document.getElementById("confirmation-modal");
  const crimeForm = document.getElementById("crimeForm");
  
  if (confirmationModal) {
    confirmationModal.classList.remove("active");
    confirmationModal.classList.add("hidden");
  }

  if (crimeForm) {
    crimeForm.reset();
    crimeForm.classList.remove("hidden");
  }

  const sectionReview = document.getElementById("section-review");
  const sectionPersonal = document.getElementById("section-personal");
  
  if (sectionReview) {
    sectionReview.classList.remove("active");
  }
  if (sectionPersonal) {
    sectionPersonal.classList.add("active");
  }
  
  updateProgressSteps("section-personal");

  const filePreview = document.getElementById("file-preview");
  if (filePreview) {
    filePreview.innerHTML = "";
  }
  
  capturedPhotos = [];

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