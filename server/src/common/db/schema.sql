-- Schema for Room Shifting LPU

-- 1. Users Table (Student Profile & Authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    st_name VARCHAR(100) NOT NULL,
    st_reg_id VARCHAR(50) UNIQUE NOT NULL,
    st_phone VARCHAR(20) UNIQUE NOT NULL,
    st_hostel VARCHAR(100) NOT NULL,
    st_password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Rooms Table (Room Listings)
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    st_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    st_hostel_name VARCHAR(100) NOT NULL,
    st_room_number VARCHAR(50) NOT NULL,
    st_block_number VARCHAR(20) NOT NULL,
    st_room_type VARCHAR(20) NOT NULL CHECK (st_room_type IN ('AC', 'Non-AC')),
    st_seater INT NOT NULL,
    st_resident_name TEXT NOT NULL,
    st_description TEXT,
    st_status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (st_status IN ('AVAILABLE', 'REQUESTED', 'SHIFTED')),
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

-- 4. Find Roommate Table
CREATE TABLE IF NOT EXISTS find_roommate (
    id SERIAL PRIMARY KEY,
    st_name VARCHAR(100) NOT NULL,
    st_state TEXT NOT NULL,
    st_city TEXT,
    st_language TEXT NOT NULL,
    st_phone VARCHAR(15) NOT NULL,
    st_year TEXT NOT NULL,
    st_gender TEXT NOT NULL,
    st_hostel TEXT NOT NULL,
    st_room_number TEXT NOT NULL,
    st_block_number TEXT NOT NULL,
    st_room_type TEXT NOT NULL,
    st_seater TEXT NOT NULL,
    st_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast query filtering
CREATE INDEX IF NOT EXISTS idx_rooms_filters ON rooms(st_hostel_name, st_room_type, st_seater, st_block_number);
CREATE INDEX IF NOT EXISTS idx_rooms_user ON rooms(st_id);
