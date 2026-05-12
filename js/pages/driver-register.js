// driver-register.js
// Driver registration form handling and validation

// Form validation rules
const VALIDATION_RULES = {
  firstName: {
    required: true,
    pattern: /^[a-zA-Z\s'-]{2,50}$/,
    message: 'First name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes'
  },
  lastName: {
    required: true,
    pattern: /^[a-zA-Z\s'-]{2,50}$/,
    message: 'Last name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes'
  },
  birthDate: {
    required: true,
    custom: validateBirthDate,
    message: 'Please enter a valid birth date (must be 18 or older)'
  },
  address: {
    required: true,
    minLength: 5,
    message: 'Please enter a valid address'
  },
  licenseNumber: {
    required: true,
    pattern: /^[A-Z]{1,2}\d{6,8}$/,
    message: 'License number must be in format: STATE + 6-8 digits (e.g., NY1234567)'
  },
  licenseState: {
    required: true,
    message: 'Please select a state'
  }
};

// Birth date validation function
function validateBirthDate(value) {
  if (!value) return false;
  
  let year, month, day;
  
  // Try parsing YYYY-MM-DD format 
  if (value.includes('-')) {
    const parts = value.split('-');
    if (parts.length === 3) {
      year = parseInt(parts[0]);
      month = parseInt(parts[1]);
      day = parseInt(parts[2]);
    }
  }
  // Try parsing MM/DD/YYYY format 
  else if (value.includes('/')) {
    const parts = value.split('/');
    if (parts.length === 3) {
      month = parseInt(parts[0]);
      day = parseInt(parts[1]);
      year = parseInt(parts[2]);
    }
  }
  
  // Validate parsed values
  if (!year || !month || !day) return false;
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;
  
  // Use UTC to avoid timezone/DST issues
  const birthDate = new Date(Date.UTC(year, month - 1, day));
  const today = new Date();
  
  // Calculate age in years
  const age = today.getFullYear() - birthDate.getUTCFullYear();
  const monthDiff = today.getMonth() - (birthDate.getUTCMonth());
  const dayDiff = today.getDate() - birthDate.getUTCDate();
  
  // Adjust age if birthday hasn't occurred yet this year
  const birthdayNotOccurredYet = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0);
  const finalAge = birthdayNotOccurredYet ? age - 1 : age;

  return finalAge >= 18 && finalAge <= 120;
}

// Get form elements
const form = document.getElementById('registrationForm');
const successMessage = document.getElementById('successMessage');

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function() {
  // Prevent registration if already logged in
  if (typeof isLoggedIn === 'function' && isLoggedIn()) {
    window.location.href = 'driver-dashboard.html';
  }

  // Set up form submission
  form.addEventListener('submit', handleRegistrationSubmit);

  // Add real-time validation
  setupRealTimeValidation();
});

/**
 * Setup real-time validation on form fields
 */
function setupRealTimeValidation() {
  const fields = form.querySelectorAll('input, select');
  
  fields.forEach(field => {
    field.addEventListener('blur', function() {
      validateField(this);
    });

    field.addEventListener('input', function() {
      // Clear error on input if field was previously invalid
      if (this.classList.contains('form-error')) {
        validateField(this);
      }
    });
  });
}

/**
 * Validate a single field
 * @param {HTMLElement} field - Form field to validate
 * @returns {boolean} - True if valid
 */
function validateField(field) {
  const fieldName = field.name;
  const value = field.value.trim();
  const rules = VALIDATION_RULES[fieldName];
  const errorElement = field.parentElement.querySelector('.field-error');

  if (!rules) return true;

  // Check required
  if (rules.required && !value) {
    showFieldError(field, errorElement, 'This field is required');
    return false;
  }

  // Check custom validation
  if (rules.custom && value) {
    if (!rules.custom(value)) {
      showFieldError(field, errorElement, rules.message);
      return false;
    }
  }

  // Check pattern
  if (rules.pattern && value && !rules.pattern.test(value)) {
    showFieldError(field, errorElement, rules.message);
    return false;
  }

  // Check min length
  if (rules.minLength && value && value.length < rules.minLength) {
    showFieldError(field, errorElement, `Minimum length is ${rules.minLength} characters`);
    return false;
  }

  // Field is valid
  clearFieldError(field, errorElement);
  return true;
}

/**
 * Show field error
 * @param {HTMLElement} field - Form field
 * @param {HTMLElement} errorElement - Error message element
 * @param {string} message - Error message
 */
function showFieldError(field, errorElement, message) {
  field.classList.add('form-error');
  errorElement.textContent = message;
  errorElement.classList.add('show');
}

/**
 * Clear field error
 * @param {HTMLElement} field - Form field
 * @param {HTMLElement} errorElement - Error message element
 */
function clearFieldError(field, errorElement) {
  field.classList.remove('form-error');
  errorElement.classList.remove('show');
  errorElement.textContent = '';
}

/**
 * Validate entire form
 * @returns {boolean} - True if form is valid
 */
function validateForm() {
  const fields = form.querySelectorAll('input[required], select[required]');
  let isValid = true;

  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });

  return isValid;
}

/**
 * Handle form submission
 * @param {Event} event - Form submission event
 */
async function handleRegistrationSubmit(event) {
  event.preventDefault();

  // Validate form
  if (!validateForm()) {
    alert('Please fix all errors before submitting');
    return;
  }

  // Collect form data
  const formData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    birthDate: document.getElementById('birthDate').value,
    address: document.getElementById('address').value.trim(),
    licenseNumber: document.getElementById('licenseNumber').value.trim(),
    licenseState: document.getElementById('licenseState').value
  };

  try {
    // Call API to register driver
    const result = await registerDriver(formData);

    if (result.success) {
      // Show success message
      successMessage.style.display = 'block';
      
      // Clear form
      form.reset();

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = 'driver-login.html';
      }, 2000);
    } else {
      // Show error message
      alert('Registration failed: ' + result.error);
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('An error occurred during registration. Please try again.');
  }
}

// end of driver-register.js