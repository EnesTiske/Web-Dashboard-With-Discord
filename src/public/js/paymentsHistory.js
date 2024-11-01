function convertTimestampToReadableDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} _ ${hours}:${minutes}:${seconds}`;
}

let amountSortDirection = 'desc';

function sortByAmount() {
    historyData.sort((a, b) => {
        if (amountSortDirection === 'asc') {
            return a.amount - b.amount;
        } else {
            return b.amount - a.amount;
        }
    });
    amountSortDirection = amountSortDirection === 'asc' ? 'desc' : 'asc';
    displayTable();
}

document.querySelector('#historyTable th:nth-child(3)').addEventListener('click', sortByAmount);

let dateSortDirection = 'desc';

function sortByDate() {
    historyData.sort((a, b) => {
        const dateA = new Date(a.created * 1000);
        const dateB = new Date(b.created * 1000);
        if (dateSortDirection === 'asc') {
            return dateA - dateB;
        } else {
            return dateB - dateA;
        }
    });
    dateSortDirection = dateSortDirection === 'asc' ? 'desc' : 'asc';
    displayTable();
}

document.querySelector('#historyTable th:nth-child(4)').addEventListener('click', sortByDate);

const historyTableBody = document.getElementById('historyTableBody');

function displayTable() {
    historyTableBody.innerHTML = '';

    historyData.forEach(item => {
        const row = document.createElement('tr');
        row.onclick = () => window.location.href = item.receipt_url;

        const userCell = document.createElement('td');
        userCell.textContent = item.user ? item.user.username : 'N/A';
        row.appendChild(userCell);

        const customerCell = document.createElement('td');
        customerCell.textContent = item.customer;
        row.appendChild(customerCell);

        const amountCell = document.createElement('td');
        amountCell.textContent = "$" + item.amount / 100;
        row.appendChild(amountCell);

        const dateCell = document.createElement('td');
        dateCell.textContent = convertTimestampToReadableDate(item.created);
        row.appendChild(dateCell);

        const receiptNumberCell = document.createElement('td');
        receiptNumberCell.textContent = item.receipt_number;
        row.appendChild(receiptNumberCell);

        historyTableBody.appendChild(row);
    });
}

displayTable();