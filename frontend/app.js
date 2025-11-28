const API_BASE_URL = 'http://localhost:8000/api/v1';
let currentToken = localStorage.getItem('token');
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAlbums();
    loadTopRated();
    checkAuth();
});

// Auth Check
function checkAuth() {
    if (currentToken) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
    } else {
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'none';
    }
}

// Login
document.getElementById('loginBtn').addEventListener('click', () => {
    document.getElementById('loginModal').style.display = 'block';
});

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            currentToken = data.access_token;
            localStorage.setItem('token', currentToken);
            closeLoginModal();
            checkAuth();
            alert('✅ Login successful!');
        } else {
            alert('❌ Login failed! Check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Error connecting to server');
    }
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    currentToken = null;
    localStorage.removeItem('token');
    checkAuth();
    alert('👋 Logged out successfully');
});

// Register
function showRegisterForm() {
    closeLoginModal();
    document.getElementById('registerModal').style.display = 'block';
}

function showLoginForm() {
    closeRegisterModal();
    document.getElementById('loginModal').style.display = 'block';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        if (response.ok) {
            closeRegisterModal();
            alert('✅ Registration successful! Please login.');
            showLoginForm();
        } else {
            const error = await response.json();
            alert(`❌ Registration failed: ${error.detail}`);
        }
    } catch (error) {
        console.error('Register error:', error);
        alert('❌ Error connecting to server');
    }
}

// Load Albums
async function loadAlbums(filters = {}) {
    const grid = document.getElementById('albumsGrid');
    const spinner = document.getElementById('loadingSpinner');
    const errorMsg = document.getElementById('errorMessage');
    
    spinner.style.display = 'block';
    errorMsg.style.display = 'none';
    grid.innerHTML = '';
    
    try {
        let url = `${API_BASE_URL}/albums?skip=0&limit=20`;
        
        if (filters.region) url += `&region=${filters.region}`;
        if (filters.year) url += `&year=${filters.year}`;
        if (filters.artist) url += `&artist=${filters.artist}`;
        
        const response = await fetch(url);
        const albums = await response.json();
        
        spinner.style.display = 'none';
        
        if (albums.length === 0) {
            grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">No albums found 😔</p>';
            return;
        }
        
        albums.forEach(album => {
            grid.appendChild(createAlbumCard(album));
        });
        
    } catch (error) {
        console.error('Error loading albums:', error);
        spinner.style.display = 'none';
        errorMsg.style.display = 'block';
        errorMsg.textContent = '❌ Error loading albums. Make sure the API is running!';
    }
}

// Create Album Card
function createAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.onclick = () => showAlbumDetails(album.id);
    
    const regionClass = `region-${album.region}`;
    const regionName = album.region.replace('_', ' ').toUpperCase();
    
    card.innerHTML = `
        <img src="${album.cover_url || 'https://via.placeholder.com/300x300/1a1a1d/ff6b35?text=' + encodeURIComponent(album.title)}" 
             alt="${album.title}" 
             class="album-cover"
             onerror="this.src='https://via.placeholder.com/300x300/1a1a1d/ff6b35?text=Album+Cover'">
        <div class="album-info">
            <h3 class="album-title">${album.title}</h3>
            <p class="album-artist">${album.artist}</p>
            <span class="region-badge ${regionClass}">${regionName}</span>
            <div class="album-meta">
                <span>${album.year}</span>
                <span class="album-rating">⭐ ${album.avg_rating.toFixed(1)} (${album.total_ratings})</span>
            </div>
        </div>
    `;
    
    return card;
}

// Show Album Details
async function showAlbumDetails(albumId) {
    try {
        const response = await fetch(`${API_BASE_URL}/albums/${albumId}`);
        const album = await response.json();
        
        const modal = document.getElementById('albumModal');
        const details = document.getElementById('albumDetails');
        
        details.innerHTML = `
            <h2>${album.title}</h2>
            <img src="${album.cover_url || 'https://via.placeholder.com/400x400/1a1a1d/ff6b35?text=Album'}" 
                 alt="${album.title}" 
                 style="width:100%; max-width:400px; border-radius:10px; margin:1rem 0;">
            <p><span class="detail-label">Artist:</span> ${album.artist}</p>
            <p><span class="detail-label">Year:</span> ${album.year}</p>
            <p><span class="detail-label">Region:</span> ${album.region.replace('_', ' ').toUpperCase()}</p>
            <p><span class="detail-label">Producer:</span> ${album.producer || 'N/A'}</p>
            <p><span class="detail-label">Label:</span> ${album.label || 'N/A'}</p>
            <p><span class="detail-label">Rating:</span> ⭐ ${album.avg_rating.toFixed(2)} / 5.0 (${album.total_ratings} ratings)</p>
            <p><span class="detail-label">Description:</span></p>
            <p>${album.description || 'No description available.'}</p>
            <br>
            <button class="btn btn-primary" onclick="getSimilarAlbums(${album.id})">Similar Albums</button>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading album details:', error);
        alert('Error loading album details');
    }
}

function closeModal() {
    document.getElementById('albumModal').style.display = 'none';
}


// Similar Albums
async function getSimilarAlbums(albumId) {
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations/similar/${albumId}?limit=5`);
        const recommendations = await response.json();
        
        const details = document.getElementById('albumDetails');
        
        let html = '<h3 style="margin-top:2rem; color: var(--accent);">Similar Albums:</h3>';
        html += '<div style="display:grid; gap:1rem; margin-top:1rem;" id="similarAlbumsContainer">';
        
        recommendations.forEach((rec, index) => {
            html += `
                <div class="similar-album-card" data-album-id="${rec.album.id}" style="background: rgba(255,255,255,0.05); padding:1rem; border-radius:8px; cursor:pointer;">
                    <strong>${rec.album.artist} - ${rec.album.title}</strong> (${rec.album.year})
                    <br>
                    <small style="color: var(--accent);">Similarity: ${(rec.similarity_score * 100).toFixed(0)}%</small>
                    <br>
                    <small style="color: #888;">${rec.reason}</small>
                </div>
            `;
        });
        
        html += '</div>';
        details.innerHTML += html;
        
        // Add click listeners AFTER HTML is added
        setTimeout(() => {
            const similarCards = document.querySelectorAll('.similar-album-card');
            similarCards.forEach(card => {
                card.addEventListener('click', function() {
                    const albumId = this.getAttribute('data-album-id');
                    closeModal();
                    setTimeout(() => showAlbumDetails(albumId), 200);
                });
            });
        }, 100);
        
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

// Top Rated
async function loadTopRated() {
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations/top-rated?limit=6`);
        const albums = await response.json();
        
        const grid = document.getElementById('topRatedGrid');
        grid.innerHTML = '';
        
        albums.forEach(album => {
            grid.appendChild(createAlbumCard(album));
        });
    } catch (error) {
        console.error('Error loading top rated:', error);
    }
}

// Filters
function filterAlbums() {
    const filters = {
        region: document.getElementById('regionFilter').value,
        year: document.getElementById('yearFilter').value,
        artist: document.getElementById('artistFilter').value
    };
    
    loadAlbums(filters);
}

function resetFilters() {
    document.getElementById('regionFilter').value = '';
    document.getElementById('yearFilter').value = '';
    document.getElementById('artistFilter').value = '';
    loadAlbums();
}

// Random Album
async function getRandomAlbum() {
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations/random?era=golden_age`);
        const album = await response.json();
        showAlbumDetails(album.id);
    } catch (error) {
        console.error('Error loading random album:', error);
        alert('Error loading random album');
    }
}

// Scroll to Albums
function scrollToAlbums() {
    document.getElementById('albums').scrollIntoView({ behavior: 'smooth' });
}

// Close modals on outside click
window.onclick = function(event) {
    const albumModal = document.getElementById('albumModal');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (event.target === albumModal) {
        albumModal.style.display = 'none';
    }
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target === registerModal) {
        registerModal.style.display = 'none';
    }
}