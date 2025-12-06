// API endpoint for cryptocurrency data
const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h';

// Fallback data in case the API fails
const fallbackTrendingCoins = [
    {
        rank: 1,
        name: "Bitcoin",
        symbol: "BTC",
        price: 61245.89,
        change: 2.34,
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
    },
    {
        rank: 2,
        name: "Ethereum",
        symbol: "ETH",
        price: 3186.92,
        change: -1.25,
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
    },
    {
        rank: 3,
        name: "Tether",
        symbol: "USDT",
        price: 1.00,
        change: 0.01,
        image: "https://assets.coingecko.com/coins/images/325/large/Tether-logo.png"
    },
    {
        rank: 4,
        name: "BNB",
        symbol: "BNB",
        price: 567.12,
        change: 3.45,
        image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png"
    },
    {
        rank: 5,
        name: "Solana",
        symbol: "SOL",
        price: 138.47,
        change: 5.12,
        image: "https://assets.coingecko.com/coins/images/4128/large/solana.png"
    },
    {
        rank: 6,
        name: "XRP",
        symbol: "XRP",
        price: 0.5239,
        change: -2.15,
        image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png"
    },
    {
        rank: 7,
        name: "USD Coin",
        symbol: "USDC",
        price: 1.00,
        change: 0.00,
        image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png"
    }
];

// Initialize trending data
let trendingCoins = [];

// Format number function
function formatNumber(num) {
    if (num >= 1e9) {
        return '$' + (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
        return '$' + (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
        return '$' + (num / 1e3).toFixed(2) + 'K';
    } else if (num === 0) {
        return '$0.00';
    } else if (num < 0.01) {
        return '$' + num.toFixed(5);
    } else {
        return '$' + num.toFixed(2);
    }
}

// Fetch cryptocurrency data
async function fetchCryptocurrencyData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Transform API data to match our expected format
        trendingCoins = data.slice(0, 7).map((coin, index) => {
            return {
                rank: index + 1,
                name: coin.name,
                symbol: coin.symbol.toUpperCase(),
                price: coin.current_price,
                change: coin.price_change_percentage_24h,
                image: coin.image
            };
        });
        
        // Update the table with real data
        updateTrendingTable(trendingCoins);
    } catch (error) {
        console.error('Error fetching data:', error);
        // Use fallback data if API fails
        trendingCoins = fallbackTrendingCoins;
        updateTrendingTable(trendingCoins);
    }
}

// Create trending section with header and search
function createTrendingSection() {
    const trendingSection = document.getElementById('trending-section');
    if (!trendingSection) return;
    
    trendingSection.innerHTML = '';
    trendingSection.className = 'trending-section';
    
    // Create section header with icon and title
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    
    // Create title with chart icon
    const title = document.createElement('h2');
    title.className = 'section-title';
    title.style.display = 'flex';
    title.style.alignItems = 'center';
    title.style.gap = '10px';
    
    // Add chart icon
    const chartIcon = document.createElement('img');
    chartIcon.src = 'https://img.icons8.com/fluency/48/financial-growth.png';
    chartIcon.alt = 'Chart';
    chartIcon.style.width = '32px';
    chartIcon.style.height = '32px';
    
    title.appendChild(document.createTextNode('📈 Trending Cryptocurrencies'));
    
    sectionHeader.appendChild(title);
    
    // Create search input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'cryptoSearch';
    searchInput.placeholder = 'Search cryptocurrency...';
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        const filteredCoins = trendingCoins.filter(coin => 
            coin.name.toLowerCase().includes(searchText) || 
            coin.symbol.toLowerCase().includes(searchText)
        );
        updateTrendingTable(filteredCoins);
    });
    
    searchContainer.appendChild(searchInput);
    sectionHeader.appendChild(searchContainer);
    
    // Add section header to trending section
    trendingSection.appendChild(sectionHeader);
    
    // Create table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    
    // Create table element
    const table = document.createElement('table');
    table.className = 'trending-table';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th style="text-align: center; width: 60px;">Rank</th>
            <th style="text-align: left;">Name</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">24h Change</th>
        </tr>
    `;
    
    // Create table body
    const tbody = document.createElement('tbody');
    tbody.id = 'trending-tbody';
    
    // Assemble table
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    
    // Add table to trending section
    trendingSection.appendChild(tableContainer);
}

// Update trending table with data
function updateTrendingTable(coins) {
    const tbody = document.getElementById('trending-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    coins.forEach((coin, index) => {
        const row = document.createElement('tr');
        row.style.backgroundColor = index % 2 === 1 ? 'rgba(30, 10, 60, 0.4)' : 'transparent';
        
        // Create cell for rank
        const rankCell = document.createElement('td');
        rankCell.textContent = coin.rank;
        rankCell.style.textAlign = 'center';
        
        // Create cell for coin info (name, symbol, and image)
        const nameCell = document.createElement('td');
        const coinInfo = document.createElement('div');
        coinInfo.className = 'coin-info';
        
        const img = document.createElement('img');
        img.src = coin.image;
        img.alt = coin.name;
        img.style.width = '32px';
        img.style.height = '32px';
        img.style.borderRadius = '50%';
        
        const nameContainer = document.createElement('div');
        nameContainer.style.display = 'flex';
        nameContainer.style.flexDirection = 'column';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'coin-name';
        nameSpan.textContent = coin.name;
        nameSpan.style.fontWeight = '500';
        nameSpan.style.fontSize = '1.1rem';
        
        const symbolSpan = document.createElement('span');
        symbolSpan.className = 'coin-symbol';
        symbolSpan.textContent = coin.symbol;
        symbolSpan.style.color = 'rgba(255, 255, 255, 0.5)';
        symbolSpan.style.fontSize = '0.9em';
        
        nameContainer.appendChild(nameSpan);
        nameContainer.appendChild(symbolSpan);
        
        coinInfo.appendChild(img);
        coinInfo.appendChild(nameContainer);
        nameCell.appendChild(coinInfo);
        
        // Create cell for price
        const priceCell = document.createElement('td');
        priceCell.textContent = formatNumber(coin.price);
        priceCell.style.textAlign = 'right';
        
        // Create cell for 24h change
        const changeCell = document.createElement('td');
        changeCell.textContent = `${coin.change >= 0 ? '+' : ''}${coin.change.toFixed(2)}%`;
        changeCell.className = coin.change >= 0 ? 'positive' : 'negative';
        changeCell.style.textAlign = 'right';
        
        // Add cells to row
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(priceCell);
        row.appendChild(changeCell);
        
        // Add row to tbody
        tbody.appendChild(row);
    });
}

// Initialize trending section when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    createTrendingSection();
    fetchCryptocurrencyData();
}); 