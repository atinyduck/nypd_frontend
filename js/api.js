// api.js
// API helper functions for NYPD Citation System

const API_BASE_URL = 'http://localhost:8000';

/**
 * Generic API call helper
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Request body data
 * @param {string} token - Authentication token (optional)
 * @returns {object} - { success: bool, data?: any, error?: string }
 */
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json().catch(() => null);

    if (response.ok) {
      return { success: true, data: responseData };
    } else {
      return { 
        success: false, 
        error: responseData?.detail || `Error ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error) {
    console.error('API call error:', error);
    return { 
      success: false, 
      error: 'Connection failed. Please try again.' 
    };
  }
}

// ========================================================
// DRIVER REGISTRATION & AUTHENTICATION
// ========================================================

/**
 * Register a new driver
 * @param {object} driverData - Driver information
 * @returns {object} - { success: bool, data?: object, error?: string }
 */
async function registerDriver(driverData) {
  return apiCall('/drivers/register', 'POST', {
    First_Name: driverData.firstName,
    Last_Name: driverData.lastName,
    Address: driverData.address,
    Birth_Date: driverData.birthDate,
    License_Number: driverData.licenseNumber,
    License_State: driverData.licenseState
  });
}

/**
 * Register a new vehicle
 * @param {object} vehicleData - Vehicle information
 * @returns {object} - { success: bool, data?: object, error?: string }
 */
async function registerVehicle(vehicleData) {
  return apiCall('/vehicles/register', 'POST', {
    VIN: vehicleData.vin,
    Make: vehicleData.make,
    Model: vehicleData.model,
    Color: vehicleData.color,
    License_Plate: vehicleData.licensePlate,
    License_State: vehicleData.licenseState
  });
}

// ========================================================
// DRIVER DATA RETRIEVAL
// ========================================================

/**
 * Get driver by license number
 * @param {string} licenseNumber - Driver's license number
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, data?: object, error?: string }
 */
async function getDriverByLicense(licenseNumber, token) {
  return apiCall(`/drivers/license/${licenseNumber}`, 'GET', null, token);
}

/**
 * Get driver by ID
 * @param {number} driverId - Driver ID
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, data?: object, error?: string }
 */
async function getDriverById(driverId, token) {
  return apiCall(`/drivers/${driverId}`, 'GET', null, token);
}

/**
 * Get all drivers (admin only)
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, data?: array, error?: string }
 */
async function getAllDrivers(token) {
  return apiCall('/drivers/', 'GET', null, token);
}

// ========================================================
// VEHICLE DATA RETRIEVAL
// ========================================================

/**
 * Get vehicle by VIN
 * @param {string} vin - Vehicle VIN
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, data?: object, error?: string }
 */
async function getVehicleByVin(vin, token) {
  return apiCall(`/vehicles/${vin}`, 'GET', null, token);
}

/**
 * Get all vehicles (admin only)
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, data?: array, error?: string }
 */
async function getAllVehicles(token) {
  return apiCall('/vehicles/', 'GET', null, token);
}

/**
 * Create a new vehicle (authenticated)
 * @param {object} vehicleData - Vehicle information
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, data?: object, error?: string }
 */
async function createVehicle(vehicleData, token) {
  return apiCall('/vehicles/', 'POST', {
    VIN: vehicleData.vin,
    Make: vehicleData.make,
    Model: vehicleData.model,
    Color: vehicleData.color,
    License_Plate: vehicleData.licensePlate,
    License_State: vehicleData.licenseState
  }, token);
}

/**
 * Update vehicle
 * @param {string} vin - Vehicle VIN
 * @param {object} vehicleData - Vehicle information
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, error?: string }
 */
async function updateVehicle(vin, vehicleData, token) {
  return apiCall(`/vehicles/${vin}`, 'PUT', {
    VIN: vehicleData.vin,
    Make: vehicleData.make,
    Model: vehicleData.model,
    Color: vehicleData.color,
    License_Plate: vehicleData.licensePlate,
    License_State: vehicleData.licenseState
  }, token);
}

/**
 * Delete vehicle
 * @param {string} vin - Vehicle VIN
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, error?: string }
 */
async function deleteVehicle(vin, token) {
  return apiCall(`/vehicles/${vin}`, 'DELETE', null, token);
}

// ========================================================
// CITATIONS/CORRECTION NOTICES
// ========================================================

/**
 * Get citations for a driver
 * @param {number} driverId - Driver ID
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, data?: array, error?: string }
 */
async function getDriverCitations(driverId, token) {
  return apiCall(`/citations/driver/${driverId}`, 'GET', null, token);
}

/**
 * Get all citations (admin only)
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, data?: array, error?: string }
 */
async function getAllCitations(token) {
  return apiCall('/citations/', 'GET', null, token);
}

/**
 * Get citation by notice ID
 * @param {number} noticeId - Notice ID
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, data?: object, error?: string }
 */
async function getCitationById(noticeId, token) {
  return apiCall(`/citations/${noticeId}`, 'GET', null, token);
}

/**
 * Create a new citation
 * @param {object} citationData - Citation information
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, data?: object, error?: string }
 */
async function createCitation(citationData, token) {
  return apiCall('/citations/', 'POST', {
    Violation_Date: citationData.violationDate,
    Violation_Time: citationData.violationTime,
    Location: citationData.location,
    Driver_ID: citationData.driverId,
    Officer_ID: citationData.officerId,
    VIN: citationData.vin,
    Violations: citationData.violations
  }, token);
}

/**
 * Update citation
 * @param {number} noticeId - Notice ID
 * @param {object} citationData - Citation information
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, error?: string }
 */
async function updateCitation(noticeId, citationData, token) {
  return apiCall(`/citations/${noticeId}`, 'PUT', citationData, token);
}

/**
 * Delete citation
 * @param {number} noticeId - Notice ID
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, error?: string }
 */
async function deleteCitation(noticeId, token) {
  return apiCall(`/citations/${noticeId}`, 'DELETE', null, token);
}

// ========================================================
// DRIVER PROFILE MANAGEMENT
// ========================================================

/**
 * Update driver address
 * @param {number} driverId - Driver ID
 * @param {string} newAddress - New address
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, error?: string }
 */
async function updateDriverAddress(driverId, newAddress, token) {
  return apiCall(`/drivers/${driverId}/address?new_address=${encodeURIComponent(newAddress)}`, 'PUT', null, token);
}

/**
 * Delete driver
 * @param {number} driverId - Driver ID
 * @param {string} token - Authentication token
 * @returns {object} - { success: bool, error?: string }
 */
async function deleteDriver(driverId, token) {
  return apiCall(`/drivers/${driverId}`, 'DELETE', null, token);
}

// end of api.js
