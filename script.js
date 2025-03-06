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
    const saveMsg = document.getElementById('save_msg');
    const countdiv = document.getElementById('countdiv');
    const wordCountSpan = document.getElementById('wordCount');
    const charCountSpan = document.getElementById('charCount');
    const readingTimeSpan = document.getElementById('readingTime');

    // Constants
    const SAVE_DELAY = 2000; // 2 seconds delay for auto-save
    const COUNT_DISPLAY_DELAY = 1500; // 1.5 seconds before hiding count after typing stops
    const READING_SPEED = 200; // Average reading speed (words per minute)

    // Variables
    let isMenuOpen = false;
    let isFullScreen = false;
    let saveTimeout;
    let countTimeout;
    let countHideTimeout;
    let isCountVisible = false;

    // Initialize: Load saved content if exists
    initializeApp();

    // Event Listeners
    startWritingBtn.addEventListener('click', hideSplashScreen);
    logo.addEventListener('click', toggleMenu);
    opback.addEventListener('click', toggleMenu);
    opnew.addEventListener('click', newDocument);
    opsave.addEventListener('click', saveDocument);
    opfull.addEventListener('click', toggleFullScreen);
    opprint.addEventListener('click', printDocument);
    main.addEventListener('input', handleInput);
    main.addEventListener('keydown', handleKeydown);
    
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
        
        // Initially hide count div until mouse movement or typing
        countdiv.style.opacity = '0';
    }

    function hideSplashScreen() {
        splashScreen.style.display = 'none';
        main.focus();
    }

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        options.classList.toggle('visible', isMenuOpen);
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
        
        // Escape to close menu
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
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