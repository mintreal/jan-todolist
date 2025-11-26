-- ============================================
-- Jan TodoList Database Schema
-- Phase 1 (3-day Sprint)
-- ============================================
-- Date: 2025-11-26
-- Database: PostgreSQL 12+
-- Encoding: UTF-8
-- ============================================

-- ============================================
-- 1. Drop existing tables (for development only)
-- ============================================
-- NOTE: Comment out for production!

-- DROP TABLE IF EXISTS todos CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 2. Create users table
-- ============================================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. Create todos table
-- ============================================

CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraint
  CONSTRAINT fk_todos_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- ============================================
-- 4. Create indexes
-- ============================================

-- Optimize user's todo queries
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- Optimize date sorting
CREATE INDEX idx_todos_due_date ON todos(due_date);

-- ============================================
-- 5. Comments for documentation
-- ============================================

-- users table comments
COMMENT ON TABLE users IS 'Application users information';
COMMENT ON COLUMN users.id IS 'User unique identifier';
COMMENT ON COLUMN users.email IS 'User email (login ID)';
COMMENT ON COLUMN users.password IS 'Bcrypt hashed password (minimum 10 rounds)';
COMMENT ON COLUMN users.name IS 'User name';
COMMENT ON COLUMN users.created_at IS 'Account creation date/time';

-- todos table comments
COMMENT ON TABLE todos IS 'User todo list';
COMMENT ON COLUMN todos.id IS 'Todo unique identifier';
COMMENT ON COLUMN todos.user_id IS 'Owner (references users.id)';
COMMENT ON COLUMN todos.title IS 'Todo title (1-200 characters)';
COMMENT ON COLUMN todos.is_completed IS 'Completion status (true/false)';
COMMENT ON COLUMN todos.due_date IS 'Due date (date only, no time)';
COMMENT ON COLUMN todos.created_at IS 'Creation date/time';
COMMENT ON COLUMN todos.updated_at IS 'Last modification date/time';

-- ============================================
-- 6. Trigger for automatic updated_at
-- ============================================

-- Function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to todos table
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Schema verification queries
-- ============================================

-- List tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- List constraints
-- SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name IN ('users', 'todos');

-- List indexes
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';