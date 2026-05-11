// auth.js
// Authentication functions for NYPD Citation System
// Note: API_BASE_URL is defined in api.js

// Store configuration
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_TYPE: 'userType',
  LICENSE_NUMBER: 'licenseNumber',
  BADGE_NUMBER: 'badgeNumber'
};

/**
 * Driver Login - License number only
 * @param {string} licenseNumber - Driver's license number
 * @returns {object} - { success: bool, message: string, token?: string }
 */
async function driverLogin(licenseNumber) {
  try {
    // Create FormData for OAuth2 format (FastAPI expects this)
    // For drivers, use license number as both username and password
    const formData = new FormData();
    formData.append('username', licenseNumber);
    formData.append('password', licenseNumber);  // Use license number as password
    
    // Call the /token endpoint
    const response = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Store token in sessionStorage (cleared when browser closes)
      sessionStorage.setItem('token', data.access_token);
      sessionStorage.setItem('userType', 'driver');
      sessionStorage.setItem('licenseNumber', licenseNumber);
      
      return { 
        success: true, 
        message: 'Login successful',
        token: data.access_token 
      };
    } else {
      // Unauthorized or other error
      const error = await response.json();
      return { 
        success: false, 
        message: error.detail || 'License number not found'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: 'Connection failed. Please try again.' 
    };
  }
}


/**
 * Admin Login
 * @param {string} badgeNumber - Officer's badge number
 * @param {string} password - Officer's password
 * @returns {object} - { success: bool, message: string, token?: string }
 */
async function adminLogin(badgeNumber, password) {
  try {
    const formData = new FormData();
    formData.append('username', badgeNumber);  // API expects 'username'
    formData.append('password', password);
    
    const response = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Store token for admin
      sessionStorage.setItem('token', data.access_token);
      sessionStorage.setItem('userType', 'admin');
      sessionStorage.setItem('badgeNumber', badgeNumber);
      
      return { 
        success: true, 
        message: 'Admin login successful',
        token: data.access_token 
      };
    } else {
      const error = await response.json();
      return { 
        success: false, 
        message: error.detail || 'Invalid credentials'
      };
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return { 
      success: false, 
      message: 'Connection failed. Please try again.' 
    };
  }
}

/**
 * Logout - Clear stored authentication data
 */
function logout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('userType');
  sessionStorage.removeItem('licenseNumber');
  sessionStorage.removeItem('badgeNumber');
  window.location.href = '../index.html';
}

/**
 * Check if user is logged in
 * @returns {boolean} - True if token exists
 */
function isLoggedIn() {
  return sessionStorage.getItem('token') !== null;
}

/**
 * Get stored token
 * @returns {string|null} - JWT token or null
 */
function getToken() {
  return sessionStorage.getItem('token');
}

/**
 * Get user type (driver or admin)
 * @returns {string|null} - 'driver', 'admin', or null
 */
function getUserType() {
  return sessionStorage.getItem('userType');
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '../pages/driver-login.html';
  }
}

/**
 * Officer Login
 * @param {string} badgeNumber - Officer's badge number
 * @param {string} password - Officer's password
 * @returns {object} - { success: bool, message: string, token?: string }
 */
async function officerLogin(badgeNumber, password) {
  return adminLogin(badgeNumber, password);
}

/**
 * Get license number from session
 * @returns {string|null}
 */
function getLicenseNumber() {
  return sessionStorage.getItem('licenseNumber');
}

/**
 * Get badge number from session
 * @returns {string|null}
 */
function getBadgeNumber() {
  return sessionStorage.getItem('badgeNumber');
}

/**
 * Get user ID (license number for drivers, badge number for officers)
 * @returns {string|null} - License or badge number, or null
 */
function getUserId() {
  const userType = getUserType();
  if (userType === 'driver') {
    return sessionStorage.getItem('licenseNumber');
  } else if (userType === 'admin' || userType === 'officer') {
    return sessionStorage.getItem('badgeNumber');
  }
  return null;
}

/**
 * Redirect to appropriate login if not authenticated
 * @param {string} requiredType - Optional: 'driver' or 'admin' to restrict page
 */
function requireAuthByType(requiredType) {
  if (!isLoggedIn()) {
    if (requiredType === 'driver') {
      window.location.href = '../pages/driver-login.html';
    } else {
      window.location.href = '../pages/officer-login.html';
    }
    return;
  }
  
  // If a specific user type is required, check it
  if (requiredType && getUserType() !== requiredType) {
    alert('Unauthorized access. Logging you out.');
    logout();
  }
}

// end of auth.js