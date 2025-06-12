// document.getElementById('crimeForm').addEventListener('submit', async function (e) {
//     e.preventDefault();
//     console.log('Form submission started'); // Debugging

//     // Clear previous errors
//     const errorMessages = document.querySelectorAll('.error-message');
//     errorMessages.forEach(msg => msg.remove());

//     // Basic validation
//     const requiredFields = document.querySelectorAll('[required]');
//     let isValid = true;

//     requiredFields.forEach(field => {
//         if (!field.value.trim()) {
//             isValid = false;
//             field.classList.add('error');
//             const errorMsg = document.createElement('div');
//             errorMsg.className = 'error-message';
//             errorMsg.textContent = 'This field is required';
//             field.parentNode.appendChild(errorMsg);
//         } else {
//             field.classList.remove('error');
//         }
//     });

//     if (!isValid) {
//         alert('Please fill in all required fields');
//         return;
//     }

//     // Disable submit button to prevent multiple submissions
//     const submitButton = document.querySelector('.sub');
//     submitButton.disabled = true;
//     submitButton.textContent = 'Submitting...';

//     try {
//         const formData = new FormData(this);
//         console.log('FormData:', formData); // Debugging

//         const response = await fetch('http://localhost:5000/submit-report', {
//             method: 'POST',
//             body: formData,
//         });

//         console.log('Response:', response); // Debugging

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         const data = await response.json();
//         console.log('Response Data:', data); // Debugging

//         // Hide form and show confirmation
//         document.getElementById('crimeForm').style.display = 'none'; // Hide the form
//         document.getElementById('confirmation').classList.remove('hidden'); // Show confirmation message
//         document.getElementById('reportId').textContent = data.reportId; // Display report ID

//     } catch (error) {
//         console.error('Error:', error);
//         alert('An error occurred while submitting the report. Please try again.');
//     } finally {
//         // Re-enable submit button
//         submitButton.disabled = false;
//         submitButton.textContent = 'Submit Report';
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
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());

        // Basic validation
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

            const response = await fetch('http://localhost:5000/api/reports/submit-report', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Store submission data in sessionStorage
            sessionStorage.setItem('reportSubmitted', 'true');
            sessionStorage.setItem('reportId', data.reportId);

            // Update UI
            crimeForm.style.display = 'none';
            confirmation.classList.remove('hidden');
            confirmation.style.display = 'block'; // Ensure visibility
            document.getElementById('reportId').textContent = data.reportId;

            // Clear form
            crimeForm.reset();

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the report. Please try again.');
            
            // Show form again in case of error
            crimeForm.style.display = 'block';
            confirmation.classList.add('hidden');
            
        } finally {
            isSubmitting = false;
            const submitButton = document.querySelector('.sub');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Report';
        }
    });
    const goBackButton = document.getElementById('goBack');
    
    // Add event listener for the back button
    goBackButton.addEventListener('click', function() {
        // Clear the session storage
        sessionStorage.removeItem('reportSubmitted');
        sessionStorage.removeItem('reportId');

        // Hide confirmation and show form
        document.getElementById('confirmation').classList.add('hidden');
        document.getElementById('crimeForm').style.display = 'block';

        // Reset the form
        document.getElementById('crimeForm').reset();
    });
    // Check for previous submission on page load
    window.addEventListener('load', () => {
        const wasSubmitted = sessionStorage.getItem('reportSubmitted');
        const savedReportId = sessionStorage.getItem('reportId');
        
        if (wasSubmitted && savedReportId) {
            crimeForm.style.display = 'none';
            confirmation.classList.remove('hidden');
            confirmation.style.display = 'block';
            document.getElementById('reportId').textContent = savedReportId;
        }
    });
});
// Geolocation functionality
document.getElementById('location').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            document.getElementById('location').value = `Lat: ${latitude}, Long: ${longitude}`;
        }, function(error) {
            console.error('Error getting location:', error);
            alert('Unable to retrieve your location. Please enter it manually.');
        });
    } else {
        alert('Geolocation is not supported by this browser. Please enter your location manually.');
    }
});