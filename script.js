/* ===================================
   Virtual College Notice Board System
   Main JavaScript File
   =================================== */

// === Global Variables ===
let currentUser = null;

// === DOM Content Loaded ===
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// === Initialize Application ===
function initializeApp() {
    // Setup hamburger menu
    setupHamburgerMenu();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Check for stored user session
    checkUserSession();
    
    // Setup date inputs with minimum date
    setupDateInputs();
}

// === Hamburger Menu for Mobile ===
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Animate hamburger
            this.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

// === Smooth Scrolling ===
function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Check if it's an internal anchor link
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                
                const target = document.querySelector(href);
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// === Check User Session ===
function checkUserSession() {
    const userRole = sessionStorage.getItem('userRole');
    const username = sessionStorage.getItem('username');
    
    if (userRole && username) {
        currentUser = {
            role: userRole,
            username: username,
            section: sessionStorage.getItem('section')
        };
    }
}

// === Setup Date Inputs ===
function setupDateInputs() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    dateInputs.forEach(input => {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        input.setAttribute('min', today);
    });
}

// === Utility Functions ===

/**
 * Format date to readable string
 * @param {string} dateString - Date in ISO format
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string} dateString - Date in ISO format
 * @returns {string} Relative time string
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return formatDate(dateString);
    }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Check if a notice is expired
 * @param {string} expiryDate - Expiry date in ISO format
 * @returns {boolean} True if expired
 */
function isNoticeExpired(expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return expiry < today;
}

/**
 * Get days until expiry
 * @param {string} expiryDate - Expiry date in ISO format
 * @returns {number} Days until expiry (negative if expired)
 */
function getDaysUntilExpiry(expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// === Local Storage Functions ===

/**
 * Save notices to localStorage
 * @param {Array} notices - Array of notice objects
 */
function saveNotices(notices) {
    try {
        localStorage.setItem('notices', JSON.stringify(notices));
        return true;
    } catch (error) {
        console.error('Error saving notices:', error);
        return false;
    }
}

/**
 * Load notices from localStorage
 * @returns {Array} Array of notice objects
 */
function loadNotices() {
    try {
        const notices = localStorage.getItem('notices');
        return notices ? JSON.parse(notices) : [];
    } catch (error) {
        console.error('Error loading notices:', error);
        return [];
    }
}

/**
 * Get notice by ID
 * @param {number} noticeId - Notice ID
 * @returns {Object|null} Notice object or null
 */
function getNoticeById(noticeId) {
    const notices = loadNotices();
    return notices.find(notice => notice.id === noticeId) || null;
}

/**
 * Filter notices by criteria
 * @param {Object} criteria - Filter criteria
 * @returns {Array} Filtered notices
 */
function filterNotices(criteria) {
    let notices = loadNotices();
    
    // Filter by section
    if (criteria.section && criteria.section !== 'all') {
        notices = notices.filter(n => n.section === criteria.section);
    }
    
    // Filter by importance
    if (criteria.importance) {
        if (criteria.importance === 'important') {
            notices = notices.filter(n => n.isImportant);
        } else if (criteria.importance === 'regular') {
            notices = notices.filter(n => !n.isImportant);
        }
    }
    
    // Filter by status
    if (criteria.status) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (criteria.status === 'active') {
            notices = notices.filter(n => new Date(n.expiryDate) >= today);
        } else if (criteria.status === 'expired') {
            notices = notices.filter(n => new Date(n.expiryDate) < today);
        }
    }
    
    // Filter by search term
    if (criteria.searchTerm) {
        const term = criteria.searchTerm.toLowerCase();
        notices = notices.filter(n => 
            n.title.toLowerCase().includes(term) ||
            n.description.toLowerCase().includes(term)
        );
    }
    
    return notices;
}

// === Notice Management Functions ===

/**
 * Add a new notice
 * @param {Object} noticeData - Notice data
 * @returns {Object} Created notice
 */
function addNotice(noticeData) {
    const notices = loadNotices();
    
    const newNotice = {
        id: Date.now(),
        title: noticeData.title,
        description: noticeData.description,
        section: noticeData.section,
        postedDate: new Date().toISOString().split('T')[0],
        expiryDate: noticeData.expiryDate,
        isImportant: noticeData.isImportant || false,
        postedBy: currentUser ? currentUser.username : 'admin'
    };
    
    notices.push(newNotice);
    saveNotices(notices);
    
    return newNotice;
}

/**
 * Update an existing notice
 * @param {number} noticeId - Notice ID
 * @param {Object} updatedData - Updated notice data
 * @returns {boolean} Success status
 */
function updateNotice(noticeId, updatedData) {
    const notices = loadNotices();
    const index = notices.findIndex(n => n.id === noticeId);
    
    if (index === -1) return false;
    
    notices[index] = {
        ...notices[index],
        ...updatedData,
        lastModified: new Date().toISOString().split('T')[0]
    };
    
    return saveNotices(notices);
}

/**
 * Delete a notice
 * @param {number} noticeId - Notice ID
 * @returns {boolean} Success status
 */
function deleteNotice(noticeId) {
    const notices = loadNotices();
    const filteredNotices = notices.filter(n => n.id !== noticeId);
    return saveNotices(filteredNotices);
}

// === Validation Functions ===

/**
 * Validate notice form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result
 */
function validateNoticeForm(formData) {
    const errors = [];
    
    if (!formData.title || formData.title.trim().length < 5) {
        errors.push('Title must be at least 5 characters long');
    }
    
    if (!formData.description || formData.description.trim().length < 10) {
        errors.push('Description must be at least 10 characters long');
    }
    
    if (!formData.expiryDate) {
        errors.push('Expiry date is required');
    } else {
        const expiryDate = new Date(formData.expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expiryDate < today) {
            errors.push('Expiry date must be in the future');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// === UI Helper Functions ===

/**
 * Show loading spinner
 * @param {HTMLElement} element - Element to show spinner in
 */
function showLoading(element) {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    element.innerHTML = '';
    element.appendChild(spinner);
}

/**
 * Show success message
 * @param {string} message - Success message
 */
function showSuccessMessage(message) {
    showNotification(message, 'success');
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    showNotification(message, 'error');
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
    // Check if notification container exists, if not create it
    let container = document.querySelector('.notification-container');
    
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    }[type] || 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Setup close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
}

/**
 * Remove notification
 * @param {HTMLElement} notification - Notification element
 */
function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// === Statistics Functions ===

/**
 * Calculate statistics for notices
 * @param {Array} notices - Array of notices
 * @returns {Object} Statistics object
 */
function calculateStatistics(notices) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
        total: notices.length,
        active: notices.filter(n => new Date(n.expiryDate) >= today).length,
        expired: notices.filter(n => new Date(n.expiryDate) < today).length,
        important: notices.filter(n => n.isImportant).length,
        bySection: {
            examination: notices.filter(n => n.section === 'examination').length,
            scholarship: notices.filter(n => n.section === 'scholarship').length,
            academics: notices.filter(n => n.section === 'academics').length,
            events: notices.filter(n => n.section === 'events').length,
            placement: notices.filter(n => n.section === 'placement').length
        }
    };
}

// === Search and Sort Functions ===

/**
 * Search notices by keyword
 * @param {Array} notices - Array of notices
 * @param {string} keyword - Search keyword
 * @returns {Array} Filtered notices
 */
function searchNotices(notices, keyword) {
    if (!keyword || keyword.trim() === '') return notices;
    
    const term = keyword.toLowerCase().trim();
    return notices.filter(notice =>
        notice.title.toLowerCase().includes(term) ||
        notice.description.toLowerCase().includes(term) ||
        notice.section.toLowerCase().includes(term)
    );
}

/**
 * Sort notices by criteria
 * @param {Array} notices - Array of notices
 * @param {string} sortBy - Sort criteria (date, title, importance)
 * @param {string} order - Sort order (asc, desc)
 * @returns {Array} Sorted notices
 */
function sortNotices(notices, sortBy = 'date', order = 'desc') {
    const sorted = [...notices];
    
    sorted.sort((a, b) => {
        let comparison = 0;
        
        switch(sortBy) {
            case 'date':
                comparison = new Date(a.postedDate) - new Date(b.postedDate);
                break;
            case 'expiry':
                comparison = new Date(a.expiryDate) - new Date(b.expiryDate);
                break;
            case 'title':
                comparison = a.title.localeCompare(b.title);
                break;
            case 'importance':
                comparison = (b.isImportant ? 1 : 0) - (a.isImportant ? 1 : 0);
                break;
            default:
                comparison = 0;
        }
        
        return order === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
}

// === Export Functions (for debugging) ===
window.noticeboardUtils = {
    formatDate,
    formatRelativeTime,
    truncateText,
    capitalizeFirst,
    isNoticeExpired,
    getDaysUntilExpiry,
    loadNotices,
    saveNotices,
    getNoticeById,
    filterNotices,
    addNotice,
    updateNotice,
    deleteNotice,
    validateNoticeForm,
    calculateStatistics,
    searchNotices,
    sortNotices,
    showSuccessMessage,
    showErrorMessage
};

// === Console Welcome Message ===
console.log('%c Virtual College Notice Board System ', 'background: #3498db; color: white; font-size: 16px; padding: 10px;');
console.log('%c Developed for College Mini-Project ', 'background: #2c3e50; color: white; font-size: 12px; padding: 5px;');
console.log('');
console.log('Available utilities: window.noticeboardUtils');
