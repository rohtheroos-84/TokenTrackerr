document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    // --- Tab Switching for Market ---
    const navLinks = document.querySelectorAll('.nav-link');
    const tabSections = document.querySelectorAll('.tab-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const target = link.getAttribute('data-target');

            if (target) {
                event.preventDefault();
                tabSections.forEach(section => section.classList.remove('active'));
                document.getElementById(target).classList.add('active');
            } 
            // --- Fix: Ensure Market & News trigger the alert ---
            else if (link.classList.contains("market-link") || link.classList.contains("news-link")) {
                event.preventDefault();
                alert("Feature coming soon! Stay tuned.");
            } 
            // Portfolio should open the linked HTML page instead of showing alert
            else if (link.classList.contains("portfolio-link")) {
                window.location.href = "portfolio.html";
            }
        });
    });

    // --- Dark Mode Toggle ---
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? "☀️" : "🌙";
        });
    }

    // --- Search Filter for Market Table ---
    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
        searchBar.addEventListener('keyup', () => {
            const filter = searchBar.value.toUpperCase();
            document.querySelectorAll('.crypto-table tbody tr').forEach(row => {
                const coinName = row.querySelector('td:nth-child(2)')?.innerText.toUpperCase() || "";
                row.style.display = coinName.includes(filter) ? "" : "none";
            });
        });
    }

    // DOM Elements
    const alertsBtn = document.getElementById('alertsBtn');
    const alertModal = document.getElementById('alertModal');
    const alertForm = document.getElementById('alertForm');
    const timeframeSelect = document.getElementById('timeframeSelect');
    const createAlertBtn = document.getElementById('createAlertBtn');
    const portfolioChart = document.getElementById('portfolioChart');
    const tickerMove = document.querySelector('.ticker-move');

    // Price Ticker
    function updatePriceTicker() {
        const prices = [
            { symbol: 'BTC', price: '$97,190.00', change: '+2.4%' },
            { symbol: 'ETH', price: '$2,809.29', change: '+1.8%' },
            { symbol: 'SOL', price: '$200.63', change: '-3.2%' },
            // Add more coins as needed
        ];

        tickerMove.innerHTML = prices.map(coin => 
            `<span class="ticker-item">${coin.symbol}: ${coin.price} (${coin.change})</span>`
        ).join(' • ');
    }

    // Market Overview
    function updateMarketStats() {
        document.getElementById('totalMarketCap').textContent = '$2.89T';
        document.getElementById('totalVolume').textContent = '$127.8B';
        document.getElementById('btcDominance').textContent = '48.2%';
        
        // Update sentiment meter
        const sentimentFill = document.querySelector('.meter-fill');
        sentimentFill.style.width = '65%';
    }

    // Portfolio Chart
    function initPortfolioChart() {
        if (!portfolioChart) return;

        const ctx = portfolioChart.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Portfolio Value',
                    data: [10000, 11200, 10800, 11500, 12100, 12450],
                    borderColor: '#4CAF50',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Price Alerts
    createAlertBtn.addEventListener('click', () => {
        alertModal.style.display = 'block';
    });

    alertForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const coin = document.getElementById('coinSelect').value;
        const price = document.getElementById('priceTarget').value;
        const condition = document.getElementById('condition').value;
        
        // Here you would typically send this to a backend
        console.log(`Alert set for ${coin} ${condition} ${price}`);
        alertModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === alertModal) {
            alertModal.style.display = 'none';
        }
    });

    // Search functionality
    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#cryptoTableBody tr');
        
        rows.forEach(row => {
            const coinName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            row.style.display = coinName.includes(searchTerm) ? '' : 'none';
        });
    });

    // Timeframe change handler
    timeframeSelect.addEventListener('change', (e) => {
        const timeframe = e.target.value;
        // Here you would typically fetch new data based on the timeframe
        console.log(`Fetching data for ${timeframe} timeframe`);
    });

    // Trending Cryptocurrencies data - defined in global scope
    const trendingCoins = [
        { 
            rank: 1, 
            name: 'Bitcoin', 
            symbol: 'BTC', 
            price: 67190.00, 
            change: -0.94, 
            image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' 
        },
        { 
            rank: 2, 
            name: 'Ethereum', 
            symbol: 'ETH', 
            price: 3809.29, 
            change: 2.83, 
            image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' 
        },
        { 
            rank: 3, 
            name: 'Tether', 
            symbol: 'USDT', 
            price: 1.00, 
            change: 0.00, 
            image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png' 
        },
        { 
            rank: 4, 
            name: 'BNB', 
            symbol: 'BNB', 
            price: 380.52, 
            change: 1.25, 
            image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' 
        },
        { 
            rank: 5, 
            name: 'Solana', 
            symbol: 'SOL', 
            price: 200.63, 
            change: -3.2, 
            image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' 
        },
        { 
            rank: 6, 
            name: 'XRP', 
            symbol: 'XRP', 
            price: 0.62, 
            change: 1.8, 
            image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' 
        },
        { 
            rank: 7, 
            name: 'Cardano', 
            symbol: 'ADA', 
            price: 0.72, 
            change: -0.5, 
            image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' 
        },
        { 
            rank: 8, 
            name: 'USDC', 
            symbol: 'USDC', 
            price: 1.00, 
            change: -0.01, 
            image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png' 
        },
        { 
            rank: 9, 
            name: 'Avalanche', 
            symbol: 'AVAX', 
            price: 42.15, 
            change: 2.1, 
            image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' 
        },
        { 
            rank: 10, 
            name: 'Dogecoin', 
            symbol: 'DOGE', 
            price: 0.0912, 
            change: -1.2, 
            image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' 
        }
    ];

    // Global function to update trending table
    function updateTrendingTable(coins) {
        console.log('updateTrendingTable called with', coins.length, 'coins');
        const tableBody = document.getElementById('trendingTableBody');
        console.log('Table body element:', tableBody);
        
        if (!tableBody) {
            console.error('Could not find element with ID "trendingTableBody"');
            return;
        }

        tableBody.innerHTML = '';
        
        coins.forEach(coin => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${coin.rank}</td>
                <td>
                    <div class="coin-info" style="display: flex; align-items: center; gap: 10px;">
                        <img src="${coin.image}" alt="${coin.symbol}" style="width: 24px; height: 24px;">
                        <div>
                            <span class="coin-name" style="display: block; font-weight: 500;">${coin.name}</span>
                            <span class="coin-symbol" style="color: rgba(255, 255, 255, 0.5); font-size: 0.9em;">${coin.symbol}</span>
                        </div>
                    </div>
                </td>
                <td>$${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</td>
                <td class="${coin.change >= 0 ? 'positive' : 'negative'}" style="color: ${coin.change >= 0 ? '#4dff4d' : '#ff4d4d'}">
                    ${coin.change >= 0 ? '+' : ''}${coin.change.toFixed(2)}%
                </td>
            `;
            tableBody.appendChild(row);
        });
        console.log('Trending table update completed');
    }

    // Global function to initialize trending section
    function initializeTrendingSection() {
        console.log('Initializing trending section');
        updateTrendingTable(trendingCoins);

        const searchInput = document.getElementById('cryptoSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredCoins = trendingCoins.filter(coin => 
                    coin.name.toLowerCase().includes(searchTerm) || 
                    coin.symbol.toLowerCase().includes(searchTerm)
                );
                updateTrendingTable(filteredCoins);
            });
        } else {
            console.error('Could not find search input element');
        }
    }

    // Initialize everything
    updatePriceTicker();
    updateMarketStats();
    initPortfolioChart();
    
    // Start ticker animation
    setInterval(updatePriceTicker, 30000); // Update every 30 seconds
    
    // Update market stats periodically
    setInterval(updateMarketStats, 60000); // Update every minute

    // Handle dark mode persistence
    function initDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // Set initial dark mode state
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️';
        }

        // Toggle dark mode
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            darkModeToggle.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('darkMode', isDark);
        });
    }

    // Initialize when DOM is loaded
    initDarkMode();
    
    // Update trending table
    console.log('Calling initializeTrendingSection from DOMContentLoaded');
    initializeTrendingSection();
});

// Direct call to populate table after a slight delay
console.log('Setting up direct table update');
setTimeout(() => {
    console.log('Running direct table update');
    updateTrendingTable(trendingCoins);
}, 500);
