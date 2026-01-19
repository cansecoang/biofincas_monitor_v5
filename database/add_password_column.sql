-- Migration: Add password_hash column to users table
-- Date: 2026-01-19
-- Description: Adds password_hash column for authentication

-- 1. Add password_hash column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 2. Verify the column was added
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name = 'password_hash';

-- 3. Show current users (without showing passwords for security)
SELECT 
    user_id,
    user_name,
    user_email,
    CASE 
        WHEN password_hash IS NULL THEN 'NO PASSWORD SET ❌'
        ELSE 'PASSWORD SET ✅'
    END as password_status,
    role_id
FROM users
ORDER BY user_id;

-- Note: After running this migration, use the API endpoint:
-- POST /api/seed-demo-users
-- to create demo users with hashed passwords
