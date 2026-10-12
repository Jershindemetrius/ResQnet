-- ResQNet Database Schema
-- MySQL Database Creation Script

DROP DATABASE IF EXISTS resqnet_db;
CREATE DATABASE resqnet_db;
USE resqnet_db;

-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Requests Table
CREATE TABLE emergency_requests (
    request_id VARCHAR(20) PRIMARY KEY,
    user_id INT,
    citizen_name VARCHAR(100) NOT NULL,
    contact VARCHAR(15) NOT NULL,
    emergency_type VARCHAR(50) NOT NULL,
    location VARCHAR(150) NOT NULL,
    landmark VARCHAR(150),
    people_affected INT NOT NULL,
    description TEXT NOT NULL,
    required_resources VARCHAR(255),
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Resources Table
CREATE TABLE resources (
    resource_id VARCHAR(20) PRIMARY KEY,
    resource_name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    location VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    provider_name VARCHAR(100) NOT NULL,
    availability VARCHAR(30) DEFAULT 'AVAILABLE',
    assigned_request_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_request_id) REFERENCES emergency_requests(request_id) ON DELETE SET NULL
);

-- Volunteers Table
CREATE TABLE volunteers (
    volunteer_id VARCHAR(20) PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(15) NOT NULL,
    skills VARCHAR(255) NOT NULL,
    location VARCHAR(150) NOT NULL,
    availability VARCHAR(30) DEFAULT 'AVAILABLE',
    assigned_request_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_request_id) REFERENCES emergency_requests(request_id) ON DELETE SET NULL
);

-- Assignments Table
CREATE TABLE assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(20) NOT NULL,
    resource_id VARCHAR(20),
    volunteer_id VARCHAR(20),
    assigned_by INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE SET NULL,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Emergency Updates Table
CREATE TABLE emergency_updates (
    update_id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(20) NOT NULL,
    updated_by INT,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    remarks VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_emergency_status ON emergency_requests(status);
CREATE INDEX idx_emergency_priority ON emergency_requests(priority);
CREATE INDEX idx_resource_availability ON resources(availability);
CREATE INDEX idx_volunteer_availability ON volunteers(availability);
CREATE INDEX idx_user_role ON users(role);
