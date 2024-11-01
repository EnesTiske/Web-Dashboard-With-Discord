async function submitForm(formData) {
    let url = 'https://nexusvault.net/emote-submit-form';
    let method = 'POST';
    let headers = {
        'Content-Type': 'application/json',
    };
    fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify({
            functionName: formData.functionName,
            emoteId: formData.emoteId,
            emoteName: formData.emoteName,
            emoteDate: formData.emoteDate,
            emoteCreatedDate: formData.emoteCreatedDate,
            emoteFile: formData.emoteFile,
            user: formData.user,
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
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}



function displayEmotes(emotes) {
    const container = document.getElementById('emotes-container');

    emotes.forEach(emote => {
        const emoteRow = document.createElement('div');
        emoteRow.className = 'emote-row';
        emoteRow.dataset.emoteId = emote.emoteId;

        // Görsel için div oluştur
        const emoteContainer = document.createElement('div');
        emoteContainer.className = 'emote-container';

        // Görsel span'ı oluştur ve div içine ekle
        const emoteElement = document.createElement('span');
        emoteElement.className = 'emote';
        emoteElement.style.backgroundImage = `url(https://cdn.discordapp.com/emojis/${emote.emoteId}.png)`;
        emoteContainer.appendChild(emoteElement);


        const emoteNameElement = document.createElement('span');
        emoteNameElement.className = 'emote-name';
        emoteNameElement.textContent = `:${emote.emoteName}:`;

        const userNameElement = document.createElement('span');
        userNameElement.className = 'user-name';
        userNameElement.textContent = `@${emote.user.username}`;

        const formattedDate = emote.emoteDate.substring(0, 10).split('-').reverse().join('/');
        const formattedCreatedDate = emote.emoteCreatedDate.substring(0, 10).split('-').reverse().join('/');

        const emoteDate = document.createElement('span');
        emoteDate.className = 'emote-date';
        emoteDate.textContent = formattedCreatedDate;

        // Elemanları satıra ekleme
        emoteRow.appendChild(emoteContainer)
        emoteRow.appendChild(emoteNameElement);
        emoteRow.appendChild(userNameElement);
        emoteRow.appendChild(emoteDate);

        // Tıklama olayını dinleme
        emoteRow.addEventListener('click', () => {
            console.log(`Emote ID: ${emote.emoteId}`);

            //#region -- EMOTE DETAIL MODAL --

            Swal.fire({
                title: `:${emote.emoteName}:`,
                html: `
                    <div class="swal-emote-container">
                        <img src="https://cdn.discordapp.com/emojis/${emote.emoteId}.png" alt="${emote.emoteId}" class="swal-emote-image">
                        <div class="swal-emote-details">
                            <p><strong>Owner:</strong> @${emote.user.username}</p>
                            <p><strong>Created Date:</strong> ${formattedCreatedDate}</p>
                        </div>
                    </div>
                `,
                showCloseButton: true,
                showCancelButton: true,
                focusConfirm: false,

                cancelButtonText: 'Delete',
                cancelButtonColor: '#d33', // Delete butonu varsayılan kırmızı
                showCancelButton: userIsAdmin, // Edit butonunu yalnızca adminler için göster

                confirmButtonText: 'Edit',
                confirmButtonColor: '#7289da', // Edit butonu varsayılan mavi
                showConfirmButton: userIsAdmin, // Edit butonunu yalnızca adminler için göster

                customClass: {
                    confirmButton: 'swal2-confirm swal2-styled swal2-edit-button', // Edit butonu
                    cancelButton: 'swal2-cancel swal2-styled swal2-delete-button', // Delete butonu
                    popup: 'swal2-dark-popup'
                },

                //#endregion

            }).then((result) => {
                if (result.isConfirmed) {

                    //#region -- EMOTE EDIT MODAL --

                    // Düzenle butonuna tıklanırsa buraya düzenleme işlemleri gelecek
                    Swal.fire({
                        title: 'Edit Emote',
                        html: `
                            <label for="emote-name" class="swal2-label">Emote Name:</label>
                            <input type="text" id="emote-name" class="swal2-input" value="${emote.emoteName}" placeholder="Emote Name">
                            <label for="emote-date" class="swal2-label">Created Date:</label>
                            <input type="date" id="emote-created-date" class="swal2-input" value="${emote.emoteCreatedDate.slice(0, 10)}" placeholder="Created Date">
                        `,
                        showCancelButton: true,
                        focusConfirm: false,
                        confirmButtonText: 'Save',
                        confirmButtonColor: '#7289da',
                        showConfirmButton: true,
                        cancelButtonText: 'Cancel',
                        cancelButtonColor: '#d33',
                        showCancelButton: true,
                        customClass: {
                            confirmButton: 'swal2-confirm swal2-styled swal2-edit-button',
                            cancelButton: 'swal2-cancel swal2-styled swal2-delete-button',
                            popup: 'swal2-dark-popup'
                        },
                        preConfirm: () => {
                            const emoteName = document.getElementById('emote-name').value;
                            const emoteCreatedDate = document.getElementById('emote-created-date').value;

                            if (emoteName.length < 2) {  
                                Swal.showValidationMessage('Emote name must be at least 2 characters long');
                            }
                            
                            const formData = {
                                functionName: 'editEmote',
                                emoteId: emote.emoteId,
                                emoteName: emoteName || emote.emoteName,
                                emoteDate: emote.emoteDate,
                                emoteCreatedDate: emoteCreatedDate || emote.emoteCreatedDate,
                                emoteFile: null,
                                user: emote.user,
                            };

                            return formData;
                        }




                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Düzenleme işlemleri buraya gelecek
                            submitForm(result.value);

                        }
                    });

                    //#endregion

                } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
                    // Sil butonuna tıklanırsa buraya silme işlemleri gelecek

                    //#region -- EMOTE DELETE MODAL --

                    Swal.fire({
                        title: 'Are you sure?',
                        text: "You won't be able to revert this!",
                        icon: 'warning',
                        iconColor: '#d33',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'Yes, delete it!',
                        customClass: {
                            confirmButton: 'swal2-confirm swal2-styled swal2-edit-button',
                            cancelButton: 'swal2-cancel swal2-styled swal2-delete-button',
                            popup: 'swal2-dark-popup'
                        },
                        preConfirm: () => {
                            const formData = {
                                functionName: 'deleteEmote',
                                emoteId: emote.emoteId,
                                emoteName: emote.emoteName,
                                emoteDate: emote.emoteDate,
                                emoteCreatedDate: emote.emoteCreatedDate,
                                emoteFile: null,
                                user: emote.user,
                            };

                            return formData;
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Silme işlemleri buraya gelecek

                            submitForm(result.value);

                        }
                    });

                    //#endregion

                }
            });
        });

        container.appendChild(emoteRow);
    });

}

displayEmotes(usersEmotes);
