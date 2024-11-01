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

    fetch('https://nexusvault.net/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            cost: formData.cost,
            image: base64Image,
            restrictRoles: formData.restrictRoles,
            requiredRoles: formData.requiredRoles,
            minLevel: formData.minLevel,
            endDate: formData.endDate,
            channel: formData.channel,
            winnerAmount: formData.winnerAmount,
            winnerMessage: formData.winnerMessage,
            isChange: formData.isChange,
            giveawayMessageId: formData.giveawayMessageId || null
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
                title: 'Success',
                text: 'Your giveaway reward has been updated successfully!',
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

document.addEventListener('DOMContentLoaded', function () {



    //#region Sample Data

    const data = []; // Sample data for the table

    // İlk önce tarih bilgisine göre sıralama işlemini yapıyoruz
    const sortedGiveaways = giveaways.sort((a, b) => new Date(a.date) - new Date(b.date));

    for (let index = 0; index < sortedGiveaways.length; index++) {
        const raffleDate = new Date(sortedGiveaways[index].date);
        const jsonDate = raffleDate.toISOString().replace('T', ' at ').substring(0, 19);
        data.push({
            col1: ` ${sortedGiveaways[index].name}`,
            col2: ` ${sortedGiveaways[index].winnerAmount}`,
            col3: ` ${jsonDate}`,
            href: '#',
            id: sortedGiveaways[index].messageId
        });
    }

    let currentPage = 1;
    const rowsPerPage = 10;

    function displayTable(page) {
        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = data.slice(start, end);

        pageData.forEach(item => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', item.id);
            row.innerHTML = `<td>${item.col1}</td>
                             <td>${item.col2}</td>
                             <td>${item.col3}</td>`;
            tableBody.appendChild(row);
        });

        // Add click event listener to each row
        const rows = document.querySelectorAll('#data-table tr[data-id]');
        rows.forEach(row => {
            row.addEventListener('click', function (event) {
                event.preventDefault();
                const id = row.getAttribute('data-id');




                // console.log('Clicked row with id:', giveaways);


                const jsonData = giveaways.find(giveaway => giveaway.messageId === id);

                let jsonName = jsonData.name;
                let jsonDescription = jsonData.description;
                let jsonCost = jsonData.cost ? jsonData.cost : 0;
                let jsonRestrictRoles = jsonData.roleId[0] ? true : false;
                let jsonRequiredRolesId = jsonData.roleId[0] ? jsonData.roleId[0] : 'None';
                let jsonRequiredRolesName = jsonData.roleId[0] ? rolesInfo.find(role => role.id === jsonData.roleId[0]).name : 'None';
                let jsonMinLevel = jsonData.minLevel ? jsonData.minLevel : 0;
                let jsonDate = jsonData.date;
                let jsonChannelId = channelInfo.find(channel => channel.id === jsonData.channelId).id;
                let jsonChannelName = channelInfo.find(channel => channel.id === jsonData.channelId).name;
                let jsonWinnerAmount = jsonData.winnerAmount;
                let jsonWinnerMessage = jsonData.winnerMessage ? jsonData.winnerMessage : 'Congratulations {winner}! You won the giveaway!';


                const giveawayDate = new Date(jsonData.date);
                let jsonFormatDate = giveawayDate.toISOString().replace('T', ' at ').substring(0, 19);

                Swal.fire({
                    title: 'Giveaway Details',
                    html: `
        <div class="swal2-form-group">
            <label class="swal2-label-edit">NAME</label>
            <div class="swal2-value-edit">${jsonName}</div>
        </div>
        <div class="swal2-form-group">
            <label class="swal2-label-edit">DESCRIPTION</label>
            <div class="swal2-value-edit">${jsonDescription}</div>
        </div>
        <div class="swal2-form-group">
            <label class="swal2-label-edit">COST</label>
            <div class="swal2-value-edit">${jsonCost}</div>
        </div>
        <div class="swal2-form-group">
            <label class="swal2-label-edit">REQUIRED ROLES</label>
            <div class="swal2-value-edit">${jsonRequiredRolesName}</div>
        </div>
        <div class="swal2-form-group">
            <label class="swal2-label-edit">MIN LEVEL</label>
            <div class="swal2-value-edit">${jsonMinLevel}</div>
        </div>
        <div class="swal2-form-group">
            <label class="swal2-label-edit">END DATE</label>
            <div class="swal2-value-edit">${jsonFormatDate}</div>
        </div>
        <div class="swal2-form-group">
            <label class="swal2-label-edit">CHANNEL</label>
            <div class="swal2-value-edit">${jsonChannelName}</div>
        </div>
        <div class="swal2-form-group">
            <label class="swal2-label-edit">WINNER AMOUNT</label>
            <div class="swal2-value-edit">${jsonWinnerAmount}</div>
        </div>
        <div class="swal2-form-group">
            <label class="swal2-label-edit">WINNER MESSAGE</label>
            <div class="swal2-value-edit">${jsonWinnerMessage}</div>
        </div>
    `,
                    showCancelButton: true,
                    showConfirmButton: true,
                    showDenyButton: userIsAdmin, // Edit butonunu yalnızca adminler için göster
                    confirmButtonText: 'Okay',
                    denyButtonText: 'Edit',
                    cancelButtonText: 'Cancel',
                    customClass: {
                        confirmButton: 'swal2-confirm swal2-styled',
                        cancelButton: 'swal2-cancel swal2-styled',
                        denyButton: 'swal2-deny swal2-styled swal2-edit-button',
                        popup: 'swal2-dark-popup'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {

                    } else if (result.isDenied) {

                        //#region -- EDIT --

                        Swal.fire({
                            title: 'Edit Giveaway',
                            html: `
                                <label for="swal-input-name" class="swal2-label">NAME *</label>
                                <input type="text" id="swal-input-name" class="swal2-input" value="${jsonName}" placeholder="Reward Name">
                                <label for="swal-input-description" class="swal2-label">DESCRIPTION *</label>
                                <textarea id="swal-input-description" class="swal2-textarea" placeholder="Reward Description Here...">${jsonDescription}</textarea>
                                <label for="swal-input-cost" class="swal2-label">COST</label>
                                <input type="number" id="swal-input-cost" class="swal2-input" value="${jsonCost}" placeholder="Cost">
                                <div class="checkbox-wrapper">
                                    <label for="swal-input-restrict-roles" class="swal2-label-inline">Restrict Roles or Level?</label>
                                    <input type="checkbox" id="swal-input-restrict-roles">
                                </div>
                                <div id="role-selects" style="display: none;">
                                    <label for="swal-input-required-roles" class="swal2-label">REQUIRED ROLES</label>
                                    <select id="swal-input-required-roles" class="swal2-select">
                                        <option value="${jsonRequiredRolesId}">${jsonRequiredRolesName}</option>
                                    </select>
                                    <label for="swal-input-min-level" class="swal2-label">MIN LEVEL</label>
                                    <input type="number" id="swal-input-min-level" class="swal2-input" value="${jsonMinLevel}" placeholder="Minimum Level">
                                </div>
                                <label for="swal-input-end-date" class="swal2-label">END DATE *</label>
                                <input type="datetime-local" id="swal-input-end-date" class="swal2-input" value="${jsonDate.slice(0, 16)}">
                                <label for="swal-input-channel" class="swal2-label">CHANNEL *</label>
                                <select id="swal-input-channel" class="swal2-select">
                                    <option value="${jsonChannelId}">${jsonChannelName}</option>
                                    <!-- Channel options will be populated dynamically -->
                                </select>
                                <label for="swal-input-winner-amount" class="swal2-label">WINNER AMOUNT *</label>
                                <input type="number" id="swal-input-winner-amount" class="swal2-input" value="${jsonWinnerAmount}" placeholder="Winner Amount">
                                <label for="swal-input-winner-message" class="swal2-label">WINNER MESSAGE *</label>
                                <textarea id="swal-input-winner-message" class="swal2-textarea" placeholder="Winner Message">${jsonWinnerMessage}</textarea>
                            `,
                            showCancelButton: true,
                            confirmButtonText: 'Save',
                            cancelButtonText: 'Cancel',
                            focusConfirm: false,
                            customClass: {
                                confirmButton: 'swal2-confirm swal2-styled',
                                cancelButton: 'swal2-cancel swal2-styled',
                                popup: 'swal2-dark-popup'
                            },
                            preConfirm: () => {
                                const name = Swal.getPopup().querySelector('#swal-input-name').value;
                                const description = Swal.getPopup().querySelector('#swal-input-description').value;
                                const cost = Swal.getPopup().querySelector('#swal-input-cost').value;
                                const image = Swal.getPopup().querySelector('#swal-input-image').files[0] || null;
                                const restrictRoles = Swal.getPopup().querySelector('#swal-input-restrict-roles').checked;
                                const requiredRoles = Swal.getPopup().querySelector('#swal-input-required-roles').value;
                                const minLevel = Swal.getPopup().querySelector('#swal-input-min-level').value;
                                const endDate = Swal.getPopup().querySelector('#swal-input-end-date').value;
                                const channel = Swal.getPopup().querySelector('#swal-input-channel').value;
                                const winnerAmount = Swal.getPopup().querySelector('#swal-input-winner-amount').value;
                                const winnerMessage = Swal.getPopup().querySelector('#swal-input-winner-message').value;

                                let validationError = false;
                                let errorMessage = '';

                                // Check required fields
                                if (!name) {
                                    document.getElementById('swal-input-name').style.border = '2px solid red';
                                    validationError = true;
                                }
                                if (!description) {
                                    document.getElementById('swal-input-description').style.border = '2px solid red';
                                    validationError = true;
                                }
                                if (!cost) {
                                    document.getElementById('swal-input-cost').style.border = '2px solid red';
                                    validationError = true;
                                }
                                if (!endDate) {
                                    document.getElementById('swal-input-end-date').style.border = '2px solid red';
                                    validationError = true;
                                }
                                if (!channel) {
                                    document.getElementById('swal-input-channel').style.border = '2px solid red';
                                    validationError = true;
                                }
                                if (!winnerAmount) {
                                    document.getElementById('swal-input-winner-amount').style.border = '2px solid red';
                                    validationError = true;
                                }
                                if (!winnerMessage) {
                                    document.getElementById('swal-input-winner-message').style.border = '2px solid red';
                                    validationError = true;
                                }

                                // Check if endDate is at least 5 minutes in the future
                                const now = new Date();
                                const endDateTime = new Date(endDate);
                                const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

                                if (endDateTime < fiveMinutesLater) {
                                    document.getElementById('swal-input-end-date').style.border = '2px solid red';
                                    Swal.showValidationMessage('End date must be at least 5 minutes in the future');
                                    errorMessage = 'End date must be at least 5 minutes in the future';
                                    validationError = true;
                                }

                                if (validationError) {
                                    if (errorMessage) {
                                        Swal.showValidationMessage(errorMessage);
                                    } else {
                                        Swal.showValidationMessage('Please fill out all required fields correctly');
                                    }
                                    return false;
                                }


                                const formData = {
                                    name: name,
                                    description: description,
                                    cost: cost,
                                    image: null,
                                    restrictRoles: restrictRoles,
                                    requiredRoles: requiredRoles,
                                    minLevel: minLevel,
                                    endDate: endDate,
                                    channel: channel,
                                    winnerAmount: winnerAmount,
                                    winnerMessage: winnerMessage,
                                    isChange: true,
                                    giveawayMessageId: id
                                };

                                return formData;
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                const formData = result.value;
                                submitForm(formData);
                            }
                        });

                        // Gerekli roller için seçenekleri doldurma
                        const requiredRolesSelect = document.getElementById('swal-input-required-roles');
                        const channelSelect = document.getElementById('swal-input-channel');

                        rolesInfo.forEach(role => {
                            const option = document.createElement('option');
                            option.value = role.id;
                            option.innerHTML = role.name;
                            requiredRolesSelect.appendChild(option);
                        });

                        // Kanalları dinamik olarak doldurmak için örnek kanallar
                        channelInfo.forEach(channel => {
                            const option = document.createElement('option');
                            option.value = channel.id;
                            option.innerHTML = channel.name;
                            channelSelect.appendChild(option);
                        });

                        // Checkbox değişikliğinde select menüleri gösterme/gizleme
                        document.getElementById('swal-input-restrict-roles').addEventListener('change', function () {
                            const roleSelects = document.getElementById('role-selects');
                            if (this.checked) {
                                roleSelects.style.display = 'block';
                            } else {
                                roleSelects.style.display = 'none';
                            }
                        });

                        // Resim yükleme kutucuğuna tıklandığında dosya seçimini aç
                        document.getElementById('image-upload-wrapper').addEventListener('click', function () {
                            document.getElementById('swal-input-image').click();
                        });

                        // Dosya seçildiğinde kutucuk içeriğini güncelle
                        document.getElementById('swal-input-image').addEventListener('change', function () {
                            const fileName = this.files[0] ? this.files[0].name : 'Click here to upload an image<br>PNG, JPG, GIF up to 5MB';
                            document.getElementById('image-upload-wrapper').children.item(0).remove();
                            document.getElementById('image-upload-wrapper').innerHTML += `<span>${fileName}</span>`;
                        });

                        // Yalnızca belirli giriş alanlarının çerçeve rengini güncelleme
                        const fieldsToValidate = ['swal-input-name', 'swal-input-description', 'swal-input-end-date', 'swal-input-winner-amount', 'swal-input-winner-message'];

                        fieldsToValidate.forEach(id => {
                            document.getElementById(id).addEventListener('input', function () {
                                if (this.value.trim() !== '') {
                                    this.style.border = '1px solid #ccc'; // Eski çerçeve rengine döndür
                                } else {
                                    this.style.border = '2px solid red'; // Boşsa kırmızı çerçeve
                                }
                            });
                        });

                        const validatePositiveNumber = (inputId) => {
                            const inputValue = parseInt(document.getElementById(inputId).value);
                            if (!inputValue || inputValue <= 0) {
                                document.getElementById(inputId).style.border = '2px solid red';
                                return false;
                            }
                            return true;
                        };

                        document.getElementById('swal-input-cost').addEventListener('input', function () {
                            validatePositiveNumber('swal-input-cost');
                        });

                        document.getElementById('swal-input-winner-amount').addEventListener('input', function () {
                            validatePositiveNumber('swal-input-winner-amount');
                        });

                        //#endregion

                    }
                });



                // window.location.href = `/details/${id}`;
            });
        });
    }




    //#region -- CREATE  --

    document.getElementById('create-button').onclick = function () {

        let image = null;

        Swal.fire({
            title: 'Create New Giveaway',
            html: `
                <label for="swal-input-name" class="swal2-label">NAME *</label>
                <input type="text" id="swal-input-name" class="swal2-input" placeholder="Giveaway Name">
                <label for="swal-input-description" class="swal2-label">DESCRIPTION *</label>
                <textarea id="swal-input-description" class="swal2-textarea" placeholder="Giveaway Description Here..."></textarea>
                <label for="swal-input-cost" class="swal2-label">COST</label>
                <input type="number" id="swal-input-cost" class="swal2-input" value="0" placeholder="Cost">
                <div class="image-upload-wrapper" id="image-upload-wrapper">
                    <span>Click here to upload an image<br>PNG, JPG, GIF up to 5MB</span>
                    <input type="file" id="swal-input-image" style="display: none;" accept="image/*">
                </div>
                <div class="checkbox-wrapper">
                    <label for="swal-input-restrict-roles" class="swal2-label-inline">Restrict Roles or Level?</label>
                    <input type="checkbox" id="swal-input-restrict-roles">
                </div>
                <div id="role-selects" style="display: none;">
                    <label for="swal-input-required-roles" class="swal2-label">REQUIRED ROLES</label>
                    <select id="swal-input-required-roles" class="swal2-select">
                        <option value="">Select Required Role</option>
                    </select>
                    <label for="swal-input-min-level" class="swal2-label">MIN LEVEL</label>
                    <input type="number" id="swal-input-min-level" class="swal2-input" value="0" placeholder="Minimum Level">
                </div>
                <label for="swal-input-end-date" class="swal2-label">END DATE *</label>
                <input type="datetime-local" id="swal-input-end-date" class="swal2-input">
                <label for="swal-input-channel" class="swal2-label">CHANNEL *</label>
                <select id="swal-input-channel" class="swal2-select">
                    <option value="">Select Channel</option>
                    <!-- Channel options will be populated dynamically -->
                </select>
                <label for="swal-input-winner-amount" class="swal2-label">WINNER AMOUNT *</label>
                <input type="number" id="swal-input-winner-amount" class="swal2-input" value="1" placeholder="Winner Amount">
                <label for="swal-input-winner-message" class="swal2-label">WINNER MESSAGE *</label>
                <textarea id="swal-input-winner-message" class="swal2-textarea" placeholder="Winner Message"></textarea>
            `,
            showCancelButton: true,
            confirmButtonText: 'Okay',
            cancelButtonText: 'Cancel',
            focusConfirm: false,
            customClass: {
                confirmButton: 'swal2-confirm swal2-styled',
                cancelButton: 'swal2-cancel swal2-styled',
                popup: 'swal2-dark-popup'
            },
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#swal-input-name').value;
                const description = Swal.getPopup().querySelector('#swal-input-description').value;
                const cost = Swal.getPopup().querySelector('#swal-input-cost').value;
                const restrictRoles = Swal.getPopup().querySelector('#swal-input-restrict-roles').checked;
                const requiredRoles = Swal.getPopup().querySelector('#swal-input-required-roles').value;
                const minLevel = Swal.getPopup().querySelector('#swal-input-min-level').value;
                const endDate = Swal.getPopup().querySelector('#swal-input-end-date').value;
                const channel = Swal.getPopup().querySelector('#swal-input-channel').value;
                const winnerAmount = Swal.getPopup().querySelector('#swal-input-winner-amount').value;
                const winnerMessage = Swal.getPopup().querySelector('#swal-input-winner-message').value;

                let validationError = false;
                let errorMessage = '';

                // Check required fields
                if (!name) {
                    document.getElementById('swal-input-name').style.border = '2px solid red';
                    validationError = true;
                }
                if (!description) {
                    document.getElementById('swal-input-description').style.border = '2px solid red';
                    validationError = true;
                }
                if (!endDate) {
                    document.getElementById('swal-input-end-date').style.border = '2px solid red';
                    validationError = true;
                }
                if (!channel) {
                    document.getElementById('swal-input-channel').style.border = '2px solid red';
                    validationError = true;
                }
                if (!winnerAmount) {
                    document.getElementById('swal-input-winner-amount').style.border = '2px solid red';
                    validationError = true;
                }
                if (!winnerMessage) {
                    document.getElementById('swal-input-winner-message').style.border = '2px solid red';
                    validationError = true;
                }

                // Check if endDate is at least 5 minutes in the future
                const now = new Date();
                const endDateTime = new Date(endDate);
                const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

                if (endDateTime < fiveMinutesLater) {
                    document.getElementById('swal-input-end-date').style.border = '2px solid red';
                    Swal.showValidationMessage('End date must be at least 5 minutes in the future');
                    errorMessage = 'End date must be at least 5 minutes in the future';
                    validationError = true;
                }

                if (validationError) {
                    if (errorMessage) {
                        Swal.showValidationMessage(errorMessage);
                    } else {
                        Swal.showValidationMessage('Please fill out all required fields correctly');
                    }
                    return false;
                }

                console.log(image);

                const formData = {
                    name: name,
                    description: description,
                    cost: cost,
                    image: image,
                    restrictRoles: restrictRoles,
                    requiredRoles: requiredRoles,
                    minLevel: minLevel,
                    endDate: endDate,
                    channel: channel,
                    winnerAmount: winnerAmount,
                    winnerMessage: winnerMessage,
                    isChange: false
                };

                return formData;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const formData = result.value;
                submitForm(formData);
            }
        });

        // Gerekli roller için seçenekleri doldurma
        const requiredRolesSelect = document.getElementById('swal-input-required-roles');
        const channelSelect = document.getElementById('swal-input-channel');

        rolesInfo.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.innerHTML = role.name;
            requiredRolesSelect.appendChild(option);
        })

        // Kanalları dinamik olarak doldurmak için örnek kanallar
        channelInfo.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.innerHTML = channel.name;
            channelSelect.appendChild(option);
        });

        // Checkbox değişikliğinde select menüleri gösterme/gizleme
        document.getElementById('swal-input-restrict-roles').addEventListener('change', function () {
            const roleSelects = document.getElementById('role-selects');
            if (this.checked) {
                roleSelects.style.display = 'block';
            } else {
                roleSelects.style.display = 'none';
            }
        });

        // Resim yükleme kutucuğuna tıklandığında dosya seçimini aç
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

        // Yalnızca belirli giriş alanlarının çerçeve rengini güncelleme
        const fieldsToValidate = ['swal-input-name', 'swal-input-description', 'swal-input-end-date', 'swal-input-winner-amount', 'swal-input-winner-message'];

        fieldsToValidate.forEach(id => {
            document.getElementById(id).addEventListener('input', function () {
                if (this.value.trim() !== '') {
                    this.style.border = '1px solid #ccc'; // Eski çerçeve rengine döndür
                } else {
                    this.style.border = '2px solid red'; // Boşsa kırmızı çerçeve
                }
            });
        });

        const validatePositiveNumber = (inputId) => {
            const inputValue = parseInt(document.getElementById(inputId).value);
            if (!inputValue || inputValue <= 0) {
                document.getElementById(inputId).style.border = '2px solid red';
                return false;
            } else {
                document.getElementById(inputId).style.border = '1px solid #ccc';
            }
            return true;
        };

        document.getElementById('swal-input-cost').addEventListener('input', function () {
            // validatePositiveNumber('swal-input-cost');
        });

        document.getElementById('swal-input-winner-amount').addEventListener('input', function () {
            validatePositiveNumber('swal-input-winner-amount');
        });










    };

    //#endregion


    //#endregion

    document.getElementById('prev-button').onclick = function () {
        if (currentPage > 1) {
            currentPage--;
            displayTable(currentPage);
        }
    };

    document.getElementById('next-button').onclick = function () {
        if (currentPage * rowsPerPage < data.length) {
            currentPage++;
            displayTable(currentPage);
        }
    };

    // Initial display
    displayTable(currentPage);
});