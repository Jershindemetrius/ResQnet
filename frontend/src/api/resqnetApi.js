const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

// Dashboard API
export async function getDashboard() {
  const response = await fetch(`${API_BASE_URL}/dashboard`);
  if (!response.ok) {
    throw new Error(`Dashboard request failed: ${response.status}`);
  }
  return response.json();
}

// Emergency APIs
export async function getEmergencies() {
  const response = await fetch(`${API_BASE_URL}/emergencies`);
  if (!response.ok) {
    throw new Error(`Failed to fetch emergencies: ${response.status}`);
  }
  return response.json();
}

export async function createEmergency(emergencyData) {
  const response = await fetch(`${API_BASE_URL}/emergencies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emergencyData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create emergency: ${response.status}`);
  }
  return response.json();
}

export async function updateEmergencyStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/emergencies/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update emergency status: ${response.status}`);
  }
  return response.json();
}

// Resource APIs
export async function getResources() {
  const response = await fetch(`${API_BASE_URL}/resources`);
  if (!response.ok) {
    throw new Error(`Failed to fetch resources: ${response.status}`);
  }
  return response.json();
}

export async function createResource(resourceData) {
  const response = await fetch(`${API_BASE_URL}/resources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resourceData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create resource: ${response.status}`);
  }
  return response.json();
}

export async function updateResourceAvailability(id, available) {
  const response = await fetch(`${API_BASE_URL}/resources/${id}/availability`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ available }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update resource availability: ${response.status}`);
  }
  return response.json();
}

// Volunteer APIs
export async function getVolunteers() {
  const response = await fetch(`${API_BASE_URL}/volunteers`);
  if (!response.ok) {
    throw new Error(`Failed to fetch volunteers: ${response.status}`);
  }
  return response.json();
}

export async function createVolunteer(volunteerData) {
  const response = await fetch(`${API_BASE_URL}/volunteers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(volunteerData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create volunteer: ${response.status}`);
  }
  return response.json();
}

export async function updateVolunteerAvailability(id, available) {
  const response = await fetch(`${API_BASE_URL}/volunteers/${id}/availability`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ available }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update volunteer availability: ${response.status}`);
  }
  return response.json();
}

// Dispatch APIs
export async function assignResources(emergencyId, assignmentData) {
  const response = await fetch(`${API_BASE_URL}/dispatch/${emergencyId}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assignmentData),
  });
  if (!response.ok) {
    throw new Error(`Failed to assign resources: ${response.status}`);
  }
  return response.json();
}

export async function getMatchingSuggestions(emergencyId) {
  const response = await fetch(`${API_BASE_URL}/dispatch/${emergencyId}/suggestions`);
  if (!response.ok) {
    throw new Error(`Failed to get matching suggestions: ${response.status}`);
  }
  return response.json();
}
