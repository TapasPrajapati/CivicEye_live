// document.addEventListener('DOMContentLoaded', function() {
//     const crimeForm = document.getElementById('crimeForm');
//     const confirmation = document.getElementById('confirmation');
//     let isSubmitting = false;

//     crimeForm.addEventListener('submit', async function(e) {
//         e.preventDefault();
        
//         if (isSubmitting) return;
//         isSubmitting = true;

//         // Clear previous errors
//         const errorMessages = document.querySelectorAll('.error-message');
//         errorMessages.forEach(msg => msg.remove());

//         // Basic validation
//         const requiredFields = document.querySelectorAll('[required]');
//         let isValid = true;

//         requiredFields.forEach(field => {
//             if (!field.value.trim()) {
//                 isValid = false;
//                 field.classList.add('error');
//                 const errorMsg = document.createElement('div');
//                 errorMsg.className = 'error-message';
//                 errorMsg.textContent = 'This field is required';
//                 field.parentNode.appendChild(errorMsg);
//             } else {
//                 field.classList.remove('error');
//             }
//         });

//         if (!isValid) {
//             alert('Please fill in all required fields');
//             isSubmitting = false;
//             return;
//         }

//         // Disable submit button
//         const submitButton = document.querySelector('.sub');
//         submitButton.disabled = true;
//         submitButton.textContent = 'Submitting...';

//         try {
//             const formData = new FormData(this);

//             const response = await fetch('http://localhost:5000/api/reports/submit-report', {
//                 method: 'POST',
//                 body: formData,
//             });

//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }

//             const data = await response.json();
            
//             // Store submission data in sessionStorage
//             sessionStorage.setItem('reportSubmitted', 'true');
//             sessionStorage.setItem('reportId', data.reportId);

//             // Update UI
//             crimeForm.style.display = 'none';
//             confirmation.classList.remove('hidden');
//             confirmation.style.display = 'block'; // Ensure visibility
//             document.getElementById('reportId').textContent = data.reportId;

//             // Clear form
//             crimeForm.reset();

//         } catch (error) {
//             console.error('Error:', error);
//             alert('An error occurred while submitting the report. Please try again.');
            
//             // Show form again in case of error
//             crimeForm.style.display = 'block';
//             confirmation.classList.add('hidden');
            
//         } finally {
//             isSubmitting = false;
//             const submitButton = document.querySelector('.sub');
//             submitButton.disabled = false;
//             submitButton.textContent = 'Submit Report';
//         }
//     });
//     const goBackButton = document.getElementById('goBack');
    
//     // Add event listener for the back button
//     goBackButton.addEventListener('click', function() {
//         // Clear the session storage
//         sessionStorage.removeItem('reportSubmitted');
//         sessionStorage.removeItem('reportId');

//         // Hide confirmation and show form
//         document.getElementById('confirmation').classList.add('hidden');
//         document.getElementById('crimeForm').style.display = 'block';

//         // Reset the form
//         document.getElementById('crimeForm').reset();
//     });
//     // Check for previous submission on page load
//     window.addEventListener('load', () => {
//         const wasSubmitted = sessionStorage.getItem('reportSubmitted');
//         const savedReportId = sessionStorage.getItem('reportId');
        
//         if (wasSubmitted && savedReportId) {
//             crimeForm.style.display = 'none';
//             confirmation.classList.remove('hidden');
//             confirmation.style.display = 'block';
//             document.getElementById('reportId').textContent = savedReportId;
//         }
//     });
// });
// // Geolocation functionality
// document.getElementById('location').addEventListener('click', function() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(function(position) {
//             const latitude = position.coords.latitude;
//             const longitude = position.coords.longitude;
//             document.getElementById('location').value = `Lat: ${latitude}, Long: ${longitude}`;
//         }, function(error) {
//             console.error('Error getting location:', error);
//             alert('Unable to retrieve your location. Please enter it manually.');
//         });
//     } else {
//         alert('Geolocation is not supported by this browser. Please enter your location manually.');
//     }
// });
document.addEventListener('DOMContentLoaded', function() {
    const crimeForm = document.getElementById('crimeForm');
    const confirmation = document.getElementById('confirmation');
    let isSubmitting = false;

    crimeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isSubmitting) return;
        isSubmitting = true;

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(msg => msg.remove());

        // Validate required fields
        const requiredFields = document.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'This field is required';
                field.parentNode.appendChild(errorMsg);
            } else {
                field.classList.remove('error');
            }
        });

        if (!isValid) {
            alert('Please fill in all required fields');
            isSubmitting = false;
            return;
        }

        // Disable submit button
        const submitButton = document.querySelector('.sub');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            const formData = new FormData(this);
            
            // Add authentication token if available
            const authData = authUtils.getAuthData();
            const headers = {};
            if (authData?.token) {
                headers['Authorization'] = `Bearer ${authData.token}`;
            }

            // Debug: Log form data before sending
            for (let [key, value] of formData.entries()) {
                console.log('Form data:', key, value);
            }

            const response = await fetch('http://localhost:5000/api/reports/submit-report', {
                method: 'POST',
                headers: headers,
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
            const submitButton = document.querySelector('.sub');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Report';
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
    });

    // Check for previous submission
    if (sessionStorage.getItem('reportSubmitted')) {
        crimeForm.style.display = 'none';
        confirmation.classList.remove('hidden');
        document.getElementById('reportId').textContent = sessionStorage.getItem('reportId');
    }
});

// Geolocation handler
document.getElementById('location')?.addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                document.getElementById('location').value = `Lat: ${latitude}, Long: ${longitude}`;
            },
            error => {
                console.error('Geolocation error:', error);
                alert(`Location error: ${error.message}. Please enter manually.`);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    } else {
        alert('Geolocation not supported. Please enter location manually.');
    }
});