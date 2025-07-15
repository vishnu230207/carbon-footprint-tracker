// Global variables
let currentSection = 'dashboard';
let userData = {
    emissions: {
        transport: 0,
        energy: 0,
        food: 0,
        waste: 0,
        water: 0,
        total: 0
    },
    goals: {
        monthlyTarget: 250,
        greenTransportDays: 16,
        targetTransportDays: 20
    },
    points: 1250,
    streak: 7,
    co2Saved: 45,
    badges: ['🌿 Eco Beginner', '🌻 Nature Guardian']
};

let emissionChart = null;

// Emission factors (kg CO2 per unit)
const emissionFactors = {
    transport: {
        car: 0.21,     // kg CO2 per km
        bus: 0.089,    // kg CO2 per km
        train: 0.041,  // kg CO2 per km
        bike: 0,       // kg CO2 per km
        walk: 0        // kg CO2 per km
    },
    energy: {
        small: 2.5,    // kg CO2 per kWh
        medium: 3.2,   // kg CO2 per kWh
        large: 4.1     // kg CO2 per kWh
    },
    diet: {
        omnivore: 1.85,     // kg CO2 per meal
        vegetarian: 1.25,   // kg CO2 per meal
        vegan: 0.89,        // kg CO2 per meal
        pescatarian: 1.45   // kg CO2 per meal
    },
    waste: 0.45,    // kg CO2 per kg waste
    water: 0.001    // kg CO2 per litre
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserData();
    updateDashboard();
});

function initializeApp() {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle();
    
    // Initialize charts
    initializeCharts();
    
    // Load background images
    loadBackgroundImages();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            switchSection(section);
        });
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });

    // Form inputs
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('change', saveFormData);
    });

    // Calculate button
    const calculateBtn = document.querySelector('.btn-primary');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateFootprint);
    }
}

function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    currentSection = sectionName;
    
    // Update section-specific content
    if (sectionName === 'leaderboard') {
        updateLeaderboard();
    } else if (sectionName === 'goals') {
        updateGoals();
    } else if (sectionName === 'tips') {
        updateTips();
    }
}

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle();
    
    // Update charts
    if (emissionChart) {
        updateChartTheme();
    }
}

function updateThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
}

function calculateFootprint() {
    const calculations = {
        transport: calculateTransportEmissions(),
        energy: calculateEnergyEmissions(),
        food: calculateFoodEmissions(),
        waste: calculateWasteEmissions()
    };
    
    userData.emissions = calculations;
    userData.emissions.total = Object.values(calculations).reduce((sum, val) => sum + val, 0);
    
    updateEmissionResults();
    updateChart();
    updateEcoScore();
    checkAchievements();
    
    // Save to localStorage
    saveUserData();
    
    // Show celebration if good performance
    if (userData.emissions.total < 300) {
        showCelebration();
    }
}

function calculateTransportEmissions() {
    const mode = document.getElementById('transportMode').value;
    const distance = parseFloat(document.getElementById('transportDistance').value) || 0;
    
    const dailyEmissions = distance * emissionFactors.transport[mode];
    return dailyEmissions * 365; // Annual emissions
}

function calculateEnergyEmissions() {
    const usage = parseFloat(document.getElementById('energyUsage').value) || 0;
    const homeSize = document.getElementById('homeSize').value;
    
    const monthlyEmissions = usage * emissionFactors.energy[homeSize];
    return monthlyEmissions * 12; // Annual emissions
}

function calculateFoodEmissions() {
    const dietType = document.getElementById('dietType').value;
    const meals = parseFloat(document.getElementById('mealsPerDay').value) || 3;
    
    const dailyEmissions = meals * emissionFactors.diet[dietType];
    return dailyEmissions * 365; // Annual emissions
}

function calculateWasteEmissions() {
    const waste = parseFloat(document.getElementById('wasteGeneration').value) || 0;
    const water = parseFloat(document.getElementById('waterUsage').value) || 0;
    
    const weeklyWasteEmissions = waste * emissionFactors.waste;
    const dailyWaterEmissions = water * emissionFactors.water;
    
    return (weeklyWasteEmissions * 52) + (dailyWaterEmissions * 365); // Annual emissions
}

function updateEmissionResults() {
    const emissions = userData.emissions;
    
    document.getElementById('totalEmissions').textContent = Math.round(emissions.total);
    document.getElementById('transportEmissions').textContent = Math.round(emissions.transport) + ' kg';
    document.getElementById('energyEmissions').textContent = Math.round(emissions.energy) + ' kg';
    document.getElementById('foodEmissions').textContent = Math.round(emissions.food) + ' kg';
    document.getElementById('wasteEmissions').textContent = Math.round(emissions.waste) + ' kg';
    
    // Update status
    const statusElement = document.getElementById('emissionStatus');
    const statusIcon = statusElement.querySelector('.status-icon');
    const statusText = statusElement.querySelector('.status-text');
    
    if (emissions.total < 250) {
        statusIcon.textContent = '🌱';
        statusText.textContent = 'Excellent! Well below average';
        statusElement.style.background = 'rgba(34, 197, 94, 0.1)';
    } else if (emissions.total < 400) {
        statusIcon.textContent = '🌿';
        statusText.textContent = 'Good! Below average';
        statusElement.style.background = 'rgba(34, 197, 94, 0.1)';
    } else if (emissions.total < 600) {
        statusIcon.textContent = '⚠️';
        statusText.textContent = 'Above average - room for improvement';
        statusElement.style.background = 'rgba(245, 158, 11, 0.1)';
    } else {
        statusIcon.textContent = '🔴';
        statusText.textContent = 'High emissions - urgent action needed';
        statusElement.style.background = 'rgba(239, 68, 68, 0.1)';
    }
}

function updateEcoScore() {
    const emissions = userData.emissions.total;
    let score = 100;
    
    if (emissions > 200) score = Math.max(0, 100 - ((emissions - 200) / 10));
    if (emissions > 400) score = Math.max(0, 80 - ((emissions - 400) / 8));
    if (emissions > 600) score = Math.max(0, 60 - ((emissions - 600) / 6));
    
    const scoreElement = document.getElementById('ecoScore');
    scoreElement.textContent = Math.round(score);
    
    // Update score circle
    const scoreCircle = document.querySelector('.score-circle');
    const percentage = (score / 100) * 360;
    scoreCircle.style.background = `conic-gradient(var(--success-color) 0deg ${percentage}deg, var(--border-color) ${percentage}deg 360deg)`;
}

function initializeCharts() {
    const ctx = document.getElementById('emissionChart').getContext('2d');
    
    emissionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['🚗 Transport', '⚡ Energy', '🍽️ Food', '🗑️ Waste'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    '#ef4444',
                    '#f59e0b',
                    '#22c55e',
                    '#3b82f6'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            },
            animation: {
                animateScale: true,
                duration: 1000
            }
        }
    });
}

function updateChart() {
    if (!emissionChart) return;
    
    const emissions = userData.emissions;
    emissionChart.data.datasets[0].data = [
        emissions.transport,
        emissions.energy,
        emissions.food,
        emissions.waste
    ];
    
    emissionChart.update();
}

function updateChartTheme() {
    if (!emissionChart) return;
    
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
    emissionChart.options.plugins.legend.labels.color = textColor;
    emissionChart.update();
}

function updateLeaderboard() {
    // Simulate leaderboard updates
    const leaderboardData = [
        { username: 'EcoWarrior23', points: 2450, badge: '🌍 Earth Hero', avatar: 'https://source.unsplash.com/100x100/?avatar,user,face' },
        { username: 'GreenGuru', points: 2180, badge: '🌻 Nature Guardian', avatar: 'https://source.unsplash.com/100x100/?person,portrait' },
        { username: 'NatureLover', points: 1890, badge: '🌻 Nature Guardian', avatar: 'https://source.unsplash.com/100x100/?face,smile' },
        { username: 'You', points: userData.points, badge: '🌻 Nature Guardian', avatar: 'https://source.unsplash.com/100x100/?user,happy' }
    ];
    
    // Update user rank
    const userRank = document.querySelector('.rank-badge');
    userRank.textContent = '🏆 #4';
}

function updateGoals() {
    // Update progress bars
    const currentEmissions = userData.emissions.total / 12; // Monthly
    const targetEmissions = userData.goals.monthlyTarget;
    const emissionProgress = Math.min(100, (currentEmissions / targetEmissions) * 100);
    
    document.querySelector('.goal-card .progress-fill').style.width = emissionProgress + '%';
    document.querySelector('.goal-card .progress-text').innerHTML = `
        <span>Current: ${Math.round(currentEmissions)} kg</span>
        <span>Target: ${targetEmissions} kg</span>
    `;
    
    // Update transport goals
    const transportProgress = (userData.goals.greenTransportDays / userData.goals.targetTransportDays) * 100;
    document.querySelectorAll('.goal-card .progress-fill')[1].style.width = transportProgress + '%';
}

function updateTips() {
    // Personalized tips based on user's highest emission categories
    const emissions = userData.emissions;
    const highestCategory = Object.keys(emissions).reduce((a, b) => 
        emissions[a] > emissions[b] ? a : b
    );
    
    // Highlight relevant tips
    document.querySelectorAll('.tip-card').forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
    });
    
    // Add focus effect to relevant tip
    setTimeout(() => {
        const relevantTips = {
            transport: 0,
            energy: 1,
            food: 2,
            waste: 3
        };
        
        if (relevantTips[highestCategory] !== undefined) {
            const tipCard = document.querySelectorAll('.tip-card')[relevantTips[highestCategory]];
            tipCard.style.border = '2px solid var(--primary-color)';
            tipCard.style.transform = 'scale(1.02)';
        }
    }, 500);
}

function checkAchievements() {
    const emissions = userData.emissions.total;
    const previousPoints = userData.points;
    
    // Award points based on performance
    if (emissions < 200) {
        userData.points += 100;
        showNotification('🎉 Bonus! +100 points for excellent performance!');
    } else if (emissions < 300) {
        userData.points += 50;
        showNotification('🌟 Great job! +50 points');
    } else if (emissions < 400) {
        userData.points += 25;
        showNotification('✨ Good effort! +25 points');
    }
    
    // Check for badge upgrades
    if (userData.points >= 1000 && !userData.badges.includes('🌍 Earth Hero')) {
        userData.badges.push('🌍 Earth Hero');
        showNotification('🏆 New Badge Unlocked: Earth Hero!');
        updateBadges();
    }
    
    // Update points display
    document.getElementById('greenPoints').textContent = userData.points;
    
    // Increment streak
    userData.streak++;
    document.getElementById('weekStreak').textContent = userData.streak;
    
    // Update CO2 saved
    const averageEmissions = 500; // Average annual emissions
    const saved = Math.max(0, averageEmissions - emissions);
    userData.co2Saved = saved;
    document.getElementById('co2Saved').textContent = Math.round(saved);
}

function updateBadges() {
    const badgeContainer = document.querySelector('.badges');
    badgeContainer.innerHTML = '';
    
    const allBadges = [
        { name: '🌿 Eco Beginner', requirement: 100 },
        { name: '🌻 Nature Guardian', requirement: 500 },
        { name: '🌍 Earth Hero', requirement: 1000 }
    ];
    
    allBadges.forEach(badge => {
        const badgeElement = document.createElement('div');
        badgeElement.className = 'badge';
        badgeElement.textContent = badge.name;
        
        if (userData.points >= badge.requirement) {
            badgeElement.classList.add('earned');
        } else {
            badgeElement.classList.add('locked');
        }
        
        badgeContainer.appendChild(badgeElement);
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showCelebration() {
    const celebration = document.createElement('div');
    celebration.innerHTML = '🎉';
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 5rem;
        z-index: 1001;
        animation: celebration 2s ease-out;
        pointer-events: none;
    `;
    
    document.body.appendChild(celebration);
    
    setTimeout(() => {
        celebration.remove();
    }, 2000);
}

function saveFormData() {
    const formData = {
        transportMode: document.getElementById('transportMode').value,
        transportDistance: document.getElementById('transportDistance').value,
        energyUsage: document.getElementById('energyUsage').value,
        homeSize: document.getElementById('homeSize').value,
        dietType: document.getElementById('dietType').value,
        mealsPerDay: document.getElementById('mealsPerDay').value,
        wasteGeneration: document.getElementById('wasteGeneration').value,
        waterUsage: document.getElementById('waterUsage').value
    };
    
    localStorage.setItem('ecotrackFormData', JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem('ecotrackFormData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        
        Object.keys(formData).forEach(key => {
            const element = document.getElementById(key);
            if (element && formData[key]) {
                element.value = formData[key];
            }
        });
    }
}

function saveUserData() {
    localStorage.setItem('ecotrackUserData', JSON.stringify(userData));
}

function loadUserData() {
    const savedData = localStorage.getItem('ecotrackUserData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        userData = { ...userData, ...parsedData };
    }
    
    loadFormData();
    updateDashboard();
}

function updateDashboard() {
    document.getElementById('greenPoints').textContent = userData.points;
    document.getElementById('weekStreak').textContent = userData.streak;
    document.getElementById('co2Saved').textContent = userData.co2Saved;
    
    updateBadges();
    updateEcoScore();
    
    if (userData.emissions.total > 0) {
        updateEmissionResults();
        updateChart();
    }
}

function loadBackgroundImages() {
    // Add different background images for different sections
    const backgrounds = {
        dashboard: 'image1.jpg',
        goals: 'image2.jpg',
        leaderboard: 'image4.jpg',
        tips: 'image5.jpg'
    };
    
    // Preload images
    Object.values(backgrounds).forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Challenge system
function initializeChallenges() {
    const challenges = [
        {
            id: 'bike_challenge',
            title: 'Use bike for 3 days',
            description: 'Choose cycling as your transport mode',
            points: 50,
            progress: 2,
            target: 3,
            completed: false
        },
        {
            id: 'energy_challenge',
            title: 'Reduce energy usage by 10%',
            description: 'Lower your monthly kWh consumption',
            points: 100,
            progress: 5,
            target: 10,
            completed: false
        },
        {
            id: 'vegan_challenge',
            title: 'Try 2 vegan meals',
            description: 'Experiment with plant-based diet',
            points: 75,
            progress: 0,
            target: 2,
            completed: false
        }
    ];
    
    localStorage.setItem('ecotrackChallenges', JSON.stringify(challenges));
}

// Initialize challenges if not exists
if (!localStorage.getItem('ecotrackChallenges')) {
    initializeChallenges();
}

// Auto-save functionality
setInterval(saveUserData, 30000); // Save every 30 seconds

// Performance monitoring
function trackPerformance() {
    if (performance.mark) {
        performance.mark('ecotrack-load-start');
        
        window.addEventListener('load', () => {
            performance.mark('ecotrack-load-end');
            performance.measure('ecotrack-load-time', 'ecotrack-load-start', 'ecotrack-load-end');
        });
    }
}

trackPerformance();

// Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

// Accessibility improvements
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Initialize app when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}