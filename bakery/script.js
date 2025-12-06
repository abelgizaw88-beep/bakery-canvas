
document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded and DOM fully parsed.");

    // --- GSAP Setup ---
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // --- CSS RGB Custom Property for theme toggling (for dynamic colors in JS/GSAP) ---
    function updateAccentRGB() {
        const primaryAccentColor = getComputedStyle(document.documentElement).getPropertyValue('--clr-accent-primary');
        const secondaryAccentColor = getComputedStyle(document.documentElement).getPropertyValue('--clr-accent-secondary');

        // Helper to convert any CSS color string to R, G, B
        const toRGB = (colorStr) => {
            const div = document.createElement('div');
            div.style.color = colorStr;
            document.body.appendChild(div);
            const style = getComputedStyle(div);
            const rgb = style.color.match(/\d+/g).map(Number);
            document.body.removeChild(div);
            return rgb.join(', ');
        };

        document.documentElement.style.setProperty('--clr-accent-primary-rgb', toRGB(primaryAccentColor));
        document.documentElement.style.setProperty('--clr-accent-secondary-rgb', toRGB(secondaryAccentColor));
        document.documentElement.style.setProperty('--clr-input-focus-rgb', toRGB(primaryAccentColor));
    }
    updateAccentRGB(); // Set initial RGB

    // --- Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            body.classList.add(savedTheme + '-theme');
            themeToggleBtn.querySelector('i').classList.replace(savedTheme === 'dark' ? 'fa-moon' : 'fa-sun', savedTheme === 'dark' ? 'fa-sun' : 'fa-moon');
        } else {
            body.classList.add('light-theme');
            themeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
        updateAccentRGB(); // Update RGB on load based on theme

        themeToggleBtn.addEventListener('click', () => {
            const isLight = body.classList.contains('light-theme');
            body.classList.toggle('light-theme', !isLight);
            body.classList.toggle('dark-theme', isLight);
            themeToggleBtn.querySelector('i').classList.replace(isLight ? 'fa-moon' : 'fa-sun', isLight ? 'fa-sun' : 'fa-moon');
            localStorage.setItem('theme', isLight ? 'dark' : 'light');
            updateAccentRGB(); // Update RGB on theme change
            console.log(`Switched to ${isLight ? 'Dark' : 'Light'} Theme`);
        });
    } else {
        console.warn("Theme toggle button not found.");
    }

    // --- Dynamic Footer Year ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Mobile Menu Toggle ---
    const menuToggleBtn = document.querySelector('.menu-toggle');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (menuToggleBtn && mobileNavOverlay) {
        // Initial GSAP setup for mobile menu (hidden state)
        gsap.set(mobileNavOverlay, { xPercent: 100 });
        gsap.set(mobileNavLinks, { y: 20, opacity: 0 });

        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });

        tl.to(mobileNavOverlay, { xPercent: 0, duration: 0.6 })
          .fromTo(mobileNavLinks, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 }, "-=0.3"); // Staggered reveal

        menuToggleBtn.addEventListener('click', () => {
            menuToggleBtn.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');
            body.classList.toggle('nav-open'); // Prevent scroll

            if (mobileNavOverlay.classList.contains('active')) {
                tl.play();
            } else {
                tl.reverse();
            }
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNavOverlay.classList.contains('active')) {
                    menuToggleBtn.classList.remove('active');
                    mobileNavOverlay.classList.remove('active');
                    body.classList.remove('nav-open');
                    tl.reverse();
                }
                // Update active nav link class (for both desktop and mobile links)
                document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => l.classList.remove('active'));
                document.querySelector(`.nav-link[href="${link.getAttribute('href')}"]`)?.classList.add('active');
                link.classList.add('active');
            });
        });
    }

    // --- Header Shrink on Scroll (GSAP ScrollTrigger) ---
    const siteHeader = document.querySelector('.site-header');
    const headerInner = document.querySelector('.header-inner');
    const mainContent = document.getElementById('main-content');
    const headerHeightInitial = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
    const headerHeightScrolled = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height-scrolled'));

    if (siteHeader && headerInner && mainContent) {
        // Set initial main content padding based on header height
        mainContent.style.paddingTop = `${headerHeightInitial}px`;

        ScrollTrigger.create({
            trigger: 'body',
            start: 'top -80', // Trigger after 80px scroll
            end: 'max',
            onUpdate: (self) => {
                if (self.direction === 1 && self.progress > 0) { // Scrolling down
                    siteHeader.classList.add('scrolled');
                    // Update main content padding dynamically
                    mainContent.style.paddingTop = `${headerHeightScrolled}px`;
                } else if (self.direction === -1 && self.progress === 0) { // Scrolling up to top
                    siteHeader.classList.remove('scrolled');
                    mainContent.style.paddingTop = `${headerHeightInitial}px`;
                }
            },
            onLeaveBack: () => { // Ensure it resets if user quickly scrolls back up
                 siteHeader.classList.remove('scrolled');
                 mainContent.style.paddingTop = `${headerHeightInitial}px`;
            }
        });
    }


    // --- Smooth Scroll for Nav Links (GSAP ScrollToPlugin) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Determine offset based on scrolled header height
                const headerOffset = siteHeader.classList.contains('scrolled') ? headerHeightScrolled : headerHeightInitial;

                gsap.to(window, {
                    duration: 1.2,
                    scrollTo: {
                        y: targetElement,
                        offsetY: headerOffset + 20 // Adjust for fixed header height + some padding
                    },
                    ease: 'power3.inOut'
                });
            }
        });
    });

    // --- Loading Overlay Animation (GSAP) ---
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        setTimeout(() => {
            gsap.to(loadingOverlay, {
                opacity: 0,
                visibility: 'hidden',
                duration: 1.2,
                ease: 'power3.out',
                onComplete: () => {
                    loadingOverlay.remove();
                    initPageAnimations();
                }
            });
        }, 1800); // Increased loading time for a more dramatic intro
    } else {
        initPageAnimations();
    }


    // --- Core Page Animations (GSAP) ---
    function initPageAnimations() {
        // Hero Section Text Animation
        gsap.from('.hero-tagline', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.5 });
        gsap.from('.hero-section h1', { y: 30, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.7 });
        gsap.from('.hero-description', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.9 });
        gsap.from('.hero-actions .btn', { y: 30, opacity: 0, stagger: 0.2, duration: 0.8, ease: 'power2.out', delay: 1.1 });

        // ScrollTrigger Animations for 'reveal-fade-up'
        document.querySelectorAll('.reveal-fade-up').forEach(element => {
            gsap.from(element.children, {
                opacity: 0,
                y: 50,
                stagger: 0.15,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                }
            });
        });

        // ScrollTrigger Animations for 'reveal-slide-left'
        document.querySelectorAll('.reveal-slide-left').forEach(element => {
            gsap.from(element, {
                opacity: 0,
                x: -100,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                }
            });
        });

        // ScrollTrigger Animations for 'reveal-slide-right'
        document.querySelectorAll('.reveal-slide-right').forEach(element => {
            gsap.from(element, {
                opacity: 0,
                x: 100,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                }
            });
        });
    }

    // --- Dynamic Product Loading & Filtering ---
    const productGrid = document.getElementById('product-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productsPerPage = 8;
    let currentPage = 1;
    let allProducts = [];
    let filteredProducts = [];

    const productsData = [
        { id: 'p1', name: 'Deluxe Stand Mixer', category: 'bakeware', price: 299.99, image: 'images/medium-shot-cook-preparing-dessert.jpg' },
        { id: 'p2', name: 'Organic All-Purpose Flour (5kg)', category: 'ingredients', price: 9.99, image: 'images/honey-jar-cinnamon-sticks.jpg' },
        { id: 'p3', name: 'Silicone Spatula Set (5-pc)', category: 'tools', price: 14.99, image: 'images/ingredient-bags-full-flour.jpg' },
        { id: 'p4', name: 'Premium Cake Decorating Kit', category: 'decorations', price: 39.99, image: 'images/teflon-pan-wood-table.jpg' },
        { id: 'p5', name: 'Non-Stick Springform Pan (9")', category: 'bakeware', price: 24.99, image: 'images/1.jpg' },
        { id: 'p6', name: 'Madagascar Vanilla Extract (Pure)', category: 'ingredients', price: 18.50, image: 'images/2.jpg' },
        { id: 'p7', name: 'Digital Kitchen Scale (High Precision)', category: 'tools', price: 29.00, image: 'images/3.jpg' },
        { id: 'p8', name: 'Edible Glitter Dust (Gold)', category: 'decorations', price: 7.99, image: 'images/4.jpg' },
        { id: 'p9', name: 'Professional Pastry Bag Set', category: 'tools', price: 22.00, image: 'images/honey-jar-cinnamon-sticks.jpg' },
        { id: 'p10', name: 'Almond Flour (Gluten-Free, 1kg)', category: 'ingredients', price: 12.50, image: 'images/4.jpg' },
        { id: 'p11', name: 'Adjustable Cake Slicer Leveler', category: 'bakeware', price: 19.99, image: 'images/2.jpg' },
        { id: 'p12', name: 'Food Coloring Gel Set (12-pc)', category: 'decorations', price: 16.00, image: 'images/ingredient-bags-full-flour.jpg' }
    ];

    function fetchProducts() {
        return new Promise(resolve => {
            setTimeout(() => {
                allProducts = productsData;
                resolve(allProducts);
            }, 800);
        });
    }

    function renderProducts(productsToRender) {
        if (!productGrid) return;
        productGrid.innerHTML = '';

        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;
        const paginatedProducts = productsToRender.slice(start, end);

        if (paginatedProducts.length === 0) {
            productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--clr-text-secondary);">No products found in this category.</p>';
            renderPagination(productsToRender.length);
            return;
        }

        paginatedProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <div class="product-card-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-card-content">
                    <h3>${product.name}</h3>
                    <p class="category">${product.category}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <button class="btn add-to-cart-btn magnet" data-product-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
        renderPagination(productsToRender.length);
        // Reapply magnetic effect to newly rendered buttons
        initMagneticElements();
    }

    function renderPagination(totalProducts) {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalProducts / productsPerPage);

        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.classList.add('page-btn', 'magnet'); // Add magnet class
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderProducts(filteredProducts);
                gsap.to(window, { duration: 0.8, scrollTo: '#shop', ease: 'power2.out' });
            });
            paginationContainer.appendChild(pageBtn);
        }
        initMagneticElements(); // Reapply to pagination buttons
    }

    function filterAndRenderProducts(category = 'all') {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.filter-btn[data-category="${category}"]`).classList.add('active');

        if (category === 'all') {
            filteredProducts = allProducts;
        } else {
            filteredProducts = allProducts.filter(p => p.category === category);
        }
        currentPage = 1;
        renderProducts(filteredProducts);
    }

    fetchProducts().then(products => {
        filteredProducts = products;
        renderProducts(filteredProducts);

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                filterAndRenderProducts(category);
            });
        });
    });

    // --- Cart Functionality (Basic) ---
    const cartCountSpan = document.querySelector('.cart-count');
    let cartItemCount = 0;

    if (productGrid) {
        productGrid.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-to-cart-btn') || event.target.closest('.add-to-cart-btn')) {
                const btn = event.target.closest('.add-to-cart-btn');
                const productId = btn.dataset.productId;
                cartItemCount++;
                cartCountSpan.textContent = cartItemCount;

                gsap.timeline()
                    .to(cartCountSpan, { scale: 1.2, duration: 0.2, ease: 'back.out(2)' })
                    .to(cartCountSpan, { scale: 1, duration: 0.3, ease: 'power1.out' })
                    .to('.cart-icon', { keyframes: [{y: -5, duration: 0.1}, {y: 0, duration: 0.3, ease: 'power1.out'}], duration: 0.4 }, "<"); // subtle jump effect

                console.log(`Product ${productId} added to cart. Total: ${cartItemCount}`);
            }
        });
    }

    // --- Contact Form Submission (Placeholder) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
            console.log("Contact form submitted (simulated).");
        });
    }


    // --- Custom Cursor ---
    const customCursor = document.getElementById('custom-cursor');
    const interactiveElements = 'a, button, .magnet, [role="button"], input[type="submit"], input[type="text"], input[type="email"], textarea'; // Add more as needed

    if (customCursor && window.matchMedia("(hover: hover) and (pointer: fine)").matches) { // Only show on desktop with fine pointer
        document.addEventListener('mousemove', (e) => {
            gsap.to(customCursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: 'power2.out'
            });
        });

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactiveElements)) {
                customCursor.classList.add('hovered');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactiveElements)) {
                customCursor.classList.remove('hovered');
            }
        });

        document.addEventListener('mousedown', () => {
            customCursor.classList.add('pressed');
        });
        document.addEventListener('mouseup', () => {
            customCursor.classList.remove('pressed');
        });
    } else if (customCursor) {
        customCursor.style.display = 'none'; // Hide if not desktop or hover not supported
    }

    // --- Magnetic Elements (Using GSAP) ---
    function initMagneticElements() {
        const magnets = document.querySelectorAll('.magnet');

        magnets.forEach(magnet => {
            magnet.addEventListener('mousemove', (e) => {
                const bounding = magnet.getBoundingClientRect();
                const magnetStrength = 0.5; // Adjust how strong the magnet effect is

                gsap.to(magnet, {
                    x: ((e.clientX - bounding.left) / magnet.offsetWidth - 0.5) * magnet.offsetWidth * magnetStrength,
                    y: ((e.clientY - bounding.top) / magnet.offsetHeight - 0.5) * magnet.offsetHeight * magnetStrength,
                    ease: 'power3.out',
                    duration: 0.3
                });
            });

            magnet.addEventListener('mouseleave', () => {
                gsap.to(magnet, {
                    x: 0,
                    y: 0,
                    ease: 'power3.out',
                    duration: 0.6
                });
            });
        });
    }
    initMagneticElements(); // Initialize on page load

});
function initTestimonialCarousel() {
    const slidesContainer = document.querySelector('.testimonial-slides');
    const slides = document.querySelectorAll('.testimonial-slide');
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevArrow = document.querySelector('.carousel-arrow.prev');
    const nextArrow = document.querySelector('.carousel-arrow.next');

    if (!slidesContainer || slides.length === 0) return; // Exit if no carousel elements

    let currentSlide = 0;
    let autoPlayInterval;
    const intervalTime = 5000; // 5 seconds

    // Create dots if not already present
    if (dotsContainer && dotsContainer.children.length === 0) {
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => showSlide(index));
            dotsContainer.appendChild(dot);
        });
    }
    const dots = document.querySelectorAll('.carousel-dots .dot');

    function showSlide(index) {
        // Ensure index wraps around
        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        // Move the slides container
        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update active dot
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
        resetAutoPlay();
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
        resetAutoPlay();
    }

    function startAutoPlay() {
        stopAutoPlay(); // Clear any existing interval
        autoPlayInterval = setInterval(nextSlide, intervalTime);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    // Event Listeners
    if (nextArrow) nextArrow.addEventListener('click', nextSlide);
    if (prevArrow) prevArrow.addEventListener('click', prevSlide);

    // Pause autoplay on hover
    slidesContainer.addEventListener('mouseenter', stopAutoPlay);
    slidesContainer.addEventListener('mouseleave', startAutoPlay);

    // Initial display and start autoplay
    showSlide(currentSlide);
    startAutoPlay();
}

// Call the carousel initializer when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // ... (existing script.js content like theme toggle, mobile menu, etc.) ...

    // Initialize testimonial carousel
    initTestimonialCarousel();
});