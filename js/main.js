document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuClosedIcon = document.getElementById('menu-closed-icon');
    const menuOpenIcon = document.getElementById('menu-open-icon');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            menuClosedIcon.classList.toggle('hidden');
            menuOpenIcon.classList.toggle('hidden');
        });
    }
});
