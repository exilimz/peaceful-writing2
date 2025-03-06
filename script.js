document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const splashScreen = document.getElementById('splash_screen');
    const startWritingBtn = document.getElementById('start_writing');
    const main = document.getElementById('main');
    const wrapper = document.getElementById('wrapper');
    const logo = document.getElementById('logo');
    const options = document.getElementById('options');
    const opback = document.getElementById('opback');
    const opnew = document.getElementById('opnew');
    const opsave = document.getElementById('opsave');
    const opfull = document.getElementById('opfull');
    const opprint = document.getElementById('opprint');
    const opsettings = document.getElementById('opsettings');
    const saveMsg = document.getElementById('save_msg');
    const countdiv = document.getElementById('countdiv');
    const wordCountSpan = document.getElementById('wordCount');
    const charCountSpan = document.getElementById('charCount');
    const readingTimeSpan = document.getElementById('readingTime');
    
    // Settings Elements
    const settingsPanel = document.getElementById('settings_panel');
    const closeSettings = document.getElementById('close_settings');
    const darkModeToggle = document.getElementById('dark_mode_toggle');
    const widthOptions = document.querySelectorAll('.width-option');
    
    // Format Bar Elements
    const formatBar = document.getElementById('format_bar');
    const formatH1 = document.getElementById('format_h1');
    const formatH2 = document.getElementById('format_h2');
    const formatH3 = document.getElementById('format_h3');
    const formatBold = document.getElementById('format_bold');
    const formatItalic = document.getElementById('format_italic');

    // Constants
    const SAVE_DELAY = 2000; // 2 seconds delay for auto-save
    const COUNT_DISPLAY_DELAY = 1500; // 1.5 seconds before hiding count after typing stops
    const READING_SPEED = 200; // Average reading speed (words per minute)

    // Variables
    let isMenuOpen = false;
    let isSettingsOpen = false;
    let isFullScreen = false;
    let saveTimeout;
    let countTimeout;
    let countHideTimeout;
    let isCountVisible = false;
    let selectionTimeout;

    // Initialize: Load saved content and settings if exists
    initializeApp();

    // Event Listeners
    startWritingBtn.addEventListener('click', hideSplashScreen);
    logo.addEventListener('click', toggleMenu);
    opback.addEventListener('click', toggleMenu);
    opnew.addEventListener('click', newDocument);
    opsave.addEventListener('click', saveDocument);
    opfull.addEventListener('click', toggleFullScreen);
    opprint.addEventListener('click', printDocument);
    opsettings.addEventListener('click', toggleSettings);
    closeSettings.addEventListener('click', toggleSettings);
    main.addEventListener('input', handleInput);
    main.addEventListener('keydown', handleKeydown);
    
    // Settings Event Listeners
    darkModeToggle.addEventListener('change', toggleDarkMode);
    
    // Make the toggle slider also trigger the checkbox
    const toggleSlider = document.querySelector('.toggle-slider');
    if (toggleSlider) {
        toggleSlider.addEventListener('click', function(e) {
            // Prevent default to avoid double triggering with the label
            e.preventDefault();
            darkModeToggle.checked = !darkModeToggle.checked;
            toggleDarkMode();
        });
    }
    
    widthOptions.forEach(option => {
        option.addEventListener('click', function() {
            const width = this.getAttribute('data-width');
            setTextWidth(width);
        });
    });
    
    // Hide format bar
    if (formatBar) {
        formatBar.style.display = 'none';
    }
    
    // Show count div on mouse movement
    document.addEventListener('mousemove', showCountDiv);
    
    // Functions
    function initializeApp() {
        // Load saved content
        const savedContent = localStorage.getItem('peacefulWriterContent');
        if (savedContent) {
            main.innerHTML = savedContent;
            updateWordCount();
            hideSplashScreen();
        }
        
        // Load saved settings
        loadSettings();
        
        // Initially hide count div until mouse movement or typing
        countdiv.style.opacity = '0';
    }

    function loadSettings() {
        // Load dark mode setting
        const darkMode = localStorage.getItem('peacefulWriterDarkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
            
            // Set dark mode logo
            const logoImg = document.querySelector('#logo img');
            logoImg.src = 'public/dark mode.png';
        }
        
        // Load text width setting
        const textWidth = localStorage.getItem('peacefulWriterTextWidth') || '700';
        main.style.maxWidth = textWidth + 'px';
        
        // Mark the active width option
        widthOptions.forEach(option => {
            if (option.getAttribute('data-width') === textWidth) {
                option.classList.add('active');
            }
        });
    }

    function hideSplashScreen() {
        splashScreen.style.display = 'none';
        main.focus();
    }

    function toggleMenu() {
        if (isSettingsOpen) {
            toggleSettings();
        }
        
        isMenuOpen = !isMenuOpen;
        options.classList.toggle('visible', isMenuOpen);
    }

    function toggleSettings() {
        if (isMenuOpen) {
            // Hide the menu first
            options.classList.remove('visible');
        }
        
        isSettingsOpen = !isSettingsOpen;
        settingsPanel.classList.toggle('visible', isSettingsOpen);
        
        // If we're closing settings and the menu was open before, show it again
        if (!isSettingsOpen && isMenuOpen) {
            options.classList.add('visible');
        } else if (isSettingsOpen) {
            // If we're opening settings, ensure menu state is tracked correctly
            isMenuOpen = false;
        }
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode', darkModeToggle.checked);
        localStorage.setItem('peacefulWriterDarkMode', darkModeToggle.checked);
        
        // Update logo based on dark mode
        const logoImg = document.querySelector('#logo img');
        if (darkModeToggle.checked) {
            logoImg.src = 'public/dark mode.png';
        } else {
            logoImg.src = 'public/logo.png';
        }
    }

    function setTextWidth(width) {
        main.style.maxWidth = width + 'px';
        localStorage.setItem('peacefulWriterTextWidth', width);
        
        // Update active class
        widthOptions.forEach(option => {
            option.classList.toggle('active', option.getAttribute('data-width') === width);
        });
    }

    function newDocument() {
        if (confirm('Are you sure you want to create a new document? Any unsaved changes will be lost.')) {
            main.innerHTML = '';
            updateWordCount();
            toggleMenu();
        }
    }

    function saveDocument() {
        localStorage.setItem('peacefulWriterContent', main.innerHTML);
        showSaveMessage();
        toggleMenu();
    }

    function showSaveMessage() {
        saveMsg.classList.add('visible');
        setTimeout(() => {
            saveMsg.classList.remove('visible');
        }, 2000);
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            isFullScreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                isFullScreen = false;
            }
        }
        toggleMenu();
    }

    function printDocument() {
        window.print();
        toggleMenu();
    }

    function showCountDiv() {
        if (!isCountVisible) {
            countdiv.style.opacity = '0.7';
            isCountVisible = true;
            
            // Hide count after 3 seconds of no mouse movement
            clearTimeout(countHideTimeout);
            countHideTimeout = setTimeout(() => {
                countdiv.style.opacity = '0';
                isCountVisible = false;
            }, 3000);
        }
    }

    function handleInput() {
        // Show count immediately when typing
        showCountDivImmediate();
        
        // Auto-save after delay
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            localStorage.setItem('peacefulWriterContent', main.innerHTML);
        }, SAVE_DELAY);
        
        // Update word count with slight delay for performance
        clearTimeout(countTimeout);
        countTimeout = setTimeout(updateWordCount, 100);
        
        // Hide count after typing stops
        clearTimeout(countHideTimeout);
        countHideTimeout = setTimeout(() => {
            countdiv.style.opacity = '0';
            isCountVisible = false;
        }, COUNT_DISPLAY_DELAY);
    }

    function handleKeydown(e) {
        // Ctrl+S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveDocument();
        }
        
        // Escape to close menu or settings
        if (e.key === 'Escape') {
            if (isMenuOpen) {
                closeMenu();
            }
            if (isSettingsOpen) {
                toggleSettings();
            }
        }
        
        // Handle tab key
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
    }

    function updateWordCount() {
        const text = main.innerText || main.textContent;
        
        // Calculate word count
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        // Calculate character count
        const charCount = text.length;
        
        // Calculate reading time
        const minutes = Math.ceil(wordCount / READING_SPEED);
        let readingTime;
        
        if (minutes === 0) {
            readingTime = "less than 1 min read";
        } else if (minutes === 1) {
            readingTime = "1 min read";
        } else {
            readingTime = `${minutes} min read`;
        }
        
        // Update the display
        wordCountSpan.textContent = `${wordCount} words`;
        charCountSpan.textContent = `${charCount} characters`;
        readingTimeSpan.textContent = readingTime;
    }

    function showCountDivImmediate() {
        countdiv.style.opacity = '0.7';
        isCountVisible = true;
    }

    function closeMenu() {
        isMenuOpen = false;
        options.classList.remove('visible');
    }
}); 