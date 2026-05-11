// driver-dashboard.js
// Handle driver dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in as driver
  requireAuth('driver');
  
  // Set up event listeners
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('refresh-btn').addEventListener('click', loadCitations);
  
  // Initialize dashboard
  initializeDashboard();
});

/**
 * Initialize dashboard on page load
 */
async function initializeDashboard() {
  // Display user info
  displayUserInfo();
  
  // Load citations
  await loadCitations();
}

/**
 * Display user information
 */
function displayUserInfo() {
  const licenseNumber = sessionStorage.getItem('licenseNumber');
  document.getElementById('user-license').textContent = licenseNumber || 'Unknown';
}

/**
 * Load and display driver's citations
 */
async function loadCitations() {
  try {
    // Show loading state
    showLoadingState();
    
    const licenseNumber = sessionStorage.getItem('licenseNumber');
    const token = getToken();
    
    if (!licenseNumber || !token) {
      showErrorState('User information not found. Please login again.');
      return;
    }
    
    // Fetch citations from API
    const response = await fetch(`http://localhost:8000/citations/driver/${licenseNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const citations = await response.json();
      displayCitations(citations);
    } else if (response.status === 404) {
      // No citations found
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
  
  // Calculate statistics
  let totalCitations = citations.length;
  let activeCitations = 0;
  let paidCitations = 0;
  let dismissedCitations = 0;
  
  // Add each citation as a table row
  citations.forEach(citation => {
    const row = createCitationRow(citation);
    tbody.appendChild(row);
    
    // Count by status
    if (citation.status === 'active') activeCitations++;
    else if (citation.status === 'paid') paidCitations++;
    else if (citation.status === 'dismissed') dismissedCitations++;
  });
  
  // Update statistics
  updateStats(totalCitations, activeCitations, paidCitations, dismissedCitations);
  
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
function updateStats(total, active, paid, dismissed) {
  document.getElementById('total-citations').textContent = total;
  document.getElementById('active-citations').textContent = active;
  document.getElementById('paid-citations').textContent = paid;
  document.getElementById('dismissed-citations').textContent = dismissed;
}

/**
 * Show loading state
 */
function showLoadingState() {
  document.getElementById('loading-state').style.display = 'block';
  hideErrorState();
  hideEmptyState();
  document.getElementById('citations-table-wrapper').style.display = 'none';
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  document.getElementById('loading-state').style.display = 'none';
}

/**
 * Show error state
 * @param {string} message - Error message to display
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
 * Hide error state
 */
function hideErrorState() {
  document.getElementById('error-state').style.display = 'none';
}

/**
 * Show empty state
 */
function showEmptyState() {
  document.getElementById('empty-state').style.display = 'block';
  hideLoadingState();
  hideErrorState();
  document.getElementById('citations-table-wrapper').style.display = 'none';
  
  // Reset stats
  updateStats(0, 0, 0, 0);
}

/**
 * Hide empty state
 */
function hideEmptyState() {
  document.getElementById('empty-state').style.display = 'none';
}