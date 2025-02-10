document.getElementById('crimeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Basic validation
    const requiredFields = document.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });

    if (!isValid) {
        alert('Please fill in all required fields');
        return;
    }

    // Generate random report ID
    const reportId = 'CR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Hide form and show confirmation
    document.getElementById('crimeForm').classList.add('hidden');
    document.getElementById('confirmation').classList.remove('hidden');
    document.getElementById('reportId').textContent = reportId;

    // Here you would typically send the data to your server
    const formData = new FormData(this);
    fetch('/submit-report', { method: 'POST', body: formData })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});