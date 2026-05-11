// officer-login.js
// Handle officer login form submission

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  
  // Add form submission listener
  loginForm.addEventListener('submit', handleLogin);
});

/**
 * Handle officer login form submission
 * @param {Event} e - Form submit event
 */
async function handleLogin(e) {
  e.preventDefault();  // Prevent page reload
  
  // Clear previous messages
  hideMessages();
  
  // Get form values
  const badgeNumber = document.getElementById('badge-number').value.trim();
  const password = document.getElementById('password').value.trim();
  
  // Validate inputs (client-side)
  if (!validateLoginForm(badgeNumber, password)) {
    return;  // Stop if validation fails
  }
  
  // Show loading state
  showLoading();
  
  try {
    // Call the login function from auth.js
    const response = await officerLogin(badgeNumber, password);
    
    if (response.success) {
      // Show success message
      showSuccessMessage('Login successful! Redirecting...');
      
      // Redirect to officer dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = 'officer-dashboard.html';
      }, 2000);
    } else {
      // Show error message
      showErrorMessage(response.message || 'Login failed. Please try again.');
      hideLoading();
    }
  } catch (error) {
    console.error('Login error:', error);
    showErrorMessage('Connection error. Please check your internet and try again.');
    hideLoading();
  }
}

/**
 * Validate login form inputs
 * @param {string} badgeNumber - Officer's badge number
 * @param {string} password - Officer's password
 * @returns {boolean} - True if valid, false otherwise
 */
function validateLoginForm(badgeNumber, password) {
  let isValid = true;
  
  // Clear previous error messages
  document.getElementById('badge-error').textContent = '';
  document.getElementById('password-error').textContent = '';
  
  // Validate badge number
  if (!badgeNumber) {
    document.getElementById('badge-error').textContent = 'Badge number is required';
    isValid = false;
  } else if (badgeNumber.length < 3) {
    document.getElementById('badge-error').textContent = 'Badge number must be at least 3 characters';
    isValid = false;
  }
  
  // Validate password
  if (!password) {
    document.getElementById('password-error').textContent = 'Password is required';
    isValid = false;
  } else if (password.length < 6) {
    document.getElementById('password-error').textContent = 'Password must be at least 6 characters';
    isValid = false;
  }
  
  return isValid;
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
  const errorDiv = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  
  errorText.textContent = message;
  errorDiv.style.display = 'block';
}

/**
 * Show success message
 * @param {string} message - Success message to display
 */
function showSuccessMessage(message) {
  const successDiv = document.getElementById('success-message');
  const successText = document.getElementById('success-text');
  
  successText.textContent = message;
  successDiv.style.display = 'block';
}

/**
 * Hide error and success messages
 */
function hideMessages() {
  document.getElementById('error-message').style.display = 'none';
  document.getElementById('success-message').style.display = 'none';
}

/**
 * Show loading state on submit button
 */
function showLoading() {
  const submitBtn = document.querySelector('button[type="submit"]');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  
  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline-block';
}

/**
 * Hide loading state on submit button
 */
function hideLoading() {
  const submitBtn = document.querySelector('button[type="submit"]');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  
  submitBtn.disabled = false;
  btnText.style.display = 'inline';
  btnSpinner.style.display = 'none';
}