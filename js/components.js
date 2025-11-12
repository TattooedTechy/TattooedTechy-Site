document.addEventListener('DOMContentLoaded', () => {
    const loadComponent = async (componentPath, targetId) => {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${componentPath}: ${response.statusText}`);
            }
            const text = await response.text();
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.innerHTML = text;
            } else {
                console.error(`Target element with ID #${targetId} not found.`);
            }
            return text; // Return the HTML content for further processing
        } catch (error) {
            console.error(`Error loading component from ${componentPath}:`, error);
        }
    };

    const setActiveNav = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // First, try to find a direct match
        let desktopLink = document.querySelector(`nav a[href$="${currentPage}"]`);
        let mobileLink = document.querySelector(`#mobile-menu a[href$="${currentPage}"]`);

        // If no direct match, check for parent category
        if (!desktopLink) {
            const navLinks = document.querySelectorAll('nav a');
            for (const link of navLinks) {
                const linkPage = link.getAttribute('href').split('/').pop();
                if (linkPage !== 'index.html' && currentPage.startsWith(linkPage.split('.')[0])) {
                    desktopLink = link;
                    break;
                }
            }
        }

        if (!mobileLink) {
            const mobileNavLinks = document.querySelectorAll('#mobile-menu a');
            for (const link of mobileNavLinks) {
                const linkPage = link.getAttribute('href').split('/').pop();
                if (linkPage !== 'index.html' && currentPage.startsWith(linkPage.split('.')[0])) {
                    mobileLink = link;
                    break;
                }
            }
        }

        if (desktopLink) {
            desktopLink.classList.add('active');
        }
        if (mobileLink) {
            mobileLink.classList.add('active-mobile');
        }
    };

    // --- NEW FUNCTION ---
    // This is the logic from your main.js, now a function
    const initMobileMenu = () => {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuClosedIcon = document.getElementById('menu-closed-icon');
        const menuOpenIcon = document.getElementById('menu-open-icon');

        if (mobileMenuButton && mobileMenu && menuClosedIcon && menuOpenIcon) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                menuClosedIcon.classList.toggle('hidden');
                menuOpenIcon.classList.toggle('hidden');
            });
        } else {
            console.error('Could not initialize mobile menu. One or more elements not found.');
        }
    };


    const init = async () => {
        // Load header
        await loadComponent('_header.html', 'header-placeholder');
        
        // NOW that the header is loaded, run the scripts that depend on it
        setActiveNav();
        initMobileMenu(); // <-- Call the new function here

        // Load the footer
        await loadComponent('_footer.html', 'footer-placeholder');
    };

    init();
});