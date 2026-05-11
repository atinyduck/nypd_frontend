// vehicle-register.js
// Vehicle registration form handling and validation

// Form validation rules
const VALIDATION_RULES = {
  vin: {
    required: true,
    length: 17,
    pattern: /^[A-HJ-NPR-Z0-9]{17}$/,
    message: 'VIN must be exactly 17 characters (numbers and letters, no I, O, Q)'
  },
  make: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z0-9\s-]{2,50}$/,
    message: 'Make must be 2-50 characters'
  },
  model: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z0-9\s-]{2,50}$/,
    message: 'Model must be 2-50 characters'
  },
  color: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s]{2,50}$/,
    message: 'Color must be 2-50 letters only'
  },
  year: {
    required: true,
    custom: validateYear,
    message: 'Please enter a valid year (1900-2100)'
  },
  licensePlate: {
    required: true,
    minLength: 2,
    pattern: /^[A-Z0-9]{2,10}$/,
    message: 'License plate format invalid (2-10 alphanumeric characters)'
  },
  plateState: {
    required: true,
    message: 'Please select a state'
  }
};

// Year validation function
function validateYear(value) {
  const year = parseInt(value);
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 1;
}

// Get form elements
const form = document.getElementById('vehicleForm');
const successMessage = document.getElementById('successMessage');

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function() {
  // Prevent registration if not logged in
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
    window.location.href = 'driver-register.html';
  }

  // Set up form submission
  form.addEventListener('submit', handleVehicleSubmit);

  // Add real-time validation
  setupRealTimeValidation();

  // Format VIN input to uppercase
  document.getElementById('vin').addEventListener('input', function() {
    this.value = this.value.toUpperCase();
  });

  // Format license plate to uppercase
  document.getElementById('licensePlate').addEventListener('input', function() {
    this.value = this.value.toUpperCase();
  });
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

  // Check exact length
  if (rules.length && value && value.length !== rules.length) {
    showFieldError(field, errorElement, `Must be exactly ${rules.length} characters`);
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
async function handleVehicleSubmit(event) {
  event.preventDefault();

  // Validate form
  if (!validateForm()) {
    alert('Please fix all errors before submitting');
    return;
  }

  // Collect form data
  const formData = {
    vin: document.getElementById('vin').value.toUpperCase(),
    make: document.getElementById('make').value.trim(),
    model: document.getElementById('model').value.trim(),
    color: document.getElementById('color').value.trim(),
    licensePlate: document.getElementById('licensePlate').value.toUpperCase(),
    licenseState: document.getElementById('plateState').value
  };

  try {
    // Get authentication token
    const token = typeof getToken === 'function' ? getToken() : null;
    
    // If authenticated, use authenticated endpoint
    if (token) {
      const result = await createVehicle(formData, token);
      
      if (result.success) {
        showSuccess();
      } else {
        alert('Vehicle registration failed: ' + result.error);
      }
    } else {
      // Use public registration endpoint
      const result = await registerVehicle(formData);
      
      if (result.success) {
        showSuccess();
      } else {
        alert('Vehicle registration failed: ' + result.error);
      }
    }
  } catch (error) {
    console.error('Vehicle registration error:', error);
    alert('An error occurred during registration. Please try again.');
  }
}

/**
 * Show success message and reset form
 */
function showSuccess() {
  successMessage.style.display = 'block';
  form.reset();
  
  // Scroll to success message
  successMessage.scrollIntoView({ behavior: 'smooth' });
}

// end of vehicle-register.js
