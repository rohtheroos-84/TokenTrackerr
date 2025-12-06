document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const categoryFilter = document.getElementById('categoryFilter');
    const timeFilter = document.getElementById('timeFilter');
    const newsSearch = document.getElementById('newsSearch');
    const newsGrid = document.getElementById('newsGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const newsletterForm = document.getElementById('newsletterForm');
    const filterBtn = document.getElementById('filterBtn');
    const activeFilters = document.getElementById('activeFilters');
    const viewControls = document.querySelectorAll('.view-btn');

    // State Management
    let currentPage = 1;
    let currentView = 'grid';
    const itemsPerPage = 6;
    let activeFilterTags = new Set();

    // Dark Mode Toggle
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // Extended Sample News Data
    const sampleNews = [
        {
            title: "Major Bank Announces Crypto Custody Service",
            category: "adoption",
            summary: "Leading financial institution launches digital asset custody solution for institutional clients, marking a significant step in crypto adoption.",
            image: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f",
            timestamp: "3 hours ago",
            author: "Michael Chang",
            readTime: "5 min read"
        },
        {
            title: "New Crypto Regulation Framework Proposed",
            category: "regulation",
            summary: "Government officials outline comprehensive regulatory framework for cryptocurrency markets, focusing on investor protection and market stability.",
            image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
            timestamp: "5 hours ago",
            author: "Emily Parker",
            readTime: "8 min read"
        },
        {
            title: "DeFi Protocol Sets New TVL Record",
            category: "defi",
            summary: "Leading decentralized finance platform reaches unprecedented milestone in total value locked, signaling growing confidence in DeFi sector.",
            image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d",
            timestamp: "6 hours ago",
            author: "David Wilson",
            readTime: "4 min read"
        },
        {
            title: "Revolutionary Layer 2 Solution Unveiled",
            category: "technology",
            summary: "New scaling solution promises faster and cheaper transactions on Ethereum network, addressing key scalability challenges.",
            image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0",
            timestamp: "8 hours ago",
            author: "Sarah Lee",
            readTime: "6 min read"
        },
        {
            title: "Mining Difficulty Reaches All-Time High",
            category: "mining",
            summary: "Bitcoin mining difficulty adjusts upward as hash rate continues to climb, reflecting growing network security.",
            image: "https://images.unsplash.com/photo-1516245834210-c4c142787335",
            timestamp: "12 hours ago",
            author: "Robert Chen",
            readTime: "5 min read"
        },
        {
            title: "Ethereum Staking Reaches New Milestone",
            category: "technology",
            summary: "Total ETH staked surpasses 30 million as more validators join the network, strengthening Ethereum's proof-of-stake consensus.",
            image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05",
            timestamp: "2 hours ago",
            author: "Lisa Wang",
            readTime: "4 min read"
        },
        {
            title: "Major DEX Launches Cross-Chain Bridge",
            category: "defi",
            summary: "Leading decentralized exchange introduces innovative cross-chain bridge solution, enabling seamless asset transfers across multiple blockchains.",
            image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0",
            timestamp: "4 hours ago",
            author: "James Rodriguez",
            readTime: "7 min read"
        },
        {
            title: "Central Bank Digital Currency Pilot Program Expands",
            category: "regulation",
            summary: "National central bank extends CBDC testing to include more financial institutions and use cases, signaling progress in digital currency adoption.",
            image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
            timestamp: "7 hours ago",
            author: "Maria Garcia",
            readTime: "6 min read"
        },
        {
            title: "Gaming Studio Launches Blockchain Integration",
            category: "adoption",
            summary: "Major gaming publisher announces blockchain integration for in-game assets and rewards, bridging traditional gaming with web3 technology.",
            image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41",
            timestamp: "9 hours ago",
            author: "Tom Anderson",
            readTime: "5 min read"
        },
        {
            title: "New Smart Contract Language Unveiled",
            category: "technology",
            summary: "Innovative programming language for smart contracts promises enhanced security and easier development, potentially revolutionizing blockchain applications.",
            image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb",
            timestamp: "11 hours ago",
            author: "Nina Patel",
            readTime: "8 min read"
        },
        {
            title: "DeFi Insurance Protocol Launches",
            category: "defi",
            summary: "New decentralized insurance platform offers coverage for smart contract risks and protocol failures, enhancing DeFi ecosystem security.",
            image: "https://images.unsplash.com/photo-1563986768609-322da13575f3",
            timestamp: "15 hours ago",
            author: "Ryan Kim",
            readTime: "5 min read"
        },
        {
            title: "Crypto Payment Integration for E-commerce Giant",
            category: "adoption",
            summary: "Major online retailer announces cryptocurrency payment acceptance across its platform, potentially reaching millions of customers.",
            image: "https://images.unsplash.com/photo-1556742111-a301076d9d18",
            timestamp: "16 hours ago",
            author: "Sophie Chen",
            readTime: "4 min read"
        }
    ];

    // Populate News Grid
    function populateNewsGrid(news) {
        const newsHTML = news.map(item => `
            <article class="news-card">
                <img src="${item.image}" alt="${item.title}">
                <div class="card-content">
                    <div class="card-tags">
                        <span class="category ${item.category}">${item.category}</span>
                        ${item.readTime ? `<span class="read-time"><i class="far fa-clock"></i> ${item.readTime}</span>` : ''}
                    </div>
                    <h3>${item.title}</h3>
                    <p>${item.summary}</p>
                    <div class="card-footer">
                        <div class="meta-info">
                            <span class="timestamp"><i class="far fa-clock"></i> ${item.timestamp}</span>
                            <span class="author"><i class="far fa-user"></i> ${item.author}</span>
                        </div>
                        <button class="read-more">Read More <i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>
            </article>
        `).join('');

        newsGrid.innerHTML = newsHTML;
        updateGridView();
    }

    // Update Grid View
    function updateGridView() {
        newsGrid.className = `news-grid view-${currentView}`;
    }

    // Filter News
    function filterNews() {
        const category = categoryFilter.value;
        const timeframe = timeFilter.value;
        const searchTerm = newsSearch.value.toLowerCase();

        const filteredNews = sampleNews.filter(item => {
            const categoryMatch = category === 'all' || item.category === category;
            const titleMatch = item.title.toLowerCase().includes(searchTerm);
            const summaryMatch = item.summary.toLowerCase().includes(searchTerm);
            return categoryMatch && (titleMatch || summaryMatch);
        });

        populateNewsGrid(filteredNews);
        updateActiveFilters();
    }

    // Update Active Filters
    function updateActiveFilters() {
        const filters = [];
        if (categoryFilter.value !== 'all') {
            filters.push({
                type: 'category',
                value: categoryFilter.value
            });
        }
        if (timeFilter.value !== '24h') {
            filters.push({
                type: 'time',
                value: timeFilter.value
            });
        }
        if (newsSearch.value) {
            filters.push({
                type: 'search',
                value: newsSearch.value
            });
        }

        const filterHTML = filters.map(filter => `
            <span class="filter-tag">
                ${filter.type}: ${filter.value}
                <button onclick="removeFilter('${filter.type}')" class="remove-filter">×</button>
            </span>
        `).join('');

        activeFilters.innerHTML = filterHTML;
    }

    // Remove Filter
    window.removeFilter = function(type) {
        switch(type) {
            case 'category':
                categoryFilter.value = 'all';
                break;
            case 'time':
                timeFilter.value = '24h';
                break;
            case 'search':
                newsSearch.value = '';
                break;
        }
        filterNews();
    };

    // Event Listeners
    filterBtn.addEventListener('click', filterNews);
    
    viewControls.forEach(btn => {
        btn.addEventListener('click', () => {
            viewControls.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            updateGridView();
        });
    });

    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        // In a real app, this would fetch more news from an API
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        setTimeout(() => {
            loadMoreBtn.innerHTML = 'Load More <i class="fas fa-sync"></i>';
        }, 1000);
    });

    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        // In a real app, this would submit to a backend
        alert('Thank you for subscribing to our newsletter!');
        e.target.reset();
    });

    // Initialize Breaking News Ticker
    const tickerContent = document.querySelector('.ticker-content');
    if (tickerContent) {
        tickerContent.addEventListener('animationend', () => {
            tickerContent.style.animation = 'none';
            void tickerContent.offsetWidth; // Trigger reflow
            tickerContent.style.animation = 'tickerScroll 30s linear infinite';
        });
    }

    // Initialize
    populateNewsGrid(sampleNews);
}); 