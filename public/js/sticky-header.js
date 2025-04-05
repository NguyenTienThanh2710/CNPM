// Sticky Header functionality
document.addEventListener('DOMContentLoaded', function() {
    // Function to handle sticky header
    function handleStickyHeader() {
        const navbar = document.querySelector('.navbar');
        const body = document.body;
        
        if (!navbar) return;
        
        // Get the height of the navbar for proper body padding
        const navbarHeight = navbar.offsetHeight;
        
        // Function to update header state based on scroll position
        function updateHeaderState() {
            if (window.scrollY > 50) {
                // Add fixed header class when scrolled down
                navbar.classList.add('fixed-header');
                body.classList.add('has-fixed-header');
                // Update body padding to match navbar height
                body.style.paddingTop = navbarHeight + 'px';
            } else {
                // Remove fixed header class when at top
                navbar.classList.remove('fixed-header');
                body.classList.remove('has-fixed-header');
                body.style.paddingTop = '0';
            }
        }
        
        // Initial check
        updateHeaderState();
        
        // Add scroll event listener
        window.addEventListener('scroll', updateHeaderState);
        
        // Update on window resize (in case header height changes)
        window.addEventListener('resize', function() {
            // Update navbar height value
            const updatedNavbarHeight = navbar.offsetHeight;
            
            // If we have fixed header, update padding
            if (body.classList.contains('has-fixed-header')) {
                body.style.paddingTop = updatedNavbarHeight + 'px';
            }
        });
    }
    
    // Initialize sticky header functionality
    // We need to wait for the header to be loaded since it's loaded dynamically
    const headerContainer = document.getElementById('header-container');
    
    if (headerContainer) {
        // Check if header is already loaded
        if (headerContainer.querySelector('.navbar')) {
            handleStickyHeader();
        } else {
            // If not loaded yet, set up a mutation observer to detect when it's loaded
            const observer = new MutationObserver(function(mutations) {
                if (headerContainer.querySelector('.navbar')) {
                    handleStickyHeader();
                    observer.disconnect(); // Stop observing once header is loaded
                }
            });
            
            // Start observing the header container for changes
            observer.observe(headerContainer, { childList: true, subtree: true });
        }
    }
});