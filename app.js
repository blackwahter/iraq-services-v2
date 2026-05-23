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
        renderGlobalCurrencies();
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
                <div class="salary-header-row">
                    <div class="salary-badge ${badgeClass}">
                        ${badgeIcon}
                        <span>${badgeText}</span>
                    </div>
                </div>
                <div class="salary-title">${item.content}</div>
                <div class="salary-time">${timeStr} MT</div>
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
// Render Bourses & Currencies
// ==========================================
function renderLocalBoursesBoard() {
    if (!localBoursesData || !boursesGrid) return;
    const b = localBoursesData;
    
    // SVG Wave Chart 
    const svgChart = `
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" style="width:100%; height:80px; margin-top:20px; filter: drop-shadow(0 4px 6px rgba(52, 199, 89, 0.2));">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgba(52, 199, 89,0.3);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgba(52, 199, 89,0);stop-opacity:1" />
            </linearGradient>
        </defs>
        <path d="M0,20 Q10,10 20,20 T40,15 T60,25 T80,10 T100,20 L100,30 L0,30 Z" fill="url(#grad1)"></path>
        <path d="M0,20 Q10,10 20,20 T40,15 T60,25 T80,10 T100,20" fill="none" stroke="var(--ios-green)" stroke-width="2"></path>
    </svg>`;

    boursesGrid.innerHTML = `
        <div class="ios-card kifah-card">
            <div class="kifah-label">سعر الدولار الموازي (بغداد)</div>
            <div class="kifah-price">${b.kifah.toLocaleString()}</div>
            <div class="kifah-sub">لكل 100 دولار - بورصة الكفاح</div>
            ${svgChart}
        </div>
        
        <div class="bourse-list">
            <div class="bourse-list-item">
                <span class="bourse-city">بورصة أربيل</span>
                <span class="bourse-price-sub">${b.erbil.toLocaleString()}</span>
            </div>
            <div class="bourse-list-item">
                <span class="bourse-city">بورصة البصرة</span>
                <span class="bourse-price-sub">${b.basra.toLocaleString()}</span>
            </div>
        </div>
    `;
}

function renderGlobalCurrencies() {
    if (Object.keys(currentRates).length === 0 || !currenciesGrid) return;
    
    let html = '';
    targetCurrencies.forEach(curr => {
        let rawRate = currentRates[curr.code] || 0;
        let convertedPrice = 0;
        
        if (curr.code === 'USD') {
            convertedPrice = localBoursesData.kifah / 100;
        } else if (rawRate > 0) {
            convertedPrice = (localBoursesData.kifah / 100) / rawRate;
        }

        html += `
        <div class="ios-card" style="min-width: 120px; text-align: center; margin-bottom: 0;">
            <div style="font-size: 2rem; margin-bottom: 8px;">${curr.flag}</div>
            <div style="font-size: 0.9rem; font-weight: 700; color: var(--ios-text-sub);">${curr.code}</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--ios-text-main); margin-top: 4px;">${Math.round(convertedPrice).toLocaleString()}</div>
        </div>
        `;
    });
    currenciesGrid.innerHTML = html;
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