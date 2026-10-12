-- ResQNet Sample Data
-- Insert sample data for testing and demonstration

USE resqnet_db;

-- Insert Sample Users
-- Password for all users: password123 (hashed with BCrypt)
-- Note: In production, use actual BCrypt hashing
INSERT INTO users (full_name, username, email, phone, password_hash, role, location, status) VALUES
('Administrator', 'admin', 'admin@resqnet.com', '9876543210', '$2a$10$XPTPjzwWiPPZlGv7CJZ9nOvZKzSLGW4BPXkHw9Zyp3YmKQzJhZ2yS', 'ADMINISTRATOR', 'Kovilpatti', 'ACTIVE'),
('Coordinator User', 'coordinator', 'coordinator@resqnet.com', '9876543211', '$2a$10$XPTPjzwWiPPZlGv7CJZ9nOvZKzSLGW4BPXkHw9Zyp3YmKQzJhZ2yS', 'COORDINATOR', 'Kovilpatti', 'ACTIVE'),
('Citizen One', 'citizen1', 'citizen1@gmail.com', '9876543212', '$2a$10$XPTPjzwWiPPZlGv7CJZ9nOvZKzSLGW4BPXkHw9Zyp3YmKQzJhZ2yS', 'CITIZEN', 'Kovilpatti', 'ACTIVE'),
('Volunteer User', 'volunteer1', 'volunteer1@gmail.com', '9876543213', '$2a$10$XPTPjzwWiPPZlGv7CJZ9nOvZKzSLGW4BPXkHw9Zyp3YmKQzJhZ2yS', 'VOLUNTEER', 'Kovilpatti', 'ACTIVE'),
('Provider User', 'provider1', 'provider1@gmail.com', '9876543214', '$2a$10$XPTPjzwWiPPZlGv7CJZ9nOvZKzSLGW4BPXkHw9Zyp3YmKQzJhZ2yS', 'RESOURCE_PROVIDER', 'Kovilpatti', 'ACTIVE'),
('Ravi Kumar', 'citizen2', 'ravi@gmail.com', '9876543215', '$2a$10$XPTPjzwWiPPZlGv7CJZ9nOvZKzSLGW4BPXkHw9Zyp3YmKQzJhZ2yS', 'CITIZEN', 'North Sector', 'ACTIVE'),
('Priya Sharma', 'volunteer2', 'priya@gmail.com', '9876543216', '$2a$10$XPTPjzwWiPPZlGv7CJZ9nOvZKzSLGW4BPXkHw9Zyp3YmKQzJhZ2yS', 'VOLUNTEER', 'South Block', 'ACTIVE');

-- Insert Sample Resources
INSERT INTO resources (resource_id, resource_name, resource_type, location, quantity, provider_name, availability) VALUES
('RES001', 'Ambulance A', 'AMBULANCE', 'Kovilpatti', 1, 'City Hospital', 'AVAILABLE'),
('RES002', 'Ambulance B', 'AMBULANCE', 'Kovilpatti', 1, 'City Hospital', 'AVAILABLE'),
('RES003', 'Medical Kit 1', 'MEDICAL_KIT', 'Kovilpatti', 5, 'Health Center', 'AVAILABLE'),
('RES004', 'Food Supply 1', 'FOOD', 'Kovilpatti', 100, 'Food Bank', 'AVAILABLE'),
('RES005', 'Water Supply 1', 'DRINKING_WATER', 'Kovilpatti', 200, 'Water Supply Dept', 'AVAILABLE'),
('RES006', 'Rescue Equipment 1', 'RESCUE_EQUIPMENT', 'Kovilpatti', 10, 'Fire Department', 'AVAILABLE'),
('RES007', 'Fire Truck A', 'VEHICLE', 'North Sector', 1, 'Fire Station', 'AVAILABLE'),
('RES008', 'Shelter Space 1', 'SHELTER_SPACE', 'South Block', 50, 'Community Center', 'AVAILABLE'),
('RES009', 'Medical Kit 2', 'MEDICAL_KIT', 'North Sector', 3, 'Clinic', 'AVAILABLE'),
('RES010', 'Ambulance C', 'AMBULANCE', 'South Block', 1, 'Private Hospital', 'AVAILABLE');

-- Insert Sample Volunteers
INSERT INTO volunteers (volunteer_id, user_id, name, contact, skills, location, availability) VALUES
('VOL001', 4, 'Arun Kumar', '9876543213', 'FIRST_AID', 'Kovilpatti', 'AVAILABLE'),
('VOL002', 7, 'Priya Sharma', '9876543216', 'RESCUE_OPERATIONS', 'South Block', 'AVAILABLE'),
('VOL003', NULL, 'Karthik Raja', '9876543217', 'DRIVING', 'Kovilpatti', 'BUSY'),
('VOL004', NULL, 'Meena Devi', '9876543218', 'COOKING', 'Kovilpatti', 'AVAILABLE'),
('VOL005', NULL, 'Suresh Babu', '9876543219', 'MEDICAL_SUPPORT', 'North Sector', 'AVAILABLE'),
('VOL006', NULL, 'Lakshmi Sundaram', '9876543220', 'LOGISTICS', 'South Block', 'AVAILABLE'),
('VOL007', NULL, 'Vijay Kumar', '9876543221', 'FIRST_AID', 'North Sector', 'AVAILABLE'),
('VOL008', NULL, 'Anjali Reddy', '9876543222', 'TRANSLATION', 'Kovilpatti', 'AVAILABLE');

-- Insert Sample Emergency Requests
INSERT INTO emergency_requests (request_id, user_id, citizen_name, contact, emergency_type, location, landmark, people_affected, description, required_resources, priority, status) VALUES
('ER102', 3, 'Citizen One', '9876543212', 'MEDICAL_EMERGENCY', 'Kovilpatti', 'Near Main Bus Stand', 2, 'Accident occurred, two people injured, need immediate medical assistance', 'AMBULANCE,MEDICAL_KIT', 'HIGH', 'PENDING'),
('ER103', 6, 'Ravi Kumar', '9876543215', 'FIRE', 'North Sector', 'Building No 42', 5, 'Fire in residential building, people trapped on second floor', 'VEHICLE,RESCUE_EQUIPMENT', 'CRITICAL', 'PENDING'),
('ER104', 3, 'Citizen One', '9876543212', 'FLOOD', 'South Block', 'River Bank Area', 10, 'Heavy rainfall causing flooding, families stranded', 'SHELTER_SPACE,FOOD,DRINKING_WATER', 'HIGH', 'PENDING'),
('ER105', NULL, 'Anonymous', '9876543230', 'ACCIDENT', 'Highway 7', 'Kilometer 45', 3, 'Vehicle collision on highway', 'AMBULANCE', 'MEDIUM', 'RESOLVED'),
('ER106', NULL, 'Ramesh Kumar', '9876543231', 'FOOD_WATER_REQUIREMENT', 'Kovilpatti', 'Slum Area East', 20, 'Families in need of food and water supply', 'FOOD,DRINKING_WATER', 'LOW', 'RESOLVED');

-- Insert Sample Assignments (for resolved emergencies)
INSERT INTO assignments (request_id, resource_id, volunteer_id, assigned_by, status) VALUES
('ER105', 'RES001', 'VOL003', 2, 'COMPLETED'),
('ER106', 'RES004', 'VOL004', 2, 'COMPLETED');

-- Insert Sample Emergency Updates
INSERT INTO emergency_updates (request_id, updated_by, old_status, new_status, remarks) VALUES
('ER105', 2, 'PENDING', 'RESOURCE_ASSIGNED', 'Ambulance and volunteer assigned'),
('ER105', 2, 'RESOURCE_ASSIGNED', 'RESPONDING', 'Team en route to location'),
('ER105', 2, 'RESPONDING', 'ON_SITE', 'Team reached accident site'),
('ER105', 2, 'ON_SITE', 'RESOLVED', 'Victims transported to hospital'),
('ER106', 2, 'PENDING', 'RESOURCE_ASSIGNED', 'Food and water supplies allocated'),
('ER106', 2, 'RESOURCE_ASSIGNED', 'RESOLVED', 'Supplies delivered successfully');
