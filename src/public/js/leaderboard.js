document.addEventListener('DOMContentLoaded', () => {
    let leaderboardData = JSON.parse(document.getElementById('leaderboard-data').textContent);
    const tbody = document.getElementById('leaderboard-rows');
    let filterValue = 'Xp';
    let period = 'total';

    function displayTable(filterValue, period) {
        tbody.innerHTML = '';

        let dayCount = period === 'monthly' ? 29 : (period === 'weekly' ? 6 : 0);
        leaderboardData = leaderboardData.filter(item => item !== null);

        let rankCounter = 1; // Rank sayacı

        leaderboardData.slice(0, 1000).forEach((entry) => {
            let userTotal = 0;
            if (filterValue === "level" || filterValue === "subMonth" || filterValue === "boostTime") {
                userTotal = entry[filterValue] || 0;
            } else if (period === 'total') {
                userTotal = entry["total" + filterValue.charAt(0).toUpperCase() + filterValue.slice(1)] || 0;
            } else {
                for (let i = 0; i <= dayCount; i++) {
                    userTotal += entry["monthly" + filterValue.charAt(0).toUpperCase() + filterValue.slice(1)][i] || 0;
                }
            }

            if (filterValue === "boostTime" && userTotal === 0) {
                return; // boostTime sıfır olanları atla
            }

            const tr = document.createElement('tr');
            tr.setAttribute('data-id', entry.id);

            let displayValue = userTotal;
            if (filterValue === "boostTime" && userTotal !== 0) {
                const boostDate = new Date(userTotal);
                const currentDate = new Date();
                const timeDiff = Math.abs(currentDate - boostDate);
                const daysAgo = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                displayValue = `for ${daysAgo} days`;
            }

            tr.innerHTML = `
                <td>#${rankCounter}</td>
                <td class="user-cell"><img src="${entry.iconURL}" alt="User Icon" class="user-icon" width="32" height="32">${entry.name}</td>
                <td>${displayValue}</td>
            `;

            tr.addEventListener('click', () => {
                const userId = tr.getAttribute('data-id');
                window.location.href = `/profile/${userId}`;
            });

            tbody.appendChild(tr);

            rankCounter++; // Geçerli bir kullanıcı eklediğimizde rank sayacını artır
        });
    }

    document.getElementById('selectMenu').addEventListener('change', function (event) {
        filterValue = event.target.value;
        refreshContent(filterValue, period);
    });

    document.getElementById('filterPeriodButton').addEventListener('click', function () {
        if (period === 'total') {
            period = 'monthly';
            this.textContent = 'Month';
        } else if (period === 'monthly') {
            period = 'weekly';
            this.textContent = 'Week';
        } else {
            period = 'total';
            this.textContent = 'Total';
        }

        const filterValue = document.getElementById('selectMenu').value;
        refreshContent(filterValue, period);
    });

    function refreshContent(filterValue, period) {
        leaderboardData.sort((a, b) => {
            let atoplam = 0;
            let btoplam = 0;
            let dayCount = period === 'monthly' ? 29 : (period === 'weekly' ? 6 : 0);
            
            if (filterValue === "boostTime") {
                if (a[filterValue] === 0) return 1;
                if (b[filterValue] === 0) return -1;
                const aDate = new Date(a[filterValue]);
                const bDate = new Date(b[filterValue]);
                const aDaysAgo = Math.ceil(Math.abs(new Date() - aDate) / (1000 * 60 * 60 * 24));
                const bDaysAgo = Math.ceil(Math.abs(new Date() - bDate) / (1000 * 60 * 60 * 24));
                return bDaysAgo - aDaysAgo; // Sort by longest duration first
            }
            
            if (filterValue === "level" || filterValue === "subMonth") {
                atoplam = a[filterValue] || 0;
                btoplam = b[filterValue] || 0;
                return btoplam - atoplam;
            }
            
            if (period === 'total') {
                atoplam = a["total" + filterValue.charAt(0).toUpperCase() + filterValue.slice(1)] || 0;
                btoplam = b["total" + filterValue.charAt(0).toUpperCase() + filterValue.slice(1)] || 0;
            } else {
                for (let i = 0; i <= dayCount; i++) {
                    atoplam += a["monthly" + filterValue.charAt(0).toUpperCase() + filterValue.slice(1)][i] || 0;
                    btoplam += b["monthly" + filterValue.charAt(0).toUpperCase() + filterValue.slice(1)][i] || 0;
                }
            }
            
            return btoplam - atoplam;
        });
    
        displayTable(filterValue, period);
    }
    
    displayTable(filterValue, period);
});
