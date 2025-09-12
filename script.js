// Performance utilities
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Cached DOM elements
const DOMCache = {
    scrollToTopBtn: null,
    nav: null,
    heroImage: null,
    heroContent: null,
    mobileMenu: null,
    menuToggle: null,
    video: null,
    
    init() {
        this.scrollToTopBtn = document.getElementById('scrollToTop');
        this.nav = document.querySelector('nav');
        this.heroImage = document.querySelector('.hero-image');
        this.heroContent = document.querySelector('.hero-content');
        this.mobileMenu = document.getElementById('mobileMenu');
        this.menuToggle = document.querySelector('.mobile-menu-toggle');
        this.video = document.getElementById('mainVideo');
    }
};

let currentLanguage = 'en';

// Language management
function toggleLanguage() {
    const body = document.body;
    const html = document.documentElement;
    
    if (currentLanguage === 'en') {
        currentLanguage = 'ar';
        body.setAttribute('lang', 'ar');
        body.setAttribute('dir', 'rtl');
        html.setAttribute('lang', 'ar');
        html.setAttribute('dir', 'rtl');
        document.title = 'برايم - خدمات الطعام والضيافة';
    } else {
        currentLanguage = 'en';
        body.setAttribute('lang', 'en');
        body.setAttribute('dir', 'ltr');
        html.setAttribute('lang', 'en');
        html.setAttribute('dir', 'ltr');
        document.title = 'PRIME by Asma - Catering & Food Services';
    }
    
    // Save language preference
    localStorage.setItem('preferred-language', currentLanguage);
}

// Load saved language preference on page load
function loadLanguagePreference() {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && savedLanguage !== currentLanguage) {
        toggleLanguage();
    }
}

// Scroll to Top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button based on scroll position
const toggleScrollToTopButton = throttle(() => {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollPosition > 300) {
        DOMCache.scrollToTopBtn?.classList.add('visible');
    } else {
        DOMCache.scrollToTopBtn?.classList.remove('visible');
    }
}, 100);

// Mobile menu functions
function toggleMobileMenu() {
    DOMCache.mobileMenu?.classList.toggle('active');
    DOMCache.menuToggle?.classList.toggle('active');
}

function closeMobileMenu() {
    DOMCache.mobileMenu?.classList.remove('active');
    DOMCache.menuToggle?.classList.remove('active');
}

// Video Player Functions
function initVideoPlayer() {
    const video = DOMCache.video;
    const playPauseBtn = document.getElementById('playPauseBtn');
    const soundBtn = document.getElementById('soundBtn');
    const progressFill = document.getElementById('progressFill');
    const progressBar = document.querySelector('.progress-bar');
    
    if (!video) return;
    
    const playIcon = playPauseBtn?.querySelector('.play-icon');
    const pauseIcon = playPauseBtn?.querySelector('.pause-icon');
    const soundOffIcon = soundBtn?.querySelector('.sound-off-icon');
    const soundOnIcon = soundBtn?.querySelector('.sound-on-icon');
    
    // Play/Pause functionality
    playPauseBtn?.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
        } else {
            video.pause();
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
        }
    });
    
    // Sound toggle functionality
    soundBtn?.addEventListener('click', () => {
        if (video.muted) {
            video.muted = false;
            if (soundOffIcon) soundOffIcon.style.display = 'none';
            if (soundOnIcon) soundOnIcon.style.display = 'block';
        } else {
            video.muted = true;
            if (soundOffIcon) soundOffIcon.style.display = 'block';
            if (soundOnIcon) soundOnIcon.style.display = 'none';
        }
    });
    
    // Progress bar functionality
    video.addEventListener('timeupdate', () => {
        const progress = (video.currentTime / video.duration) * 100;
        if (progressFill) progressFill.style.width = progress + '%';
    });
    
    // Click on progress bar to seek
    progressBar?.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const clickTime = (clickX / width) * video.duration;
        video.currentTime = clickTime;
    });
    
    // Auto-hide controls on mobile after 3 seconds
    let controlsTimeout;
    const videoContainer = document.querySelector('.video-container');
    
    function showControls() {
        const controls = document.querySelector('.video-controls');
        if (window.innerWidth <= 768 && controls) {
            controls.style.opacity = '1';
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                if (!video.paused) {
                    controls.style.opacity = '0.7';
                }
            }, 3000);
        }
    }
    
    videoContainer?.addEventListener('touchstart', showControls);
    videoContainer?.addEventListener('click', showControls);
    
    // Show controls when video is paused on mobile
    video.addEventListener('pause', () => {
        if (window.innerWidth <= 768) {
            const controls = document.querySelector('.video-controls');
            if (controls) controls.style.opacity = '1';
            clearTimeout(controlsTimeout);
        }
    });
    
    video.addEventListener('play', () => {
        if (window.innerWidth <= 768) {
            showControls();
        }
    });
}

// Enhanced parallax effect with performance optimization
let ticking = false;

const updateParallax = throttle(() => {
    const scrolled = window.pageYOffset;
    
    if (scrolled < window.innerHeight) {
        if (DOMCache.heroImage) {
            const rate = scrolled * -0.2;
            DOMCache.heroImage.style.transform = `translate3d(0, ${rate}px, 0) scale(${1.02 + scrolled * 0.0001})`;
        }
        
        if (DOMCache.heroContent) {
            const rate = scrolled * 0.1;
            DOMCache.heroContent.style.transform = `translate3d(0, ${rate}px, 0)`;
            DOMCache.heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.2;
        }
    }
}, 16); // ~60fps

// Smooth navigation background transition
let lastScrollTop = 0;

const handleNavbarScroll = throttle(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (!DOMCache.nav) return;
    
    // Handle navbar hide/show
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down - hide navbar
        DOMCache.nav.classList.add('nav-hidden');
        DOMCache.nav.classList.remove('nav-visible');
    } else if (scrollTop < lastScrollTop) {
        // Scrolling up - show navbar
        DOMCache.nav.classList.remove('nav-hidden');
        DOMCache.nav.classList.add('nav-visible');
    }
    
    // Show navbar when at top of page
    if (scrollTop <= 50) {
        DOMCache.nav.classList.remove('nav-hidden');
        DOMCache.nav.classList.add('nav-visible');
    }
    
    // Background transition
    if (scrollTop > 100) {
        DOMCache.nav.style.background = 'rgba(35, 31, 32, 0.99)';
        DOMCache.nav.style.backdropFilter = 'blur(40px)';
        DOMCache.nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
    } else {
        DOMCache.nav.style.background = 'rgba(35, 31, 32, 0.98)';
        DOMCache.nav.style.backdropFilter = 'blur(30px)';
        DOMCache.nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    }
    
    lastScrollTop = scrollTop;
}, 16);

// Combined scroll handler
const handleScroll = throttle(() => {
    toggleScrollToTopButton();
    updateParallax();
    handleNavbarScroll();
}, 16);

// Luxury scroll animations with intersection observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Add staggered animation for service features
                if (entry.target.classList.contains('service-item')) {
                    const features = entry.target.querySelectorAll('.service-features li');
                    features.forEach((feature, index) => {
                        setTimeout(() => {
                            feature.style.transform = 'translate3d(0, 0, 0)';
                            feature.style.opacity = '1';
                        }, index * 100);
                    });
                }
                
                // Unobserve element after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll(
        '.services, .section-title, .service-item, .contact h2, .contact p, .contact-item'
    );

    elementsToAnimate.forEach((el, index) => {
        // Add staggered delay for contact items
        if (el.classList.contains('contact-item')) {
            el.style.transitionDelay = `${index * 0.15}s`;
        }
        
        // Prepare service features for staggered animation
        if (el.classList.contains('service-item')) {
            const features = el.querySelectorAll('.service-features li');
            features.forEach(feature => {
                feature.style.transform = 'translate3d(-20px, 0, 0)';
                feature.style.opacity = '0';
                feature.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                feature.style.willChange = 'transform, opacity';
            });
        }
        
        // Add will-change for better performance
        el.style.willChange = 'transform, opacity';
        
        observer.observe(el);
    });
}

// Event handlers
function handleLogoClick(e) {
    e.preventDefault();
    scrollToTop();
}

function handleAnchorClick(e) {
    const href = this.getAttribute('href');
    
    // Only prevent default for logo/home links
    if (href === '#' || href === '#home') {
        e.preventDefault();
        scrollToTop();
        return;
    }
    
    // Allow normal anchor navigation for other links
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
        const headerOffset = 120; // Account for fixed navigation
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function handleMobileMenuClick(event) {
    const navContainer = document.querySelector('.nav-container');
    const languageToggle = document.querySelector('.language-toggle');
    
    if (!navContainer?.contains(event.target) && 
        !languageToggle?.contains(event.target) && 
        DOMCache.mobileMenu?.classList.contains('active')) {
        closeMobileMenu();
    }
}

function handleMobileMenuLinkClick() {
    closeMobileMenu();
}

function handleResize() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM cache
    DOMCache.init();
    
    // Set initial language if not already set
    const body = document.body;
    const html = document.documentElement;
    if (!body.getAttribute('lang')) {
        body.setAttribute('lang', 'en');
        body.setAttribute('dir', 'ltr');
        html.setAttribute('lang', 'en');
        html.setAttribute('dir', 'ltr');
    }
    
    loadLanguagePreference();
    initScrollAnimations();
    
    // Initialize navbar as visible
    DOMCache.nav?.classList.add('nav-visible');
    
    // Initialize video player
    if (DOMCache.video) {
        initVideoPlayer();
    }
    
    // Event listeners
    document.querySelector('.nav-logo')?.addEventListener('click', handleLogoClick);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleAnchorClick);
    });
    
    // Mobile menu links
    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', handleMobileMenuLinkClick);
    });
    
    // Clean up will-change after animations complete
    setTimeout(() => {
        const animatedElements = document.querySelectorAll('[style*="will-change"]');
        animatedElements.forEach(el => {
            if (el.style.willChange) {
                el.style.willChange = 'auto';
            }
        });
    }, 5000);
});

// Event listeners with proper cleanup
window.addEventListener('scroll', handleScroll, { passive: true });
document.addEventListener('click', handleMobileMenuClick);
window.addEventListener('resize', debounce(handleResize, 250));

// Initialize event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Language toggle event listener
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', toggleLanguage);
    }
    
    // Mobile menu toggle event listener
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Scroll to top button event listener
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', scrollToTop);
    }
});

// Prevent initial auto-scroll
window.scrollTo(0, 0);
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

// Disable scroll restoration
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Block any auto-scrolling on page unload/reload
window.addEventListener('beforeunload', function() {
    window.scrollTo(0, 0);
});