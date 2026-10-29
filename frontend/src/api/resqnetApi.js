const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = configuredApiBaseUrl
  ? `${configuredApiBaseUrl.replace(/\/+$/, '').replace(/\/api$/i, '')}/api`
  : '/api';
export const API_PAGE_SIZE = 100;
const MAX_RESPONSE_BYTES = 4 * 1024 * 1024;

async function readJson(response) {
  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) {
      throw new Error('The backend returned an oversized response. Restart it from the latest project source to enable paginated API responses.');
    }
    return JSON.parse(text);
  }

  const chunks = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error('The backend returned an oversized response. Restart it from the latest project source to enable paginated API responses.');
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function request(path, options) {
  let response;
  const { allowUnauthorized = false, ...fetchOptions } = options ?? {};
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      credentials: 'include',
    });
  } catch {
    const target = import.meta.env.VITE_API_BASE_URL || 'the local Java backend through the Vite proxy';
    throw new Error(`Cannot reach ${target}. Check that the Java backend is running on port 8080 and that the host firewall allows the connection.`);
  }

  let body;
  try {
    body = await readJson(response);
  } catch (parseError) {
    if (parseError instanceof Error && parseError.message.includes('oversized response')) {
      throw parseError;
    }
    throw new Error('The ResQNet backend returned an invalid JSON response.');
  }
  if (allowUnauthorized && response.status === 401) return null;
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

function pagedPath(path, pagination) {
  if (!pagination) return path;
  const params = new URLSearchParams({
    limit: String(pagination.limit ?? API_PAGE_SIZE),
    offset: String(pagination.offset ?? 0),
  });
  return `${path}?${params.toString()}`;
}

function listRows(data) {
  if (!Array.isArray(data)) {
    throw new Error('The ResQNet backend returned an invalid list response.');
  }
  return data;
}

function displayEnum(value) {
  return typeof value === 'string'
    ? value.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    : '';
}

function canonicalSkill(skill) {
  const value = skill.toLowerCase();
  if (value.includes('first aid')) return 'FIRST_AID';
  if (value.includes('medical') || value.includes('nurs')) return 'MEDICAL';
  if (value.includes('fire')) return 'FIREFIGHTING';
  if (value.includes('rescue')) return 'RESCUE';
  if (value.includes('driv')) return 'DRIVER';
  if (value.includes('communication') || value.includes('radio')) return 'COMMUNICATION';
  return 'GENERAL';
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
    skills: canonicalSkill(firstSkill),
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

export async function getAdminDashboard() {
  const data = await request('/admin/dashboard');
  return {
    ...data,
    activeEmergencies: data.active,
    criticalCount: data.critical,
    highCount: data.high,
    mediumCount: data.medium,
    lowCount: data.low,
  };
}

export async function getAdminEmergencies(pagination) {
  const data = listRows(await request(pagedPath('/admin/incidents', pagination)));
  return data.map(normalizeEmergency);
}

export async function getEmergencies(pagination) {
  const data = listRows(await request(pagedPath('/emergencies', pagination)));
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

export async function getResources(pagination) {
  return listRows(await request(pagedPath('/resources', pagination)));
}

export async function getAmbulanceInventory(pagination = { limit: 12, offset: 0 }) {
  const data = await request(pagedPath('/ambulances', pagination));
  if (!data || !Array.isArray(data.ambulances)
      || !Number.isInteger(data.totalResources)
      || !Number.isInteger(data.totalUnits)
      || !Number.isInteger(data.availableUnits)) {
    throw new Error('The ResQNet backend returned an invalid ambulance inventory response.');
  }
  return data;
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

export async function getVolunteers(pagination) {
  const data = listRows(await request(pagedPath('/volunteers', pagination)));
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

export async function registerAccount({ name, email, password }) {
  return request('/auth/signup', {
    method: 'POST',
    ...jsonBody({ name, email, password }),
  });
}

export async function loginAccount({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    ...jsonBody({ email, password }),
  });
}

export async function getCurrentAccount() {
  return request('/auth/session', { allowUnauthorized: true });
}

export async function logoutAccount() {
  return request('/auth/logout', { method: 'POST' });
}
