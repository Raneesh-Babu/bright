// Initialize data structure
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: 'Salary', type: 'income' },
    { id: 2, name: 'Freelance', type: 'income' },
    { id: 3, name: 'Investment', type: 'income' },
    { id: 4, name: 'Food', type: 'expense' },
    { id: 5, name: 'Transport', type: 'expense' },
    { id: 6, name: 'Shopping', type: 'expense' },
    { id: 7, name: 'Entertainment', type: 'expense' },
    { id: 8, name: 'Utilities', type: 'expense' }
];

let currentFilter = 'month';
let chart = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    
    // Load initial data
    loadCategories();
    loadTransactions();
    updateDashboard();
    updateChart();
    
    // Setup form submission
    document.getElementById('transactionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addTransaction();
    });
});

// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Update data if needed
    if (sectionId === 'dashboard') {
        updateDashboard();
        updateChart();
    } else if (sectionId === 'transactions') {
        loadAllTransactions();
    } else if (sectionId === 'categories') {
        loadCategoryLists();
    }
}

// Category Management
function loadCategories() {
    const categorySelect = document.getElementById('category');
    const newCategorySelect = document.getElementById('newCategoryType');
    
    // Clear existing options
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    // Add categories to select
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
    
    // Update category lists display
    loadCategoryLists();
    
    // Save to localStorage
    localStorage.setItem('categories', JSON.stringify(categories));
}

function loadCategoryLists() {
    const incomeList = document.getElementById('incomeCategories');
    const expenseList = document.getElementById('expenseCategories');
    
    // Clear lists
    incomeList.innerHTML = '';
    expenseList.innerHTML = '';
    
    // Populate lists
    categories.forEach(category => {
        const tag = document.createElement('div');
        tag.className = 'category-tag';
        tag.innerHTML = `
            ${category.name}
            <span class="delete-category" onclick="deleteCategory(${category.id})">
                <i class="fas fa-times"></i>
            </span>
        `;
        
        if (category.type === 'income') {
            incomeList.appendChild(tag);
        } else {
            expenseList.appendChild(tag);
        }
    });
}

function showAddCategoryModal() {
    document.getElementById('addCategoryModal').style.display = 'flex';
}

function closeAddCategoryModal() {
    document.getElementById('addCategoryModal').style.display = 'none';
    document.getElementById('modalCategoryName').value = '';
}

function saveNewCategory() {
    const name = document.getElementById('modalCategoryName').value.trim();
    const type = document.getElementById('modalCategoryType').value;
    
    if (!name) {
        alert('Please enter a category name');
        return;
    }
    
    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase() && cat.type === type)) {
        alert('Category already exists!');
        return;
    }
    
    // Add new category
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    categories.push({ id: newId, name, type });
    
    // Update UI and close modal
    loadCategories();
    closeAddCategoryModal();
    
    // Switch to categories section
    showSection('categories');
}

function addNewCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    const type = document.getElementById('newCategoryType').value;
    
    if (!name) {
        alert('Please enter a category name');
        return;
    }
    
    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase() && cat.type === type)) {
        alert('Category already exists!');
        return;
    }
    
    // Add new category
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    categories.push({ id: newId, name, type });
    
    // Update UI
    loadCategories();
    document.getElementById('newCategoryName').value = '';
}

function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category? Transactions using this category will not be deleted.')) {
        return;
    }
    
    // Remove category
    categories = categories.filter(cat => cat.id !== id);
    loadCategories();
}

// Transaction Management
function addTransaction() {
    const type = document.getElementById('type').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const remark = document.getElementById('remark').value.trim();
    const categoryId = parseInt(document.getElementById('category').value);
    const date = document.getElementById('date').value;
    
    // Validate
    if (!type || !amount || amount <= 0 || !date) {
        alert('Please fill in all required fields with valid values');
        return;
    }
    
    // Create transaction
    const transaction = {
        id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
        type,
        amount,
        remark: remark || 'No remark',
        categoryId,
        date,
        createdAt: new Date().toISOString()
    };
    
    // Add to transactions
    transactions.push(transaction);
    
    // Save to localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Reset form
    document.getElementById('transactionForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    
    // Update UI
    loadTransactions();
    updateDashboard();
    updateChart();
    
    alert('Transaction added successfully!');
    
    // Switch to transactions view
    showSection('transactions');
}

function loadTransactions() {
    const recentList = document.getElementById('recentTransactions');
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get recent 5 transactions
    const recentTransactions = sortedTransactions.slice(0, 5);
    
    // Display
    if (recentTransactions.length === 0) {
        recentList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet. Add your first transaction!</p>
            </div>
        `;
        return;
    }
    
    recentList.innerHTML = recentTransactions.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        return `
            <div class="transaction-item">
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <span class="transaction-type type-${transaction.type}">
                            ${transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                        <span class="transaction-category">${category ? category.name : 'Uncategorized'}</span>
                        <small>${formatDate(transaction.date)}</small>
                    </div>
                    <div class="transaction-remark">${transaction.remark}</div>
                </div>
                <div class="transaction-amount" style="color: ${transaction.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

function loadAllTransactions() {
    const allList = document.getElementById('allTransactions');
    
    if (transactions.length === 0) {
        allList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet. Add your first transaction!</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    allList.innerHTML = sortedTransactions.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        return `
            <div class="transaction-item">
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <span class="transaction-type type-${transaction.type}">
                            ${transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                        <span class="transaction-category">${category ? category.name : 'Uncategorized'}</span>
                        <small>${formatDate(transaction.date)}</small>
                    </div>
                    <div class="transaction-remark">${transaction.remark}</div>
                </div>
                <div class="transaction-amount" style="color: ${transaction.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

function filterTransactions(filterType) {
    // Update active button
    document.querySelectorAll('#transactions .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const allList = document.getElementById('allTransactions');
    let filteredTransactions = [...transactions];
    
    const now = new Date();
    
    switch(filterType) {
        case 'income':
            filteredTransactions = filteredTransactions.filter(t => t.type === 'income');
            break;
        case 'expense':
            filteredTransactions = filteredTransactions.filter(t => t.type === 'expense');
            break;
        case 'today':
            const today = now.toISOString().split('T')[0];
            filteredTransactions = filteredTransactions.filter(t => t.date === today);
            break;
        case 'week':
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startOfWeek);
            break;
        case 'month':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startOfMonth);
            break;
        default:
            // 'all' - show all transactions
            break;
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredTransactions.length === 0) {
        allList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-filter"></i>
                <p>No transactions match the selected filter.</p>
            </div>
        `;
        return;
    }
    
    allList.innerHTML = filteredTransactions.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        return `
            <div class="transaction-item">
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <span class="transaction-type type-${transaction.type}">
                            ${transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                        <span class="transaction-category">${category ? category.name : 'Uncategorized'}</span>
                        <small>${formatDate(transaction.date)}</small>
                    </div>
                    <div class="transaction-remark">${transaction.remark}</div>
                </div>
                <div class="transaction-amount" style="color: ${transaction.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

// Dashboard Functions
function updateDashboard() {
    // Calculate totals
    const now = new Date();
    let filteredTransactions = [...transactions];
    
    // Apply time filter
    switch(currentFilter) {
        case 'week':
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startOfWeek);
            break;
        case 'year':
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startOfYear);
            break;
        default: // 'month'
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startOfMonth);
            break;
    }
    
    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Update UI
    document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `$${totalExpense.toFixed(2)}`;
    document.getElementById('currentBalance').textContent = `$${balance.toFixed(2)}`;
}

function changeTimeFilter(filter) {
    // Update active button
    document.querySelectorAll('#dashboard .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    currentFilter = filter;
    updateDashboard();
    updateChart();
}

function filterByDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) return;
    
    // Update button states
    document.querySelectorAll('#dashboard .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return transDate >= start && transDate <= end;
    });
    
    // Calculate totals
    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Update UI
    document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `$${totalExpense.toFixed(2)}`;
    document.getElementById('currentBalance').textContent = `$${balance.toFixed(2)}`;
}

function updateChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (chart) {
        chart.destroy();
    }
    
    // Prepare data based on current filter
    let labels = [];
    let incomeData = [];
    let expenseData = [];
    
    const now = new Date();
    let filteredTransactions = [...transactions];
    
    switch(currentFilter) {
        case 'week':
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                labels.push(formatDate(dateStr, true));
                
                const dayTransactions = filteredTransactions.filter(t => t.date === dateStr);
                incomeData.push(dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
                expenseData.push(dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
            }
            break;
            
        case 'year':
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthYear = date.toLocaleString('default', { month: 'short' });
                labels.push(monthYear);
                
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                
                const monthTransactions = filteredTransactions.filter(t => {
                    const transDate = new Date(t.date);
                    return transDate >= monthStart && transDate <= monthEnd;
                });
                
                incomeData.push(monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
                expenseData.push(monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
            }
            break;
            
        default: // 'month'
            // Last 30 days
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                labels.push(formatDate(dateStr, true));
                
                const dayTransactions = filteredTransactions.filter(t => t.date === dateStr);
                incomeData.push(dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
                expenseData.push(dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
            }
            break;
    }
    
    // Create chart
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: 'var(--income-color)',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: 'var(--expense-color)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: currentFilter === 'month' ? 'Last 30 Days' : 
                          currentFilter === 'week' ? 'Last 7 Days' : 
                          'Last 12 Months'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

// Data Import/Export
function exportData() {
    const data = {
        transactions,
        categories,
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `money-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

function importData() {
    document.getElementById('importFile').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.transactions || !data.categories) {
                throw new Error('Invalid data format');
            }
            
            if (confirm('This will replace all your current data. Are you sure?')) {
                transactions = data.transactions;
                categories = data.categories;
                
                localStorage.setItem('transactions', JSON.stringify(transactions));
                localStorage.setItem('categories', JSON.stringify(categories));
                
                // Reload UI
                loadCategories();
                loadTransactions();
                updateDashboard();
                updateChart();
                
                alert('Data imported successfully!');
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
        
        // Reset file input
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
        transactions = [];
        categories = [
            { id: 1, name: 'Salary', type: 'income' },
            { id: 2, name: 'Freelance', type: 'income' },
            { id: 3, name: 'Investment', type: 'income' },
            { id: 4, name: 'Food', type: 'expense' },
            { id: 5, name: 'Transport', type: 'expense' },
            { id: 6, name: 'Shopping', type: 'expense' },
            { id: 7, name: 'Entertainment', type: 'expense' },
            { id: 8, name: 'Utilities', type: 'expense' }
        ];
        
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('categories', JSON.stringify(categories));
        
        // Reload UI
        loadCategories();
        loadTransactions();
        updateDashboard();
        updateChart();
        
        alert('All data has been cleared!');
    }
}

// Utility Functions
function formatDate(dateStr, short = false) {
    const date = new Date(dateStr);
    if (short) {
        return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('default', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}