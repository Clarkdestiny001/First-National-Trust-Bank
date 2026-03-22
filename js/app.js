// Banking Application State
const BankApp = {
    user: {
        name: 'Alexander Morgan',
        userId: 'alex.morgan',
        lastLogin: new Date().toLocaleString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        }) + ' EST'
    },
    accounts: {
        checking: { name: 'Checking Account', number: '•••• 4521', balance: 100000000.00, available: 100000000.00, type: 'checking' },
        savings: { name: 'High-Yield Savings', number: '•••• 8823', balance: 100000000.00, available: 100000000.00, type: 'savings', apy: 5.25 },
        investment: { name: 'Investment Portfolio', number: '•••• 7734', balance: 28392.18, available: 28392.18, type: 'investment' }
    },
    externalBanks: {
        chase: { name: 'Chase Bank', logo: 'bg-blue-900', color: 'blue' },
        bofa: { name: 'Bank of America', logo: 'bg-red-700', color: 'red' },
        wells: { name: 'Wells Fargo', logo: 'bg-red-600', color: 'red' },
        citi: { name: 'Citibank', logo: 'bg-blue-600', color: 'blue' },
        usbank: { name: 'U.S. Bank', logo: 'bg-blue-800', color: 'blue' },
        pnc: { name: 'PNC Bank', logo: 'bg-orange-600', color: 'orange' },
        capitalone: { name: 'Capital One', logo: 'bg-red-500', color: 'red' },
        td: { name: 'TD Bank', logo: 'bg-green-600', color: 'green' },
        schwab: { name: 'Charles Schwab', logo: 'bg-blue-700', color: 'blue' },
        other: { name: 'External Bank', logo: 'bg-slate-600', color: 'slate' }
    },
    transactions: [],
    spendingCategories: [
        { name: 'Shopping', amount: 2450, color: '#ef4444', icon: 'shopping-bag' },
        { name: 'Groceries', amount: 890, color: '#3b82f6', icon: 'utensils' },
        { name: 'Utilities', amount: 450, color: '#6b7280', icon: 'bolt' },
        { name: 'Entertainment', amount: 320, color: '#f59e0b', icon: 'play' },
        { name: 'Transportation', amount: 280, color: '#10b981', icon: 'car' }
    ],
    isLoggedIn: false,
    loginAttempts: 0,
    lockoutExpiry: null,
    currentReceipt: null,
    cardFrozen: false,
    previousNetWorth: null,
    liveModeInterval: null,
    disableToasts: true,
    security: {
        twoFactorEnabled: true,
        trustedDevices: ['This device', 'Work laptop', 'iPhone 15'],
        emailAlerts: true,
        smsAlerts: true,
        pushAlerts: true
    },
    notifications: [
        { id: 1, title: 'Transfer Completed', message: 'Your transfer to Chase Bank was successful.', time: '2 min ago', read: false, type: 'success' },
        { id: 2, title: 'Security Alert', message: 'New login detected from New York, NY.', time: '1 hour ago', read: false, type: 'warning' },
        { id: 3, title: 'Interest Earned', message: 'You earned $45.23 in interest this month.', time: '1 day ago', read: true, type: 'info' }
    ]
};

let portfolioChart = null;
let spendingChart = null;

function generateLast30DaysTransactions() {
    const sources = [
        { name: 'Direct Deposit', category: 'Income', type: 'credit', icon: 'arrow-down', color: 'green', min: 3200, max: 6500 },
        { name: 'PayPal Transfer', category: 'Income', type: 'credit', icon: 'paypal', color: 'green', min: 180, max: 950 },
        { name: 'Starbucks', category: 'Dining', type: 'debit', icon: 'cup-hot', color: 'orange', min: 6, max: 45 },
        { name: 'Whole Foods', category: 'Groceries', type: 'debit', icon: 'utensils', color: 'blue', min: 20, max: 210 },
        { name: 'Electric Bill', category: 'Utilities', type: 'debit', icon: 'bolt', color: 'gray', min: 65, max: 190 },
        { name: 'Netflix', category: 'Entertainment', type: 'debit', icon: 'play', color: 'red', min: 12, max: 22 },
        { name: 'Amazon', category: 'Shopping', type: 'debit', icon: 'shopping-bag', color: 'red', min: 17, max: 400 },
        { name: 'ATM Withdrawal', category: 'Cash', type: 'debit', icon: 'money-bill-wave', color: 'amber', min: 20, max: 300 },
        { name: 'Transfer to Savings', category: 'Transfer', type: 'debit', icon: 'arrow-right', color: 'cyan', min: 100, max: 700 },
        { name: 'Investment Dividend', category: 'Income', type: 'credit', icon: 'chart-line', color: 'green', min: 35, max: 220 }
    ];

    const transactions = [];
    let id = 1;
    for (let days = 0; days < 30; days++) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        const dailyCount = Math.floor(Math.random() * 2) + 1;

        for (let t = 0; t < dailyCount; t++) {
            const template = sources[Math.floor(Math.random() * sources.length)];
            const amount = Number((template.min + Math.random() * (template.max - template.min)).toFixed(2));
            const type = template.type;
            const value = type === 'credit' ? amount : -amount;
            transactions.push({
                id: id++,
                date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)),
                name: template.name,
                category: template.category,
                amount: value,
                type,
                icon: template.icon,
                color: template.color,
                status: 'completed'
            });
        }
    }
    BankApp.transactions = transactions.sort((a, b) => b.date - a.date);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('fntb-auth');
    if (saved) {
        const session = JSON.parse(saved);
        if (session.isLoggedIn && session.userId && session.name) {
            BankApp.isLoggedIn = true;
            BankApp.user.userId = session.userId;
            BankApp.user.name = session.name;
            BankApp.user.lastLogin = session.lastLogin || BankApp.user.lastLogin;
            document.getElementById('authButton').textContent = 'Sign Out';
            document.getElementById('authButton').onclick = handleLogout;
            showDashboard();
        }
    }
    generateLast30DaysTransactions();
    updateNotificationBadge();
    updateSecurityCenter();
    updateDashboard();
    renderTransactions();
    document.getElementById('lastLogin').textContent = BankApp.user.lastLogin;
    initPortfolioChart();
    showServiceSection('personal');
    loadSettingsFromStorage();
});

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function showToast(message, type = 'success') {
    if (BankApp.disableToasts) return;
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600', warning: 'bg-amber-600' };
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.className = `${colors[type] || colors.success} text-white px-4 py-3 rounded-xl shadow-lg flex items-start gap-2 max-w-sm opacity-95`;
    toast.innerHTML = `<div class="mt-0.5"><i class="fas ${icons[type] || icons.info}"></i></div><div class="text-xs">${message}</div>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(24px)'; setTimeout(() => toast.remove(), 300); }, 2800);
}

function showServiceSection(section) {
    const sections = ['personal', 'business', 'wealth', 'support'];
    sections.forEach(s => {
        const panel = document.getElementById(`${s}Content`);
        const nav = document.getElementById(`serviceBtn${s.charAt(0).toUpperCase() + s.slice(1)}`);
        const link = document.getElementById(`nav${s.charAt(0).toUpperCase() + s.slice(1)}`);
        if (panel) panel.classList.toggle('hidden', s !== section);
        if (nav) {
            nav.classList.toggle('bg-blue-700', s === section);
            nav.classList.toggle('text-white', s === section);
            nav.classList.toggle('bg-slate-200', s !== section);
            nav.classList.toggle('text-slate-700', s !== section);
        }
        if (link) {
            link.classList.toggle('text-blue-900', s === section);
            link.classList.toggle('font-bold', s === section);
            link.classList.toggle('text-slate-600', s !== section);
        }
    });

    const serviceTitle = {
        personal: 'Personal Banking Overview',
        business: 'Business Banking Solutions',
        wealth: 'Wealth Management Planning',
        support: 'Customer Support Center'
    };
    showToast(`Now viewing ${serviceTitle[section]} section.`, 'info');
}

function showSettingsTab(tab) {
    document.querySelectorAll('.settings-panel').forEach(panel => panel.classList.add('hidden'));
    document.querySelectorAll('.settings-tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-slate-100', 'text-slate-700');
    });

    const map = {
        account: 'settingsAccount',
        security: 'settingsSecurity'
    };
    const selected = map[tab] || 'settingsAccount';
    document.getElementById(selected).classList.remove('hidden');
    const selectedBtn = document.getElementById(`settingsTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    if (selectedBtn) {
        selectedBtn.classList.remove('bg-slate-100', 'text-slate-700');
        selectedBtn.classList.add('bg-blue-600', 'text-white');
    }
}

function loadSettingsFromStorage() {
    showSettingsTab('account');
    document.querySelectorAll('#twoFactorStatus, #safetyTwoFactorStatus').forEach(el => el.textContent = BankApp.security.twoFactorEnabled ? 'Enabled' : 'Disabled');
    const stored = JSON.parse(localStorage.getItem('fntb-user') || 'null');
    if (stored) {
        document.getElementById('settingsName').value = stored.name || '';
        document.getElementById('settingsEmail').value = stored.email || '';
    }
    updateSecurityCenter();
}

function saveAccountSettings(e) {
    e.preventDefault();
    const name = document.getElementById('settingsName').value.trim();
    const email = document.getElementById('settingsEmail').value.trim();
    const password = document.getElementById('settingsPassword').value;
    const passwordConfirm = document.getElementById('settingsPasswordConfirm').value;

    if (!name || !email) { showToast('Name and email are required.', 'error'); return; }
    if (password && password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
    if (password && password !== passwordConfirm) { showToast('Passwords do not match.', 'error'); return; }

    const stored = JSON.parse(localStorage.getItem('fntb-user') || 'null') || {};
    stored.name = name;
    stored.email = email;
    if (password) stored.password = password;
    localStorage.setItem('fntb-user', JSON.stringify(stored));

    BankApp.user.name = name;
    document.getElementById('userNameDisplay').textContent = name;
    showToast('Account settings updated successfully.', 'success');
    document.getElementById('settingsPassword').value = '';
    document.getElementById('settingsPasswordConfirm').value = '';
}

function getDeviceId() {
    const fingerprint = `${navigator.platform}-${navigator.userAgent}-${navigator.language}`;
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) { hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i); hash |= 0; }
    return `device-${Math.abs(hash)}`;
}

function getRecognizedDevices() {
    return JSON.parse(localStorage.getItem('fntb-devices') || '[]');
}

function addRecognizedDevice(deviceId) {
    const devices = getRecognizedDevices();
    if (!devices.includes(deviceId)) {
        devices.push(deviceId);
        localStorage.setItem('fntb-devices', JSON.stringify(devices));
    }
    updateSecurityCenter();
}

function addLoginHistory() {
    const history = JSON.parse(localStorage.getItem('fntb-login-history') || '[]');
    history.unshift({ time: new Date().toLocaleString(), device: navigator.platform, location: 'Unknown', status: 'Success' });
    localStorage.setItem('fntb-login-history', JSON.stringify(history.slice(0, 5)));
    updateSecurityCenter();
}

        function resetLoginForm() {
            document.getElementById('userId').value = '';
            document.getElementById('password').value = '';
            document.getElementById('loginSubmitBtn').textContent = 'Sign In Securely';
            document.getElementById('loginError').classList.add('hidden');
            document.getElementById('loginError').textContent = '';
            document.getElementById('rememberMe').checked = true;
        }

function togglePasswordVisibility(fieldId, btnId) {
    const field = document.getElementById(fieldId);
    const btn = document.getElementById(btnId);
    if (!field || !btn) return;
    if (field.type === 'password') {
        field.type = 'text';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        field.type = 'password';
        btn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function toggleLogin() {
    const modal = document.getElementById('loginModal');
    const overlay = document.getElementById('loginScreenOverlay');
    modal.classList.toggle('hidden');
    overlay.classList.toggle('hidden');
    if (modal.classList.contains('hidden')) {
        document.body.style.overflow = 'auto';
        resetLoginForm();
    } else {
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const userIdInput = document.getElementById('userId');
            if (userIdInput) userIdInput.focus();
        }, 60);
    }
}

function showLoginError(message) {
    const el = document.getElementById('loginError');
    el.textContent = message;
    el.classList.remove('hidden');
}

function clearLoginError() {
    const el = document.getElementById('loginError');
    el.textContent = '';
    el.classList.add('hidden');
}

function handleLogin(e) {
    e.preventDefault();
    const now = Date.now();

    if (BankApp.lockoutExpiry && now < BankApp.lockoutExpiry) {
        const remaining = Math.ceil((BankApp.lockoutExpiry - now) / 1000);
        showLoginError(`Too many attempts. Try again in ${remaining} seconds.`);
        return;
    }

    const userId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value;

    clearLoginError();

    if (!userId || !password) {
        showLoginError('Enter both User ID and password.');
        return;
    }

    if (password.length < 6 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        showLoginError('Password must be at least 6 chars and include letters and numbers.');
        return;
    }

    const storedUser = JSON.parse(localStorage.getItem('fntb-user') || 'null');
    if (!storedUser) {
        showLoginError('No account found. Please enroll before signing in.');
        return;
    }

    if (storedUser.userId !== userId || storedUser.password !== password) {
        showLoginError('User ID or password not recognized. Please enroll or retry.');
        return;
    }

    const deviceId = getDeviceId();

    BankApp.isLoggedIn = true;
    BankApp.user.name = storedUser.name;
    BankApp.user.userId = userId;
    addRecognizedDevice(deviceId);
    addLoginHistory();
    BankApp.user.lastLogin = new Date().toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' EST';
    localStorage.setItem('fntb-auth', JSON.stringify({ isLoggedIn: true, userId: BankApp.user.userId, name: BankApp.user.name, lastLogin: BankApp.user.lastLogin }));
    toggleLogin();
    showDashboard();
    showToast(`Welcome back, ${BankApp.user.name}!`, 'success');
    document.getElementById('authButton').textContent = 'Sign Out';
    document.getElementById('authButton').onclick = handleLogout;
    BankApp.loginAttempts = 0;
}

function handleLogout() {
    BankApp.isLoggedIn = false;
    localStorage.removeItem('fntb-auth');
    document.getElementById('mainContent').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('authButton').textContent = 'Sign In';
    document.getElementById('authButton').onclick = toggleLogin;
    showToast('You have been signed out successfully', 'info');
}

function openEnrollModal() {
    document.getElementById('enrollModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEnrollModal() {
    document.getElementById('enrollModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function handleEnroll(e) {
    e.preventDefault();
    const name = document.getElementById('enrollName').value.trim();
    const email = document.getElementById('enrollEmail').value.trim();
    const userId = document.getElementById('enrollUserId').value.trim();
    const password = document.getElementById('enrollPassword').value;
    const errorEl = document.getElementById('enrollError');

    errorEl.classList.add('hidden');
    errorEl.textContent = '';

    if (!name || !email || !userId || password.length < 6) {
        errorEl.textContent = 'Please fill in all fields with valid information (password min 6 chars).';
        errorEl.classList.remove('hidden');
        return;
    }

    localStorage.setItem('fntb-user', JSON.stringify({ name, email, userId, password }));
    showToast('Enrollment complete. Please sign in with your new account.', 'success');
    closeEnrollModal();
    toggleLogin();
    document.getElementById('userId').value = userId;
    document.getElementById('password').value = password;
    return;
}

function showDashboard() {
    if (!BankApp.isLoggedIn) { toggleLogin(); return; }
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
    updateDashboard();
    updateSecurityCenter();
}

function animateMoneyCounter(elementId, targetValue, duration = 900) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const startValue = Number(el.getAttribute('data-start') || 0);
    const start = performance.now();
    const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const value = startValue + (targetValue - startValue) * progress;
        el.textContent = formatCurrency(value);
        if (progress < 1) requestAnimationFrame(update);
        else { el.textContent = formatCurrency(targetValue); el.setAttribute('data-start', String(targetValue)); }
    };
    requestAnimationFrame(update);
}

function startLiveMode() {
    if (BankApp.liveModeInterval) return;
    BankApp.liveModeInterval = setInterval(() => {
        const drift = (Math.random() - 0.45) * 1200;
        BankApp.accounts.investment.balance = Math.max(0, BankApp.accounts.investment.balance + drift);
        BankApp.accounts.investment.available = BankApp.accounts.investment.balance;
        const savingDrift = (Math.random() - 0.5) * 160;
        BankApp.accounts.savings.balance = Math.max(0, BankApp.accounts.savings.balance + savingDrift);
        BankApp.accounts.savings.available = BankApp.accounts.savings.balance;
        updateDashboard();
    }, 3000);
    const btn = document.getElementById('liveModeButton');
    if (btn) { btn.textContent = 'Live: On'; btn.className = 'px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-100 font-semibold'; }
}

function stopLiveMode() {
    if (BankApp.liveModeInterval) {
        clearInterval(BankApp.liveModeInterval);
        BankApp.liveModeInterval = null;
    }
    const btn = document.getElementById('liveModeButton');
    if (btn) { btn.textContent = 'Live: Off'; btn.className = 'px-3 py-1 rounded-full bg-red-500/20 text-red-100 font-semibold'; }
}

function toggleLiveMode() {
    if (BankApp.liveModeInterval) stopLiveMode(); else startLiveMode();
}

function updateDashboard() {
    const total = BankApp.accounts.checking.balance + BankApp.accounts.savings.balance + BankApp.accounts.investment.balance;
    const totalBalanceEl = document.getElementById('totalBalance');
    if (totalBalanceEl) {
        const current = Number(totalBalanceEl.getAttribute('data-start') || total);
        totalBalanceEl.setAttribute('data-start', String(current));
        animateMoneyCounter('totalBalance', total, 900);
    }

    const growthEl = document.getElementById('balanceGrowth');
    const periodEl = document.getElementById('balanceGrowthPeriod');
    if (growthEl) {
        const prev = BankApp.previousNetWorth !== null ? BankApp.previousNetWorth : total;
        const diff = total - prev;
        const pct = prev === 0 ? 0 : (diff / prev) * 100;
        const sign = diff >= 0 ? '+' : '-';
        growthEl.innerHTML = `<i class='fas fa-arrow-${diff >= 0 ? 'up' : 'down'}'></i> ${sign}${Math.abs(pct).toFixed(2)}%`;
        growthEl.className = `px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${diff >= 0 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`;
        BankApp.previousNetWorth = total;
    }
    if (periodEl) periodEl.textContent = 'vs last refresh';

    document.getElementById('userNameDisplay').textContent = BankApp.user.name;
    animateMoneyCounter('checkingBalance', BankApp.accounts.checking.balance, 850);
    animateMoneyCounter('savingsBalance', BankApp.accounts.savings.balance, 850);
    animateMoneyCounter('investmentBalance', BankApp.accounts.investment.balance, 850);
    animateMoneyCounter('fromCheckingBalance', BankApp.accounts.checking.balance, 850);
    animateMoneyCounter('fromSavingsBalance', BankApp.accounts.savings.balance, 850);
    document.getElementById('checkingAvailable').textContent = formatCurrency(BankApp.accounts.checking.available);

    const recent = BankApp.transactions.filter(tx => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        return new Date(tx.date) >= cutoff;
    });
    const totalCredit = recent.filter(tx => tx.type === 'credit').reduce((sum, tx) => sum + tx.amount, 0);
    const totalDebit = recent.filter(tx => tx.type === 'debit').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const net = totalCredit - totalDebit;
    document.getElementById('summaryNet').textContent = net >= 0 ? `+${formatCurrency(net)}` : formatCurrency(net);
    document.getElementById('summaryCredit').textContent = `+${formatCurrency(totalCredit)}`;
    document.getElementById('summaryDebit').textContent = `-${formatCurrency(totalDebit)}`;
    
    updateAvailableBalance();
}

function initPortfolioChart() {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Portfolio Value',
                data: [42000, 43500, 42800, 45000, 46500, 47284],
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function updateChartPeriod(period) {
    // Update active button state
    document.querySelectorAll('.chart-btn').forEach(btn => {
        if (btn.textContent === period) {
            btn.classList.remove('bg-white/10', 'text-white');
            btn.classList.add('bg-white', 'text-blue-900');
        } else {
            btn.classList.remove('bg-white', 'text-blue-900');
            btn.classList.add('bg-white/10', 'text-white');
        }
    });

    // Simulate data update
    const newData = period === '1M' ? [45000, 45500, 46000, 46500, 47000, 47284] :
                   period === '6M' ? [42000, 43500, 42800, 45000, 46500, 47284] :
                   period === '1Y' ? [35000, 38000, 40000, 42000, 45000, 47284] :
                   [25000, 30000, 35000, 40000, 44000, 47284];
    
    portfolioChart.data.datasets[0].data = newData;
    portfolioChart.update();
    showToast(`Chart updated to ${period} view`, 'info');
}

function renderTransactions(filter = 'all') {
    const container = document.getElementById('transactionsList');
    container.innerHTML = '';
    
    let filtered = BankApp.transactions;
    if (filter === 'income') filtered = BankApp.transactions.filter(t => t.type === 'credit');
    if (filter === 'expense') filtered = BankApp.transactions.filter(t => t.type === 'debit');
    
    filtered.sort((a, b) => b.date - a.date).forEach(tx => {
        const div = document.createElement('div');
        div.className = 'p-5 hover:bg-slate-50 smooth-transition flex items-center justify-between cursor-pointer group';
        div.onclick = () => showReceipt(tx);
        div.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-${tx.color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 smooth-transition">
                    <i class="fas fa-${tx.icon} text-${tx.color}-600 text-lg"></i>
                </div>
                <div>
                    <p class="font-bold text-slate-900 text-base">${tx.name}</p>
                    <p class="text-sm text-slate-500">${formatDate(tx.date)} • ${tx.category}</p>
                </div>
            </div>
            <div class="text-right">
                <span class="font-bold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-slate-900'} amount-display">
                    ${tx.type === 'credit' ? '+' : ''}${formatCurrency(tx.amount)}
                </span>
                <div class="text-xs text-slate-400 mt-1 flex items-center gap-1 justify-end">
                    <i class="fas fa-receipt"></i>
                    View Receipt
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function filterTransactions(type) {
    renderTransactions(type);
    showToast(`Showing ${type} transactions`, 'info');
}

function loadMoreTransactions() {
    showToast('Loading more transactions...', 'info');
    // Simulate loading
    setTimeout(() => {
        showToast('All transactions loaded', 'success');
    }, 1000);
}

function openAddMoneyModal() {
    document.getElementById('addMoneyModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeAddMoneyModal() {
    document.getElementById('addMoneyModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function quickAdd(amount) {
    document.getElementById('depositAmount').value = amount;
    showToast(`$${amount.toLocaleString()} ready to deposit!`, 'info');
}

function handleAddMoney(e) {
    e.preventDefault();
    const account = document.getElementById('depositAccount').value;
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'error'); return; }
    
    BankApp.accounts[account].balance += amount;
    BankApp.accounts[account].available += amount;
    
    const tx = {
        id: Date.now(),
        date: new Date(),
        name: 'Deposit',
        category: 'Transfer',
        amount: amount,
        type: 'credit',
        icon: 'plus',
        color: 'green',
        status: 'completed',
        from: 'External Account',
        to: BankApp.accounts[account].name,
        memo: 'Deposit'
    };
    BankApp.transactions.unshift(tx);
    
    updateDashboard();
    renderTransactions();
    closeAddMoneyModal();
    showReceipt(tx);
    addNotification('Deposit Received', `Added ${formatCurrency(amount)} to ${BankApp.accounts[account].name}.`, 'success', { txId: tx.id });
    document.getElementById('depositAmount').value = '';
}

function openTransferModal() {
    document.getElementById('transferModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    updateTransferOptions();
}

function closeTransferModal() {
    document.getElementById('transferModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function updateTransferOptions() {
    const from = document.getElementById('transferFrom').value;
    const to = document.getElementById('transferTo').value;
    const externalDetails = document.getElementById('externalBankDetails');
    
    updateAvailableBalance();
    
    if (BankApp.externalBanks[to]) {
        externalDetails.classList.remove('hidden');
    } else {
        externalDetails.classList.add('hidden');
    }
}

function updateAvailableBalance() {
    const from = document.getElementById('transferFrom').value;
    document.getElementById('availableBalance').textContent = formatCurrency(BankApp.accounts[from].balance);
}

function handleTransfer(e) {
    e.preventDefault();
    const from = document.getElementById('transferFrom').value;
    const to = document.getElementById('transferTo').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const memo = document.getElementById('transferMemo').value || 'Transfer';
    
    if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'error'); return; }
    if (amount > BankApp.accounts[from].balance) { showToast('Insufficient funds', 'error'); return; }
    if (from === to) { showToast('Cannot transfer to the same account', 'error'); return; }
    
    BankApp.accounts[from].balance -= amount;
    BankApp.accounts[from].available -= amount;
    
    let toAccountName = '';
    let toDetail = '';
    
    if (BankApp.externalBanks[to]) {
        const bank = BankApp.externalBanks[to];
        toAccountName = bank.name;
        toDetail = `Account ${document.getElementById('externalAccountNumber').value || '•••• 9876'}`;
        showToast(`Transfer of ${formatCurrency(amount)} to ${bank.name} submitted`, 'success');
    } else {
        BankApp.accounts[to].balance += amount;
        BankApp.accounts[to].available += amount;
        toAccountName = BankApp.accounts[to].name;
        toDetail = BankApp.accounts[to].number;
    }
    
    const tx = {
        id: Date.now(),
        date: new Date(),
        name: `Transfer to ${toAccountName}`,
        category: 'Transfer',
        amount: -amount,
        type: 'debit',
        icon: 'paper-plane',
        color: 'blue',
        status: 'completed',
        from: BankApp.accounts[from].name,
        to: toAccountName,
        toDetail: toDetail,
        memo: memo
    };
    
    BankApp.transactions.unshift(tx);
    
    updateDashboard();
    renderTransactions();
    closeTransferModal();
    showReceipt(tx);
    addNotification('Transfer Successful', `Sent ${formatCurrency(amount)} to ${toAccountName}.`, 'success', { txId: tx.id });
    
    document.getElementById('transferAmount').value = '';
    document.getElementById('transferMemo').value = '';
}

function openPayBillsModal() {
    document.getElementById('payBillsModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Set default date to today
    document.getElementById('billDate').valueAsDate = new Date();
}

function openFastTransfers() {
    closeSettings();
    openTransferModal();
    showToast('Fast transfers ready. Choose account and amount.', 'info');
}

function openCardControls() {
    closeSettings();
    openCardModal();
    showToast('Manage your cards: freeze, unfreeze, or report lost.', 'info');
}

function openSecurityAlerts() {
    closeSettings();
    showToast('Security alerts are active. Reviewing recent sign-ins...', 'success');
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
}

function toggleTwoFactor() {
    BankApp.security.twoFactorEnabled = !BankApp.security.twoFactorEnabled;
    const statusText = BankApp.security.twoFactorEnabled ? 'Enabled' : 'Disabled';
    document.querySelectorAll('#twoFactorStatus, #safetyTwoFactorStatus').forEach(el => el.textContent = statusText);
    showToast(`Two-factor authentication ${BankApp.security.twoFactorEnabled ? 'enabled' : 'disabled'}.`, 'success');
    addNotification('Two-Factor Authentication', `Two-factor is now ${BankApp.security.twoFactorEnabled ? 'enabled' : 'disabled'}.`, 'info');
}

function addCurrentDevice() {
    const deviceId = getDeviceId();
    addRecognizedDevice(deviceId);
    showToast('This device is now trusted and added to your recognized devices list.', 'success');
    addNotification('Device Added', 'This device was added to your trusted devices list.', 'success');
    updateSecurityCenter();
}

function showLoginHistory() {
    const history = JSON.parse(localStorage.getItem('fntb-login-history') || '[]');
    if (!history.length) {
        showToast('No login history yet. Sign in to seed your activity log.', 'info');
        return;
    }
    const recent = history.slice(0, 3).map((item, i) => `${i + 1}. ${item.time} from ${item.device}`).join('\n');
    alert(`Recent logins:\n${recent}`);
}

function updateSecurityCenter() {
    const devices = getRecognizedDevices();
    const history = JSON.parse(localStorage.getItem('fntb-login-history') || '[]');
    document.querySelectorAll('[data-security-stat="trusted-devices"]').forEach(el => el.textContent = `${devices.length} device${devices.length === 1 ? '' : 's'}`);
    document.querySelectorAll('[data-security-stat="login-history"]').forEach(el => el.textContent = `${history.length} login${history.length === 1 ? '' : 's'}`);
    document.querySelectorAll('#recognizedDeviceCount, #safetyDevicesExternal').forEach(el => el.textContent = `${devices.length} recognized device${devices.length === 1 ? '' : 's'}`);
    document.querySelectorAll('#loginHistoryCount, #safetyLoginExternal').forEach(el => el.textContent = `${history.length} recent login${history.length === 1 ? '' : 's'}`);
}

function viewTrustedDevices() {
    const devices = getRecognizedDevices();
    if (!devices.length) {
        showToast('No trusted devices saved yet.', 'info');
        return;
    }
    showToast(`Trusted devices: ${devices.join(', ')}`, 'info');
}

function shortcutExternalTransfer(bank) {
    const map = {
        chase: 'Chase Bank',
        bofa: 'Bank of America',
        wells: 'Wells Fargo',
        citi: 'Citibank',
        usbank: 'U.S. Bank'
    };
    const bankName = map[bank] || 'External Bank';
    openTransferModal();
    document.getElementById('transferFrom').value = 'checking';
    document.getElementById('transferTo').value = bank;
    document.getElementById('transferAmount').value = '150';
    document.getElementById('transferMemo').value = `Quick transfer to ${bankName}`;
    updateTransferOptions();
    showToast(`Shortcut prepared for ${bankName}.`, 'success');
}

function lockOrUnlockCard() {
    BankApp.cardFrozen = !BankApp.cardFrozen;
    const statusText = BankApp.cardFrozen ? 'Frozen' : 'Active';
    document.getElementById('lockCardButtonLabel').textContent = statusText;
    showToast(`Your card is now ${statusText.toLowerCase()}.`, BankApp.cardFrozen ? 'warning' : 'success');
    addNotification('Card Updated', `Your card status is now ${statusText}.`, BankApp.cardFrozen ? 'warning' : 'success');
}

function toggleEmailAlerts() {
    BankApp.security.emailAlerts = !BankApp.security.emailAlerts;
    document.getElementById('emailAlertBadge').textContent = BankApp.security.emailAlerts ? 'On' : 'Off';
    showToast(`Email alerts ${BankApp.security.emailAlerts ? 'enabled' : 'disabled'}.`, 'info');
}

function toggleSmsAlerts() {
    BankApp.security.smsAlerts = !BankApp.security.smsAlerts;
    document.getElementById('smsAlertBadge').textContent = BankApp.security.smsAlerts ? 'On' : 'Off';
    showToast(`SMS alerts ${BankApp.security.smsAlerts ? 'enabled' : 'disabled'}.`, 'info');
}

function togglePushAlerts() {
    BankApp.security.pushAlerts = !BankApp.security.pushAlerts;
    document.getElementById('pushAlertBadge').textContent = BankApp.security.pushAlerts ? 'On' : 'Off';
    showToast(`Push alerts ${BankApp.security.pushAlerts ? 'enabled' : 'disabled'}.`, 'info');
}

function sendSecurityReport() {
    showToast('Security report requested. Our team will contact you soon.', 'info');
    addNotification('Security Report Sent', 'We have received your security report request.', 'info');
}

function downloadMonthlyStatement() {
    const rows = [
        ['Date', 'Description', 'Category', 'Amount', 'Type'],
        ...BankApp.transactions.slice(0, 100).map(tx => [
            new Date(tx.date).toLocaleDateString(), tx.name, tx.category, tx.amount.toFixed(2), tx.type
        ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '30_day_statement.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('30-day statement download started.', 'success');
    addNotification('Statement Download', 'Your 30-day statement download has started.', 'info');
}

function closePayBillsModal() {
    document.getElementById('payBillsModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function handlePayBill(e) {
    e.preventDefault();
    const payee = document.getElementById('billPayee');
    const payeeName = payee.options[payee.selectedIndex].text;
    const amount = parseFloat(document.getElementById('billAmount').value);
    const date = document.getElementById('billDate').value;
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    const fromAccount = document.getElementById('billFromAccount').value;
    
    if (amount > BankApp.accounts[fromAccount].balance) {
        showToast('Insufficient funds', 'error');
        return;
    }
    
    BankApp.accounts[fromAccount].balance -= amount;
    BankApp.accounts[fromAccount].available -= amount;
    
    const tx = {
        id: Date.now(),
        date: new Date(date),
        name: payeeName,
        category: 'Bills & Utilities',
        amount: -amount,
        type: 'debit',
        icon: 'file-invoice-dollar',
        color: 'purple',
        status: 'completed',
        from: BankApp.accounts[fromAccount].name,
        to: payeeName,
        memo: 'Bill Payment'
    };
    
    BankApp.transactions.unshift(tx);
    
    updateDashboard();
    renderTransactions();
    closePayBillsModal();
    showReceipt(tx);
    
    showToast(`Bill payment of ${formatCurrency(amount)} scheduled`, 'success');
    document.getElementById('billAmount').value = '';
}

function openMobileDepositModal() {
    document.getElementById('mobileDepositModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeMobileDepositModal() {
    document.getElementById('mobileDepositModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function simulateCheckCapture(side) {
    showToast(`Capturing ${side} of check...`, 'info');
    setTimeout(() => {
        const preview = document.getElementById(`check${side.charAt(0).toUpperCase() + side.slice(1)}Preview`);
        preview.innerHTML = '<i class="fas fa-check-circle text-green-600 text-4xl"></i>';
        preview.classList.add('bg-green-100');
        showToast(`${side.charAt(0).toUpperCase() + side.slice(1)} of check captured!`, 'success');
    }, 1500);
}

function handleMobileDeposit() {
    const amount = parseFloat(document.getElementById('checkAmount').value);
    const account = document.getElementById('mobileDepositAccount').value;
    
    if (!amount || amount <= 0) {
        showToast('Please enter check amount', 'error');
        return;
    }
    
    BankApp.accounts[account].balance += amount;
    BankApp.accounts[account].available += amount;
    
    const tx = {
        id: Date.now(),
        date: new Date(),
        name: 'Mobile Check Deposit',
        category: 'Deposit',
        amount: amount,
        type: 'credit',
        icon: 'camera',
        color: 'blue',
        status: 'completed',
        from: 'Check Deposit',
        to: BankApp.accounts[account].name,
        memo: 'Mobile Deposit'
    };
    
    BankApp.transactions.unshift(tx);
    
    updateDashboard();
    renderTransactions();
    closeMobileDepositModal();
    showReceipt(tx);
    
    showToast(`Check deposit of ${formatCurrency(amount)} submitted`, 'success');
    document.getElementById('checkAmount').value = '';
    
    // Reset previews
    ['Front', 'Back'].forEach(side => {
        const preview = document.getElementById(`check${side}Preview`);
        preview.innerHTML = '<i class="fas fa-plus text-slate-400 text-3xl"></i>';
        preview.classList.remove('bg-green-100');
    });
}

function openCardModal() {
    document.getElementById('cardModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderCardActivity();
}

function closeCardModal() {
    document.getElementById('cardModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function renderCardActivity() {
    const container = document.getElementById('cardActivityList');
    const recentCardTx = BankApp.transactions.slice(0, 3);
    
    container.innerHTML = recentCardTx.map(tx => `
        <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-${tx.color}-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-${tx.icon} text-${tx.color}-600"></i>
                </div>
                <div>
                    <p class="font-bold text-slate-900 text-sm">${tx.name}</p>
                    <p class="text-xs text-slate-500">${formatDate(tx.date)}</p>
                </div>
            </div>
            <span class="font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-slate-900'}">
                ${tx.type === 'credit' ? '+' : ''}${formatCurrency(tx.amount)}
            </span>
        </div>
    `).join('');
}

function toggleCardFreeze() {
    BankApp.cardFrozen = !BankApp.cardFrozen;
    const btn = document.getElementById('freezeCardBtn');
    if (BankApp.cardFrozen) {
        btn.innerHTML = '<i class="fas fa-snowflake text-2xl text-blue-600"></i><span class="font-bold text-slate-700">Unfreeze Card</span>';
        btn.classList.add('bg-blue-50', 'border-blue-500');
        showToast('Card has been frozen', 'warning');
    } else {
        btn.innerHTML = '<i class="fas fa-snowflake text-2xl text-blue-600"></i><span class="font-bold text-slate-700">Freeze Card</span>';
        btn.classList.remove('bg-blue-50', 'border-blue-500');
        showToast('Card has been unfrozen', 'success');
    }
}

function showCardDetails() {
    const cardNumber = document.getElementById('virtualCardNumber');
    const current = cardNumber.textContent;
    if (current.includes('•')) {
        cardNumber.textContent = '4532  8912  3456  8901';
        showToast('Card details revealed', 'info');
    } else {
        cardNumber.textContent = '4532  ••••  ••••  8901';
    }
}

function requestNewCard() {
    showToast('New card request submitted', 'success');
    setTimeout(() => {
        showToast('Your new card will arrive in 5-7 business days', 'info');
    }, 2000);
}

function setSpendingLimit() {
    const limit = prompt('Enter daily spending limit:', '5000');
    if (limit) {
        showToast(`Daily spending limit set to ${formatCurrency(parseFloat(limit))}`, 'success');
    }
}

function showSpendingInsights() {
    const insights = document.getElementById('spendingInsights');
    insights.classList.remove('hidden');
    insights.scrollIntoView({ behavior: 'smooth' });
    
    // Initialize spending chart
    if (!spendingChart) {
        const ctx = document.getElementById('spendingChart').getContext('2d');
        spendingChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: BankApp.spendingCategories.map(c => c.name),
                datasets: [{
                    data: BankApp.spendingCategories.map(c => c.amount),
                    backgroundColor: BankApp.spendingCategories.map(c => c.color),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                cutout: '70%'
            }
        });
    }
    
    // Render category list
    const total = BankApp.spendingCategories.reduce((sum, c) => sum + c.amount, 0);
    const categoriesHtml = BankApp.spendingCategories.map(cat => {
        const percentage = ((cat.amount / total) * 100).toFixed(1);
        return `
            <div class="spending-category flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color: ${cat.color}20">
                    <i class="fas fa-${cat.icon}" style="color: ${cat.color}"></i>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between mb-1">
                        <span class="font-bold text-slate-900">${cat.name}</span>
                        <span class="font-bold text-slate-900">${formatCurrency(cat.amount)}</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2">
                        <div class="progress-bar h-2 rounded-full" style="width: ${percentage}%; background-color: ${cat.color}"></div>
                    </div>
                    <p class="text-xs text-slate-500 mt-1">${percentage}% of total</p>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('spendingCategories').innerHTML = `
        <div class="mb-4">
            <p class="text-sm text-slate-500">Total Spending</p>
            <p class="text-3xl font-bold text-slate-900">${formatCurrency(total)}</p>
        </div>
        ${categoriesHtml}
    `;
}

function hideSpendingInsights() {
    document.getElementById('spendingInsights').classList.add('hidden');
}

function showReceipt(transaction) {
    BankApp.currentReceipt = transaction;
    const modal = document.getElementById('receiptModal');
    const isCredit = transaction.type === 'credit';
    
    document.getElementById('receiptId').textContent = `#TXN-${Date.now().toString().slice(-10)}`;
    document.getElementById('receiptDate').textContent = transaction.date.toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    }) + ' EST';
    document.getElementById('receiptAmount').textContent = formatCurrency(Math.abs(transaction.amount));
    document.getElementById('receiptAmount').className = `text-5xl font-bold amount-display ${isCredit ? 'text-green-600' : 'gold-text'}`;
    document.getElementById('receiptFrom').textContent = transaction.from || BankApp.accounts.checking.name;
    document.getElementById('receiptTo').textContent = transaction.to || transaction.name;
    document.getElementById('receiptToDetail').textContent = transaction.toDetail || '';
    document.getElementById('receiptMemo').textContent = transaction.memo || 'General Transfer';
    document.getElementById('receiptBarcode').textContent = generateBarcode();
    
    const watermark = document.getElementById('receiptWatermark');
    watermark.textContent = isCredit ? 'RECEIVED' : 'SENT';
    watermark.style.color = isCredit ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)';
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeReceiptModal() {
    document.getElementById('receiptModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function shareReceipt() {
    showToast('Receipt shared successfully!', 'success');
}

function generateBarcode() {
    let barcode = '';
    for (let i = 0; i < 30; i++) {
        barcode += Math.random() > 0.5 ? '|' : ' ';
    }
    return barcode;
}

function downloadReceipt() {
    showToast('Receipt downloaded successfully!', 'success');
    setTimeout(() => closeReceiptModal(), 1000);
}

function selectAccount(type) {
    showToast(`${BankApp.accounts[type].name} selected`, 'info');
}

function updateNotificationBadge() {
    const unreadCount = BankApp.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    if (unreadCount > 0) {
        badge.style.display = 'block';
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
    } else {
        badge.style.display = 'none';
    }
    badge.title = `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`;
}

function addNotification(title, message, type = 'info', meta = {}) {
    BankApp.notifications.unshift({
        id: Date.now(),
        title,
        message,
        time: 'Just now',
        read: false,
        type,
        ...meta
    });
    if (BankApp.notifications.length > 30) BankApp.notifications.pop();
    updateNotificationBadge();
}

function showNotifications() {
    updateNotificationBadge();
    const modal = document.createElement('div');
    modal.id = 'notificationsModal';
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-end p-4 pt-20';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    const unreadCount = BankApp.notifications.filter(n => !n.read).length;
    
    modal.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md modal-enter max-h-[80vh] overflow-hidden">
            <div class="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 class="font-bold text-slate-900 text-lg">Notifications ${unreadCount > 0 ? `<span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">${unreadCount}</span>` : ''}</h3>
                <button onclick="this.closest('#notificationsModal').remove()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="overflow-y-auto max-h-[60vh]">
                ${BankApp.notifications.map(n => `
                    <div class="p-4 border-b border-slate-100 hover:bg-slate-50 ${n.read ? '' : 'bg-blue-50'} cursor-pointer" onclick="openNotificationDetail(${n.id})">
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center ${n.type === 'success' ? 'bg-green-100 text-green-600' : n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}">
                                <i class="fas fa-${n.type === 'success' ? 'check' : n.type === 'warning' ? 'exclamation' : 'info'}"></i>
                            </div>
                            <div class="flex-1">
                                <p class="font-bold text-slate-900 text-sm">${n.title}</p>
                                <p class="text-sm text-slate-600 mt-1">${n.message}</p>
                                <p class="text-xs text-slate-400 mt-2">${n.time}</p>
                                ${n.txId ? `<button onclick="event.stopPropagation(); openNotificationDetail(${n.id});" class="mt-2 text-xs font-semibold text-blue-700 hover:underline">View receipt</button>` : ''}
                            </div>
                            ${!n.read ? '<span class="w-2 h-2 bg-blue-500 rounded-full"></span>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="p-4 border-t border-slate-200 bg-slate-50">
                <button onclick="markAllNotificationsRead()" class="w-full text-center text-blue-900 font-bold text-sm hover:underline">
                    Mark all as read
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function markNotificationRead(id) {
    const notif = BankApp.notifications.find(n => n.id === id);
    if (notif) {
        notif.read = true;
        updateNotificationBadge();
        showToast('Notification marked as read', 'info');
    }
}

function openNotificationDetail(id) {
    const notif = BankApp.notifications.find(n => n.id === id);
    if (!notif) return;
    notif.read = true;
    updateNotificationBadge();
    if (notif.txId) {
        const tx = BankApp.transactions.find(t => t.id === notif.txId);
        if (tx) {
            showReceipt(tx);
            const modal = document.getElementById('notificationsModal');
            if (modal) modal.remove();
            return;
        }
    }
    showToast(`${notif.title}: ${notif.message}`, notif.type || 'info');
    const modal = document.getElementById('notificationsModal');
    if (modal) modal.remove();
}

function markAllNotificationsRead() {
    BankApp.notifications.forEach(n => n.read = true);
    showToast('All notifications marked as read', 'success');
    updateNotificationBadge();
}

window.onclick = function(event) {
    if (event.target.id === 'loginModal') toggleLogin();
    if (event.target.id === 'addMoneyModal') closeAddMoneyModal();
    if (event.target.id === 'transferModal') closeTransferModal();
    if (event.target.id === 'receiptModal') closeReceiptModal();
    if (event.target.id === 'payBillsModal') closePayBillsModal();
    if (event.target.id === 'mobileDepositModal') closeMobileDepositModal();
    if (event.target.id === 'cardModal') closeCardModal();
}

window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 10) nav.classList.add('shadow-md');
    else nav.classList.remove('shadow-md');
});