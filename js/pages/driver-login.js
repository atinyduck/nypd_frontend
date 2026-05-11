// driver-login.js
// Handle driver login form submission

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  
  // Add form submission listener
  loginForm.addEventListener('submit', handleLogin);
});

/**
 * Handle driver login form submission
 * @param {Event} e - Form submit event
 */
async function handleLogin(e) {
  e.preventDefault();  // Prevent page reload
  
  // Clear previous messages
  hideMessages();
  
  // Get form values
  const licenseNumber = document.getElementById('license-number').value.trim();
  
  // Validate inputs (client-side)
  if (!validateLoginForm(licenseNumber)) {
    return;  // Stop if validation fails
  }
  
  // Show loading state
  showLoading();
  
  try {
    // Call the login function from auth.js
    const response = await driverLogin(licenseNumber);
    
    if (response.success) {
      // Verify user type is driver
      const userType = sessionStorage.getItem('userType');
      if (userType !== 'driver') {
        // Wrong credentials for driver - clear and show error
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('licenseNumber');
        showErrorMessage('Invalid driver license number. Please try again.');
        hideLoading();
        return;
      }
      
      // Show success message
      showSuccessMessage('Login successful! Redirecting...');
      
      // Redirect to driver dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = 'driver-dashboard.html';
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
 * @param {string} licenseNumber - Driver's license number
 * @returns {boolean} - True if valid, false otherwise
 */
function validateLoginForm(licenseNumber) {
  let isValid = true;
  
  // Clear previous error messages
  document.getElementById('license-error').textContent = '';
  
  // Validate license number
  if (!licenseNumber) {
    document.getElementById('license-error').textContent = 'License number is required';
    isValid = false;
  } else if (licenseNumber.length < 3) {
    document.getElementById('license-error').textContent = 'License number must be at least 3 characters';
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