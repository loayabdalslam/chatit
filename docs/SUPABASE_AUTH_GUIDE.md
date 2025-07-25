# Supabase Authentication & RLS Complete Guide

## 🔐 Authentication System Overview

This guide provides a comprehensive solution for Supabase authentication with proper Row Level Security (RLS) configuration.

## 📋 Database Schema Setup

### Users Table Structure
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  is_active boolean DEFAULT true,
  failed_attempts integer DEFAULT 0,
  locked_until timestamptz,
  metadata jsonb DEFAULT '{}',
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);
```

### Required Indexes
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
```

## 🛡️ Row Level Security Configuration

### 1. Enable RLS
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### 2. Registration Policy (Critical)
```sql
-- Allow anonymous users to register
CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

### 3. Data Access Policies
```sql
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role has full access
CREATE POLICY "Service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

## 🔧 Authentication Setup

### 1. Supabase Client Configuration
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

### 2. User Registration
```typescript
async function registerUser(email: string, password: string, fullName: string) {
  // Step 1: Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (authError) throw authError;

  // Step 2: Profile is created automatically via trigger
  return authData;
}
```

### 3. User Sign In
```typescript
async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}
```

## 🔄 Database Triggers

### Automatic Profile Creation
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, auth_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 🧪 Testing & Verification

### 1. Test Registration
```typescript
// Should succeed
const result = await authService.registerUser({
  email: 'test@example.com',
  password: 'securepassword123',
  fullName: 'Test User'
});
```

### 2. Verify RLS Policies
```sql
-- Test as anonymous user (should work for registration)
SET ROLE anon;
INSERT INTO users (email, full_name) VALUES ('test@example.com', 'Test User');

-- Test as authenticated user (should work for own data)
SET ROLE authenticated;
SELECT * FROM users WHERE id = auth.uid();
```

### 3. Check Policy Status
```sql
-- View all policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users';
```

## ⚠️ Common Issues & Solutions

### Issue 1: RLS Policy Violation
**Error**: `new row violates row-level security policy`

**Solution**: Ensure the registration policy allows `anon` role:
```sql
CREATE POLICY "Allow user registration"
  ON users FOR INSERT TO anon, authenticated
  WITH CHECK (true);
```

### Issue 2: 401 Unauthorized
**Error**: API returns 401 status

**Solutions**:
1. Check Supabase URL and anon key are correct
2. Verify RLS policies allow the operation
3. Ensure user is authenticated for protected operations

### Issue 3: Trigger Not Working
**Error**: Profile not created automatically

**Solution**: Verify trigger exists and function has proper permissions:
```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Recreate if missing
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 🔒 Security Best Practices

### 1. Principle of Least Privilege
- Only grant necessary permissions
- Use specific conditions in policies
- Regularly audit policy effectiveness

### 2. Data Validation
```sql
-- Add constraints for data integrity
ALTER TABLE users ADD CONSTRAINT valid_email 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

### 3. Rate Limiting
```sql
-- Track failed attempts
CREATE OR REPLACE FUNCTION handle_failed_auth(user_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE users 
  SET failed_attempts = failed_attempts + 1,
      locked_until = CASE 
        WHEN failed_attempts >= 4 THEN now() + interval '15 minutes'
        ELSE locked_until
      END
  WHERE id = user_id;
  
  RETURN (SELECT failed_attempts < 5 FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📊 Monitoring & Debugging

### 1. Enable Logging
```sql
-- Enable statement logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
```

### 2. Monitor Policy Usage
```sql
-- Check policy violations
SELECT * FROM pg_stat_user_tables WHERE relname = 'users';
```

### 3. Debug RLS Issues
```sql
-- Test policies manually
SET ROLE anon;
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users;
```

## 🚀 Production Deployment

### 1. Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Security Headers
```typescript
// Add to your app
const supabase = createClient(url, key, {
  global: {
    headers: {
      'X-Client-Info': 'your-app-name'
    }
  }
});
```

### 3. Error Handling
```typescript
try {
  const result = await authService.registerUser(userData);
  if (!result.success) {
    throw new Error(result.error);
  }
} catch (error) {
  console.error('Registration failed:', error);
  // Handle error appropriately
}
```

This comprehensive setup ensures secure, production-ready authentication with proper RLS policies that allow user registration while maintaining data security.