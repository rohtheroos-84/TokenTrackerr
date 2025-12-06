document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode from localStorage
    initDarkMode();

    // DOM Elements
    const createAlertBtn = document.getElementById('createAlertBtn');
    const alertModal = document.getElementById('alertModal');
    const alertForm = document.getElementById('alertForm');
    const searchBar = document.getElementById('searchBar');
    const timeframeSelect = document.getElementById('timeframeSelect');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const cryptoTableBody = document.getElementById('cryptoTableBody');
    const tableHeader = document.querySelector('.table-header');

    // State Management
    let currentPage = 1;
    const itemsPerPage = 10;
    let cryptoData = [];
    let websocket = null;

    // CoinGecko API endpoints
    const COINGECKO_API = {
        COINS: 'https://api.coingecko.com/api/v3/coins/markets',
        WEBSOCKET: 'wss://ws.coincap.io/prices?assets=ALL'
    };

    // Rearrange the UI elements to match the image
    function updateUILayout() {
        // Create a container for the top controls
        const topControls = document.createElement('div');
        topControls.className = 'top-controls';
        
        // Add the title
        const tableTitle = document.createElement('h2');
        tableTitle.textContent = 'Top Cryptocurrencies';
        tableTitle.style.display = 'flex';
        tableTitle.style.alignItems = 'center';
        tableTitle.style.gap = '10px';
        
        // Add chart icon
        const chartIcon = document.createElement('img');
        chartIcon.src = 'https://img.icons8.com/fluency/48/financial-growth.png';
        chartIcon.alt = 'Chart';
        chartIcon.style.width = '32px';
        chartIcon.style.height = '32px';
        tableTitle.prepend(chartIcon);
        
        topControls.appendChild(tableTitle);
        
        // Create controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'controls-container';
        
        // Create a timeframe dropdown that's right-aligned
        const timeframeContainer = document.createElement('div');
        timeframeContainer.className = 'timeframe-container';
        timeframeContainer.appendChild(timeframeSelect);
        
        // Create a search container 
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.appendChild(searchBar);
        
        // Create a create alert button container
        const alertBtnContainer = document.createElement('div');
        alertBtnContainer.className = 'alert-btn-container';
        alertBtnContainer.appendChild(createAlertBtn);
        
        // Clear the table header and add elements in the desired order
        tableHeader.innerHTML = '';
        tableHeader.appendChild(topControls);
        
        // Add controls to container
        controlsContainer.appendChild(timeframeContainer);
        controlsContainer.appendChild(searchContainer);
        controlsContainer.appendChild(alertBtnContainer);
        
        topControls.appendChild(controlsContainer);
    }

    // Fetch initial crypto data from CoinGecko API
    async function fetchCryptoData() {
        try {
            const response = await fetch(`${COINGECKO_API.COINS}?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false&price_change_percentage=24h`);
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            cryptoData = data.map(coin => ({
                id: coin.id,
                rank: coin.market_cap_rank,
                name: coin.name,
                symbol: coin.symbol.toUpperCase(),
                price: coin.current_price,
                change: coin.price_change_percentage_24h,
                marketCap: coin.market_cap,
                volume: coin.total_volume,
                logo: coin.image
            }));

            updateCryptoTable();
            updatePriceTicker();
            updateMarketStats();
        } catch (error) {
            console.error('Error fetching data:', error);
            useFallbackData();
        }
    }

    // Initialize WebSocket connection for real-time updates
    function initWebSocket() {
        try {
            websocket = new WebSocket(COINGECKO_API.WEBSOCKET);

            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                updatePricesInRealTime(data);
            };

            websocket.onclose = () => {
                console.log('WebSocket connection closed. Reconnecting...');
                setTimeout(initWebSocket, 5000);
            };

            websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Error initializing WebSocket:', error);
        }
    }

    // Update prices in real-time
    function updatePricesInRealTime(data) {
        let updated = false;
        
        for (const [coinId, price] of Object.entries(data)) {
            const coin = cryptoData.find(c => c.id === coinId);
            if (coin) {
                const oldPrice = coin.price;
                coin.price = parseFloat(price);
                coin.change = ((coin.price - oldPrice) / oldPrice) * 100;
                updated = true;
            }
        }

        if (updated) {
            updateCryptoTable();
            updatePriceTicker();
            updateMarketStats();
        }
    }

    // Format numbers for display
    function formatNumber(num, isCurrency = true) {
        if (num >= 1e9) return `${isCurrency ? '$' : ''}${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${isCurrency ? '$' : ''}${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${isCurrency ? '$' : ''}${(num / 1e3).toFixed(2)}K`;
        return `${isCurrency ? '$' : ''}${num.toFixed(2)}`;
    }

    // Update price ticker
    function updatePriceTicker() {
        const tickerMove = document.querySelector('.ticker-move');
        const topCoins = cryptoData.slice(0, 10);
        
        tickerMove.innerHTML = topCoins.map(coin => `
            <div class="ticker-item">
                <img src="${coin.logo}" alt="${coin.symbol}">
                <span>${coin.symbol}: ${formatNumber(coin.price)}</span>
                <span class="${coin.change >= 0 ? 'up' : 'down'}">${coin.change.toFixed(2)}%</span>
            </div>
        `).join('');
    }

    // Update market stats
    function updateMarketStats() {
        const totalMarketCap = cryptoData.reduce((sum, coin) => sum + coin.marketCap, 0);
        const totalVolume = cryptoData.reduce((sum, coin) => sum + coin.volume, 0);
        const btcDominance = (cryptoData[0]?.marketCap / totalMarketCap * 100) || 0;

        document.getElementById('totalMarketCap').textContent = formatNumber(totalMarketCap);
        document.getElementById('totalVolume').textContent = formatNumber(totalVolume);
        document.getElementById('btcDominance').textContent = `${btcDominance.toFixed(1)}%`;
        
        // Update sentiment meter based on market conditions
        const sentiment = calculateMarketSentiment();
        const sentimentFill = document.querySelector('.meter-fill');
        sentimentFill.style.width = `${sentiment}%`;
    }

    // Calculate market sentiment (simplified version)
    function calculateMarketSentiment() {
        const positiveChanges = cryptoData.filter(coin => coin.change > 0).length;
        return (positiveChanges / cryptoData.length) * 100;
    }

    // Update crypto table
    function updateCryptoTable() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = cryptoData.slice(startIndex, endIndex);

        cryptoTableBody.innerHTML = pageData.map((coin, index) => `
            <tr style="background-color: ${index % 2 === 1 ? 'rgba(30, 10, 60, 0.4)' : 'transparent'}">
                <td style="text-align: center;">${coin.rank}</td>
                <td>
                    <div class="coin-info" style="display: flex; align-items: center; gap: 12px;">
                        <img src="${coin.logo}" style="width: 32px; height: 32px; border-radius: 50%;" alt="${coin.name}">
                        <div style="display: flex; flex-direction: column;">
                            <span class="coin-name" style="display: block; font-weight: 500; font-size: 1.1rem;">${coin.name}</span>
                            <span class="coin-symbol" style="color: rgba(255, 255, 255, 0.5); font-size: 0.9em;">${coin.symbol}</span>
                        </div>
                    </div>
                </td>
                <td style="text-align: right;">${formatNumber(coin.price)}</td>
                <td class="${coin.change >= 0 ? 'positive' : 'negative'}" style="text-align: right;">${coin.change >= 0 ? '+' : ''}${coin.change.toFixed(2)}%</td>
                <td style="text-align: right;">${formatNumber(coin.marketCap)}</td>
                <td style="text-align: right;">${formatNumber(coin.volume)}</td>
                <td>
                    <button class="action-btn" onclick="addToPortfolio('${coin.id}', '${coin.name}', '${coin.symbol}', ${coin.price})">Add to Portfolio</button>
                </td>
            </tr>
        `).join('');

        pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(cryptoData.length / itemsPerPage)}`;
        updatePaginationButtons();
    }

    // Update pagination buttons
    function updatePaginationButtons() {
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === Math.ceil(cryptoData.length / itemsPerPage);
    }

    // Event Listeners
    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        // Filter the original data
        const filteredData = cryptoData.filter(coin => 
            coin.name.toLowerCase().includes(searchTerm) || 
            coin.symbol.toLowerCase().includes(searchTerm)
        );

        // Update the table with filtered results
        cryptoTableBody.innerHTML = filteredData.map(coin => `
            <tr>
                <td>${coin.rank}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${coin.logo}" class="crypto-logo" alt="${coin.name}">
                        <div>
                            <span class="coin-name" style="display: block; font-weight: 500;">${coin.name}</span>
                            <span class="coin-symbol" style="color: rgba(255, 255, 255, 0.5); font-size: 0.9em;">${coin.symbol}</span>
                        </div>
                    </div>
                </td>
                <td>${formatNumber(coin.price)}</td>
                <td class="${coin.change >= 0 ? 'up' : 'down'}">${coin.change >= 0 ? '+' : ''}${coin.change.toFixed(2)}%</td>
                <td>${formatNumber(coin.marketCap)}</td>
                <td>${formatNumber(coin.volume)}</td>
                <td>
                    <button class="action-btn" onclick="addToPortfolio('${coin.id}', '${coin.name}', '${coin.symbol}', ${coin.price})">Add to Portfolio</button>
                </td>
            </tr>
        `).join('');

        // Update pagination info
        pageInfo.textContent = `Page ${Math.min(currentPage, Math.ceil(filteredData.length / itemsPerPage) || 1)} of ${Math.ceil(filteredData.length / itemsPerPage) || 1}`;
        
        // Disable pagination buttons as needed
        prevPageBtn.disabled = currentPage === 1 || filteredData.length === 0;
        nextPageBtn.disabled = currentPage >= Math.ceil(filteredData.length / itemsPerPage) || filteredData.length === 0;
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateCryptoTable();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < Math.ceil(cryptoData.length / itemsPerPage)) {
            currentPage++;
            updateCryptoTable();
        }
    });

    // Alert Modal
    createAlertBtn.addEventListener('click', () => {
        alertModal.style.display = 'block';
    });

    // Close modal
    document.querySelector('.close-modal').addEventListener('click', () => {
        alertModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === alertModal) {
            alertModal.style.display = 'none';
        }
    });

    alertForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const coin = document.getElementById('coinSelect').value;
        const price = document.getElementById('priceTarget').value;
        const condition = document.getElementById('condition').value;
        
        // Store alert in localStorage
        const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
        alerts.push({ coin, price, condition, timestamp: Date.now() });
        localStorage.setItem('priceAlerts', JSON.stringify(alerts));
        
        alert(`Price alert set for ${coin} ${condition} ${formatNumber(parseFloat(price))}`);
        alertModal.style.display = 'none';
    });

    // Add to portfolio function
    function addToPortfolio(id, name, symbol, price) {
        // Get existing portfolio or initialize empty array
        const portfolio = JSON.parse(localStorage.getItem('portfolio') || '[]');
        
        // Check if coin already exists in portfolio
        const existingCoin = portfolio.find(item => item.id === id);
        
        if (existingCoin) {
            // Ask user for quantity to add
            const additionalQuantity = prompt(`Enter quantity of ${name} to add to your portfolio:`, "1");
            
            if (additionalQuantity === null) return; // User canceled
            
            const quantity = parseFloat(additionalQuantity);
            if (isNaN(quantity) || quantity <= 0) {
                alert('Please enter a valid quantity.');
                return;
            }
            
            // Update existing entry
            existingCoin.quantity += quantity;
            existingCoin.totalInvested += quantity * price;
            existingCoin.averagePrice = existingCoin.totalInvested / existingCoin.quantity;
        } else {
            // Ask user for quantity
            const quantityInput = prompt(`Enter quantity of ${name} to add to your portfolio:`, "1");
            
            if (quantityInput === null) return; // User canceled
            
            const quantity = parseFloat(quantityInput);
            if (isNaN(quantity) || quantity <= 0) {
                alert('Please enter a valid quantity.');
                return;
            }
            
            // Add new coin to portfolio
            portfolio.push({
                id,
                name,
                symbol,
                quantity,
                purchasePrice: price,
                averagePrice: price,
                totalInvested: quantity * price,
                dateAdded: new Date().toISOString()
            });
        }
        
        // Save updated portfolio to localStorage
        localStorage.setItem('portfolio', JSON.stringify(portfolio));
        
        // Show confirmation message
        alert(`${name} added to your portfolio successfully!`);
    }

    // Make addToPortfolio function available globally
    window.addToPortfolio = addToPortfolio;

    // Initialize
    fetchCryptoData();
    initWebSocket();
    initializeMarketTrendsChart();
    
    // Refresh data periodically as backup for WebSocket
    setInterval(fetchCryptoData, 60000); // Refresh every minute as backup
});

// Handle dark mode persistence
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;

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

// Add function to initialize market trends chart
function initializeMarketTrendsChart() {
    const ctx = document.getElementById('marketChart');
    if (!ctx) return;

    // Sample data for the chart (replace with real API data in production)
    const labels = Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
    });

    // Generate sample price data with an uptrend
    const priceData = [];
    let baseValue = 50000;
    for (let i = 0; i < 30; i++) {
        // Random movement with slight upward bias
        const change = (Math.random() - 0.4) * 1000;
        baseValue += change;
        priceData.push(baseValue);
    }

    // Generate sample volume data
    const volumeData = Array.from({length: 30}, () => Math.random() * 10000 + 5000);

    const marketChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bitcoin Price (USD)',
                data: priceData,
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    // Handle chart type change
    document.getElementById('chartType').addEventListener('change', function() {
        const chartType = this.value;
        let newData, newLabel;

        switch(chartType) {
            case 'volume':
                newData = volumeData;
                newLabel = 'Trading Volume (USD)';
                break;
            case 'marketCap':
                // Generate market cap data (higher than price)
                newData = priceData.map(price => price * (Math.random() * 500 + 500));
                newLabel = 'Market Cap (USD)';
                break;
            default: // price
                newData = priceData;
                newLabel = 'Bitcoin Price (USD)';
        }

        marketChart.data.datasets[0].data = newData;
        marketChart.data.datasets[0].label = newLabel;
        marketChart.update();
    });

    // Handle timeframe change
    document.getElementById('chartTimeframe').addEventListener('change', function() {
        const timeframe = this.value;
        let days;

        switch(timeframe) {
            case '7d':
                days = 7;
                break;
            case '30d':
                days = 30;
                break;
            case '1y':
                days = 365;
                break;
            default: // 1d
                days = 1;
        }

        // Update chart with new timeframe (simplified for demo)
        const newLabels = Array.from({length: days}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
        });

        // Generate new data based on timeframe
        let newPriceData;
        if (days === 1) {
            // Hourly data for 1 day
            newPriceData = Array.from({length: 24}, (_, i) => {
                const hourFactor = i < 12 ? 1 - (i / 24) : (i - 12) / 24;
                return baseValue + (Math.random() - 0.5 + hourFactor) * 500;
            });
            marketChart.data.labels = Array.from({length: 24}, (_, i) => 
                `${i}:00`
            );
        } else {
            // Daily data
            newPriceData = Array.from({length: days}, () => 
                baseValue + (Math.random() - 0.5) * 1000
            );
            marketChart.data.labels = newLabels;
        }

        marketChart.data.datasets[0].data = newPriceData;
        marketChart.update();
    });
} 