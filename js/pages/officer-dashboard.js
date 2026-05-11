// officer-dashboard.js
// Handle officer dashboard functionality

let allCitations = [];  // Store all citations for filtering

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in as officer
  requireAuth('officer');
  
  // Set up event listeners
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('refresh-btn').addEventListener('click', loadAllCitations);
  document.getElementById('apply-filter-btn').addEventListener('click', applyFilter);
  document.getElementById('issue-citation-form').addEventListener('submit', handleIssueCitation);
  
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', switchTab);
  });
  
  // Initialize dashboard
  initializeDashboard();
});

/**
 * Initialize dashboard on page load
 */
async function initializeDashboard() {
  // Display user info
  displayUserInfo();
  
  // Load all citations
  await loadAllCitations();
}

/**
 * Display user information
 */
function displayUserInfo() {
  const badgeNumber = sessionStorage.getItem('badgeNumber');
  document.getElementById('user-badge').textContent = badgeNumber || 'Unknown';
}

/**
 * Load and display all citations
 */
async function loadAllCitations() {
  try {
    // Show loading state
    showLoadingState();
    
    const token = getToken();
    
    if (!token) {
      showErrorState('Authentication failed. Please login again.');
      return;
    }
    
    // Fetch all citations from API
    const response = await fetch(`http://localhost:8000/citations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const citations = await response.json();
      allCitations = citations;  // Store for filtering
      displayCitations(citations);
    } else if (response.status === 404) {
      showEmptyState();
    } else {
      showErrorState('Failed to load citations. Please try again.');
    }
  } catch (error) {
    console.error('Error loading citations:', error);
    showErrorState('Connection error. Please check your internet and try again.');
  }
}

/**
 * Apply filter to citations
 */
function applyFilter() {
  const filterStatus = document.getElementById('filter-status').value;
  
  let filteredCitations = allCitations;
  
  if (filterStatus) {
    filteredCitations = allCitations.filter(c => c.status.toLowerCase() === filterStatus.toLowerCase());
  }
  
  displayCitations(filteredCitations);
}

/**
 * Display citations in the table
 * @param {Array} citations - Array of citation objects
 */
function displayCitations(citations) {
  if (!citations || citations.length === 0) {
    showEmptyState();
    return;
  }
  
  // Clear previous rows
  const tbody = document.getElementById('citations-tbody');
  tbody.innerHTML = '';
  
  // Calculate statistics from ALL citations (not filtered)
  let totalCitations = allCitations.length;
  let issuedToday = 0;
  let activeCitations = 0;
  let paidCitations = 0;
  
  const today = new Date().toDateString();
  
  allCitations.forEach(citation => {
    const citationDate = new Date(citation.date_issued).toDateString();
    if (citationDate === today) issuedToday++;
    if (citation.status === 'active') activeCitations++;
    else if (citation.status === 'paid') paidCitations++;
  });
  
  // Add each citation as a table row
  citations.forEach(citation => {
    const row = createCitationRow(citation);
    tbody.appendChild(row);
  });
  
  // Update statistics
  updateStats(totalCitations, issuedToday, activeCitations, paidCitations);
  
  // Show table
  hideLoadingState();
  hideErrorState();
  hideEmptyState();
  document.getElementById('citations-table-wrapper').style.display = 'block';
}

/**
 * Create a table row for a citation
 * @param {object} citation - Citation object
 * @returns {HTMLElement} - Table row element
 */
function createCitationRow(citation) {
  const row = document.createElement('tr');
  
  // Format date
  const dateIssued = new Date(citation.date_issued).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Get status badge class
  const statusClass = `status-${citation.status.toLowerCase()}`;
  const statusText = citation.status.charAt(0).toUpperCase() + citation.status.slice(1);
  
  row.innerHTML = `
    <td>${citation.citation_number || 'N/A'}</td>
    <td>${citation.driver_license || 'Unknown'}</td>
    <td>${citation.violation_type || 'Unknown'}</td>
    <td>${dateIssued}</td>
    <td>$${(citation.fine_amount || 0).toFixed(2)}</td>
    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
  `;
  
  return row;
}

/**
 * Update statistics cards
 */
function updateStats(total, issuedToday, active, paid) {
  document.getElementById('total-citations').textContent = total;
  document.getElementById('issued-today').textContent = issuedToday;
  document.getElementById('active-citations').textContent = active;
  document.getElementById('paid-citations').textContent = paid;
}

/**
 * Switch between tabs
 * @param {Event} e - Click event
 */
function switchTab(e) {
  const tabName = e.target.getAttribute('data-tab');
  
  // Remove active class from all buttons and sections
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
  
  // Add active class to clicked button and corresponding section
  e.target.classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

/**
 * Handle issue citation form submission
 * @param {Event} e - Form submit event
 */
async function handleIssueCitation(e) {
  e.preventDefault();
  
  // Clear previous messages
  hideFormMessages();
  clearFormErrors();
  
  // Get form values
  const formData = {
    driver_license: document.getElementById('driver-license').value.trim(),
    driver_name: document.getElementById('driver-name').value.trim(),
    vehicle_plate: document.getElementById('vehicle-plate').value.trim(),
    vehicle_make: document.getElementById('vehicle-make').value.trim(),
    vehicle_model: document.getElementById('vehicle-model').value.trim(),
    violation_type: document.getElementById('violation-type').value.trim(),
    violation_location: document.getElementById('violation-location').value.trim(),
    fine_amount: parseFloat(document.getElementById('fine-amount').value),
    violation_description: document.getElementById('violation-description').value.trim(),
    issued_by_badge: sessionStorage.getItem('badgeNumber'),
    date_issued: new Date().toISOString(),
    status: 'active'
  };
  
  // Validate form
  if (!validateCitationForm(formData)) {
    return;
  }
  
  // Show loading state
  showFormLoading();
  
  try {
    const token = getToken();
    
    // Submit citation to API
    const response = await fetch(`http://localhost:8000/citations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // Show success message
      showFormSuccessMessage('Citation issued successfully! Citation #: ' + (result.citation_number || 'N/A'));
      
      // Reset form
      document.getElementById('issue-citation-form').reset();
      
      // Reload citations
      setTimeout(() => {
        loadAllCitations();
      }, 1500);
    } else {
      const error = await response.json();
      showFormErrorMessage(error.detail || 'Failed to issue citation. Please try again.');
      hideFormLoading();
    }
  } catch (error) {
    console.error('Error issuing citation:', error);
    showFormErrorMessage('Connection error. Please check your internet and try again.');
    hideFormLoading();
  }
}

/**
 * Validate citation form
 * @param {object} formData - Form data object
 * @returns {boolean} - True if valid
 */
function validateCitationForm(formData) {
  let isValid = true;
  
  // Driver License
  if (!formData.driver_license) {
    setFieldError('driver-license-error', 'Driver license is required');
    isValid = false;
  } else if (formData.driver_license.length < 3) {
    setFieldError('driver-license-error', 'Driver license must be at least 3 characters');
    isValid = false;
  }
  
  // Driver Name
  if (!formData.driver_name) {
    setFieldError('driver-name-error', 'Driver name is required');
    isValid = false;
  }
  
  // Vehicle Plate
  if (!formData.vehicle_plate) {
    setFieldError('vehicle-plate-error', 'License plate is required');
    isValid = false;
  }
  
  // Vehicle Make
  if (!formData.vehicle_make) {
    setFieldError('vehicle-make-error', 'Vehicle make is required');
    isValid = false;
  }
  
  // Vehicle Model
  if (!formData.vehicle_model) {
    setFieldError('vehicle-model-error', 'Vehicle model is required');
    isValid = false;
  }
  
  // Violation Type
  if (!formData.violation_type) {
    setFieldError('violation-type-error', 'Violation type is required');
    isValid = false;
  }
  
  // Violation Location
  if (!formData.violation_location) {
    setFieldError('violation-location-error', 'Location is required');
    isValid = false;
  }
  
  // Fine Amount
  if (!formData.fine_amount || formData.fine_amount < 0) {
    setFieldError('fine-amount-error', 'Valid fine amount is required');
    isValid = false;
  }
  
  return isValid;
}

/**
 * Set field error message
 * @param {string} fieldId - Error message element ID
 * @param {string} message - Error message
 */
function setFieldError(fieldId, message) {
  document.getElementById(fieldId).textContent = message;
}

/**
 * Clear all field errors
 */
function clearFormErrors() {
  document.querySelectorAll('.error-hint').forEach(el => el.textContent = '');
}

/**
 * Show form loading state
 */
function showFormLoading() {
  const submitBtn = document.querySelector('#issue-citation-form button[type="submit"]');
  const submitText = document.getElementById('submit-text');
  const submitSpinner = document.getElementById('submit-spinner');
  
  submitBtn.disabled = true;
  submitText.style.display = 'none';
  submitSpinner.style.display = 'inline-block';
}

/**
 * Hide form loading state
 */
function hideFormLoading() {
  const submitBtn = document.querySelector('#issue-citation-form button[type="submit"]');
  const submitText = document.getElementById('submit-text');
  const submitSpinner = document.getElementById('submit-spinner');
  
  submitBtn.disabled = false;
  submitText.style.display = 'inline';
  submitSpinner.style.display = 'none';
}

/**
 * Show form success message
 * @param {string} message - Success message
 */
function showFormSuccessMessage(message) {
  const successDiv = document.getElementById('success-message');
  const successText = document.getElementById('success-text');
  
  successText.textContent = message;
  successDiv.classList.add('success-alert');
  successDiv.style.display = 'block';
  hideFormLoading();
}

/**
 * Show form error message
 * @param {string} message - Error message
 */
function showFormErrorMessage(message) {
  const errorDiv = document.getElementById('form-error-message');
  const errorText = document.getElementById('form-error-text');
  
  errorText.textContent = message;
  errorDiv.style.display = 'block';
}

/**
 * Hide form messages
 */
function hideFormMessages() {
  document.getElementById('success-message').style.display = 'none';
  document.getElementById('form-error-message').style.display = 'none';
}

/**
 * Show loading state for citations table
 */
function showLoadingState() {
  document.getElementById('loading-state').style.display = 'block';
  hideErrorState();
  hideEmptyState();
  document.getElementById('citations-table-wrapper').style.display = 'none';
}

/**
 * Hide loading state for citations table
 */
function hideLoadingState() {
  document.getElementById('loading-state').style.display = 'none';
}

/**
 * Show error state for citations table
 * @param {string} message - Error message
 */
function showErrorState(message) {
  const errorDiv = document.getElementById('error-state');
  const errorText = document.getElementById('error-text');
  errorText.textContent = message;
  errorDiv.style.display = 'block';
  hideLoadingState();
  hideEmptyState();
  document.getElementById('citations-table-wrapper').style.display = 'none';
}

/**
 * Hide error state for citations table
 */
function hideErrorState() {
  document.getElementById('error-state').style.display = 'none';
}

/**
 * Show empty state for citations table
 */
function showEmptyState() {
  document.getElementById('empty-state').style.display = 'block';
  hideLoadingState();
  hideErrorState();
  document.getElementById('citations-table-wrapper').style.display = 'none';
}

/**
 * Hide empty state for citations table
 */
function hideEmptyState() {
  document.getElementById('empty-state').style.display = 'none';
}