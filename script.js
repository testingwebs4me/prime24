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
function toggleScrollToTopButton() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollPosition > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
}

// Mobile menu functions
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    mobileMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    mobileMenu.classList.remove('active');
    menuToggle.classList.remove('active');
}

// Video Player Functions
function initVideoPlayer() {
    const video = document.getElementById('mainVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const soundBtn = document.getElementById('soundBtn');
    const progressFill = document.getElementById('progressFill');
    const progressBar = document.querySelector('.progress-bar');
    
    if (!video) return;
    
    const playIcon = playPauseBtn.querySelector('.play-icon');
    const pauseIcon = playPauseBtn.querySelector('.pause-icon');
    const soundOffIcon = soundBtn.querySelector('.sound-off-icon');
    const soundOnIcon = soundBtn.querySelector('.sound-on-icon');
    
    // Play/Pause functionality
    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            video.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    });
    
    // Sound toggle functionality
    soundBtn.addEventListener('click', () => {
        if (video.muted) {
            video.muted = false;
            soundOffIcon.style.display = 'none';
            soundOnIcon.style.display = 'block';
        } else {
            video.muted = true;
            soundOffIcon.style.display = 'block';
            soundOnIcon.style.display = 'none';
        }
    });
    
    // Progress bar functionality
    video.addEventListener('timeupdate', () => {
        const progress = (video.currentTime / video.duration) * 100;
        progressFill.style.width = progress + '%';
    });
    
    // Click on progress bar to seek
    progressBar.addEventListener('click', (e) => {
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
        if (window.innerWidth <= 768) {
            controls.style.opacity = '1';
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                if (!video.paused) {
                    controls.style.opacity = '0.7';
                }
            }, 3000);
        }
    }
    
    videoContainer.addEventListener('touchstart', showControls);
    videoContainer.addEventListener('click', showControls);
    
    // Show controls when video is paused on mobile
    video.addEventListener('pause', () => {
        if (window.innerWidth <= 768) {
            document.querySelector('.video-controls').style.opacity = '1';
            clearTimeout(controlsTimeout);
        }
    });
    
    video.addEventListener('play', () => {
        if (window.innerWidth <= 768) {
            showControls();
        }
    });
}

// Event listeners
window.addEventListener('scroll', toggleScrollToTopButton, { passive: true });

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    // Preload critical elements for performance
    heroImage = document.querySelector('.hero-image');
    heroContent = document.querySelector('.hero-content');
    nav = document.querySelector('nav');
    
    loadLanguagePreference();
    
    // Ensure hero elements are properly hidden initially
    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription) {
        heroDescription.style.opacity = '0';
        heroDescription.style.visibility = 'hidden';
        heroDescription.style.transform = 'translate3d(0, 30px, 0)';
        heroDescription.style.willChange = 'transform, opacity, visibility';
    }
    
    initScrollAnimations();
    
    // Initialize navbar as visible
    nav.classList.add('nav-visible');
    
    // Initialize video player
    const video = document.getElementById('mainVideo');
    if (video) {
        initVideoPlayer();
    }
    
    // Logo click functionality
    document.querySelector('.nav-logo').addEventListener('click', function(e) {
        e.preventDefault();
        scrollToTop();
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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
        });
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

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navContainer = document.querySelector('.nav-container');
    const languageToggle = document.querySelector('.language-toggle');
    
    if (!navContainer.contains(event.target) && 
        !languageToggle.contains(event.target) && 
        mobileMenu.classList.contains('active')) {
        closeMobileMenu();
    }
});

// Close mobile menu on window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
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

// Enhanced parallax effect for hero with performance optimization
let ticking = false;
let heroImage, heroContent;

function updateParallax() {
    const scrolled = window.pageYOffset;
    
    // Cache DOM elements on first run
    if (!heroImage) heroImage = document.querySelector('.hero-image');
    if (!heroContent) heroContent = document.querySelector('.hero-content');
    
    if (scrolled < window.innerHeight) {
        if (heroImage) {
            const rate = scrolled * -0.2;
            heroImage.style.transform = `translate3d(0, ${rate}px, 0) scale(${1.02 + scrolled * 0.0001})`;
        }
        
        if (heroContent) {
            const rate = scrolled * 0.1;
            heroContent.style.transform = `translate3d(0, ${rate}px, 0)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.2;
        }
    }
    
    ticking = false;
}

function requestParallaxUpdate() {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', requestParallaxUpdate, { passive: true });

// Smooth navigation background transition
let lastScrollTop = 0;
let navbarTimeout;
let nav;

window.addEventListener('scroll', () => {
    // Cache nav element
    if (!nav) nav = document.querySelector('nav');
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Handle navbar hide/show
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down - hide navbar
        nav.classList.add('nav-hidden');
        nav.classList.remove('nav-visible');
    } else if (scrollTop < lastScrollTop) {
        // Scrolling up - show navbar
        nav.classList.remove('nav-hidden');
        nav.classList.add('nav-visible');
    }
    
    // Show navbar when at top of page
    if (scrollTop <= 50) {
        nav.classList.remove('nav-hidden');
        nav.classList.add('nav-visible');
    }
    
    // Background transition
    if (scrollTop > 100) {
        nav.style.background = 'rgba(35, 31, 32, 0.99)';
        nav.style.backdropFilter = 'blur(40px)';
        nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
    } else {
        nav.style.background = 'rgba(35, 31, 32, 0.98)';
        nav.style.backdropFilter = 'blur(30px)';
        nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    }
    
    lastScrollTop = scrollTop;
}, { passive: true });

// Add luxury loading animation
// Removed loading animation to prevent flash

// Performance optimization: Debounce resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}