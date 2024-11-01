async function submitForm(formData) {
    let url = 'https://nexusvault.net/profile-submit-form';
    let method = 'POST';
    let headers = {
        'Content-Type': 'application/json',
    };
    fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(formData)
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
                text: 'Profile update successful!',
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
        });
}

function autocomplete(inp, arr) {
    let currentFocus;
    inp.addEventListener("input", function (e) {
        let a, b, i, val = this.value;
        closeAllLists();
        if (!val) {
            let parentDiv = document.getElementById("autocomplete-parent");
            if (parentDiv) {
                parentDiv.parentNode.removeChild(parentDiv);
            }
            return false;
        }
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");

        let parentDiv = document.createElement("DIV");
        parentDiv.setAttribute("id", "autocomplete-parent");
        parentDiv.classList.add("search-bar-container");

        parentDiv.appendChild(a); 
        this.parentNode.appendChild(parentDiv); 

        let count = 0; 

        for (i = 0; i < arr.length && count < 5; i++) {
            if (arr[i].name.toUpperCase().includes(val.toUpperCase())) {
                b = document.createElement("DIV");
                b.innerHTML = "<strong>" + arr[i].name.substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].name.substr(val.length);
                b.innerHTML += "<input type='hidden' value='" + arr[i].id + "'>";
                b.addEventListener("click", function (e) {
                    inp.value = arr.find(user => user.id === this.getElementsByTagName("input")[0].value).name;
                    let userId = this.getElementsByTagName("input")[0].value;
                    let newData = arr.find(user => user.id === userId);
                    closeAllLists();

                    window.location.href = `/profile/${userId}`;

                });
                a.appendChild(b);
                count++;
            }
        }
    });

    inp.addEventListener("keydown", function (e) {
        let x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) {
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            } else {
                let enteredValue = inp.value.trim();
                console.log(arr)
                let matchedUser = arr.find(user => user.name.includes(enteredValue));
                if (matchedUser) {
                    window.location.href = `/profile/${matchedUser.id}`;
                } else {
                    console.log("User not found");
                }
            }
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        let x = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

autocomplete(document.getElementById("searchBar"), allUsers);


document.getElementById("quip-button").addEventListener("click", function () {
    
    console.log(0);

    let newData = allUsers.find(user => user.name === data.name);


    if (allUsers.find(user => user.name === document.getElementById("searchBar").value)) {
        newData = allUsers.find(user => user.name === document.getElementById("searchBar").value);
    }

    console.log(1);

    Swal.fire({
        title: 'Set Profile Quip',
        html: `
            <p class="swal2-name">@${newData.name}</p>
            <input id="quip-input" type="text" placeholder="Profile quip" class="swal2-input equal-input">
        `,
        focusConfirm: false,
        customClass: {
            popup: 'swal2-dark-popup'
        },
        preConfirm: () => {
            const quipValue = document.getElementById('quip-input').value;

            if (!quipValue) {
                Swal.showValidationMessage('Please enter a valid profile quip');
                return false;
            }

            return { quipValue };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { quipValue } = result.value;
            let formData = {
                functionName: "quip",
                id: newData.id,
                quip: quipValue
            };

            submitForm(formData);

            console.log(`Quip: ${quipValue}`);
        }
    });
});

document.getElementById("bar-color-button").addEventListener("click", function () {
    let newData = allUsers.find(user => user.name === data.name);

    if (allUsers.find(user => user.name === document.getElementById("searchBar").value)) {
        newData = allUsers.find(user => user.name === document.getElementById("searchBar").value);
    }

    Swal.fire({
        title: 'Set Bar Color',
        html: `
            <p class="swal2-name">@${newData.name}</p>
            <input id="bar-color-input" type="color" class="swal2-input equal-input">
        `,
        focusConfirm: false,
        customClass: {
            popup: 'swal2-dark-popup'
        },
        preConfirm: () => {
            const barColorValue = document.getElementById('bar-color-input').value;

            return { barColorValue };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { barColorValue } = result.value;
            let formData = {
                functionName: "barColor",
                id: newData.id,
                color: barColorValue
            };

            submitForm(formData);

            console.log(`Bar Color: ${barColorValue}`);
        }
    });
});

document.getElementById("background-color-button").addEventListener("click", function () {
    let newData = allUsers.find(user => user.name === data.name);

    if (allUsers.find(user => user.name === document.getElementById("searchBar").value)) {
        newData = allUsers.find(user => user.name === document.getElementById("searchBar").value);
    }

    Swal.fire({
        title: 'Set Background Color',
        html: `
            <p class="swal2-name">@${newData.name}</p>
            <input id="background-color-input" type="color" class="swal2-input equal-input">
        `,
        focusConfirm: false,
        customClass: {
            popup: 'swal2-dark-popup'
        },
        preConfirm: () => {
            const backgroundColorValue = document.getElementById('background-color-input').value;

            return { backgroundColorValue };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { backgroundColorValue } = result.value;
            let formData = {
                functionName: "backgroundColor",
                id: newData.id,
                color: backgroundColorValue
            };

            submitForm(formData);

            console.log(`Background Color: ${backgroundColorValue}`);
        }
    });
});

document.getElementById("xp-button").addEventListener("click", function () {

    let newData = allUsers.find(user => user.name === data.name);

    if (allUsers.find(user => user.name === document.getElementById("searchBar").value)) {
        newData = allUsers.find(user => user.name === document.getElementById("searchBar").value);
    }

    Swal.fire({
        title: 'Add / Remove XP',
        html: `
            <p class="swal2-name">@${newData.name}</p>
            <input id="xp-input" type="number" placeholder="XP amount" class="swal2-input equal-input">
            <select id="action-select" class="swal2-select equal-input">
                <option value="add">Add</option>
                <option value="remove">Remove</option>
            </select>
        `,
        focusConfirm: false,
        customClass: {
            popup: 'swal2-dark-popup'
        },
        preConfirm: () => {
            const xpValue = document.getElementById('xp-input').value;
            const action = document.getElementById('action-select').value;

            if (!xpValue || xpValue < 0) {
                Swal.showValidationMessage('Please enter a valid, non-negative XP amount');
                return false;
            }

            return { xpValue, action };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { xpValue, action } = result.value;
            let formData = {
                functionName: "xp",
                id: newData.id,
                xp: xpValue,
                action: action
            };

            submitForm(formData);

            console.log(`XP: ${xpValue}, Action: ${action}`);
        }
    });
});

document.getElementById("balance-button").addEventListener("click", function () {

    let newData = allUsers.find(user => user.name === data.name);

    if (allUsers.find(user => user.name === document.getElementById("searchBar").value)) {
        newData = allUsers.find(user => user.name === document.getElementById("searchBar").value);
    }

    Swal.fire({
        title: 'Add / Remove Coin',
        html: `
            <p class="swal2-name">@${newData.name}</p>
            <input id="coin-input" type="number" placeholder="Coin amount" class="swal2-input equal-input">
            <select id="coin-action-select" class="swal2-select equal-input">
                <option value="add">Add</option>
                <option value="remove">Remove</option>
            </select>
        `,
        focusConfirm: false,
        customClass: {
            popup: 'swal2-dark-popup'
        },
        preConfirm: () => {
            const coinValue = document.getElementById('coin-input').value;
            const action = document.getElementById('coin-action-select').value;

            if (!coinValue || coinValue < 0) {
                Swal.showValidationMessage('Please enter a valid, non-negative coin amount');
                return false;
            }

            return { coinValue, action };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { coinValue, action } = result.value;
            let formData = {
                functionName: "coin",
                id: newData.id,
                xp: coinValue,
                action: action
            };

            submitForm(formData);
        }
    });
});