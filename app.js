/* App JS extracted from finance.html and improved: split, accessible, and PWA-ready */
(function(){
    'use strict';

    // =====================================================
    // CONFIGURATION
    // =====================================================
    const DEFAULT_CATEGORIES = [
        { id: 'epargne', name: 'Epargne', icon: '🔒', percent: 10, locked: true },
        { id: 'nourriture', name: 'Nourriture', icon: '🍽️', percent: 30, locked: false },
        { id: 'projet', name: 'Projet', icon: '🎯', percent: 25, locked: false },
        { id: 'transport', name: 'Transport', icon: '🚗', percent: 20, locked: false },
        { id: 'autres', name: 'Autres', icon: '📦', percent: 15, locked: false }
    ];

    const RANKS = [
        { name: 'Recrue', minXP: 0, icon: '🎖️' },
        { name: 'Soldat', minXP: 100, icon: '⚔️' },
        { name: 'Sergent', minXP: 300, icon: '🗡️' },
        { name: 'Lieutenant', minXP: 600, icon: '🛡️' },
        { name: 'Capitaine', minXP: 1000, icon: '🏅' },
        { name: 'Commandant', minXP: 1500, icon: '👑' },
        { name: 'General', minXP: 2500, icon: '⭐' },
        { name: 'Legende', minXP: 5000, icon: '🌟' }
    ];

    const BADGES = [
        { id: 'first_income', name: 'Premier Pas', icon: '🌱', desc: 'Premier revenu enregistre', check: s => s.totalIncomes >= 1 },
        { id: 'income_10', name: 'Regulier', icon: '📈', desc: '10 revenus enregistres', check: s => s.totalIncomes >= 10 },
        { id: 'income_50', name: 'Discipline', icon: '💪', desc: '50 revenus enregistres', check: s => s.totalIncomes >= 50 },
        { id: 'saver', name: 'Epargnant', icon: '🏦', desc: '10000 FCFA en epargne', check: s => s.totalSavings >= 10000 },
        { id: 'mega_saver', name: 'Coffre Fort', icon: '💎', desc: '100000 FCFA en epargne', check: s => s.totalSavings >= 100000 },
        { id: 'streak_7', name: 'Semaine Parfaite', icon: '🔥', desc: '7 jours de streak', check: s => s.currentStreak >= 7 },
        { id: 'streak_30', name: 'Mois Heroique', icon: '🏆', desc: '30 jours de streak', check: s => s.currentStreak >= 30 },
        { id: 'streak_100', name: 'Centurion', icon: '👑', desc: '100 jours de streak', check: s => s.currentStreak >= 100 },
        { id: 'ops_100', name: 'Actif', icon: '⚡', desc: '100 operations', check: s => s.totalOperations >= 100 },
        { id: 'ops_500', name: 'Veteran', icon: '🎯', desc: '500 operations', check: s => s.totalOperations >= 500 },
        { id: 'level_5', name: 'Capitaine', icon: '🏅', desc: 'Atteindre niveau 5', check: s => s.level >= 5 },
        { id: 'level_8', name: 'Legende', icon: '🌟', desc: 'Atteindre niveau max', check: s => s.level >= 8 }
    ];

    const MANTRAS = [
        "La discipline est le pont entre les objectifs et les accomplissements.",
        "Chaque franc epargne est un pas vers la liberte.",
        "La richesse vient de la constance, pas de la chance.",
        "Controle ton argent avant qu'il ne te controle.",
        "Les petites economies d'aujourd'hui font les grandes fortunes de demain.",
        "La patience est la mere de toutes les vertus financieres.",
        "Un guerrier ne depense pas, il investit.",
        "La vraie richesse est dans la maitrise de soi.",
        "Chaque jour est une opportunite de batir ton empire.",
        "La discipline financiere est la premiere victoire.",
        "L'argent est un outil. Utilisez-le avec sagesse pour bâtir votre avenir.",
        "Investissez dans ce qui vous rend libre, pas dans ce qui vous enchaîne.",
        "La clé de la richesse est de dépenser moins que ce que vous gagnez.",
        "Évitez les pièges de la consommation impulsive pour une vie financière saine.",
        "Le succès financier commence par une bonne gestion quotidienne."
    ];

    const FINANCE_TIPS = [
        { title: "Éviter le Biais d'Ancrage", text: "Le biais d'ancrage en finance est la tendance à s'appuyer trop sur la première information reçue (comme un prix initial) lors de décisions. Pour l'éviter, comparez toujours plusieurs options et réévaluez vos budgets mensuellement." },
        { title: "Règle des 50/30/20", text: "Allouez 50% de vos revenus aux besoins essentiels, 30% aux désirs, et 20% à l'épargne. Adaptez cela à votre situation pour une gestion moderne." },
        { title: "Investissement Passif", text: "Considérez les fonds indiciels (ETFs) pour une croissance à long terme avec faible risque. Diversifiez pour minimiser les pertes." },
        { title: "Éviter les Dettes Toxiques", text: "Priorisez le remboursement des dettes à haut intérêt. Utilisez la méthode 'boule de neige' : remboursez les petites dettes d'abord pour gagner en motivation." }
    ];

    const STORAGE_KEYS = {
        CATEGORIES: 'shadoron_categories',
        BALANCES: 'shadoron_balances',
        HISTORY: 'shadoron_history',
        XP: 'shadoron_xp',
        STREAK: 'shadoron_streak',
        THEME: 'shadoron_theme',
        BADGES: 'shadoron_badges',
        LAST_ACTIVITY: 'shadoron_last_activity',
        SAVINGS_GOAL: 'shadoron_savings_goal'
    };

    // =====================================================
    // STATE
    // =====================================================
    let state = {
        categories: [],
        balances: {},
        history: [],
        xp: 0,
        streak: { current: 0, best: 0, lastDate: null },
        theme: 'dark',
        unlockedBadges: [],
        lastActivity: null,
        savingsGoal: 0,
        viewMode: 'all'
    };

    // For charts
    let expenseChart = null;

    // =====================================================
    // UTILITIES
    // =====================================================
    function formatCurrency(amount) {
        return Math.round(amount).toLocaleString('fr-FR') + ' FCFA';
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function formatDateShort(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function getToday() { return new Date().toISOString().split('T')[0]; }
    function getCurrentMonthYear() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; }
    function getGreeting() { const hour = new Date().getHours(); if (hour < 12) return 'Bonjour, Guerrier'; if (hour < 18) return 'Bon apres-midi, Guerrier'; return 'Bonsoir, Guerrier'; }

    function getCurrentRank(xp) { let rank = RANKS[0]; for (const r of RANKS) if (xp >= r.minXP) rank = r; return rank; }
    function getNextRank(xp) { for (const r of RANKS) if (xp < r.minXP) return r; return null; }
    function getRankIndex(xp) { let index = 0; for (let i=0;i<RANKS.length;i++) if (xp >= RANKS[i].minXP) index = i; return index; }
    function getXPProgress(xp) { const rank = getCurrentRank(xp); const next = getNextRank(xp); if (!next) return 100; const progress = ((xp - rank.minXP) / (next.minXP - rank.minXP)) * 100; return Math.min(100, Math.max(0, progress)); }

    // =====================================================
    // STORAGE
    // =====================================================
    function loadData() {
        try {
            state.categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || [...DEFAULT_CATEGORIES];
            state.balances = JSON.parse(localStorage.getItem(STORAGE_KEYS.BALANCES)) || initializeBalances();
            state.history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
            state.xp = parseInt(localStorage.getItem(STORAGE_KEYS.XP)) || 0;
            state.streak = JSON.parse(localStorage.getItem(STORAGE_KEYS.STREAK)) || { current: 0, best: 0, lastDate: null };
            state.theme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
            state.unlockedBadges = JSON.parse(localStorage.getItem(STORAGE_KEYS.BADGES)) || [];
            state.lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
            state.savingsGoal = parseInt(localStorage.getItem(STORAGE_KEYS.SAVINGS_GOAL)) || 0;
        } catch (e) {
            console.error('Error loading data:', e);
            resetToDefaults();
        }
    }

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(state.categories));
            localStorage.setItem(STORAGE_KEYS.BALANCES, JSON.stringify(state.balances));
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
            localStorage.setItem(STORAGE_KEYS.XP, state.xp.toString());
            localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(state.streak));
            localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
            localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(state.unlockedBadges));
            localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, state.lastActivity);
            localStorage.setItem(STORAGE_KEYS.SAVINGS_GOAL, state.savingsGoal.toString());
        } catch (e) {
            console.error('Error saving data:', e);
            showToast('Erreur de sauvegarde', 'error');
        }
    }

    function initializeBalances() { const balances = {}; state.categories.forEach(cat => balances[cat.id] = 0); return balances; }
    function resetToDefaults() { state.categories = [...DEFAULT_CATEGORIES]; state.balances = initializeBalances(); state.history = []; state.xp = 0; state.streak = { current:0, best:0, lastDate:null }; state.unlockedBadges = []; state.lastActivity = null; state.savingsGoal = 0; saveData(); }

    // =====================================================
    // EXPORT / IMPORT
    // =====================================================
    window.exportData = function() {
        const data = { version: '2.2', exportDate: new Date().toISOString(), categories: state.categories, balances: state.balances, history: state.history, xp: state.xp, streak: state.streak, unlockedBadges: state.unlockedBadges, savingsGoal: state.savingsGoal };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `shadoron-backup-${getToday()}.json`; a.click(); URL.revokeObjectURL(url); showToast('Sauvegarde exportee avec succes', 'success');
    };

    window.importData = function(event) {
        const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.categories && data.balances && data.history) {
                    state.categories = data.categories; state.balances = data.balances; state.history = data.history; state.xp = data.xp || 0; state.streak = data.streak || { current:0,best:0,lastDate:null }; state.unlockedBadges = data.unlockedBadges || []; state.savingsGoal = data.savingsGoal || 0; saveData(); renderAll(); showToast('Donnees restaurees avec succes', 'success');
                } else { throw new Error('Format invalide'); }
            } catch (err) { showToast('Erreur: fichier invalide', 'error'); }
        };
        reader.readAsText(file); event.target.value = '';
    };

    window.resetAllData = function() { if (confirm('Etes-vous sur de vouloir supprimer TOUTES les donnees? Cette action est irreversible.')) { resetToDefaults(); renderAll(); showToast('Donnees reinitialisees', 'warning'); } };

    // =====================================================
    // GAMIFICATION
    // =====================================================
    function addXP(amount) {
        const oldRank = getCurrentRank(state.xp);
        state.xp += amount; showXPPopup(amount);
        const newRank = getCurrentRank(state.xp);
        if (newRank.name !== oldRank.name) { setTimeout(()=>{ showToast(`Niveau superieur! Tu es maintenant ${newRank.name}!`, 'success'); triggerConfetti(); }, 600); }
        updateLevelBadge(); checkBadges(); saveData();
    }

    function showXPPopup(amount) { const popup = document.createElement('div'); popup.className = 'xp-popup'; popup.textContent = `+${amount} XP`; document.body.appendChild(popup); setTimeout(()=>popup.remove(),600); }

    function updateStreak() {
        const today = getToday(); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (state.streak.lastDate === today) return; if (state.streak.lastDate === yesterdayStr) { state.streak.current++; } else { state.streak.current = 1; }
        state.streak.lastDate = today; if (state.streak.current > state.streak.best) state.streak.best = state.streak.current; state.lastActivity = today; saveData();
    }

    function checkBadges() { const stats = getStats(); const newBadges = []; BADGES.forEach(badge => { if (!state.unlockedBadges.includes(badge.id) && badge.check(stats)) { state.unlockedBadges.push(badge.id); newBadges.push(badge); } }); if (newBadges.length>0) { newBadges.forEach(b => setTimeout(()=>{ showToast(`Badge debloque: ${b.name} ${b.icon}`, 'success'); triggerConfetti(); },800)); saveData(); } }

    function getStats() { const incomes = state.history.filter(h => h.type==='income'); const expenses = state.history.filter(h => h.type==='expense'); return { totalIncomes: incomes.length, totalExpenses: expenses.length, totalOperations: state.history.length, totalSavings: state.balances['epargne'] || 0, currentStreak: state.streak.current, bestStreak: state.streak.best, level: getRankIndex(state.xp) + 1, xp: state.xp }; }

    // =====================================================
    // CONFETTI
    // =====================================================
    function triggerConfetti() {
        const container = document.getElementById('confetti-container'); if (!container) return; const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6']; const shapes = ['⭐','⚔️','💰','🔥','🏆']; for (let i=0;i<40;i++){ const c = document.createElement('div'); c.className='confetti confetti-star'; c.textContent = shapes[Math.floor(Math.random()*shapes.length)]; c.style.left = Math.random()*100+'%'; c.style.color = colors[Math.floor(Math.random()*colors.length)]; c.style.animationDelay = Math.random()*0.5+'s'; container.appendChild(c); setTimeout(()=>c.remove(),3000); }
    }

    // =====================================================
    // TOASTS
    // =====================================================
    function showToast(message, type='info') { const container = document.getElementById('toast-container'); if (!container) return; const icons = { success:'✓', error:'✕', warning:'⚠', info:'ℹ' }; const toast = document.createElement('div'); toast.className = `toast ${type}`; toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-message">${message}</span>`; container.appendChild(toast); setTimeout(()=>toast.remove(),3000); }

    // =====================================================
    // THEME
    // =====================================================
    window.setTheme = function(theme) { state.theme = theme; document.documentElement.setAttribute('data-theme', theme); document.querySelectorAll('.theme-option').forEach(opt => { opt.classList.toggle('active', opt.dataset.theme === theme); }); localStorage.setItem(STORAGE_KEYS.THEME, theme); };

    // =====================================================
    // NAVIGATION
    // =====================================================
    window.switchTab = function(tabId) { document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active')); document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); const tab = document.getElementById(`tab-${tabId}`); if (tab) tab.classList.add('active'); const navItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`); if (navItem) navItem.classList.add('active'); if (navigator.vibrate) navigator.vibrate(10); };

    // =====================================================
    // SEARCH
    // =====================================================
    window.openSearch = function() { document.getElementById('search-modal').classList.add('active'); const input = document.getElementById('search-input'); if (input) { input.focus(); input.select(); renderSearchResults(''); } };
    window.closeSearch = function() { document.getElementById('search-modal').classList.remove('active'); const input = document.getElementById('search-input'); if (input) input.value = ''; };

    function renderSearchResults(query) {
        const container = document.getElementById('search-results'); const results = []; const navItems = [ { icon:'🏠', title:'Tableau de bord', subtitle:'Voir les soldes', action: ()=>{ closeSearch(); switchTab('dashboard'); } }, { icon:'💰', title:'Ajouter un revenu', subtitle:"Enregistrer de l'argent recu", action: ()=>{ closeSearch(); switchTab('income'); } }, { icon:'💸', title:'Ajouter une depense', subtitle:'Enregistrer une depense', action: ()=>{ closeSearch(); switchTab('expense'); } }, { icon:'📋', title:'Historique', subtitle:'Voir les operations', action: ()=>{ closeSearch(); switchTab('history'); } }, { icon:'🏆', title:'Progression', subtitle:'Voir XP et badges', action: ()=>{ closeSearch(); switchTab('progress'); } }, { icon:'⚙️', title:'Parametres', subtitle:'Theme et donnees', action: ()=>{ closeSearch(); switchTab('settings'); } } ];
        navItems.forEach(item => { if (!query || item.title.toLowerCase().includes(query.toLowerCase())) results.push(item); });
        if (query) {
            const lowerQuery = query.toLowerCase(); state.history.forEach(h => { const cat = state.categories.find(c=>c.id===h.category); const text = h.note || (cat ? cat.name : 'Revenu'); if (text.toLowerCase().includes(lowerQuery) || text.toLowerCase().replace(/e/g,'é').includes(lowerQuery)) { results.push({ icon: h.type==='income' ? '💰' : '💸', title: text, subtitle: formatDate(h.timestamp), action: ()=>{ closeSearch(); switchTab('history'); } }); } });
        }
        container.innerHTML = results.length ? results.map(r => `
            <div class="search-result-item" tabindex="0" role="button" aria-pressed="false" onclick="(${r.action})()">
                <span class="search-result-icon">${r.icon}</span>
                <div class="search-result-text">
                    <div class="search-result-title">${r.title}</div>
                    <div class="search-result-subtitle">${r.subtitle}</div>
                </div>
            </div>
        `).join('') : '<div style="padding:20px;text-align:center;color:var(--text-muted)">Aucun resultat</div>';
    }

    // =====================================================
    // LEVEL MODAL
    // =====================================================
    window.showLevelModal = function() { const modal = document.getElementById('level-modal'); const content = document.getElementById('level-modal-content'); const rank = getCurrentRank(state.xp); const next = getNextRank(state.xp); content.innerHTML = `<div style="text-align:center;margin-bottom:20px;"><div style="font-size:48px;margin-bottom:8px;">${rank.icon}</div><div style="font-size:1.5rem;font-weight:700;">${rank.name}</div><div style="color:var(--text-muted);">${state.xp} XP total</div></div><div class="xp-progress" style="margin-bottom:20px;"><div class="xp-bar" style="height:12px;"><div class="xp-fill" style="width:${getXPProgress(state.xp)}%;"></div></div>${next?`<div style="text-align:center;margin-top:8px;font-size:0.8rem;color:var(--text-muted);">${next.minXP - state.xp} XP pour ${next.name}</div>`:'<div style="text-align:center;margin-top:8px;color:var(--positive);">Niveau maximum atteint!</div>'}</div><div style="font-size:0.8rem;color:var(--text-muted);text-align:center;"><p>+10 XP par revenu enregistre</p><p>+5 XP par depense enregistree</p><p>Streak bonus: +${state.streak.current} XP</p></div>`; modal.classList.add('active'); };
    window.closeLevelModal = function() { document.getElementById('level-modal').classList.remove('active'); };

    // =====================================================
    // RENDERING
    // =====================================================
    function updateLevelBadge() { const rank = getCurrentRank(state.xp); const rankEl = document.getElementById('current-rank'); const xpEl = document.getElementById('current-xp'); if (rankEl) rankEl.textContent = rank.name; if (xpEl) xpEl.textContent = state.xp + ' XP'; }

    function renderMorningBriefing() { const g = document.getElementById('greeting'); const d = document.getElementById('current-date'); const m = document.getElementById('daily-mantra'); if (g) g.textContent = getGreeting(); if (d) d.textContent = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }); if (m) m.textContent = '"' + MANTRAS[Math.floor(Math.random()*MANTRAS.length)] + '"'; const s = document.getElementById('stat-streak'); const t = document.getElementById('stat-transactions'); const sv = document.getElementById('stat-savings'); if (s) s.textContent = state.streak.current; if (t) t.textContent = state.history.length; const totalIncome = state.history.filter(h=>h.type==='income').reduce((sum,h)=>sum+h.amount,0); const savingsPercent = totalIncome>0 ? Math.round((state.balances['epargne']||0)/totalIncome*100) : 0; if (sv) sv.textContent = savingsPercent + '%'; }

    function renderFinanceTips(){ const tip = FINANCE_TIPS[Math.floor(Math.random()*FINANCE_TIPS.length)]; const c = document.querySelector('.finance-tips'); if (!c) return; c.innerHTML = `<div class="tip-title">${tip.title}</div><div class="tip-text">${tip.text}</div><div class="tip-text">"${MANTRAS[Math.floor(Math.random()*MANTRAS.length)]}"</div><div class="tip-text">"${MANTRAS[Math.floor(Math.random()*MANTRAS.length)]}"</div>`; }

    function renderStreakBanner(){ const banner = document.getElementById('streak-banner'); if (!banner) return; if (state.streak.current > 0){ banner.style.display='flex'; const sc = document.getElementById('streak-count'); const bs = document.getElementById('best-streak'); if (sc) sc.textContent = state.streak.current + ' jour' + (state.streak.current>1?'s':''); if (bs) bs.textContent = state.streak.best; if (state.streak.current>3) banner.style.animation='pulse-streak 2s infinite'; } else banner.style.display='none'; }

    function renderBalances(){ const container = document.getElementById('balances-grid'); if (!container) return; let total=0; let filteredHistory = state.history; if (state.viewMode==='month'){ const currentMonth = getCurrentMonthYear(); filteredHistory = state.history.filter(h => h.monthYear === currentMonth); }
        const tempBalances = {}; state.categories.forEach(cat => tempBalances[cat.id]=0); filteredHistory.forEach(h => { if (h.type==='income'){ state.categories.forEach(cat => { const allocation = Math.round(h.amount * cat.percent / 100); tempBalances[cat.id] += allocation; }); } else { tempBalances[h.category] -= h.amount; } });
        let html = '';
        state.categories.forEach(cat => {
            const balance = tempBalances[cat.id] || 0;
            if (!cat.locked) total += balance;
            let itemClass = 'balance-item' + (balance<0 ? ' negative' : '') + (cat.locked? ' locked':'');
            let valueClass = 'balance-value' + (balance>0? ' positive' : (balance<0? ' negative':''));
            html += `<div class="${itemClass}"><div class="balance-left"><div class="balance-icon">${cat.icon}</div><div><div class="balance-name">${cat.name}</div><div class="balance-percent">${cat.percent}%</div></div></div><div class="${valueClass}">${formatCurrency(balance)}</div></div>`;
        });
        container.innerHTML = html; const tb = document.getElementById('total-balance'); if (tb) tb.textContent = formatCurrency(total);
    }

    function renderAllocationConfig(){ const container = document.getElementById('allocation-config'); if (!container) return; let html = ''; state.categories.forEach(cat => { html += `<div class="allocation-row"><label>${cat.icon} ${cat.name}${cat.locked? ' 🔒':''}</label><input type="number" data-category="${cat.id}" value="${cat.percent}" min="0" max="100" ${cat.locked? 'readonly':''} oninput="handleAllocationChange(this)"><span style="color:var(--text-muted);">%</span></div>`; }); container.innerHTML = html; updateAllocationTotal(); }

    window.handleAllocationChange = function(input){ const categoryId = input.dataset.category; const value = parseInt(input.value) || 0; const category = state.categories.find(c=>c.id===categoryId); if (category && !category.locked) category.percent = Math.max(0, Math.min(100, value)); updateAllocationTotal(); saveData(); };

    function updateAllocationTotal(){ const total = state.categories.reduce((sum,cat)=>sum+cat.percent,0); const totalEl = document.getElementById('total-percent'); const containerEl = document.getElementById('allocation-total'); if (totalEl) totalEl.textContent = total + '%'; if (containerEl){ containerEl.classList.remove('error','success'); containerEl.classList.add(total===100? 'success':'error'); } }

    function renderExpenseCategories(){ const select = document.getElementById('expense-category'); if (!select) return; let html = '<option value="">Choisir une categorie</option>'; state.categories.filter(c=>!c.locked).forEach(cat=>{ html += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`; }); select.innerHTML = html; }

    function updateIncomePreview(){ const amount = parseFloat(document.getElementById('income-amount').value) || 0; const preview = document.getElementById('income-preview'); const rows = document.getElementById('preview-rows'); if (!preview || !rows) return; if (amount<=0){ preview.style.display='none'; return; } let html = ''; state.categories.forEach(cat=>{ const allocation = Math.round(amount * cat.percent/100); html += `<div class="preview-row"><span class="label">${cat.icon} ${cat.name} (${cat.percent}%)</span><span class="value">${formatCurrency(allocation)}</span></div>`; }); rows.innerHTML = html; preview.style.display='block'; }

    function renderHistory(){ const container = document.getElementById('history-list'); if (!container) return; if (state.history.length===0){ container.innerHTML = `<div class="no-history"><div class="no-history-icon">📋</div><div>Aucune operation enregistree</div></div>`; return; } const sorted = [...state.history].sort((a,b)=>b.timestamp - a.timestamp); let html=''; sorted.forEach(item => { const isIncome = item.type==='income'; const cat = state.categories.find(c=>c.id===item.category); const categoryName = isIncome? 'Revenu' : (cat? cat.name : item.category); const icon = isIncome? '+' : '-'; html += `<div class="history-item"><div class="history-icon ${item.type}">${icon}</div><div class="history-details"><div class="history-category">${categoryName}${item.note? ' - ' + item.note : ''}</div><div class="history-date">${formatDate(item.timestamp)}</div></div><div class="history-amount ${isIncome? 'positive' : 'negative'}">${isIncome? '+' : '-'}${formatCurrency(item.amount)}</div><button class="history-delete" onclick="deleteHistoryItem('${item.id}')" title="Supprimer">×</button></div>`; }); container.innerHTML = html; }

    function renderHabitCalendar(){ const container = document.getElementById('habit-calendar'); if (!container) return; const today = new Date(); const activityDays = new Set(state.history.map(h => new Date(h.timestamp).toISOString().split('T')[0])); const days=[]; for (let i=29;i>=0;i--){ const date = new Date(today); date.setDate(date.getDate() - i); const dateStr = date.toISOString().split('T')[0]; const isToday = i===0; const isActive = activityDays.has(dateStr); days.push(`<div class="calendar-day ${isActive? 'active':''} ${isToday? 'today':''}" title="${dateStr}">${date.getDate()}</div>`); } container.innerHTML = days.join(''); }

    function renderBadges(){ const container = document.getElementById('badges-grid'); if (!container) return; const stats = getStats(); const html = BADGES.map(badge => { const unlocked = state.unlockedBadges.includes(badge.id); return `<div class="badge-item ${unlocked? 'unlocked':'locked'}" title="${badge.desc}"><span class="badge-icon">${badge.icon}</span><span class="badge-name">${badge.name}</span></div>`; }).join(''); container.innerHTML = html; const c = document.getElementById('badges-count'); if (c) c.textContent = `${state.unlockedBadges.length}/${BADGES.length}`; }

    function renderProgress(){ const rank = getCurrentRank(state.xp); const next = getNextRank(state.xp); const lvl = document.getElementById('progress-level'); const xpAmt = document.getElementById('progress-xp'); if (lvl) lvl.textContent = `Niveau ${getRankIndex(state.xp) + 1} - ${rank.name}`; if (xpAmt) xpAmt.textContent = next ? `${state.xp} / ${next.minXP} XP` : `${state.xp} XP (MAX)`; const xpFill = document.getElementById('xp-fill'); if (xpFill) xpFill.style.width = getXPProgress(state.xp) + '%'; const nr = document.getElementById('next-rank'); if (nr) nr.textContent = next ? next.name : 'Maximum atteint!'; }

    function renderStats(){ const st = getStats(); const elOps = document.getElementById('stats-total-ops'); if (elOps) elOps.textContent = st.totalOperations; const totalIncome = state.history.filter(h=>h.type==='income').reduce((s,h)=>s+h.amount,0); const totalExpense = state.history.filter(h=>h.type==='expense').reduce((s,h)=>s+h.amount,0); const elInc = document.getElementById('stats-total-income'); const elExp = document.getElementById('stats-total-expense'); const elSav = document.getElementById('stats-total-savings'); if (elInc) elInc.textContent = formatCurrency(totalIncome); if (elExp) elExp.textContent = formatCurrency(totalExpense); if (elSav) elSav.textContent = formatCurrency(state.balances['epargne'] || 0); }

    function renderChart(){ const canvas = document.getElementById('expense-chart'); if (!canvas) return; const ctx = canvas.getContext('2d'); const expenseData = {}; state.categories.filter(c=>!c.locked).forEach(cat=>expenseData[cat.name]=0); state.history.filter(h=>h.type==='expense').forEach(h=>{ const cat = state.categories.find(c=>c.id===h.category); if (cat) expenseData[cat.name] += h.amount; }); const labels = Object.keys(expenseData); const values = Object.values(expenseData);
        if (expenseChart) expenseChart.destroy();
        expenseChart = new Chart(ctx, { type: 'pie', data: { labels: labels, datasets: [{ data: values, backgroundColor: ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6'] }] }, options: { responsive:true, plugins: { legend: { position: 'top' } } } }); }

    function renderSavingsGoal(){ const savings = state.balances['epargne'] || 0; const progress = state.savingsGoal > 0 ? (savings / state.savingsGoal) * 100 : 0; const el = document.getElementById('goal-progress'); const fill = document.getElementById('goal-fill'); if (el) el.textContent = `${formatCurrency(savings)} / ${formatCurrency(state.savingsGoal)}`; if (fill){ fill.style.width = `${Math.min(100,progress)}%`; const root = getComputedStyle(document.documentElement); const pos = root.getPropertyValue('--positive').trim(); const warn = root.getPropertyValue('--warning').trim(); const neg = root.getPropertyValue('--negative').trim(); fill.style.background = progress >= 100 ? pos : (progress > 50 ? warn : neg); } }

    function renderAll(){ updateLevelBadge(); renderMorningBriefing(); renderFinanceTips(); renderStreakBanner(); renderBalances(); renderAllocationConfig(); renderExpenseCategories(); renderHistory(); renderHabitCalendar(); renderBadges(); renderProgress(); renderStats(); renderChart(); renderSavingsGoal(); }

    // =====================================================
    // ACTIONS
    // =====================================================
    function handleIncomeSubmit(e){ e.preventDefault(); const form = e.target; if (form.submitting) return; form.submitting = true; const amountInput = document.getElementById('income-amount'); const amount = parseFloat(amountInput.value) || 0; const totalPercent = state.categories.reduce((sum,cat)=>sum+cat.percent,0); if (totalPercent !== 100){ showToast('Le total des pourcentages doit etre de 100%', 'error'); form.submitting = false; return; } if (amount <= 0){ showToast('Veuillez entrer un montant valide', 'error'); form.submitting = false; return; } state.categories.forEach(cat => { const allocation = Math.round(amount * cat.percent / 100); state.balances[cat.id] = (state.balances[cat.id] || 0) + allocation; }); state.history.push({ id: generateId(), type: 'income', amount: amount, timestamp: Date.now(), monthYear: getCurrentMonthYear() }); updateStreak(); addXP(10 + state.streak.current); saveData(); amountInput.value = ''; const preview = document.getElementById('income-preview'); if (preview) preview.style.display = 'none'; renderAll(); showToast('Revenu enregistre avec succes!', 'success'); if (navigator.vibrate) navigator.vibrate([50,50,50]); switchTab('dashboard'); form.submitting = false; }

    function handleExpenseSubmit(e){ e.preventDefault(); const form = e.target; if (form.submitting) return; form.submitting = true; const categorySelect = document.getElementById('expense-category'); const amountInput = document.getElementById('expense-amount'); const noteInput = document.getElementById('expense-note'); const categoryId = categorySelect.value; const amount = parseFloat(amountInput.value) || 0; const note = noteInput.value.trim(); if (!categoryId){ showToast('Veuillez choisir une categorie', 'error'); form.submitting = false; return; } if (amount <= 0){ showToast('Veuillez entrer un montant valide', 'error'); form.submitting = false; return; } // Subtract from balances
        state.balances[categoryId] = (state.balances[categoryId] || 0) - amount; state.history.push({ id: generateId(), type: 'expense', category: categoryId, amount: amount, note: note, timestamp: Date.now(), monthYear: getCurrentMonthYear() }); addXP(5); updateStreak(); saveData(); amountInput.value = ''; noteInput.value = ''; renderAll(); showToast('Depense enregistree', 'success'); if (navigator.vibrate) navigator.vibrate(40); switchTab('dashboard'); form.submitting = false; }

    window.deleteHistoryItem = function(id){ if (!confirm('Supprimer cette operation?')) return; const idx = state.history.findIndex(h=>h.id===id); if (idx === -1) return; const item = state.history[idx]; // revert effects
        if (item.type === 'income'){ state.categories.forEach(cat => { const allocation = Math.round(item.amount * cat.percent / 100); state.balances[cat.id] = (state.balances[cat.id] || 0) - allocation; }); }
        if (item.type === 'expense'){ state.balances[item.category] = (state.balances[item.category] || 0) + item.amount; }
        state.history.splice(idx,1); saveData(); renderAll(); showToast('Operation supprimee', 'warning'); };

    window.quickExpense = function(categoryId){ switchTab('expense'); const sel = document.getElementById('expense-category'); if (sel) sel.value = categoryId; const amt = document.getElementById('expense-amount'); if (amt) { amt.focus(); amt.value = ''; } };

    window.toggleView = function(mode){ state.viewMode = mode; document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b.textContent.toLowerCase().includes(mode))); renderBalances(); };

    window.setSavingsGoal = function(){ const input = document.getElementById('savings-goal-input'); if (!input) return; const val = parseInt(input.value) || 0; state.savingsGoal = Math.max(0,val); saveData(); renderAll(); showToast('Objectif enregistre', 'success'); };

    // =====================================================
    // UTIL: Offline & accessibility
    // =====================================================
    function handleOnlineChange(){ const badge = document.getElementById('offline-badge'); if (!badge) return; if (navigator.onLine) badge.classList.remove('show'); else badge.classList.add('show'); }

    // =====================================================
    // INIT
    // =====================================================
    function attachListeners(){ // forms
        const incomeForm = document.getElementById('income-form'); if (incomeForm) incomeForm.addEventListener('submit', handleIncomeSubmit);
        const expenseForm = document.getElementById('expense-form'); if (expenseForm) expenseForm.addEventListener('submit', handleExpenseSubmit);
        const incAmt = document.getElementById('income-amount'); if (incAmt) incAmt.addEventListener('input', updateIncomePreview);
        const searchInput = document.getElementById('search-input'); if (searchInput) searchInput.addEventListener('input', e=>renderSearchResults(e.target.value));
        document.addEventListener('keydown', function(e){ if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openSearch(); } if (e.key === 'Escape') closeSearch(); });
        const importFile = document.getElementById('import-file'); if (importFile) importFile.addEventListener('change', importData);
        // Toggle view buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => btn.addEventListener('click', ()=>{ document.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); if (btn.textContent.toLowerCase().includes('tout')) window.toggleView('all'); else window.toggleView('month'); }));
        // Theme options
        document.querySelectorAll('.theme-option').forEach(opt => opt.addEventListener('click', ()=>{ setTheme(opt.dataset.theme); }));
        window.addEventListener('online', handleOnlineChange); window.addEventListener('offline', handleOnlineChange);
    }

    function init(){ loadData(); setTheme(state.theme || 'dark'); attachListeners(); renderAll(); handleOnlineChange(); updateLevelBadge(); checkBadges(); }

    // Expose some helpers for debugging
    window.shadoron = { state, renderAll, loadData, saveData };

    // Start
    document.addEventListener('DOMContentLoaded', init);

})();
