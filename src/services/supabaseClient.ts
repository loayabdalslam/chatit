import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'biometric-auth-system'
    }
  }
});

// Database type definitions for better TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone_number: string | null;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          is_active: boolean;
          failed_attempts: number;
          locked_until: string | null;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_active?: boolean;
          failed_attempts?: number;
          locked_until?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_active?: boolean;
          failed_attempts?: number;
          locked_until?: string | null;
          metadata?: Record<string, any>;
        };
      };
      biometric_templates: {
        Row: {
          id: string;
          user_id: string;
          template_data: Uint8Array;
          template_hash: string;
          quality_score: number;
          capture_metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
          is_primary: boolean;
          version: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_data: Uint8Array;
          template_hash: string;
          quality_score: number;
          capture_metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          is_primary?: boolean;
          version?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_data?: Uint8Array;
          template_hash?: string;
          quality_score?: number;
          capture_metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          is_primary?: boolean;
          version?: number;
        };
      };
      authentication_logs: {
        Row: {
          id: string;
          user_id: string | null;
          attempt_type: string;
          success: boolean;
          confidence_score: number | null;
          failure_reason: string | null;
          ip_address: string | null;
          user_agent: string | null;
          device_info: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          attempt_type: string;
          success: boolean;
          confidence_score?: number | null;
          failure_reason?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          device_info?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          attempt_type?: string;
          success?: boolean;
          confidence_score?: number | null;
          failure_reason?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          device_info?: Record<string, any>;
          created_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string;
          refresh_token: string | null;
          expires_at: string;
          created_at: string;
          last_accessed: string;
          ip_address: string | null;
          user_agent: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token: string;
          refresh_token?: string | null;
          expires_at: string;
          created_at?: string;
          last_accessed?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_token?: string;
          refresh_token?: string | null;
          expires_at?: string;
          created_at?: string;
          last_accessed?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          is_active?: boolean;
        };
      };
      system_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: any;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          setting_key: string;
          setting_value: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          setting_key?: string;
          setting_value?: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      fallback_auth: {
        Row: {
          id: string;
          user_id: string;
          auth_type: string;
          auth_data: string;
          is_active: boolean;
          created_at: string;
          last_used: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          auth_type: string;
          auth_data: string;
          is_active?: boolean;
          created_at?: string;
          last_used?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          auth_type?: string;
          auth_data?: string;
          is_active?: boolean;
          created_at?: string;
          last_used?: string | null;
        };
      };
    };
    Functions: {
      log_auth_attempt: {
        Args: {
          p_user_id: string;
          p_attempt_type: string;
          p_success: boolean;
          p_confidence_score?: number;
          p_failure_reason?: string;
          p_ip_address?: string;
          p_user_agent?: string;
          p_device_info?: Record<string, any>;
        };
        Returns: string;
      };
      handle_failed_auth: {
        Args: {
          p_user_id: string;
        };
        Returns: boolean;
      };
      reset_failed_attempts: {
        Args: {
          p_user_id: string;
        };
        Returns: void;
      };
    };
  };
};