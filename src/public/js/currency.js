function readImageAsBase64(image) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            resolve(e.target.result);
        };
        reader.onerror = function (error) {
            reject(error);
        };
        if (image) {
            reader.readAsDataURL(image);
        } else {
            reject('No image selected');
        }
    });
}


async function submitForm(formData) {

    let base64Image;
    try {
        base64Image = await readImageAsBase64(formData.image);
        console.log("Image read successfully");
    } catch (error) {
        console.error('Error:', error);
        base64Image = null;
    }

    fetch('https://nexusvault.net/currency-submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: formData.type,
            name: formData.name,
            price: formData.price,
            description: formData.description,
            code: formData.code,
            role: formData.role,
            image: base64Image,
            id: formData.id,
            functionName: formData.functionName,
            userIsAdmin: userIsAdmin
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                text: 'Operation successful!',
                icon: 'success',
                customClass: {
                    popup: 'swal2-dark-popup'
                }
            }).then(() => {
                location.reload();
            }
            );
        })
        .catch((error) => {
            console.error('Error:', error);
            // alert('Form submission failed! Check the console for errors.');
        });
}


function createBoxHtml(item) {
    const { id, name, price, description, imageBase64 } = item;
    const base64Image = imageBase64 && imageBase64.length > 0 ? imageBase64[0] : null;

    return `
        <div class="box" data-id="${id}">
            <h3 class="box-title">${name}</h3>
            <p class="box-price">$${price}</p>
            <p class="box-description">${description}</p>
            <div class="box-image" style="width: 200px; height: 200px;${base64Image ? '' : ' background-color: #2c2f33;'}${base64Image ? '' : ' border-radius: 10px;'}${base64Image ? '' : ' display: flex; align-items: center; justify-content: center;'}">
                ${base64Image ? `<img src="data:image/png;base64,${base64Image}" alt="${name}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 10px;">` : ''}
            </div>
        </div>
    `;
}



document.addEventListener('DOMContentLoaded', function () {
    var mainDiv = document.getElementById('main-div');

    if (userIsAdmin) {
        // Create "Add New Reward" box
        var createBox = document.createElement('div');
        createBox.className = 'box create-box';
        createBox.innerHTML = `
        <div class="create-content">
            <i class="fas fa-plus-circle"></i>
            <h3>Add New Item</h3>
        </div>
    `;
        mainDiv.appendChild(createBox);
    }

    // Create boxes for each shopData item
    shopData.forEach(function (item) {
        var boxHtml = createBoxHtml(item);
        var boxElement = document.createElement('div');
        boxElement.innerHTML = boxHtml;
        mainDiv.appendChild(boxElement);
    });

    // Add click listeners to each box
    document.querySelectorAll('.box').forEach(function (box) {
        box.addEventListener('click', function () {
            var id = this.getAttribute('data-id');
            if (id) {
                console.log('Box clicked:', id);
                editModal(shopData.find(item => item.id === id));
            } else {
                console.log('Create New Item clicked');
                openCreateModal();
            }
        });
    });
});

function editModal(item) {
    console.log('Edit Item:', item);

    // Prepare additional inputs HTML
    let extraInputsHtml = '';

    // Add textarea for codes if they exist
    if (item.codes && item.codes.length > 0) {
        const codesText = item.codes.join('##');
        extraInputsHtml += `
            <textarea id="extra-input-code" class="swal2-input" placeholder="Code">${codesText}</textarea>
        `;
    }

    if (item.roleId !== null) {
        let roleOptions = '';
        rolesInfo.forEach(role => {
            const selected = role.id === item.roleId ? 'selected' : '';
            roleOptions += `<option value="${role.id}" ${selected}>${role.name}</option>`;
        });

        extraInputsHtml += `
            <select id="extra-input-role" class="swal2-input">
                ${roleOptions}
            </select>
        `;
    }

    if (!userIsAdmin) { return; }

    Swal.fire({
        title: 'Edit Item',
        html: `
            <label for="name">Name</label>
            <input id="name" class="swal2-input" placeholder="Name" value="${item.name}">
            <label for="price">Price</label>
            <input type="number" id="price" class="swal2-input" placeholder="Price" value="${item.price}">
            <label for="description">Description</label>
            <textarea id="description" class="swal2-input" placeholder="Description">${item.description}</textarea>
            ${extraInputsHtml}
        `,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Save',
        denyButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        showCancelButton: userIsAdmin,
        showDenyButton: userIsAdmin,
        showConfirmButton: userIsAdmin,
        customClass: {
            confirmButton: 'swal2-confirm swal2-edit-button',
            denyButton: 'swal2-deny swal2-delete-button',
            cancelButton: 'swal2-cancel swal2-styled swal2-cancel-button',
            popup: 'swal2-dark-popup'
        },
        preConfirm: () => {
            const name = document.getElementById('name').value;
            const price = document.getElementById('price').value;
            const description = document.getElementById('description').value;
            let codes
            let rolesId

            if (!name || !price || !description) {
                Swal.showValidationMessage('Please fill out all fields.');
                return false;
            }

            if (price <= 0) {
                Swal.showValidationMessage('Price must be greater than 0.');
                return false;
            }

            // Collect extra input values if they exist
            if (item.codes && item.codes.length > 0) {
                codes = document.getElementById('extra-input-code').value.split('##');
            }
            if (item.rolesId !== null) {
                rolesId = document.getElementById('extra-input-role') ? document.getElementById('extra-input-role').value : null;
            }

            const formData = {
                type: item.type,
                name: name,
                price: price,
                description: description,
                code: codes || item.codes,
                role: rolesId || item.roleId,
                image: null,
                id: item.id,
                functionName: 'editItem',
                userIsAdmin: userIsAdmin
            };

            return formData;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            console.log('edit');
            console.log('Form Values:', result.value);
            var formData = result.value;
            submitForm(formData);

        } else if (result.isDenied) {
            console.log('delete');
            console.log('Form Values:', item.id);
            const id = item.id;
            var formData = {
                type: null,
                name: null,
                price: null,
                description: null,
                code: null,
                role: null,
                image: null,
                id: id,
                functionName: 'deleteItem',
                userIsAdmin: userIsAdmin
            };

            submitForm(formData);

        }
    });
}







function openCreateModal() {

    let image = null;

    if (!userIsAdmin) { return; }

    Swal.fire({
        title: 'Create New Item',
        html: `
            <select id="type-select" class="swal2-input">
                <option value="other">Other</option>
                <option value="role">Role</option>
                <option value="code">Code</option>
            </select>
            <input id="name" class="swal2-input" placeholder="Name">
            <input type="number" id="price" class="swal2-input" placeholder="Price">
            <textarea id="description" class="swal2-input" placeholder="Description"></textarea>
            <div id="extra-inputs"></div>
            <div class="image-upload-wrapper" id="image-upload-wrapper">
                <span>Click here to upload an image<br>PNG, JPG, GIF up to 5MB</span>
                <input type="file" id="swal-input-image" accept="image/*">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Create',
        cancelButtonText: 'Cancel',
        customClass: {
            confirmButton: 'swal2-confirm swal2-edit-button',
            cancelButton: 'swal2-cancel swal2-styled swal2-delete-button',
            popup: 'swal2-dark-popup'
        },
        preConfirm: () => {
            const type = document.getElementById('type-select').value;
            const name = document.getElementById('name').value;
            const price = document.getElementById('price').value;
            const description = document.getElementById('description').value;
            const role = document.getElementById('extra-input') ? document.getElementById('extra-input').value : null
            const code = document.getElementById('extra-input-code') ? document.getElementById('extra-input-code').value : null;

            console.log('Role:', role);

            if (!name || !price || !description) {
                Swal.showValidationMessage('Please fill out all fields.');
                return false;
            }

            if (price <= 0) {
                Swal.showValidationMessage('Price must be greater than 0.');
                return false;
            }

            if (type === 'role' && !role) {
                Swal.showValidationMessage('Please select a role.');
                return false;
            }

            if (type === 'code' && !code) {
                Swal.showValidationMessage('Please enter a code.');
                return false;
            }
            const functionName = 'createItem';
            const id = null;
            const userIsAdminNew = userIsAdmin


            return { type, name, price, description, code, role, image, id, functionName, userIsAdminNew };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            console.log('Form Values:', result.value);

            const formData = result.value;
            submitForm(formData);
        }
    });

    document.getElementById('type-select').addEventListener('change', function () {
        const extraInputs = document.getElementById('extra-inputs');
        extraInputs.innerHTML = '';
        if (this.value === 'role') {
            const roleSelect = document.createElement('select');
            roleSelect.id = 'extra-input';
            roleSelect.className = 'swal2-input';
            rolesInfo.forEach(role => {
                const option = document.createElement('option');
                option.value = role.id;
                option.text = role.name;
                roleSelect.appendChild(option);
            });
            extraInputs.appendChild(roleSelect);
        } else if (this.value === 'code') {
            const codeInput = document.createElement('textarea');
            codeInput.id = 'extra-input-code';
            codeInput.className = 'swal2-input';
            codeInput.placeholder = 'Wrtie ## between each code';
            extraInputs.appendChild(codeInput);
        }
    });

    document.getElementById('image-upload-wrapper').addEventListener('click', function () {
        document.getElementById('swal-input-image').click();
    });

    // Dosya seçildiğinde kutucuk içeriğini güncelle
    document.getElementById('swal-input-image').addEventListener('change', function () {
        const fileName = this.files[0] ? this.files[0].name : 'Click here to upload an image<br>PNG, JPG, GIF up to 5MB';
        image = this.files[0];
        document.getElementById('image-upload-wrapper').children.item(0).remove();
        document.getElementById('image-upload-wrapper').innerHTML += `<span>${fileName}</span>`;
    });

}