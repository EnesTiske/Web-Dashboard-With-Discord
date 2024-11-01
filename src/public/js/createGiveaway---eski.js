function validateForm() {
    let isValid = true;

    // Get all input and select elements
    const inputs = document.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        const errorElement = document.getElementById(input.id + '-error');
        if (!input.value) {
            isValid = false;
            errorElement.style.display = 'inline';
        } else {
            errorElement.style.display = 'none';
        }
    });

    return isValid;
}


function submitForm() {
    if (validateForm()) {
        const name = document.getElementById('name').value;
        const roles = document.getElementById('roles-datalist').value;
        const description = document.getElementById('description').value;
        const winners = document.getElementById('winners').value;
        const endDate = document.getElementById('end-date').value;
        const channel = document.getElementById('channel-datalist').value;

        fetch('http://localhost:3000/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                roles,
                description,
                winners,
                endDate,
                channel,
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                alert('Form submitted successfully!');
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Form submission failed! Check the console for errors.');
            });
    }
}
document.addEventListener('DOMContentLoaded', function () {
    const channelDataList = document.getElementById('channel-datalist');
    const rolesDataList = document.getElementById('roles-datalist');
    channelInfo.forEach(channel => {
        const option = document.createElement('option');
        option.value = channel.id;
        option.innerHTML = channel.name;
        channelDataList.appendChild(option);
    });
    rolesInfo.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.innerHTML = role.name;
        rolesDataList.appendChild(option);
    })
});