// Configuration
const BOT_TOKEN = '8285019522:AAG7ffSafUUM9FINJSid0PoJFusL9dJkYfQ'; // Ganti dengan bot token Telegram Anda
const CHAT_ID = '5836939482'; // Ganti dengan chat ID Telegram Anda

// Global variables
let selectedPackage = null;
let selectedPrice = 0;
let selectedPayment = null;
let proofImage = null;
let musicPlaying = false;

// DOM Elements
const loader = document.getElementById('loader');
const mainContent = document.getElementById('main-content');
const backgroundMusic = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');

// Initialize website
document.addEventListener('DOMContentLoaded', function() {
    // Start loading animation
    setTimeout(() => {
        hideLoader();
    }, 4000); // 4 seconds loading time
    
    // Initialize music
    initializeMusic();
    
    // Add scroll effects
    window.addEventListener('scroll', handleScroll);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Hide loader and show main content
function hideLoader() {
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
        mainContent.classList.add('loaded');
    }, 1000);
}

// Initialize music
function initializeMusic() {
    // Auto-play music (some browsers block autoplay)
    backgroundMusic.volume = 0.3;
    
    // Try to play music automatically
    const playPromise = backgroundMusic.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            musicPlaying = true;
            musicToggle.classList.add('playing');
        }).catch(() => {
            // Auto-play was prevented
            musicPlaying = false;
        });
    }
}

// Toggle music
function toggleMusic() {
    if (musicPlaying) {
        backgroundMusic.pause();
        musicToggle.classList.remove('playing');
        musicToggle.innerHTML = '<i class="fas fa-music-slash"></i>';
        musicPlaying = false;
    } else {
        backgroundMusic.play();
        musicToggle.classList.add('playing');
        musicToggle.innerHTML = '<i class="fas fa-music"></i>';
        musicPlaying = true;
    }
}

// Scroll to packages section
function scrollToPackages() {
    const packagesSection = document.getElementById('packages');
    packagesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Handle scroll effects
function handleScroll() {
    const header = document.querySelector('.header');
    const scrollTop = window.pageYOffset;
    
    if (scrollTop > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 212, 255, 0.2)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.9)';
        header.style.boxShadow = 'none';
    }
}

// Select package
function selectPackage(packageType, price) {
    selectedPackage = packageType;
    selectedPrice = price;
    
    // Remove previous selections
    document.querySelectorAll('.package-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked package
    event.target.closest('.package-card').classList.add('selected');
    
    // Update order summary
    updateOrderSummary();
    
    // Scroll to payment section
    document.getElementById('payment').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    // Show success animation
    showNotification('Paket berhasil dipilih!', 'success');
}

// Select payment method
function selectPayment(method) {
    selectedPayment = method;
    
    // Remove previous selections
    document.querySelectorAll('.method-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked method
    event.target.closest('.method-card').classList.add('selected');
    
    // Show/hide QRIS section
    const qrisSection = document.getElementById('qris-section');
    if (method === 'qris') {
        qrisSection.style.display = 'block';
        qrisSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    } else {
        qrisSection.style.display = 'none';
    }
    
    // Update order summary
    updateOrderSummary();
    
    // Show success animation
    showNotification(`Metode pembayaran ${method.toUpperCase()} dipilih!`, 'success');
}

// Update order summary
function updateOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    const packageElement = document.getElementById('selected-package');
    const priceElement = document.getElementById('selected-price');
    const paymentElement = document.getElementById('selected-payment');
    
    if (selectedPackage && selectedPayment) {
        const packageNames = {
            'simple': 'Murid Website Simple',
            'medium': 'Murid Website Medium',
            'hard': 'Murid Website Hard'
        };
        
        packageElement.textContent = packageNames[selectedPackage];
        priceElement.textContent = selectedPrice.toLocaleString('id-ID');
        paymentElement.textContent = selectedPayment.toUpperCase();
        
        orderSummary.style.display = 'block';
        orderSummary.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// Preview uploaded image
function previewImage(input) {
    const preview = document.getElementById('image-preview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Bukti Transfer" style="max-width: 300px; height: auto; border-radius: 10px; border: 2px solid #00d4ff; margin-top: 20px;">
                <p style="color: #00ff88; margin-top: 10px;"><i class="fas fa-check-circle"></i> Bukti transfer berhasil diupload!</p>
            `;
            proofImage = e.target.result;
        };
        
        reader.readAsDataURL(input.files[0]);
        showNotification('Bukti transfer berhasil diupload!', 'success');
    }
}

// Process order and send to Telegram
async function processOrder() {
    if (!selectedPackage || !selectedPayment) {
        showNotification('Silakan pilih paket dan metode pembayaran terlebih dahulu!', 'error');
        return;
    }
    
    if (!proofImage) {
        showNotification('Silakan upload bukti transfer terlebih dahulu!', 'error');
        return;
    }
    
    // Show loading state
    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalText = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim pesanan...';
    checkoutBtn.disabled = true;
    
    try {
        const packageNames = {
            'simple': 'Murid Website Simple',
            'medium': 'Murid Website Medium',
            'hard': 'Murid Website Hard'
        };
        
        const paymentMethods = {
            'dana': 'DANA - 082365899638',
            'ovo': 'OVO - 082365899638',
            'gopay': 'GOPAY - 082365899638',
            'qris': 'QRIS - Scan QR Code'
        };
        
        const orderDetails = `
🛍️ *PESANAN BARU - KIRYZZ STORE*

📦 *Paket:* ${packageNames[selectedPackage]}
💰 *Harga:* Rp ${selectedPrice.toLocaleString('id-ID')}
💳 *Pembayaran:* ${paymentMethods[selectedPayment]}

📅 *Tanggal:* ${new Date().toLocaleDateString('id-ID')}
⏰ *Waktu:* ${new Date().toLocaleTimeString('id-ID')}

✅ *Status:* Menunggu konfirmasi bukti transfer

🎯 *Keuntungan yang didapat:*
${selectedPackage === 'simple' ? '• Tutorial 1-5' : ''}
${selectedPackage === 'medium' ? '• Tutorial 1-9' : ''}
${selectedPackage === 'hard' ? '• Tutorial 1-12' : ''}
• Bimbingan sampai bisa
• File HTML, CSS, JavaScript
• Cara rename dan deploy

📞 *Kontak Customer:* Segera hubungi untuk konfirmasi!
        `;
        
        // Send message to Telegram
        await sendToTelegram(orderDetails);
        
        // Show success message
        showNotification('Pesanan berhasil dikirim ke Telegram! Silakan tunggu konfirmasi.', 'success');
        
        // Reset form
        resetForm();
        
    } catch (error) {
        console.error('Error sending order:', error);
        showNotification('Terjadi kesalahan saat mengirim pesanan. Silakan coba lagi.', 'error');
    } finally {
        // Reset button
        checkoutBtn.innerHTML = originalText;
        checkoutBtn.disabled = false;
    }
}

// Send message to Telegram
async function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const data = {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Failed to send message to Telegram');
    }
    
    return response.json();
}

// Reset form after successful order
function resetForm() {
    selectedPackage = null;
    selectedPrice = 0;
    selectedPayment = null;
    proofImage = null;
    
    // Remove selections
    document.querySelectorAll('.package-card, .method-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Clear image preview
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('proof-upload').value = '';
    
    // Hide sections
    document.getElementById('order-summary').style.display = 'none';
    document.getElementById('qris-section').style.display = 'none';
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${type === 'success' ? 'linear-gradient(45deg, #00ff88, #00d4ff)' : type === 'error' ? 'linear-gradient(45deg, #ff6b6b, #ff4757)' : 'linear-gradient(45deg, #00d4ff, #0066ff)'};
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
        }
        
        .notification-content i {
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(style);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.5s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 5000);
}

// Add particle effects on click
document.addEventListener('click', function(e) {
    createClickEffect(e.clientX, e.clientY);
});

function createClickEffect(x, y) {
    const particles = [];
    const colors = ['#00d4ff', '#0066ff', '#00ff88', '#ffffff'];
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${x}px;
            top: ${y}px;
        `;
        
        document.body.appendChild(particle);
        
        const angle = (i / 8) * Math.PI * 2;
        const velocity = 100 + Math.random() * 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let px = x;
        let py = y;
        let opacity = 1;
        
        const animate = () => {
            px += vx * 0.02;
            py += vy * 0.02;
            opacity -= 0.03;
            
            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                document.body.removeChild(particle);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Add typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
setTimeout(() => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 100);
    }
}, 4500);

// Add floating animation to packages
function addFloatingAnimation() {
    const packageCards = document.querySelectorAll('.package-card');
    
    packageCards.forEach((card, index) => {
        card.style.animation = `float 3s ease-in-out infinite ${index * 0.5}s`;
    });
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-10px);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize floating animation
setTimeout(addFloatingAnimation, 5000);

// Add smooth reveal animation for sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
setTimeout(() => {
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.8s ease-out';
        observer.observe(section);
    });
}, 4000);

// Add payment method auto-redirect functionality
function autoRedirectPayment(method) {
    const phoneNumber = '082365899638';
    const packageNames = {
        'simple': 'Murid Website Simple',
        'medium': 'Murid Website Medium', 
        'hard': 'Murid Website Hard'
    };
    
    const message = encodeURIComponent(`Halo, saya ingin membeli ${packageNames[selectedPackage]} seharga Rp ${selectedPrice.toLocaleString('id-ID')} melalui ${method.toUpperCase()}`);
    
    let redirectUrl = '';
    
    switch(method) {
        case 'dana':
            redirectUrl = `https://link.dana.id/qr/${phoneNumber}`;
            break;
        case 'ovo':
            redirectUrl = `https://ovo.id/app/payment?phone=${phoneNumber}&amount=${selectedPrice}&note=${message}`;
            break;
        case 'gopay':
            redirectUrl = `https://gojek.com/gopay/transfer?phone=${phoneNumber}&amount=${selectedPrice}&note=${message}`;
            break;
        case 'qris':
            // Show QRIS code instead of redirect
            return;
    }
    
    if (redirectUrl && confirm(`Redirect ke aplikasi ${method.toUpperCase()}?`)) {
        window.open(redirectUrl, '_blank');
    }
}

// Enhanced selectPayment function with auto-redirect
const originalSelectPayment = selectPayment;
selectPayment = function(method) {
    originalSelectPayment(method);
    
    // Add auto-redirect option
    setTimeout(() => {
        if (selectedPackage && confirm(`Ingin langsung membuka aplikasi ${method.toUpperCase()}?`)) {
            autoRedirectPayment(method);
        }
    }, 1000);
};

console.log('🚀 Kiryzz Store initialized successfully!');
console.log('🎵 Background music ready');
console.log('❄️ Snow effects active');
console.log('📱 Telegram integration ready');
console.log('💳 Payment methods configured');
console.log('✨ All animations loaded');