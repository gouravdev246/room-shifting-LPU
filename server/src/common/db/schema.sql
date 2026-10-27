-- Schema for Room Shifting LPU

-- 1. Users Table (Student Profile & Authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    reg_id VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    hostel VARCHAR(100) NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Rooms Table (Room Listings)
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hostel_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    block VARCHAR(20) NOT NULL,
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('AC', 'Non-AC')),
    seater INT NOT NULL,
    floor INT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'REQUESTED', 'SHIFTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Room Photos Table (Cloudinary Images)
CREATE TABLE IF NOT EXISTS room_photos (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    public_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast query filtering
CREATE INDEX IF NOT EXISTS idx_rooms_filters ON rooms(hostel_name, room_type, seater, block);
CREATE INDEX IF NOT EXISTS idx_rooms_user ON rooms(user_id);
