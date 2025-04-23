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
    const orderdLog = [...log];
    const dates = orderdLog.map(entry =>
        new Date(entry.date).toLocaleDateString('en-AU', { month: '2-digit', day: '2-digit' })
    );
    const weights = orderdLog.map(entry => entry.weight);

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
            { label: '7-Day Avg', data: averages, fill: false, borderColor: '#ffcc00', borderDash: [5, 5], tension: 0.3 }
        ]
        },
        options: { responsive: true, scales: { y: { beginAtZero: false } } }
    });
}

function renderAdmin() {
    const select = document.getElementById('editSelect');
    if (select) {
        select.innerHTML = '<option value="new">Add New Record</option>';
        log.forEach((entry, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = `${entry.date} - ${entry.weight}kg`;
        select.appendChild(option);
        });
    }

    populateEditForm();
}

function populateEditForm() {
    const select = document.getElementById('editSelect');
    if (!select) return;
    const index = select.value;
    document.getElementById('editDate').value = index === 'new' ? '' : log[index].date;
    document.getElementById('editWeight').value = index === 'new' ? '' : log[index].weight;
    }

function saveEdit() {
    const index = document.getElementById('editSelect').value;
    const date = document.getElementById('editDate').value;
    const weight = parseFloat(document.getElementById('editWeight').value);
    
    if (!date || isNaN(weight)) {
        alert("Please enter valid values.");
        return;
    }
    
    const duplicate = log.some((entry, i) => entry.date === date && i != index);
    if (duplicate) {
        alert("A record with this date already exists.");
        return;
    }
    
    if (index === 'new') {
        log.unshift({ date, weight });
    } else {
        log[index] = { date, weight };
    }
    
    localStorage.setItem('weightLog', JSON.stringify(log));
    renderAdmin();
    renderChart();
}

function deleteEntry(index) {
    log.splice(index, 1);
    localStorage.setItem('weightLog', JSON.stringify(log));
    renderAdmin();
    renderChart();
}

function deleteSelectedRecord() {
    const index = document.getElementById('editSelect').value;
    if (index === 'new') {
        alert("Cannot delete a new record.");
        return;
    }
    if (confirm("Delete this record?")) {
        deleteEntry(index);
    }
}

function resetAllData() {
    if (confirm("Delete ALL records.")) {
        localStorage.removeItem('weightLog');
        log = [];
        renderChart();
        renderAdmin();
    }
}

function applyTheme(theme) {
    localStorage.setItem('selectedTheme', theme);
    const root = document.documentElement.style;
    switch (theme) {
        case 'default':
            root.setProperty('--bg-color', '#1a1f2b');
            root.setProperty('--card-color', '#2c3e50');
            root.setProperty('--text-color', '#eaeaea');
            root.setProperty('--accent-color', '#90caf9');
            break;
        case 'steel':
            root.setProperty('--bg-color', '#1a1f2b');
            root.setProperty('--card-color', '#2c3e50');
            root.setProperty('--text-color', '#eaeaea');
            root.setProperty('--accent-color', '#2979ff');
            break;
        case 'github':
            root.setProperty('--bg-color', '#0d1117');
            root.setProperty('--card-color', '#161b22');
            root.setProperty('--text-color', '#c9d1d9');
            root.setProperty('--accent-color', '#2385f7');
            break;
        case 'purple':
            root.setProperty('--bg-color', '#0f172a');
            root.setProperty('--card-color', '#1e293b');
            root.setProperty('--text-color', '#dbeafe');
            root.setProperty('--accent-color', '#3b82f6');
            break;
        case 'cyber':
            root.setProperty('--bg-color', '#050d1f');
            root.setProperty('--card-color', '#0c1e3b');
            root.setProperty('--text-color', '#f0f8ff');
            root.setProperty('--accent-color', '#00bfff');
            break;
    }
}

function closeModal() {
    document.getElementById('adminModal').style.display = 'none';
}

function showAdmin() {
    document.getElementById('adminModal').style.display = 'flex';
    setTimeout(() => {
        renderAdmin();
    }, 50);
}

window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    document.getElementById('themeSelect').value = savedTheme;
    applyTheme(savedTheme);
    renderChart();
    renderAdmin();
});
