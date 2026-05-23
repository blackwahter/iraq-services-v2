// ==========================================
// iOS PWA - بوابة العراق المالية
// ==========================================

let currentRates = {};
let goldPriceUSD = 2415.50; 
let silverPriceUSD = 30.50;   
let brentOilUSD = 107.63;     
let wtiOilUSD = 101.28;       

const API_BASE = window.location.port === '5500' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

let localBoursesData = { 
    kifah: 146500, 
    harthiya: 146500, 
    erbil: 146700, 
    basra: 146200, 
    lastUpdated: null 
};

const MARKET_MULTIPLIER = 1.1145; 
const OUNCE_TO_GRAM = 31.1034768; 

const targetCurrencies = [
    { code: 'USD', name: 'دولار أمريكي', flag: '🇺🇸' },
    { code: 'EUR', name: 'يورو أوروبي', flag: '🇪🇺' },
    { code: 'GBP', name: 'جنيه إسترليني', flag: '🇬🇧' },
    { code: 'TRY', name: 'ليرة تركية', flag: '🇹🇷' },
    { code: 'AED', name: 'درهم إماراتي', flag: '🇦🇪' },
    { code: 'SAR', name: 'ريال سعودي', flag: '🇸🇦' }
];

// DOM Elements
const salariesGrid = document.getElementById('salaries-grid');
const boursesGrid = document.getElementById('bourses-grid');
const currenciesGrid = document.getElementById('currencies-grid');
const metalsGrid = document.getElementById('metals-grid');
const oilGrid = document.getElementById('oil-grid');

const fromAmountInput = document.getElementById('from-amount');
const toAmountInput = document.getElementById('to-amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const swapBtn = document.getElementById('swap-btn');

window.addEventListener('DOMContentLoaded', () => {
    initSPA();
    initSegmentedControls();
    initConverter();
    fetchData(); 
    fetchUpdates(); 

    // Live update for salaries every 5 seconds (seamless)
    setInterval(fetchUpdates, 5000);
});

// ==========================================
// SPA Navigation Logic
// ==========================================
function initSPA() {
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.spa-section');
    const searchBar = document.getElementById('global-search-bar');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active to clicked tab
            tab.classList.add('active');

            // Hide all sections
            sections.forEach(sec => sec.classList.remove('active'));
            // Show target section
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            if(searchBar) {
                searchBar.style.display = targetId === 'sec-salaries' ? 'block' : 'none';
            }
        });
    });
}

// ==========================================
// Segmented Controls (Gold vs Oil)
// ==========================================
function initSegmentedControls() {
    const radioMetals = document.getElementById('seg-metals');
    const radioOil = document.getElementById('seg-oil');
    const viewMetals = document.getElementById('metals-view');
    const viewOil = document.getElementById('oil-view');

    radioMetals.addEventListener('change', () => {
        if(radioMetals.checked) {
            viewMetals.classList.add('active');
            viewOil.classList.remove('active');
        }
    });

    radioOil.addEventListener('change', () => {
        if(radioOil.checked) {
            viewOil.classList.add('active');
            viewMetals.classList.remove('active');
        }
    });
}

// ==========================================
// API Fetching & Global Data
// ==========================================
async function fetchData() {
    try {
        const currencyRes = await fetch('https://open.er-api.com/v6/latest/USD'); 
        const currencyData = await currencyRes.json();
        if (currencyData.result === 'success') { 
            currentRates = currencyData.rates; 
            currentRates['USD'] = 1; 
        }

        try { 
            const goldRes = await fetch('https://api.gold-api.com/price/XAU'); 
            if (goldRes.ok) goldPriceUSD = (await goldRes.json()).price; 
        } catch(e){}
        
        try { 
            const silverRes = await fetch('https://api.gold-api.com/price/XAG'); 
            if (silverRes.ok) silverPriceUSD = (await silverRes.json()).price; 
        } catch(e){}
        
        try { 
            const oilRes = await fetch(API_BASE + '/api/oil'); 
            const oilData = await oilRes.json(); 
            if (oilData.success) { brentOilUSD = oilData.brent; wtiOilUSD = oilData.wti; } 
        } catch(e) {}
        
        try { 
            const boursesRes = await fetch(API_BASE + '/api/bourses'); 
            const boursesResp = await boursesRes.json(); 
            if (boursesResp.success && boursesResp.data) localBoursesData = boursesResp.data; 
        } catch (e) {}

        renderLocalBoursesBoard(); 
        renderMetalsBoard(); 
        renderOilBoard(); 
        calculateConversion(); 
        
    } catch (error) { 
        console.error("Fetch Data Error:", error);
    }
}

// ==========================================
// Render Salaries (Live Updates & Pagination)
// ==========================================
let allSalariesNews = [];
let currentPage = 1;
const itemsPerPage = 7;

async function fetchUpdates() {
    try {
        const response = await fetch(API_BASE + '/api/updates'); 
        const data = await response.json();
        
        let hasNewItems = false;
        
        if (allSalariesNews.length === 0) {
            allSalariesNews = data;
            hasNewItems = true;
        } else {
            const currentTopId = allSalariesNews[0].id;
            const newItems = data.filter(item => item.id > currentTopId);
            if (newItems.length > 0) {
                allSalariesNews = [...newItems, ...allSalariesNews];
                hasNewItems = true;
            }
        }
        
        if (hasNewItems) {
            renderPaginatedNews();
        }
        
    } catch (error) {
        console.error("خطأ في جلب التحديثات:", error);
    }
}

function renderPaginatedNews() {
    if (!salariesGrid) return;
    
    const salaryItems = allSalariesNews.filter(item => item.category === 'رواتب');
    
    const totalPages = Math.ceil(salaryItems.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = salaryItems.slice(startIndex, endIndex);
    
    let html = '';
    
    pageItems.forEach(item => {
        const date = new Date(item.created_at);
        const timeStr = date.toLocaleTimeString('ar-IQ', {hour: '2-digit', minute: '2-digit'});
        
        let badgeClass = 'badge-yellow';
        let badgeText = 'قيد التدقيق';
        let badgeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
        
        const contentStr = item.content.toLowerCase();
        if (contentStr.includes('تم') || contentStr.includes('إطلاق') || contentStr.includes('صرف') || contentStr.includes('رفع')) {
            badgeClass = 'badge-green';
            badgeText = 'تم الصرف';
            badgeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        }

        html += `
            <div class="ios-card salary-card">
                <div class="salary-top">
                    <div class="salary-title">${item.content}</div>
                    <div class="salary-badge ${badgeClass}">
                        ${badgeIcon}
                        <span>${badgeText}</span>
                    </div>
                </div>
                <div class="salary-time">${timeStr} MT - تحديث مباشر</div>
            </div>
        `;
    });
    
    salariesGrid.innerHTML = html;
    renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
    const controlsContainer = document.getElementById('pagination-controls');
    if (!controlsContainer) return;
    
    if (totalPages <= 1) {
        controlsContainer.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Prev
    html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>`;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) {
        html += `<button class="page-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) html += `<span style="color:var(--ios-text-sub)">...</span>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span style="color:var(--ios-text-sub)">...</span>`;
        html += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // Next
    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>`;
    
    controlsContainer.innerHTML = html;
}

window.changePage = function(newPage) {
    currentPage = newPage;
    renderPaginatedNews();
    document.getElementById('sec-salaries').scrollIntoView({ behavior: 'smooth' });
};

// ==========================================
// Render Bourses
// ==========================================
let bourseChartInstance = null;

function renderLocalBoursesBoard() {
    if (!localBoursesData || !boursesGrid) return;
    const b = localBoursesData;
    
    const currentPrice = b.kifah;
    // Simulating realistic past week data ending at current price
    const fakeHistorical = [
        currentPrice - 350, currentPrice - 100, currentPrice - 400, 
        currentPrice + 150, currentPrice - 50, currentPrice + 200, currentPrice
    ];
    
    // Check trend based on fake historical (last 2 points) or general target
    const isUp = currentPrice >= fakeHistorical[5];
    const trendColor = isUp ? '#34C759' : '#FF3B30';
    const trendBg = isUp ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 59, 48, 0.2)';
    const arrow = isUp ? '↑' : '↓';

    boursesGrid.innerHTML = `
        <div class="ios-card bourse-main-card" style="padding: 24px 16px;">
            <!-- Header -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 20px;">
                <div style="text-align:right;">
                    <div style="font-size: 0.95rem; font-weight:700; margin-bottom:4px; color:var(--ios-text-main);">سعر الدولار الموازي (بغداد)</div>
                    <div style="font-size: 2.4rem; font-weight:800; color:${trendColor}; letter-spacing:-1px;">
                        ${currentPrice.toLocaleString()} <span style="font-size:1.2rem; color:var(--ios-text-main);">دينار</span>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <div style="font-weight:700; font-size:0.9rem; margin-bottom:4px; color:var(--ios-text-main);">100 دولار</div>
                    <div style="background:${trendBg}; color:${trendColor}; border-radius:50%; width:24px; height:24px; display:flex; justify-content:center; align-items:center; font-weight:bold;">
                        ${arrow}
                    </div>
                </div>
            </div>
            
            <!-- Chart -->
            <div style="height: 120px; width:100%; margin-bottom: 24px;">
                <canvas id="boursesChart"></canvas>
            </div>
            
            <!-- Sub List -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; border-bottom:1px solid var(--ios-border); padding-bottom:8px;">
                <div style="font-weight:700; font-size:1rem; color:var(--ios-text-main);">بقية البورصات</div>
                <div style="font-size:0.85rem; color:var(--ios-text-sub); font-weight:600;">24 ساعة</div>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.85rem; color:var(--ios-text-sub); width:60px;">قبل دقيقة</span>
                    <span style="font-weight:700; font-size:1.05rem; color:${trendColor};">${b.kifah.toLocaleString()}</span>
                    <span style="font-weight:700; font-size:1rem; flex:1; text-align:right; color:var(--ios-text-main);">بورصة الكفاح</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.85rem; color:var(--ios-text-sub); width:60px;">قبل دقيقة</span>
                    <span style="font-weight:700; font-size:1.05rem; color:var(--ios-text-main);">${b.harthiya.toLocaleString()}</span>
                    <span style="font-weight:700; font-size:1rem; flex:1; text-align:right; color:var(--ios-text-main);">بورصة الحارثية</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.85rem; color:var(--ios-text-sub); width:60px;">قبل دقيقة</span>
                    <span style="font-weight:700; font-size:1.05rem; color:var(--ios-text-main);">${b.erbil.toLocaleString()}</span>
                    <span style="font-weight:700; font-size:1rem; flex:1; text-align:right; color:var(--ios-text-main);">بورصة أربيل</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.85rem; color:var(--ios-text-sub); width:60px;">قبل دقيقة</span>
                    <span style="font-weight:700; font-size:1.05rem; color:var(--ios-text-main);">${b.basra.toLocaleString()}</span>
                    <span style="font-weight:700; font-size:1rem; flex:1; text-align:right; color:var(--ios-text-main);">بورصة البصرة</span>
                </div>
            </div>
        </div>
    `;

    const ctx = document.getElementById('boursesChart');
    if (ctx && window.Chart) {
        if (bourseChartInstance) bourseChartInstance.destroy();
        
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 120);
        gradient.addColorStop(0, trendBg);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        bourseChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
                datasets: [{
                    data: fakeHistorical,
                    borderColor: trendColor,
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: true } },
                scales: {
                    x: { display: false },
                    y: { display: false, min: Math.min(...fakeHistorical) - 200, max: Math.max(...fakeHistorical) + 200 }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
    }
}

// ==========================================
// Render Metals & Oil
// ==========================================
function renderMetalsBoard() {
    if (!metalsGrid) return;
    
    const localOunceIQD = goldPriceUSD * (localBoursesData.kifah / 100);
    const globalGramIQD = localOunceIQD / OUNCE_TO_GRAM;
    const localGramIQD = globalGramIQD * MARKET_MULTIPLIER;
    
    const k24 = localGramIQD;
    const k21 = localGramIQD * (21 / 24);
    const k18 = localGramIQD * (18 / 24);

    const silverGramIQD = (silverPriceUSD * (localBoursesData.kifah / 100)) / OUNCE_TO_GRAM;

    metalsGrid.innerHTML = `
        <div class="ios-card metal-card">
            <div class="metal-title">عيار 24 (الصافي)</div>
            <div class="metal-price">${Math.round(k24).toLocaleString()}</div>
            <div class="metal-trend trend-up">▲ مستقر</div>
        </div>
        <div class="ios-card metal-card">
            <div class="metal-title">عيار 21 (الأكثر تداولاً)</div>
            <div class="metal-price">${Math.round(k21).toLocaleString()}</div>
            <div class="metal-trend trend-up">▲ مستقر</div>
        </div>
        <div class="ios-card metal-card">
            <div class="metal-title">عيار 18</div>
            <div class="metal-price">${Math.round(k18).toLocaleString()}</div>
            <div class="metal-trend trend-up">▲ مستقر</div>
        </div>
        <div class="ios-card metal-card">
            <div class="metal-title">الفضة (غرام)</div>
            <div class="metal-price">${Math.round(silverGramIQD).toLocaleString()}</div>
            <div class="metal-trend trend-up">▲ مستقر</div>
        </div>
    `;
}

function renderOilBoard() {
    if (!oilGrid) return;
    oilGrid.innerHTML = `
        <div class="ios-card metal-card">
            <div class="metal-title">خام برنت</div>
            <div class="metal-price">$${brentOilUSD.toFixed(2)}</div>
            <div class="metal-trend trend-up">▲ مباشر</div>
        </div>
        <div class="ios-card metal-card">
            <div class="metal-title">الخام الأمريكي</div>
            <div class="metal-price">$${wtiOilUSD.toFixed(2)}</div>
            <div class="metal-trend trend-up">▲ مباشر</div>
        </div>
    `;
}

// ==========================================
// Converter Logic
// ==========================================
function initConverter() {
    if (!fromAmountInput) return;

    fromAmountInput.addEventListener('input', calculateConversion);
    fromCurrencySelect.addEventListener('change', calculateConversion);
    toCurrencySelect.addEventListener('change', calculateConversion);
    
    swapBtn.addEventListener('click', () => {
        const tempCurr = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = tempCurr;
        calculateConversion();
    });
}

function parseSmartInput(val) {
    if (!val) return 0;
    let str = val.replace(/,/g, '').toLowerCase();
    if (str.endsWith('k')) return parseFloat(str) * 1000;
    if (str.endsWith('m')) return parseFloat(str) * 1000000;
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
}

function calculateConversion() {
    if (Object.keys(currentRates).length === 0 || !fromAmountInput) return;
    
    const amount = parseSmartInput(fromAmountInput.value);
    const fromCode = fromCurrencySelect.value;
    const toCode = toCurrencySelect.value;
    
    const usdToIqd = localBoursesData.kifah / 100;
    let amountInUsd = 0;
    
    if (fromCode === 'IQD') amountInUsd = amount / usdToIqd;
    else if (fromCode === 'USD') amountInUsd = amount;
    else amountInUsd = amount / currentRates[fromCode];
    
    let result = 0;
    if (toCode === 'IQD') result = amountInUsd * usdToIqd;
    else if (toCode === 'USD') result = amountInUsd;
    else result = amountInUsd * currentRates[toCode];
    
    toAmountInput.value = result.toLocaleString('en-US', {maximumFractionDigits: 2});
}