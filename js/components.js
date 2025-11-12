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

    const init = async () => {
        // Load header, and once it's loaded, set the active nav link
        await loadComponent('_header.html', 'header-placeholder');
        setActiveNav();

        // Load the footer
        await loadComponent('_footer.html', 'footer-placeholder');
    };

    init();
});
