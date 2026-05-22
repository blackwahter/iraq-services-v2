// ==========================================
// متغيرات الحالة الأساسية (State Variables)
// ==========================================
let currentRates = {};
let goldPriceUSD = 2415.50; 
let silverPriceUSD = 30.50;   
let brentOilUSD = 107.63;     
let wtiOilUSD = 101.28;       

let localBoursesData = { 
    kifah: 146500, 
    harthiya: 146500, 
    erbil: 146700, 
    basra: 146200, 
    lastUpdated: null 
};

const ministriesSalaries = [
    { id: 'retirees', name: 'هيئة التقاعد الوطنية', icon: '👴', status: 'released', date: '2026-05-15' },
    { id: 'social', name: 'الرعاية الاجتماعية', icon: '🤝', status: 'released', date: '2026-05-16' },
    { id: 'edu', name: 'وزارة التربية', icon: '🎓', status: 'released', date: '2026-05-18' },
    { id: 'health', name: 'وزارة الصحة', icon: '🏥', status: 'released', date: '2026-05-19' },
    { id: 'oil', name: 'وزارة النفط', icon: '🛢️', status: 'released', date: '2026-05-20' },
    { id: 'defense', name: 'وزارة الدفاع', icon: '🛡️', status: 'funded', date: 'تم التمويل - بانتظار الإطلاق' },
    { id: 'interior', name: 'وزارة الداخلية', icon: '👮', status: 'funded', date: 'تم التمويل - بانتظار الإطلاق' },
    { id: 'higher_edu', name: 'وزارة التعليم العالي', icon: '🏛️', status: 'funded', date: 'تم التمويل - بانتظار الإطلاق' },
    { id: 'finance', name: 'وزارة المالية', icon: '🏦', status: 'pending', date: 'بانتظار التدفقات' },
    { id: 'water', name: 'وزارة الموارد', icon: '💧', status: 'pending', date: 'بانتظار التدفقات' }
];

const MARKET_MULTIPLIER = 1.1145; 
const OUNCE_TO_GRAM = 31.1034768; 

let audioCtx = null;
let soundEnabled = true;
let marketChartInstance = null; 

const targetCurrencies = [
    { code: 'USD', name: 'دولار أمريكي', flag: '🇺🇸' },
    { code: 'EUR', name: 'يورو', flag: '🇪🇺' },
    { code: 'GBP', name: 'جنيه إسترليني', flag: '🇬🇧' },
    { code: 'TRY', name: 'ليرة تركية', flag: '🇹🇷' },
    { code: 'AED', name: 'درهم إماراتي', flag: '🇦🇪' },
    { code: 'SAR', name: 'ريال سعودي', flag: '🇸🇦' }
];

// عناصر HTML الأساسية
const currenciesGrid = document.getElementById('currencies-grid');
const metalsGrid = document.getElementById('metals-grid');
const oilGrid = document.getElementById('oil-grid');
const boursesGrid = document.getElementById('bourses-grid'); 
const salariesGrid = document.getElementById('salaries-grid'); 
const updateStatusText = document.getElementById('update-status');
const refreshBtn = document.getElementById('refresh-btn');

// عناصر الترمنال
const terminalLogs = document.getElementById('terminal-logs');
const pricesList = document.getElementById('prices-list');
const modalSysLogs = document.getElementById('modal-sys-logs');
const modalTeleLogs = document.getElementById('modal-tele-logs');

const soundToggle = document.getElementById('sound-toggle');
const soundStatusText = document.getElementById('sound-status-text');

const fromAmountInput = document.getElementById('from-amount');
const toAmountInput = document.getElementById('to-amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const swapBtn = document.getElementById('swap-btn');

window.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initClock();
    initParticles();
    initSoundEngine();
    initTerminalSimulator();
    initSalariesTracker(); 
    initModal(); 
    fetchData(); 
    fetchUpdates(); 

    window.addEventListener('resize', () => { 
        resizeCanvas(); 
        if (marketChartInstance) {
            marketChartInstance.resize(); 
        }
    });
});

// ==========================================
// شاشة المراقبة المركزية (العين)
// ==========================================
function initModal() {
    const expandBtn = document.getElementById('expand-terminal-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const modal = document.getElementById('terminal-modal');

    if(expandBtn && closeBtn && modal) {
        expandBtn.addEventListener('click', () => {
            modal.classList.add('show');
            playCyberSelect();
        });
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            playCyberSelect();
        });
    }
}

// ==========================================
// 1. نظام الخلفية المتحركة
// ==========================================
const canvas = document.getElementById('cyber-bg');
const ctx = canvas.getContext('2d');
let particlesArray = [];
const maxParticles = 65;

function initParticles() {
    resizeCanvas();
    particlesArray = [];
    for (let i = 0; i < maxParticles; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const directionX = (Math.random() - 0.5) * 0.6;
        const directionY = (Math.random() - 0.5) * 0.6;
        particlesArray.push(new Particle(x, y, directionX, directionY, size));
    }
    animateParticles();
}

function resizeCanvas() { 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
}

class Particle {
    constructor(x, y, dx, dy, size) { 
        this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.size = size; 
    }
    draw() { 
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); 
        ctx.fillStyle = 'rgba(0, 240, 255, 0.25)'; 
        ctx.fill(); 
    }
    update() {
        if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
        if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;
        this.x += this.dx; 
        this.y += this.dy; 
        this.draw();
    }
}

function animateParticles() {
    requestAnimationFrame(animateParticles);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 110) { 
                ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - (dist / 110)) * 0.12})`; 
                ctx.lineWidth = 1; 
                ctx.beginPath(); 
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y); 
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y); 
                ctx.stroke(); 
            }
        }
    }
}

// ==========================================
// 2. الصوتيات
// ==========================================
function initSoundEngine() {
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) { 
            soundToggle.classList.add('sound-active'); 
            soundStatusText.textContent = "الصوت: نشط"; 
            playSynthSound(523.25, 'sine', 0.1, 0.05); 
        } else { 
            soundToggle.classList.remove('sound-active'); 
            soundStatusText.textContent = "الصوت: مكتوم"; 
        }
    });
}

function getAudioContext() { 
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
    return audioCtx; 
}

function playSynthSound(freq, type = 'sine', dur = 0.1, vol = 0.08) {
    if (!soundEnabled) return;
    try { 
        const ctx = getAudioContext(); 
        if (ctx.state === 'suspended') ctx.resume(); 
        const osc = ctx.createOscillator(); 
        const gainNode = ctx.createGain(); 
        osc.type = type; 
        osc.frequency.setValueAtTime(freq, ctx.currentTime); 
        gainNode.gain.setValueAtTime(vol, ctx.currentTime); 
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur); 
        osc.connect(gainNode); 
        gainNode.connect(ctx.destination); 
        osc.start(); 
        osc.stop(ctx.currentTime + dur); 
    } catch (e) {}
}

function playCyberSelect() { 
    playSynthSound(900, 'sine', 0.05, 0.05); 
}

function playSuccessChime() { 
    if (!soundEnabled) return; 
    playSynthSound(659.25, 'sine', 0.1, 0.06); 
    setTimeout(() => playSynthSound(987.77, 'sine', 0.15, 0.06), 80); 
}

// ==========================================
// الترمنال المزدوج (النظيف من الرسائل الوهمية)
// ==========================================
function initTerminalSimulator() {
    // تم تفريغ هذه الدالة لإيقاف الرسائل التلقائية الوهمية
    // سيتم استخدام addTerminalLog فقط للأحداث الحقيقية
}

function addTerminalLog(message) {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logHTML = `<div style="padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">[${timeStr}] ${message}</div>`;
    
    // اضافة للترمنال الصغير
    if (terminalLogs) {
        terminalLogs.insertAdjacentHTML('beforeend', logHTML);
        terminalLogs.scrollTop = terminalLogs.scrollHeight;
        while (terminalLogs.childElementCount > 6) {
            terminalLogs.removeChild(terminalLogs.firstChild);
        }
    }
    
    // اضافة لشاشة المراقبة الكبيرة
    if (modalSysLogs) {
        modalSysLogs.insertAdjacentHTML('afterbegin', logHTML); 
        while (modalSysLogs.childElementCount > 30) {
            modalSysLogs.removeChild(modalSysLogs.lastChild);
        }
    }
}

// ==========================================
// 3. التبويبات والساعة
// ==========================================
function initClock() {
    const clockEl = document.getElementById('hud-clock');
    if (!clockEl) return;
    setInterval(() => { 
        clockEl.textContent = new Date().toLocaleTimeString('en-US'); 
    }, 1000);
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab'); 
            playCyberSelect();
            
            tabButtons.forEach(btn => btn.classList.remove('active')); 
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active'); 
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ==========================================
// 4. جلب البيانات العالمية والمحلية
// ==========================================
async function fetchData() {
    showLoaders();
    refreshBtn.classList.add('spinning');
    updateStatusText.textContent = 'جاري مزامنة مصفوفة البيانات...';

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
            const oilRes = await fetch('http://localhost:3000/api/oil'); 
            const oilData = await oilRes.json(); 
            if (oilData.success) { brentOilUSD = oilData.brent; wtiOilUSD = oilData.wti; } 
        } catch(e) {}
        
        try { 
            const boursesRes = await fetch('http://localhost:3000/api/bourses'); 
            const boursesResp = await boursesRes.json(); 
            if (boursesResp.success && boursesResp.data) localBoursesData = boursesResp.data; 
        } catch (e) {}

        updateStatusText.textContent = `مزامنة النظام: مستقر (${new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})})`;
        
        // إشعار حقيقي للترمنال بنجاح التحديث
        addTerminalLog("تم جلب البيانات بنجاح من الخوادم.");

        renderPriceBoard(); 
        renderMetalsBoard(); 
        renderOilBoard(); 
        renderLocalBoursesBoard(); 
        calculateConversion(); 
        drawChart(); 
        playSuccessChime();
        
    } catch (error) { 
        showErrorState(error.message); 
        addTerminalLog("خطأ في الاتصال بالخوادم!");
    } finally { 
        refreshBtn.classList.remove('spinning'); 
    }
}

function showLoaders() {
    const spinnerHTML = `<div class="loading-state"><div class="spinner"></div><p>جاري التحديث وجلب البيانات الحية...</p></div>`;
    if (currenciesGrid) currenciesGrid.innerHTML = spinnerHTML; 
    if (metalsGrid) metalsGrid.innerHTML = spinnerHTML; 
    if (oilGrid) oilGrid.innerHTML = spinnerHTML; 
    if (boursesGrid) boursesGrid.innerHTML = spinnerHTML;
}

function showErrorState(message) { 
    if (currenciesGrid) {
        currenciesGrid.innerHTML = `<div class="error-state"><p>فشل جلب البيانات: ${message}</p></div>`; 
    }
}

// ==========================================
// 5. 📊 المخطط البياني (Chart.js)
// ==========================================
function drawChart() {
    const canvasEl = document.getElementById('marketChart');
    if (!canvasEl) return; 

    const iqdPerUsd = currentRates['IQD'] || 1310;
    const liveParallelRate100 = (iqdPerUsd * MARKET_MULTIPLIER) * 100;
    
    const historicalDays = ['قبل 6 أيام', 'قبل 5 أيام', 'قبل 4 أيام', 'قبل 3 أيام', 'أول أمس', 'أمس', 'مباشر'];
    const historicalOfficial = [131000, 131000, 131000, 131000, 131000, 131000, 131000];
    let historicalParallel = [147200, 146800, 147100, 146900, 146500, 146300, Math.round(liveParallelRate100)];

    if (marketChartInstance) {
        marketChartInstance.destroy(); 
    }
    
    const ctx = canvasEl.getContext('2d');
    let gradient = ctx.createLinearGradient(0, 0, 0, 400); 
    gradient.addColorStop(0, 'rgba(255, 183, 0, 0.4)'); 
    gradient.addColorStop(1, 'rgba(255, 183, 0, 0.0)');

    marketChartInstance = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: historicalDays, 
            datasets: [
                { 
                    label: 'السوق الحر الموازي', 
                    data: historicalParallel, 
                    borderColor: '#ffb700', 
                    backgroundColor: gradient, 
                    borderWidth: 3, 
                    pointBackgroundColor: '#ffb700', 
                    pointBorderColor: '#111', 
                    pointRadius: 4, 
                    pointHoverRadius: 8, 
                    fill: true, 
                    tension: 0.4 
                },
                { 
                    label: 'السعر الرسمي (مركزي)', 
                    data: historicalOfficial, 
                    borderColor: '#007bff', 
                    borderWidth: 2, 
                    borderDash: [5, 5], 
                    pointRadius: 0, 
                    fill: false, 
                    tension: 0 
                }
            ]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { display: false }, 
                tooltip: { 
                    backgroundColor: 'rgba(0, 20, 40, 0.9)', 
                    titleColor: '#00ffaa', 
                    bodyColor: '#fff', 
                    borderColor: '#00ffaa', 
                    borderWidth: 1, 
                    rtl: true, 
                    titleFont: { family: 'Tajawal', size: 14 }, 
                    bodyFont: { family: 'Tajawal', size: 14 }, 
                    padding: 12, 
                    callbacks: { 
                        label: function(context) { 
                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString('ar-IQ') + ' د.ع'; 
                        } 
                    } 
                } 
            }, 
            scales: { 
                y: { 
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
                    ticks: { color: '#a0a0a0', font: { family: 'monospace' } }, 
                    min: 129000 
                }, 
                x: { 
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
                    ticks: { color: '#a0a0a0', font: { family: 'Tajawal' } } 
                } 
            } 
        }
    });
}

// ------------------------------------------
// 6. البورصات وباقي البطاقات
// ------------------------------------------
function renderLocalBoursesBoard() {
    if (!boursesGrid) return;
    
    const lastUpdate = localBoursesData.lastUpdated ? new Date(localBoursesData.lastUpdated).toLocaleTimeString('ar-IQ', {hour:'2-digit', minute:'2-digit'}) : "جاري المزامنة...";
    
    const bourses = [
        { name: 'بورصة الكفاح', icon: '🏛️', price: localBoursesData.kifah, flow: 'مرتفع جداً', effect: 'أساسي 100%', isOnline: true, desc: 'عصب المال العراقي' },
        { name: 'بورصة الحارثية', icon: '🏢', price: localBoursesData.harthiya, flow: 'نشط', effect: 'مرادف 90%', isOnline: true, desc: 'البورصة الثانية في العاصمة' },
        { name: 'بورصة أربيل', icon: '⛰️', price: localBoursesData.erbil, flow: 'متوسط', effect: 'سرعة تداول', isOnline: true, desc: 'المحور المالي الشمالي' },
        { name: 'بورصة البصرة', icon: '⚓', price: localBoursesData.basra, flow: 'تحديث آلي', effect: 'ساعات عمل', isOnline: true, desc: 'المحور التجاري للجنوب' }
    ];
    
    let html = `<div style="width:100%; text-align:right; margin-bottom:15px; color:#00ffaa; font-size:0.85rem; font-weight: bold; grid-column: 1 / -1;">⏱️ آخر تحديث للبورصات: ${lastUpdate}</div>`;
    
    bourses.forEach(b => {
        html += `
            <div class="cyber-card market-card">
                <div class="card-glow"></div>
                <div class="market-header">
                    <div class="market-title">
                        <span class="market-icon">${b.icon}</span>
                        <h4>${b.name}</h4>
                    </div>
                    <span class="market-status open">${b.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
                <p class="market-desc">${b.desc}</p>
                <div style="text-align: center; margin: 15px 0;">
                    <span style="font-size: 1.8rem; font-weight: bold; color: #fff;">
                        ${Math.round(b.price).toLocaleString('ar-IQ')} <span style="font-size: 0.95rem; color: #00ffaa;">د.ع</span>
                    </span>
                </div>
                <div class="market-stats">
                    <div class="stat-row"><span>السيولة:</span><strong>${b.flow}</strong></div>
                    <div class="stat-row"><span>التأثير:</span><strong>${b.effect}</strong></div>
                </div>
            </div>`;
    });
    
    boursesGrid.innerHTML = html;
}

function renderPriceBoard() {
    if (!currenciesGrid) return; 
    const iqdPerUsd = currentRates['IQD'] || 1310; 
    let html = '';
    
    targetCurrencies.forEach(currency => {
        const rateToUsd = currentRates[currency.code]; 
        if (!rateToUsd) return; 
        
        const marketRate = (iqdPerUsd / rateToUsd) * MARKET_MULTIPLIER;
        html += `
            <div class="rate-card">
                <div class="card-header">
                    <div class="currency-info">
                        <span class="currency-flag">${currency.flag}</span>
                        <div class="currency-names">
                            <span class="currency-code">${currency.code}</span>
                            <span class="currency-title">${currency.name}</span>
                        </div>
                    </div>
                </div>
                <div class="price-display">
                    <div class="price-row">
                        <span class="price-label">السوق الموازي:</span>
                        <span class="price-value">${Math.round(marketRate).toLocaleString('ar-IQ')} <span class="unit">د.ع</span></span>
                    </div>
                </div>
            </div>`;
    }); 
    currenciesGrid.innerHTML = html;
}

function renderMetalsBoard() {
    if (!metalsGrid) return; 
    
    const iqdPerUsd = currentRates['IQD'] || 1310; 
    const usdParallelRate = iqdPerUsd * MARKET_MULTIPLIER; 
    const p24USD = goldPriceUSD / OUNCE_TO_GRAM; 
    const pAgUSD = silverPriceUSD / OUNCE_TO_GRAM; 
    const p24IQD = p24USD * usdParallelRate; 
    const pAgIQD = pAgUSD * usdParallelRate;
    
    const metals = [
        { name: 'ذهب عيار 24', flag: '👑', class: 'gold-card', gramPrice: p24IQD, mithqalPrice: p24IQD * 5, usdPrice: p24USD },
        { name: 'ذهب عيار 22', flag: '🌟', class: 'gold-card', gramPrice: p24IQD * (22 / 24), mithqalPrice: (p24IQD * (22 / 24)) * 5, usdPrice: p24USD * (22 / 24) },
        { name: 'ذهب عيار 21', flag: '✨', class: 'gold-card', gramPrice: p24IQD * (21 / 24), mithqalPrice: (p24IQD * (21 / 24)) * 5, usdPrice: p24USD * (21 / 24) },
        { name: 'ذهب عيار 18', flag: '🎗️', class: 'gold-card', gramPrice: p24IQD * (18 / 24), mithqalPrice: (p24IQD * (18 / 24)) * 5, usdPrice: p24USD * (18 / 24) },
        { name: 'فضة حرة', flag: '🪙', class: 'silver-card', gramPrice: pAgIQD, mithqalPrice: pAgIQD * 5, usdPrice: pAgUSD }
    ];
    
    let html = ''; 
    metals.forEach(m => { 
        html += `
            <div class="rate-card ${m.class}">
                <div class="card-header">
                    <div class="currency-info">
                        <span class="currency-flag">${m.flag}</span>
                        <div class="currency-names">
                            <span class="currency-code" style="font-size: 1.1rem;">${m.name}</span>
                        </div>
                    </div>
                </div>
                <div class="price-display" style="gap: 8px;">
                    <div class="price-row" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">
                        <span class="price-label">المثقال (5 غرام):</span>
                        <span class="price-value" style="color: #00ffaa;">${Math.round(m.mithqalPrice).toLocaleString('ar-IQ')} <span class="unit">د.ع</span></span>
                    </div>
                    <div class="price-row">
                        <span>الغرام:</span>
                        <span>${Math.round(m.gramPrice).toLocaleString('ar-IQ')} د.ع</span>
                    </div>
                </div>
            </div>`; 
    }); 
    metalsGrid.innerHTML = html;
}

function renderOilBoard() {
    if (!oilGrid) return; 
    
    const usdParallelRate = (currentRates['IQD'] || 1310) * MARKET_MULTIPLIER;
    const oilList = [
        { name: 'برنت', symbol: 'BRENT', flag: '🛢️', usdPrice: brentOilUSD, iqdPrice: brentOilUSD * usdParallelRate }, 
        { name: 'تكساس', symbol: 'WTI', flag: '🔥', usdPrice: wtiOilUSD, iqdPrice: wtiOilUSD * usdParallelRate }
    ];
    
    let html = ''; 
    oilList.forEach(o => { 
        html += `
            <div class="rate-card oil-card">
                <div class="card-header">
                    <div class="currency-info">
                        <span class="currency-flag">${o.flag}</span>
                        <span class="currency-code">${o.symbol}</span>
                    </div>
                </div>
                <div class="price-display">
                    <div class="price-row">
                        <span class="price-label">بالدولار:</span>
                        <span class="price-value" style="color: var(--cyber-cyan);">$${o.usdPrice.toFixed(2)}</span>
                    </div>
                    <div class="price-row">
                        <span class="price-label">بالدينار:</span>
                        <span class="price-value">${Math.round(o.iqdPrice).toLocaleString('ar-IQ')} د.ع</span>
                    </div>
                </div>
            </div>`; 
    }); 
    oilGrid.innerHTML = html;
}

// ------------------------------------------
// المحول المالي
// ------------------------------------------
function calculateConversion() {
    if (!currentRates || !fromAmountInput || !toAmountInput) return;
    
    const fV = parseFloat(fromAmountInput.value); 
    if (isNaN(fV) || fV < 0) { 
        toAmountInput.value = '0'; 
        return; 
    }
    
    const fC = fromCurrencySelect.value;
    const tC = toCurrencySelect.value;
    const usdPr = (currentRates['IQD'] || 1310) * MARKET_MULTIPLIER;
    const gUsd = goldPriceUSD / OUNCE_TO_GRAM;
    const sUsd = silverPriceUSD / OUNCE_TO_GRAM;
    
    let aU = 0;
    
    if (fC === 'USD') aU = fV; 
    else if (fC === 'IQD') aU = fV / usdPr; 
    else if (fC.startsWith('GOLD_')) aU = fV * gUsd * (fC.includes('24')?1:fC.includes('21')?21/24:18/24); 
    else if (fC.startsWith('MITHQAL_')) aU = fV * gUsd * 5 * (fC.includes('24')?1:fC.includes('21')?21/24:18/24); 
    else if (fC === 'SILVER') aU = fV * sUsd; 
    else aU = currentRates[fC] ? fV / currentRates[fC] : fV;
    
    let cV = 0;
    
    if (tC === 'USD') cV = aU; 
    else if (tC === 'IQD') cV = aU * usdPr; 
    else if (tC.startsWith('GOLD_')) cV = aU / (gUsd * (tC.includes('24')?1:tC.includes('21')?21/24:18/24)); 
    else if (tC.startsWith('MITHQAL_')) cV = aU / (gUsd * 5 * (tC.includes('24')?1:tC.includes('21')?21/24:18/24)); 
    else if (tC === 'SILVER') cV = aU / sUsd; 
    else cV = currentRates[tC] ? aU * currentRates[tC] : aU;
    
    toAmountInput.value = tC === 'IQD' ? Math.round(cV).toString() : cV.toFixed(2);
}

function swapCurrencies() { 
    if (!fromCurrencySelect) return; 
    const t = fromCurrencySelect.value; 
    fromCurrencySelect.value = toCurrencySelect.value; 
    toCurrencySelect.value = t; 
    calculateConversion(); 
}

if (refreshBtn) refreshBtn.addEventListener('click', fetchData); 
if (fromAmountInput) fromAmountInput.addEventListener('input', calculateConversion); 
if (swapBtn) swapBtn.addEventListener('click', swapCurrencies); 
if (fromCurrencySelect) fromCurrencySelect.addEventListener('change', calculateConversion); 
if (toCurrencySelect) toCurrencySelect.addEventListener('change', calculateConversion);

// ==========================================
// 7. الرواتب
// ==========================================
let selectedSalaryFilter = 'all';

function initSalariesTracker() {
    const fBtns = document.querySelectorAll('.salaries-filters .filter-btn');
    fBtns.forEach(b => {
        b.addEventListener('click', () => { 
            fBtns.forEach(x => x.classList.remove('active')); 
            b.classList.add('active'); 
            selectedSalaryFilter = b.getAttribute('data-status'); 
            renderSalariesBoard(); 
        });
    });
    renderSalariesBoard();
}

function renderSalariesBoard() {
    if (!salariesGrid) return; 
    
    salariesGrid.querySelectorAll('.static-salary-card').forEach(c => c.remove());
    
    let html = ''; 
    const f = ministriesSalaries.filter(i => selectedSalaryFilter === 'all' || i.status === selectedSalaryFilter);
    const p = Math.round((ministriesSalaries.filter(i => i.status === 'released').length / ministriesSalaries.length) * 100);
    
    if(document.getElementById('salaries-progress')) document.getElementById('salaries-progress').style.width = `${p}%`; 
    if(document.getElementById('salaries-pct')) document.getElementById('salaries-pct').textContent = `${p}%`;
    
    const sMap = { released: '🟢 تم الصرف', funded: '🟡 تم التمويل', pending: '🔴 قيد التدقيق' };
    
    f.forEach(i => { 
        html += `
            <div class="rate-card salary-card static-salary-card ${i.status}">
                <div class="card-header">
                    <div class="currency-info">
                        <span class="currency-flag">${i.icon}</span>
                        <div class="currency-names">
                            <span class="currency-code">${i.name}</span>
                        </div>
                    </div>
                    <span class="status-badge ${i.status}">${sMap[i.status]}</span>
                </div>
                <div class="price-row">
                    <span style="color:#fff">${i.date}</span>
                </div>
            </div>`; 
    });
    
    salariesGrid.insertAdjacentHTML('beforeend', html); 
}

// ==========================================
// 8. ✈️ الرادار المزدوج لتيليجرام (ديناميكي ومستمر)
// ==========================================
async function fetchUpdates() {
    try {
        const response = await fetch('http://localhost:3000/api/updates'); 
        const data = await response.json();
        
        // تفريغ الحاويات بالكامل قبل إدراج الجديد لضمان عدم التراكم
        if (pricesList) pricesList.innerHTML = ''; 
        if (modalTeleLogs) modalTeleLogs.innerHTML = '';
        if (salariesGrid) {
            salariesGrid.querySelectorAll('.dynamic-news-card').forEach(c => c.remove()); 
        }
        
        // 🔥 التركيز هنا: السيرفر يرسل آخر 10 أخبار، ونحن نعكس الترتيب ليكون الأحدث في الأعلى
        const latestData = data.slice(-10).reverse(); 
        
        latestData.forEach(item => {
            const date = new Date(item.created_at).toLocaleTimeString('ar-IQ', {hour: '2-digit', minute: '2-digit'});
            let catColor = item.category === 'رواتب' ? '#00ffaa' : '#00ffcc'; 
            
            // 1. طباعة بالترمنال الصغير
            if (pricesList) {
                const logElement = document.createElement('div'); 
                logElement.style.padding = '6px 0'; 
                logElement.style.color = '#fff'; 
                logElement.style.fontFamily = 'monospace'; 
                logElement.style.borderBottom = '1px solid rgba(0, 240, 255, 0.08)'; 
                logElement.innerHTML = `
                    <span style="color: ${catColor}; font-weight: bold;">[${item.category}]</span> 
                    <span>${item.content}</span> 
                    <span style="color: #666; font-size: 11px; margin-right: 8px;">(${date})</span>`; 
                pricesList.appendChild(logElement);
            }

            // 2. طباعة بالترمنال الكبير (شاشة المراقبة)
            if (modalTeleLogs) {
                const modalLogElement = document.createElement('div'); 
                modalLogElement.style.padding = '8px 0'; 
                modalLogElement.style.color = '#fff'; 
                modalLogElement.style.fontFamily = 'monospace'; 
                modalLogElement.style.borderBottom = '1px dashed rgba(0, 255, 170, 0.2)'; 
                modalLogElement.innerHTML = `
                    <span style="color: ${catColor}; font-weight: bold;">[${item.category}]</span> 
                    <span>${item.content}</span> 
                    <span style="color: #666; font-size: 11px; margin-right: 8px;">(${date})</span>`; 
                modalTeleLogs.appendChild(modalLogElement);
            }
            
            // 3. إضافة الإشعارات العاجلة لقسم الرواتب
            if (salariesGrid && item.category === 'رواتب') {
                const card = document.createElement('div'); 
                card.className = 'cyber-card dynamic-news-card'; 
                card.style.padding = '15px'; 
                card.style.borderRight = '4px solid #00ffaa'; 
                card.style.background = 'rgba(0, 30, 60, 0.4)'; 
                card.style.marginBottom = '15px'; 
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(0, 255, 170, 0.2); padding-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 18px;">📢</span>
                            <span style="color: #00ffaa; font-weight: bold; font-size: 14px;">إشعار رواتب (عاجل)</span>
                        </div>
                        <span style="color: #888; font-size: 11px;">⌚ ${date}</span>
                    </div>
                    <p style="color: #e0e0e0; font-size: 14px; margin: 0;">${item.content}</p>`; 
                salariesGrid.prepend(card); 
            }
        });
    } catch (error) {
        console.error("Error fetching updates:", error);
    }
}
setInterval(fetchUpdates, 5000);