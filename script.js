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
    const textWidthSlider = document.getElementById('text_width');
    const widthValueSpan = document.getElementById('width_value');
    
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
    main.addEventListener('mouseup', handleTextSelection);
    main.addEventListener('selectionchange', handleTextSelection);
    
    // Settings Event Listeners
    darkModeToggle.addEventListener('change', toggleDarkMode);
    textWidthSlider.addEventListener('input', adjustTextWidth);
    
    // Format Bar Event Listeners
    formatH1.addEventListener('click', () => formatText('h1'));
    formatH2.addEventListener('click', () => formatText('h2'));
    formatH3.addEventListener('click', () => formatText('h3'));
    formatBold.addEventListener('click', () => formatText('bold'));
    formatItalic.addEventListener('click', () => formatText('italic'));
    
    // Hide format bar when clicking outside
    document.addEventListener('mousedown', function(e) {
        if (!formatBar.contains(e.target) && e.target !== formatBar) {
            formatBar.style.display = 'none';
        }
    });
    
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
        }
        
        // Load text width setting
        const textWidth = localStorage.getItem('peacefulWriterTextWidth');
        if (textWidth) {
            main.style.maxWidth = textWidth + 'px';
            textWidthSlider.value = textWidth;
            widthValueSpan.textContent = textWidth + 'px';
        }
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
            toggleMenu();
        }
        
        isSettingsOpen = !isSettingsOpen;
        settingsPanel.classList.toggle('visible', isSettingsOpen);
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode', darkModeToggle.checked);
        localStorage.setItem('peacefulWriterDarkMode', darkModeToggle.checked);
    }

    function adjustTextWidth() {
        const width = textWidthSlider.value;
        main.style.maxWidth = width + 'px';
        widthValueSpan.textContent = width + 'px';
        localStorage.setItem('peacefulWriterTextWidth', width);
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

    function handleTextSelection() {
        clearTimeout(selectionTimeout);
        
        // Small delay to ensure selection is complete
        selectionTimeout = setTimeout(() => {
            const selection = window.getSelection();
            
            if (selection.toString().trim().length > 0) {
                // Get selection coordinates
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                // Position the format bar above the selection
                formatBar.style.top = (rect.top - formatBar.offsetHeight - 10) + 'px';
                formatBar.style.left = (rect.left + (rect.width / 2) - (formatBar.offsetWidth / 2)) + 'px';
                formatBar.style.display = 'block';
            } else {
                formatBar.style.display = 'none';
            }
        }, 100);
    }

    function formatText(format) {
        const selection = window.getSelection();
        
        if (selection.toString().trim().length > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = selection.toString();
            
            switch (format) {
                case 'h1':
                    wrapWithTag(range, 'h1');
                    break;
                case 'h2':
                    wrapWithTag(range, 'h2');
                    break;
                case 'h3':
                    wrapWithTag(range, 'h3');
                    break;
                case 'bold':
                    document.execCommand('bold', false, null);
                    break;
                case 'italic':
                    document.execCommand('italic', false, null);
                    break;
            }
            
            // Hide format bar after applying format
            formatBar.style.display = 'none';
            
            // Save content after formatting
            localStorage.setItem('peacefulWriterContent', main.innerHTML);
        }
    }

    function wrapWithTag(range, tag) {
        const content = range.extractContents();
        const element = document.createElement(tag);
        element.appendChild(content);
        range.insertNode(element);
        
        // Ensure proper spacing after the element
        if (!element.nextSibling || element.nextSibling.nodeName !== 'BR') {
            const br = document.createElement('br');
            element.parentNode.insertBefore(br, element.nextSibling);
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