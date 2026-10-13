// Shared Ambulance Booking and Driver Order Intake Store
// Synchronizes Client Booking, Driver Dispatch, and Admin Tracking

export const initialAmbulanceOrders = [
  {
    orderId: 'AMB-7821',
    patientName: 'Karthik Subramanian',
    patientAge: 54,
    ageCategory: 'Adult',
    contactNumber: '9842156789',
    pickupLocation: 'Near Main Bus Stand, Kovilpatti',
    landmark: 'Opposite State Bank Branch',
    coordinates: { lat: 9.1738, lng: 77.8692 },
    destinationHospital: 'Govt Headquarters Hospital, Kovilpatti',
    requirements: ['Oxygen Cylinder', 'Wheeled Stretcher', 'Cardiac Monitor'],
    notes: 'Severe chest tightness, conscious, difficulty breathing.',
    priority: 'CRITICAL',
    status: 'TAKEN', // PENDING, TAKEN, EN_ROUTE, ARRIVED, IN_TRANSIT, COMPLETED, CANCELLED
    bookedAt: '12 mins ago',
    bookedTimestamp: Date.now() - 12 * 60 * 1000,
    assignedDriver: {
      driverId: 'DRV-101',
      driverName: 'R. Velmurugan',
      phone: '9876543211',
      vehicleNumber: 'TN-72-AX-4091',
      vehicleType: 'ALS (Advanced Life Support) Ambulance',
      rating: 4.9,
      currentDistance: '1.2 km',
      etaMinutes: 3
    },
    takenAt: '10 mins ago',
    callerType: 'Family Member'
  },
  {
    orderId: 'AMB-7822',
    patientName: 'Meenakshi Ammal',
    patientAge: 72,
    ageCategory: 'Senior Citizen',
    contactNumber: '9443218765',
    pickupLocation: 'South Block, Gandhi Nagar 3rd Street',
    landmark: 'Behind Vinayagar Temple',
    coordinates: { lat: 9.1625, lng: 77.8614 },
    destinationHospital: 'City Care Trauma & Multi-Specialty',
    requirements: ['Wheeled Stretcher', 'Wheelchair Access'],
    notes: 'Suspected hip fracture after slip at home, unable to stand.',
    priority: 'HIGH',
    status: 'EN_ROUTE',
    bookedAt: '24 mins ago',
    bookedTimestamp: Date.now() - 24 * 60 * 1000,
    assignedDriver: {
      driverId: 'DRV-102',
      driverName: 'M. Senthil Kumar',
      phone: '9876543213',
      vehicleNumber: 'TN-72-B-1102',
      vehicleType: 'BLS (Basic Life Support) Ambulance',
      rating: 4.8,
      currentDistance: '0.8 km',
      etaMinutes: 2
    },
    takenAt: '22 mins ago',
    callerType: 'Neighbor'
  },
  {
    orderId: 'AMB-7823',
    patientName: 'Baby Aarav',
    patientAge: 3,
    ageCategory: 'Child',
    contactNumber: '9994561234',
    pickupLocation: 'North Sector, Housing Board Colony',
    landmark: 'Water Tank Road',
    coordinates: { lat: 9.1852, lng: 77.8741 },
    destinationHospital: 'Govt Headquarters Hospital - Pediatric Unit',
    requirements: ['Oxygen Cylinder', 'Pediatric Care', 'Paramedic on Board'],
    notes: 'High fever, seizure episodes in toddler.',
    priority: 'CRITICAL',
    status: 'COMPLETED',
    bookedAt: '1h 15m ago',
    bookedTimestamp: Date.now() - 75 * 60 * 1000,
    assignedDriver: {
      driverId: 'DRV-101',
      driverName: 'R. Velmurugan',
      phone: '9876543211',
      vehicleNumber: 'TN-72-AX-4091',
      vehicleType: 'ALS (Advanced Life Support) Ambulance',
      rating: 4.9,
      currentDistance: 'At Base',
      etaMinutes: 0
    },
    takenAt: '1h 13m ago',
    completedAt: '28 mins ago',
    callerType: 'Mother'
  },
  {
    orderId: 'AMB-7824',
    patientName: 'Dinesh Raja',
    patientAge: 28,
    ageCategory: 'Adult',
    contactNumber: '9789123456',
    pickupLocation: 'Highway 7 Junction, Kovilpatti Bypass',
    landmark: 'Near Toll Plaza Gate 2',
    coordinates: { lat: 9.1912, lng: 77.8824 },
    destinationHospital: 'District Emergency Center',
    requirements: ['Wheeled Stretcher', 'Oxygen Cylinder', 'Trauma Kit'],
    notes: 'Motorcycle collision, leg injury and lacerations.',
    priority: 'HIGH',
    status: 'PENDING', // Awaiting nearby driver intake!
    bookedAt: '3 mins ago',
    bookedTimestamp: Date.now() - 3 * 60 * 1000,
    assignedDriver: null,
    callerType: 'Passerby'
  }
];

export const driverProfile = {
  driverId: 'DRV-101',
  driverName: 'R. Velmurugan',
  phone: '9876543211',
  licenseNo: 'TN-72-2018-004921',
  vehicleNumber: 'TN-72-AX-4091',
  vehicleType: 'ALS (Advanced Life Support) Ambulance',
  station: 'Kovilpatti Central Emergency Base',
  isOnline: true,
  currentLocationName: 'Kovilpatti Main Hospital Station',
  rating: 4.9,
  completedTrips: 184,
  todayTrips: 4,
  equipmentReady: [
    'Oxygen Tank (2000L - 94% Full)',
    'Stretcher & Spinal Board',
    'Automated External Defibrillator (AED)',
    'Suction Unit & Bag Valve Mask',
    'Trauma First-Aid Kit'
  ]
};

// Local storage management helpers
const STORAGE_KEY = 'resqnet_ambulance_orders';

export function getStoredOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading stored orders', e);
  }
  return initialAmbulanceOrders;
}

export function saveStoredOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('resqnet:orders-changed', { detail: orders }));
  } catch (e) {
    console.error('Error saving orders', e);
  }
}

export function createAmbulanceBooking(booking) {
  const currentOrders = getStoredOrders();
  const newOrder = {
    orderId: `AMB-${Math.floor(1000 + Math.random() * 9000)}`,
    patientName: booking.patientName || 'Emergency Patient',
    patientAge: Number(booking.patientAge) || 30,
    ageCategory: booking.patientAge < 13 ? 'Child' : booking.patientAge >= 60 ? 'Senior Citizen' : 'Adult',
    contactNumber: booking.contactNumber || '9876543210',
    pickupLocation: booking.pickupLocation || 'Kovilpatti',
    landmark: booking.landmark || '',
    coordinates: booking.coordinates || { lat: 9.1726, lng: 77.8687 },
    destinationHospital: booking.destinationHospital || 'Govt Headquarters Hospital, Kovilpatti',
    requirements: booking.requirements || ['Oxygen Cylinder', 'Wheeled Stretcher'],
    notes: booking.notes || 'Emergency ambulance requested by citizen.',
    priority: booking.priority || 'CRITICAL',
    status: 'PENDING',
    bookedAt: 'Just now',
    bookedTimestamp: Date.now(),
    assignedDriver: null,
    callerType: booking.callerType || 'Self / Relative'
  };

  const updated = [newOrder, ...currentOrders];
  saveStoredOrders(updated);
  return newOrder;
}

export function driverTakeOrder(orderId, driver = driverProfile) {
  const currentOrders = getStoredOrders();
  const updated = currentOrders.map(ord => {
    if (ord.orderId === orderId) {
      return {
        ...ord,
        status: 'TAKEN',
        takenAt: 'Just now',
        assignedDriver: {
          driverId: driver.driverId,
          driverName: driver.driverName,
          phone: driver.phone,
          vehicleNumber: driver.vehicleNumber,
          vehicleType: driver.vehicleType,
          rating: driver.rating,
          currentDistance: '1.4 km',
          etaMinutes: 3
        }
      };
    }
    return ord;
  });
  saveStoredOrders(updated);
  return updated.find(o => o.orderId === orderId);
}

export function updateOrderStatus(orderId, newStatus) {
  const currentOrders = getStoredOrders();
  const updated = currentOrders.map(ord => {
    if (ord.orderId === orderId) {
      return {
        ...ord,
        status: newStatus,
        ...(newStatus === 'COMPLETED' ? { completedAt: 'Just now' } : {})
      };
    }
    return ord;
  });
  saveStoredOrders(updated);
}
