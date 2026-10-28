const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api').replace(/\/+$/, '');

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error(`Cannot reach the ResQNet backend at ${API_BASE_URL}. Start the Java server and try again.`);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error('The ResQNet backend returned an invalid JSON response.');
  }
  if (!response.ok) {
    throw new Error(body?.error || `Backend request failed (${response.status})`);
  }
  return body;
}

function jsonBody(value) {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  };
}

function displayEnum(value) {
  return typeof value === 'string'
    ? value.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    : '';
}

function normalizeEmergency(emergency) {
  return {
    ...emergency,
    contactNumber: emergency.contact ?? emergency.contactNumber ?? '',
    type: displayEnum(emergency.type),
    numberOfPeople: emergency.affectedPeopleCount ?? emergency.numberOfPeople ?? 0,
    requiredResources: displayEnum(emergency.requiredResourceType ?? emergency.requiredResources),
  };
}

function normalizeVolunteer(volunteer) {
  const skillSet = Array.isArray(volunteer.skillSet)
    ? volunteer.skillSet
    : typeof volunteer.skills === 'string'
      ? volunteer.skills.split(/[;,|]/).map((skill) => skill.trim()).filter(Boolean)
      : [];
  const firstSkill = skillSet[0] ?? 'GENERAL';
  return {
    ...volunteer,
    contactNumber: volunteer.contact ?? volunteer.contactNumber ?? '',
    skillSet,
    skills: firstSkill.toUpperCase().replace(/[\s-]+/g, '_'),
    available: volunteer.status ? volunteer.status === 'AVAILABLE' : Boolean(volunteer.available),
  };
}

function normalizeSuggestions(result) {
  const suggestedResources = [];
  if (result?.resource) {
    suggestedResources.push({
      id: result.resource.id,
      type: result.resource.name || displayEnum(result.resource.type),
      location: result.resource.location,
      score: result.resourceScore,
      kind: 'resource',
    });
  }
  if (result?.volunteer) {
    suggestedResources.push({
      id: result.volunteer.id,
      type: result.volunteer.name,
      location: result.volunteer.location,
      score: result.volunteerScore,
      kind: 'volunteer',
    });
  }
  return { suggestedResources, successful: result?.successful ?? suggestedResources.length > 0 };
}

export async function getDashboard() {
  const data = await request('/dashboard');
  return {
    ...data,
    activeEmergencies: data.active,
    criticalCount: data.critical,
    highCount: data.high,
    mediumCount: data.medium,
    lowCount: data.low,
  };
}

export async function getEmergencies() {
  const data = await request('/emergencies');
  return data.map(normalizeEmergency);
}

export async function createEmergency(emergencyData) {
  const data = await request('/emergencies', {
    method: 'POST',
    ...jsonBody(emergencyData),
  });
  return normalizeEmergency(data);
}

export async function updateEmergencyStatus(id, status) {
  const data = await request('/dispatch/status', {
    method: 'PUT',
    ...jsonBody({ emergencyId: id, status }),
  });
  return normalizeEmergency(data);
}

export async function getResources() {
  return request('/resources');
}

export async function createResource(resourceData) {
  return request('/resources', {
    method: 'POST',
    ...jsonBody(resourceData),
  });
}

export async function updateResourceAvailability(id, available) {
  return request(`/resources/${encodeURIComponent(id)}/availability`, {
    method: 'PUT',
    ...jsonBody({ available }),
  });
}

export async function getVolunteers() {
  const data = await request('/volunteers');
  return data.map(normalizeVolunteer);
}

export async function createVolunteer(volunteerData) {
  const data = await request('/volunteers', {
    method: 'POST',
    ...jsonBody({
      name: volunteerData.name,
      contact: volunteerData.contactNumber,
      location: volunteerData.location,
      skillSet: volunteerData.skillSet,
    }),
  });
  return normalizeVolunteer(data);
}

export async function updateVolunteerAvailability(id, available) {
  const data = await request('/volunteers', {
    method: 'POST',
    ...jsonBody({ id, status: available ? 'AVAILABLE' : 'BUSY' }),
  });
  return normalizeVolunteer(data);
}

export async function assignResources(emergencyId) {
  const data = await request('/dispatch/match', {
    method: 'POST',
    ...jsonBody({ emergencyId }),
  });
  return normalizeSuggestions(data);
}

export async function getMatchingSuggestions(emergencyId) {
  const data = await request(`/dispatch/${encodeURIComponent(emergencyId)}/suggestions`);
  return normalizeSuggestions(data);
}
