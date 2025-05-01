// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartPanel = document.querySelector('.cart-panel');
let cartIcon = document.querySelector('.cart-icon');
let cartCount = document.querySelector('.cart-count');
let cartItems = document.querySelector('.cart-items');
let cartTotal = document.querySelector('.cart-total');
let continueShoppingBtn = document.querySelector('.continue-shopping');
let checkoutBtn = document.querySelector('.checkout-btn');

function initializeCart() {
    // Load cart from localStorage
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCart();

    // Toggle cart panel
    cartIcon?.addEventListener('click', () => {
        cartPanel.classList.toggle('show');
    });

    // Close cart panel when clicking continue shopping
    continueShoppingBtn?.addEventListener('click', () => {
        cartPanel.classList.remove('show');
    });

    // Add to cart functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const card = e.target.closest('.product-card');
            const product = {
                name: card.querySelector('h3').textContent,
                price: parseFloat(card.querySelector('.price').textContent.replace('$', '')),
                image: card.querySelector('img').src
            };
            
            cart.push(product);
            updateCart();
            saveCart();
            
            // Show success animation
            const successIcon = document.createElement('div');
            successIcon.className = 'add-success';
            successIcon.innerHTML = '<i class="fas fa-check"></i>';
            card.appendChild(successIcon);
            
            setTimeout(() => successIcon.remove(), 100);
        }
    });

    // Remove item from cart
    cartItems?.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const item = e.target.closest('.cart-item');
            const index = Array.from(cartItems.children).indexOf(item);
            cart.splice(index, 1);
            updateCart();
            saveCart();
        }
    });

    function updateCart() {
        if (!cartCount || !cartItems || !cartTotal) return;
        
        cartCount.textContent = cart.length;
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="price">$${item.price.toFixed(2)}</div>
                </div>
                <button class="remove-item">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}

// Initialize slider functionality
function initializeSlider() {
    const slider = document.querySelector('.product-slider');
    if (!slider) return;

    const track = slider.querySelector('.slider-track');
    const slides = track.children;
    const prevBtn = slider.querySelector('.prev');
    const nextBtn = slider.querySelector('.next');
    const dotsContainer = slider.querySelector('.slider-dots');
    
    let currentSlide = 0;
    const slidesToShow = window.innerWidth < 768 ? 1 : 3;
    const totalSlides = Math.ceil(slides.length / slidesToShow);
    
    // Create dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dotsContainer.appendChild(dot);
    }
    
    const dots = dotsContainer.children;
    dots[0].classList.add('active');
    
    // Update slider position with smooth animation
    function updateSlider(animate = true) {
        const slideWidth = slides[0].offsetWidth + parseInt(getComputedStyle(slides[0]).marginRight);
        if (animate) {
            track.style.transition = 'transform 0.5s ease-in-out';
        } else {
            track.style.transition = 'none';
        }
        track.style.transform = `translateX(-${currentSlide * slideWidth * slidesToShow}px)`;
        
        // Update dots
        Array.from(dots).forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
        
        // Update button states
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }
    
    // Event listeners
    prevBtn?.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    });
    
    nextBtn?.addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlider();
        }
    });
    
    // Dot navigation
    dotsContainer?.addEventListener('click', (e) => {
        if (e.target.classList.contains('dot')) {
            currentSlide = Array.from(dots).indexOf(e.target);
            updateSlider();
        }
    });
    
    // Touch support with improved sensitivity
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    
    track?.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        isDragging = true;
        track.style.transition = 'none';
    });
    
    track?.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        touchEndX = e.touches[0].clientX;
        const diff = touchStartX - touchEndX;
        const slideWidth = slides[0].offsetWidth + parseInt(getComputedStyle(slides[0]).marginRight);
        const currentOffset = -currentSlide * slideWidth * slidesToShow;
        track.style.transform = `translateX(${currentOffset - diff}px)`;
    });
    
    track?.addEventListener('touchend', () => {
        isDragging = false;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentSlide < totalSlides - 1) {
                currentSlide++;
            } else if (diff < 0 && currentSlide > 0) {
                currentSlide--;
            }
        }
        updateSlider();
    });
    
    // Initialize slider position
    updateSlider(false);
    
    // Update on resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newSlidesToShow = window.innerWidth < 768 ? 1 : 3;
            if (newSlidesToShow !== slidesToShow) {
                location.reload();
            }
        }, 250);
    });
    
    // Auto advance slides with fade transition
    let autoplayInterval;
    
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
            } else {
                // Smooth transition back to first slide
                track.style.transition = 'none';
                currentSlide = 0;
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        track.style.transition = 'transform 0.5s ease-in-out';
                        updateSlider();
                    });
                });
                return;
            }
            updateSlider();
        }, 3000); // Changed to 3 seconds for more frequent slides
    }
    
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    // Start autoplay
    startAutoplay();
    
    // Pause on hover or touch
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('touchstart', stopAutoplay);
    slider.addEventListener('touchend', () => {
        // Small delay before restarting autoplay after touch
        setTimeout(startAutoplay, 1000);
    });
    
    // Pause when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });

    // Add transition end listener to handle smooth infinite loop
    track.addEventListener('transitionend', () => {
        if (currentSlide === totalSlides - 1) {
            // Prepare for smooth transition back to first slide
            track.style.transition = 'none';
            currentSlide = 0;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    track.style.transition = 'transform 0.5s ease-in-out';
                    updateSlider();
                });
            });
        }
    });
}

// Hero section slider functionality
function initializeHeroSlider() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const heroContent = heroSection.querySelector('.hero-content');
    const productPreview = heroSection.querySelector('.product-preview img');
    const colorOptions = heroSection.querySelectorAll('.color-option');
    const prevBtn = heroSection.querySelector('.prev-btn');
    const nextBtn = heroSection.querySelector('.next-btn');

    const products = [
        {
            name: 'The Westmire A56 Headset',
            description: 'Experience premium sound quality with our latest technology',
            price: 299,
            colors: ['black', 'white', '#00b894'],
            image: 'https://placehold.co/500x500/black/white',
            specs: {
                driverSize: '40mm',
                batteryLife: '30h',
                range: '10m'
            },
            features: [
                'Active Noise Cancellation',
                'Hi-Res Audio Certified',
                'Bluetooth 5.2',
                'Touch Controls'
            ]
        },
        {
            name: 'Westmire Pro Gaming X1',
            description: 'Immersive gaming experience with 7.1 surround sound',
            price: 349,
            colors: ['red', 'black', '#2d3436'],
            image: 'https://placehold.co/500x500/red/white',
            specs: {
                driverSize: '50mm',
                batteryLife: '24h',
                range: '15m'
            },
            features: [
                '7.1 Virtual Surround Sound',
                'Discord Certified Mic',
                'RGB Lighting',
                'Ultra-Low Latency'
            ]
        },
        {
            name: 'Westmire Studio Pro',
            description: 'Professional grade audio for content creators',
            price: 399,
            colors: ['silver', 'gold', '#636e72'],
            image: 'https://placehold.co/500x500/silver/white',
            specs: {
                driverSize: '45mm',
                batteryLife: '35h',
                range: '12m'
            },
            features: [
                'Studio-Grade Sound',
                'Professional DAC/AMP',
                'Detachable Cable',
                'Balanced Audio Output'
            ]
        },
        {
            name: 'Westmire Elite Wireless',
            description: 'Premium wireless freedom with 40-hour battery life',
            price: 449,
            colors: ['navy', 'gray', '#2c3e50'],
            image: 'https://placehold.co/500x500/navy/white',
            specs: {
                driverSize: '42mm',
                batteryLife: '40h',
                range: '20m'
            },
            features: [
                'Fast Charging (5min = 2h)',
                'Multipoint Connection',
                'Wear Detection',
                'Voice Assistant'
            ]
        },
        {
            name: 'Westmire Sport X',
            description: 'Sweat-resistant design for active lifestyles',
            price: 199,
            colors: ['lime', 'black', '#2ecc71'],
            image: 'https://placehold.co/500x500/lime/white',
            specs: {
                driverSize: '35mm',
                batteryLife: '18h',
                range: '8m'
            },
            features: [
                'IPX7 Waterproof',
                'Heart Rate Monitor',
                'Secure Fit Design',
                'Quick Charge'
            ]
        },
        {
            name: 'Westmire Kids Safe',
            description: 'Volume-limited headphones perfect for children',
            price: 89,
            colors: ['blue', 'pink', '#3498db'],
            image: 'https://placehold.co/500x500/blue/white',
            specs: {
                driverSize: '32mm',
                batteryLife: '20h',
                range: '8m'
            },
            features: [
                'Volume Limiter (85dB)',
                'Durable Build',
                'Hypoallergenic Ear Cushions',
                'Parent Control App'
            ]
        },
        {
            name: 'Westmire DJ Pro',
            description: 'Professional DJ headphones with rotating earcups',
            price: 499,
            colors: ['purple', 'black', '#9b59b6'],
            image: 'https://placehold.co/500x500/purple/white',
            specs: {
                driverSize: '55mm',
                batteryLife: '25h',
                range: '12m'
            },
            features: [
                '180° Rotating Earcups',
                'Coiled + Straight Cables',
                'Replaceable Parts',
                'Club-Ready Sound'
            ]
        },
        {
            name: 'Westmire ANC Ultra',
            description: 'Advanced noise cancellation for complete immersion',
            price: 549,
            colors: ['titanium', 'rose', '#34495e'],
            image: 'https://placehold.co/500x500/titanium/white',
            specs: {
                driverSize: '44mm',
                batteryLife: '32h',
                range: '15m'
            },
            features: [
                'Adaptive ANC',
                'Transparency Mode',
                'Wind Noise Reduction',
                'Spatial Audio'
            ]
        },
        {
            name: 'Westmire Classic Edition',
            description: 'Timeless design with modern technology',
            price: 279,
            colors: ['brown', 'tan', '#795548'],
            image: 'https://placehold.co/500x500/brown/white',
            specs: {
                driverSize: '40mm',
                batteryLife: '28h',
                range: '10m'
            },
            features: [
                'Premium Leather',
                'Memory Foam Cushions',
                'Foldable Design',
                'Vintage Sound Profile'
            ]
        },
        {
            name: 'Westmire Limited Gold',
            description: 'Luxury limited edition with 24K gold accents',
            price: 999,
            colors: ['gold', 'black', '#f1c40f'],
            image: 'https://placehold.co/500x500/gold/white',
            specs: {
                driverSize: '45mm',
                batteryLife: '35h',
                range: '15m'
            },
            features: [
                '24K Gold Accents',
                'Italian Leather',
                'Custom Serial Number',
                'Luxury Travel Case'
            ]
        }
    ];

    let currentProduct = 0;
    let currentColor = 0;

    function updateHeroSection(animate = true) {
        const product = products[currentProduct];
        
        if (animate) {
            heroContent.style.opacity = '0';
            productPreview.style.opacity = '0';
            
            setTimeout(() => {
                updateContent();
                heroContent.style.opacity = '1';
                productPreview.style.opacity = '1';
            }, 300);
        } else {
            updateContent();
        }

        function updateContent() {
            // Update text content
            heroContent.querySelector('h1').textContent = product.name;
            heroContent.querySelector('p').textContent = product.description;
            
            // Update specifications
            const specs = heroContent.querySelectorAll('.spec-value');
            specs[0].textContent = product.specs.driverSize;
            specs[1].textContent = product.specs.batteryLife;
            specs[2].textContent = product.specs.range;

            // Update features list
            const featuresList = heroContent.querySelector('.features-list');
            featuresList.innerHTML = product.features.map(feature => 
                `<li><i class="fas fa-check"></i>${feature}</li>`
            ).join('');

            // Update Add to Cart button
            const addToCartBtn = heroContent.querySelector('.btn.primary');
            addToCartBtn.textContent = `Add to Cart - $${product.price}`;
            addToCartBtn.onclick = () => addToCart({
                name: product.name,
                price: product.price,
                image: productPreview.src
            });
            
            // Update color options
            const colorOptionsContainer = heroContent.querySelector('.color-options');
            colorOptionsContainer.innerHTML = '';
            product.colors.forEach((color, index) => {
                const button = document.createElement('button');
                button.className = `color-option${index === currentColor ? ' active' : ''}`;
                button.setAttribute('data-color', color);
                button.style.backgroundColor = color;
                button.addEventListener('click', () => {
                    currentColor = index;
                    updateColorSelection();
                });
                colorOptionsContainer.appendChild(button);
            });

            // Update product image
            const imageColor = product.colors[currentColor];
            productPreview.src = product.image.replace('black', imageColor);
        }
    }

    function updateColorSelection() {
        const buttons = heroContent.querySelectorAll('.color-option');
        buttons.forEach((btn, index) => {
            btn.classList.toggle('active', index === currentColor);
        });
        
        const imageColor = products[currentProduct].colors[currentColor];
        productPreview.src = products[currentProduct].image.replace('black', imageColor);
    }

    // Add navigation buttons if they don't exist
    if (!prevBtn) {
        const prevButton = document.createElement('button');
        prevButton.className = 'hero-nav prev-btn';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        heroSection.appendChild(prevButton);
    }

    if (!nextBtn) {
        const nextButton = document.createElement('button');
        nextButton.className = 'hero-nav next-btn';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        heroSection.appendChild(nextButton);
    }

    // Event listeners for navigation
    heroSection.querySelector('.prev-btn').addEventListener('click', () => {
        currentProduct = (currentProduct - 1 + products.length) % products.length;
        currentColor = 0;
        updateHeroSection();
    });

    heroSection.querySelector('.next-btn').addEventListener('click', () => {
        currentProduct = (currentProduct + 1) % products.length;
        currentColor = 0;
        updateHeroSection();
    });

    // Auto-advance slides
    let autoplayInterval;

    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            currentProduct = (currentProduct + 1) % products.length;
            currentColor = 0;
            updateHeroSection();
        }, 5000);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Start autoplay
    startAutoplay();

    // Pause on hover
    heroSection.addEventListener('mouseenter', stopAutoplay);
    heroSection.addEventListener('mouseleave', startAutoplay);

    // Initialize first slide
    updateHeroSection(false);
}

// Helper function to add product to cart
function addToCart(product) {
    cart.push(product);
    updateCart();
    cartPanel.classList.add('show');
}

// FAQ Accordion functionality
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Here you would typically send the form data to a server
            // For now, we'll just show a success message
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-menu') && navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
    }
});

// Initialize features
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    initializeSlider();
    initializeHeroSlider();
});

// Product Gallery Carousel
const productGalleryTrack = document.getElementById('galleryTrack');
const productGalleryPrev = document.getElementById('galleryPrev');
const productGalleryNext = document.getElementById('galleryNext');
const productGalleryDots = document.getElementById('galleryDots');

let currentProductGallerySlide = 0;
const productGallerySlides = document.querySelectorAll('.gallery-slide');
const totalProductGallerySlides = productGallerySlides.length;

// Create dots
function createProductGalleryDots() {
    productGalleryDots.innerHTML = '';
    productGallerySlides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('gallery-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToProductGallerySlide(index));
        productGalleryDots.appendChild(dot);
    });
}

// Update slide position
function updateProductGallerySlide() {
    productGalleryTrack.style.transform = `translateX(-${currentProductGallerySlide * 100}%)`;
    document.querySelectorAll('.gallery-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentProductGallerySlide);
    });
}

// Go to specific slide
function goToProductGallerySlide(index) {
    currentProductGallerySlide = index;
    updateProductGallerySlide();
}

// Next slide
function nextProductGallerySlide() {
    currentProductGallerySlide = (currentProductGallerySlide + 1) % totalProductGallerySlides;
    updateProductGallerySlide();
}

// Previous slide
function prevProductGallerySlide() {
    currentProductGallerySlide = (currentProductGallerySlide - 1 + totalProductGallerySlides) % totalProductGallerySlides;
    updateProductGallerySlide();
}

// Event listeners
productGalleryPrev.addEventListener('click', prevProductGallerySlide);
productGalleryNext.addEventListener('click', nextProductGallerySlide);

// Auto-advance slides
let productGalleryInterval = setInterval(nextProductGallerySlide, 5000);

// Pause auto-advance on hover
productGalleryTrack.addEventListener('mouseenter', () => clearInterval(productGalleryInterval));
productGalleryTrack.addEventListener('mouseleave', () => {
    productGalleryInterval = setInterval(nextProductGallerySlide, 5000);
});

// Touch support
let productGalleryTouchStartX = 0;
let productGalleryTouchEndX = 0;

productGalleryTrack.addEventListener('touchstart', (e) => {
    productGalleryTouchStartX = e.changedTouches[0].screenX;
    clearInterval(productGalleryInterval);
});

productGalleryTrack.addEventListener('touchend', (e) => {
    productGalleryTouchEndX = e.changedTouches[0].screenX;
    handleProductGallerySwipe();
    productGalleryInterval = setInterval(nextProductGallerySlide, 5000);
});

function handleProductGallerySwipe() {
    const swipeThreshold = 50;
    const diff = productGalleryTouchStartX - productGalleryTouchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextProductGallerySlide();
        } else {
            prevProductGallerySlide();
        }
    }
}

// Initialize gallery
createProductGalleryDots();
updateProductGallerySlide();

// Product Slider
const sliderTrack = document.getElementById('sliderTrack');
const sliderPrev = document.getElementById('sliderPrev');
const sliderNext = document.getElementById('sliderNext');
const sliderDots = document.getElementById('sliderDots');
const productCards = document.querySelectorAll('.product-card');
const cardsPerView = 3;
let currentSliderSlide = 0;

// Create dots
productCards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot';
    dot.addEventListener('click', () => {
        currentSliderSlide = index;
        updateSlider();
    });
    sliderDots.appendChild(dot);
});

function updateSlider() {
    const offset = -currentSliderSlide * (100 / cardsPerView);
    sliderTrack.style.transform = `translateX(${offset}%)`;
    
    // Update dots
    document.querySelectorAll('.slider-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSliderSlide);
    });
    
    // Update button states
    sliderPrev.disabled = currentSliderSlide === 0;
    sliderNext.disabled = currentSliderSlide >= productCards.length - cardsPerView;
}

sliderPrev.addEventListener('click', () => {
    if (currentSliderSlide > 0) {
        currentSliderSlide--;
        updateSlider();
    }
});

sliderNext.addEventListener('click', () => {
    if (currentSliderSlide < productCards.length - cardsPerView) {
        currentSliderSlide++;
        updateSlider();
    }
});

// Initialize slider
updateSlider();

// Color option selection
const colorOptions = document.querySelectorAll('.color-option');
colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Update product image based on color
        const color = option.dataset.color;
        const productImage = document.querySelector('.product-preview img');
        productImage.src = `https://placehold.co/500x500/${color}/white`;
    });
});
