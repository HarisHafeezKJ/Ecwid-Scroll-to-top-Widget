(function() {
    // 1. Create the button element
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑'; // You can change this to text or an icon
    scrollBtn.id = 'ecwid-scroll-top-btn';
    
    // 2. Style the button via JS
    Object.assign(scrollBtn.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: '99999',
        display: 'none', // Hidden by default
        backgroundColor: '#000000', // Change to match your store theme
        color: '#ffffff',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0px 4px 10px rgba(0,0,0,0.3)',
        transition: 'opacity 0.3s'
    });

    document.body.appendChild(scrollBtn);

    // 3. Show button when user scrolls down 300px
    window.onscroll = function() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            scrollBtn.style.display = 'block';
        } else {
            scrollBtn.style.display = 'none';
        }
    };

    // 4. Scroll to top functionality
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
})();