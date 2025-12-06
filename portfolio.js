document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode from localStorage
    initDarkMode();

    // DOM Elements
    const addHoldingBtn = document.getElementById('addHoldingBtn');
    const addAssetModal = document.getElementById('addAssetModal');
    const addAssetForm = document.getElementById('addAssetForm');
    const holdingsSearch = document.getElementById('holdingsSearch');
    const assetSelect = document.getElementById('assetSelect');
    const holdingsTableBody = document.getElementById('holdingsTableBody');
    const totalBalance = document.getElementById('totalBalance');
    const totalPnL = document.getElementById('totalPnL');
    const assetCount = document.getElementById('assetCount');
    const assetDistribution = document.getElementById('assetDistribution');
    const transactionList = document.getElementById('transactionList');

    // State
    let portfolioData = [];
    let cryptoData = new Map(); // For storing real-time price data
    
    // Load portfolio data from localStorage - check both formats
    function loadPortfolioData() {
        // First check if data exists in the new format from market.js
        const portfolioFromMarket = JSON.parse(localStorage.getItem('portfolio') || '[]');
        
        // Then check if data exists in the original format
        const originalPortfolio = JSON.parse(localStorage.getItem('portfolioData') || '{"holdings":[]}');
        
        // Merge data if both exist
        if (portfolioFromMarket.length > 0) {
            portfolioData = portfolioFromMarket;
            console.log('Loaded portfolio data from market:', portfolioData);
        } else if (originalPortfolio.holdings.length > 0) {
            portfolioData = originalPortfolio.holdings;
            console.log('Loaded portfolio data from original format:', portfolioData);
        }
    }

    // API Configuration
    const COINGECKO_API = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&price_change_percentage=24h';

    // Fetch current cryptocurrency data
    async function fetchCryptoData() {
        try {
            const response = await fetch(COINGECKO_API);
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            data.forEach(coin => {
                cryptoData.set(coin.id, {
                    name: coin.name,
                    symbol: coin.symbol.toUpperCase(),
                    price: coin.current_price,
                    change24h: coin.price_change_percentage_24h,
                    logo: coin.image
                });
            });

            // Populate asset select
            populateAssetSelect();
            
            // Update portfolio display
            updatePortfolioDisplay();
        } catch (error) {
            console.error('Error fetching data:', error);
            // Use fallback data if API fails
            updatePortfolioDisplay();
        }
    }

    // Update portfolio display with current data
    function updatePortfolioDisplay() {
        if (!portfolioData || portfolioData.length === 0) {
            displayEmptyPortfolio();
            return;
        }

        let totalValue = 0;
        let totalInvested = 0;
        let tempPortfolio = [...portfolioData]; // Create a working copy
        
        // Update each asset with current price data
        tempPortfolio.forEach(asset => {
            const coinData = cryptoData.get(asset.id);
            
            if (coinData) {
                // Update with current price
                asset.currentPrice = coinData.price;
                asset.currentValue = asset.quantity * coinData.price;
                asset.profitLoss = asset.currentValue - asset.totalInvested;
                asset.profitLossPercent = (asset.profitLoss / asset.totalInvested) * 100;
                
                // Add to totals
                totalValue += asset.currentValue;
                totalInvested += asset.totalInvested;
            } else {
                // If we can't find current data, use the saved price
                asset.currentPrice = asset.purchasePrice || asset.averagePrice;
                asset.currentValue = asset.quantity * asset.currentPrice;
                asset.profitLoss = 0;
                asset.profitLossPercent = 0;
                
                totalValue += asset.currentValue;
                totalInvested += asset.totalInvested;
            }
        });
        
        // Update summary cards
        totalBalance.textContent = formatCurrency(totalValue);
        
        const totalProfitLoss = totalValue - totalInvested;
        totalPnL.textContent = `${totalProfitLoss >= 0 ? '+' : ''}${formatCurrency(totalProfitLoss)} (${((totalProfitLoss / totalInvested) * 100).toFixed(2)}%)`;
        totalPnL.className = totalProfitLoss >= 0 ? 'positive' : 'negative';
        
        assetCount.textContent = tempPortfolio.length;
        
        // Update holdings table
        updateHoldingsTable(tempPortfolio);
        
        // Update asset distribution
        updateAssetDistribution(tempPortfolio, totalValue);
        
        // Update transaction history (placeholder)
        updateTransactionHistory();
    }
    
    // Display empty portfolio state
    function displayEmptyPortfolio() {
        totalBalance.textContent = '$0.00';
        totalPnL.textContent = '$0.00';
        assetCount.textContent = '0';
        
        holdingsTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px;">
                    <p>Your portfolio is empty.</p>
                    <button class="primary-btn" style="margin-top: 15px;" id="emptyAddAssetBtn">+ Add Your First Asset</button>
                </td>
            </tr>
        `;
        
        // Add event listener for the empty state button
        document.getElementById('emptyAddAssetBtn')?.addEventListener('click', () => {
            addAssetModal.style.display = 'block';
        });
        
        assetDistribution.innerHTML = `<p style="text-align: center; padding: 20px;">No assets to display.</p>`;
        transactionList.innerHTML = `<p style="text-align: center; padding: 20px;">No transactions to display.</p>`;
    }
    
    // Update holdings table
    function updateHoldingsTable(portfolio) {
        const searchTerm = holdingsSearch?.value?.toLowerCase() || '';
        
        const filteredHoldings = portfolio.filter(asset =>
            asset.name.toLowerCase().includes(searchTerm) ||
            asset.symbol.toLowerCase().includes(searchTerm)
        );

        if (filteredHoldings.length === 0) {
            holdingsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">
                        No matching assets found.
                    </td>
                </tr>
            `;
            return;
        }

        holdingsTableBody.innerHTML = filteredHoldings.map(asset => {
            return `
                <tr>
                    <td>
                        <div class="coin-info">
                            <img src="${asset.image}" alt="${asset.symbol}" style="width: 32px; height: 32px; border-radius: 50%;">
                            <div>
                                <span class="coin-name">${asset.name}</span>
                                <span class="coin-symbol">${asset.symbol}</span>
                            </div>
                        </div>
                    </td>
                    <td>${asset.quantity}</td>
                    <td>${formatCurrency(asset.averagePrice)}</td>
                    <td>${formatCurrency(asset.currentPrice || asset.averagePrice)}</td>
                    <td>${formatCurrency(asset.currentValue || (asset.quantity * asset.averagePrice))}</td>
                    <td class="${asset.profitLoss >= 0 ? 'positive' : 'negative'}">
                        ${asset.profitLoss >= 0 ? '+' : ''}${formatCurrency(asset.profitLoss || 0)} 
                        (${asset.profitLossPercent >= 0 ? '+' : ''}${(asset.profitLossPercent || 0).toFixed(2)}%)
                    </td>
                    <td>
                        <button class="action-btn" onclick="editAsset('${asset.id}')">Edit</button>
                        <button class="action-btn" onclick="removeAsset('${asset.id}')">Remove</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // Update asset distribution
    function updateAssetDistribution(portfolio, totalValue) {
        if (!portfolio || portfolio.length === 0) {
            assetDistribution.innerHTML = `<p style="text-align: center;">No assets to display.</p>`;
            return;
        }
        
        // Sort by value, highest first
        const sortedAssets = [...portfolio].sort((a, b) => 
            (b.currentValue || 0) - (a.currentValue || 0)
        );
        
        assetDistribution.innerHTML = sortedAssets.map(asset => {
            const percentage = ((asset.currentValue / totalValue) * 100).toFixed(2);
            return `
                <div class="distribution-item">
                    <div class="asset-info">
                        <img src="${asset.image}" alt="${asset.symbol}" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span>${asset.symbol}</span>
                    </div>
                    <div class="distribution-bar">
                        <div class="distribution-fill" style="width: ${percentage}%;"></div>
                    </div>
                    <div class="distribution-percentage">${percentage}%</div>
                </div>
            `;
        }).join('');
    }
    
    // Update transaction history (placeholder)
    function updateTransactionHistory() {
        // Simple placeholder for now
        transactionList.innerHTML = `
            <p style="text-align: center; padding: 20px;">
                Transaction history feature coming soon.
            </p>
        `;
    }

    // Populate asset select dropdown for "Add Asset" modal
    function populateAssetSelect() {
        if (!assetSelect) return;
        
        const options = Array.from(cryptoData.entries()).map(([id, coin]) =>
            `<option value="${id}">${coin.name} (${coin.symbol})</option>`
        );
        assetSelect.innerHTML = '<option value="">Choose an asset...</option>' + options.join('');
    }

    // Format currency with appropriate decimal places
    function formatCurrency(value) {
        if (value === undefined || value === null) return '$0.00';
        
        value = Number(value);
        if (isNaN(value)) return '$0.00';
        
        // For small values, show more decimal places
        const decimalPlaces = value < 1 ? 6 : 2;
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: decimalPlaces
        }).format(value);
    }

    // Event Listeners
    addHoldingBtn?.addEventListener('click', () => {
        addAssetModal.style.display = 'block';
    });

    document.querySelector('.close-modal')?.addEventListener('click', () => {
        addAssetModal.style.display = 'none';
    });

    window.onclick = (event) => {
        if (event.target === addAssetModal) {
            addAssetModal.style.display = 'none';
        }
    };

    addAssetForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = assetSelect.value;
        if (!id) {
            alert('Please select an asset.');
            return;
        }
        
        const coin = cryptoData.get(id);
        if (!coin) {
            alert('Error: Selected asset data not found.');
            return;
        }
        
        const quantity = parseFloat(document.getElementById('assetAmount').value);
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
        
        if (isNaN(quantity) || quantity <= 0 || isNaN(purchasePrice) || purchasePrice <= 0) {
            alert('Please enter valid quantity and price values.');
            return;
        }
        
        // Create new asset entry
        const newAsset = {
            id,
            name: coin.name,
            symbol: coin.symbol,
            quantity: quantity,
            purchasePrice: purchasePrice,
            averagePrice: purchasePrice,
            totalInvested: quantity * purchasePrice,
            image: coin.logo,
            dateAdded: new Date().toISOString()
        };
        
        // Check if asset already exists in portfolio
        const existingAssetIndex = portfolioData.findIndex(asset => asset.id === id);
        
        if (existingAssetIndex >= 0) {
            // Update existing asset
            const existingAsset = portfolioData[existingAssetIndex];
            const newTotalQuantity = existingAsset.quantity + quantity;
            const newTotalInvested = existingAsset.totalInvested + (quantity * purchasePrice);
            
            existingAsset.quantity = newTotalQuantity;
            existingAsset.totalInvested = newTotalInvested;
            existingAsset.averagePrice = newTotalInvested / newTotalQuantity;
        } else {
            // Add new asset
            portfolioData.push(newAsset);
        }
        
        // Save to localStorage
        localStorage.setItem('portfolio', JSON.stringify(portfolioData));
        
        // Update UI
        updatePortfolioDisplay();
        
        // Close modal and reset form
        addAssetModal.style.display = 'none';
        addAssetForm.reset();
    });

    holdingsSearch?.addEventListener('input', () => updatePortfolioDisplay());

    // Make edit and remove functions available globally
    window.editAsset = function(assetId) {
        alert('Edit functionality will be implemented in a future update.');
    };
    
    window.removeAsset = function(assetId) {
        if (confirm('Are you sure you want to remove this asset from your portfolio?')) {
            portfolioData = portfolioData.filter(asset => asset.id !== assetId);
            localStorage.setItem('portfolio', JSON.stringify(portfolioData));
            updatePortfolioDisplay();
        }
    };
    
    // Initialize
    loadPortfolioData();
    fetchCryptoData();
    
    // Refresh crypto data periodically
    setInterval(fetchCryptoData, 60000); // Every minute
});

// Handle dark mode
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
