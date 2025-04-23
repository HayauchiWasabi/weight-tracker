let log = JSON.parse(localStorage.getItem('weightLog')) || [];
let chart;

function saveEntry() {
    const weight = parseFloat(document.getElementById('weight').value);
    if (isNaN(weight)) return alert('Please enter a valid number for weight.');

    const today = new Date().toISOString().split('T')[0];
    const alreadyExists = log.some(entry => entry.date === today);
    if (alreadyExists) {
        document.getElementById('warning').style.display = 'block';
        return;
    } else {
        document.getElementById('warning').style.display = 'none';
    }

    log.unshift({ date: today, weight });
    localStorage.setItem('weightLog', JSON.stringify(log));
    document.getElementById('weight').value = '';
    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    const reversedLog = [...log].reverse();
    const dates = reversedLog.map(entry =>
        new Date(entry.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
    );
    const weights = reversedLog.map(entry => entry.weight);

    const averages = weights.map((_, i, arr) => {
        const start = Math.max(i - 6, 0);
        const slice = arr.slice(start, i + 1);
        return slice.reduce((a, b) => a + b, 0) / slice.length;
    });

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
        labels: dates,
        datasets: [
            { label: 'Weight (kg)', data: weights, fill: false, borderColor: '#4d7cfe', tension: 0.3 },
            { label: '7-Day Avg', data: averages, fill: false, borderColor: '#ffcc00', tension: 0.3 }
        ]
        },
        options: { responsive: true, scales: { y: { beginAtZero: false } } }
    });
}

function showAdmin() {
    document.getElementById('adminModal').style.display = 'flex';
    renderAdmin();
}

function closeModal() {
    document.getElementById('adminModal').style.display = 'none';
}

function renderAdmin() {
    const ul = document.getElementById('recordList');
    ul.innerHTML = '';
    log.forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${entry.date}: ${entry.weight} kg <button onclick="editEntry(${index})"><i class='fas fa-pen'></i></button> <button onclick="deleteEntry(${index})"><i class='fas fa-trash'></i></button>`;
        ul.appendChild(li);
    });
}

function deleteEntry(index) {
    if (confirm("Delete this record?")) {
        log.splice(index, 1);
        localStorage.setItem('weightLog', JSON.stringify(log));
        renderAdmin();
        renderChart();
    }
}

function editEntry(index) {
    const newWeight = prompt("Edit weight:", log[index].weight);
    if (newWeight !== null && !isNaN(parseFloat(newWeight))) {
        log[index].weight = parseFloat(newWeight);
        localStorage.setItem('weightLog', JSON.stringify(log));
        renderAdmin();
        renderChart();
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.error('Service Worker registration failed', err));
    });
}

renderChart();
