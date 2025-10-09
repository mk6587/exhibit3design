export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      ai_edit_samples: {
        Row: {
          after_image_url: string
          before_image_url: string
          category: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_featured: boolean
          prompt_used: string | null
          title: string
        }
        Insert: {
          after_image_url: string
          before_image_url: string
          category: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_featured?: boolean
          prompt_used?: string | null
          title: string
        }
        Update: {
          after_image_url?: string
          before_image_url?: string
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_featured?: boolean
          prompt_used?: string | null
          title?: string
        }
        Relationships: []
      }
      designers: {
        Row: {
          bio: string | null
          business_name: string | null
          commission_rate: number | null
          created_at: string
          id: string
          is_active: boolean
          is_approved: boolean
          portfolio_url: string | null
          specialties: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          business_name?: string | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_approved?: boolean
          portfolio_url?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          business_name?: string | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_approved?: boolean
          portfolio_url?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      guest_checkout_sessions: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_country: string | null
          customer_email: string | null
          customer_first_name: string | null
          customer_last_name: string | null
          customer_mobile: string | null
          customer_postal_code: string | null
          expires_at: string
          id: string
          session_token: string
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_country?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_mobile?: string | null
          customer_postal_code?: string | null
          expires_at?: string
          id?: string
          session_token: string
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_country?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_mobile?: string | null
          customer_postal_code?: string | null
          expires_at?: string
          id?: string
          session_token?: string
        }
        Relationships: []
      }
      guest_order_access_log: {
        Row: {
          access_granted: boolean
          access_ip: string | null
          access_timestamp: string
          access_user_agent: string | null
          failure_reason: string | null
          id: string
          order_id: string
          order_token: string
        }
        Insert: {
          access_granted?: boolean
          access_ip?: string | null
          access_timestamp?: string
          access_user_agent?: string | null
          failure_reason?: string | null
          id?: string
          order_id: string
          order_token: string
        }
        Update: {
          access_granted?: boolean
          access_ip?: string | null
          access_timestamp?: string
          access_user_agent?: string | null
          failure_reason?: string | null
          id?: string
          order_id?: string
          order_token?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          authority: string | null
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_country: string | null
          customer_email: string | null
          customer_first_name: string | null
          customer_last_name: string | null
          customer_mobile: string | null
          customer_postal_code: string | null
          id: string
          order_number: string | null
          order_token: string | null
          order_token_expires_at: string | null
          payment_description: string | null
          payment_method: string | null
          product_id: number
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string | null
          yekpay_reference: string | null
        }
        Insert: {
          amount: number
          authority?: string | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_country?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_mobile?: string | null
          customer_postal_code?: string | null
          id?: string
          order_number?: string | null
          order_token?: string | null
          order_token_expires_at?: string | null
          payment_description?: string | null
          payment_method?: string | null
          product_id: number
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
          yekpay_reference?: string | null
        }
        Update: {
          amount?: number
          authority?: string | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_country?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_mobile?: string | null
          customer_postal_code?: string | null
          id?: string
          order_number?: string | null
          order_token?: string | null
          order_token_expires_at?: string | null
          payment_description?: string | null
          payment_method?: string | null
          product_id?: number
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
          yekpay_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_registrations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          otp: string
          password_hash: string | null
          verified: boolean
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          otp: string
          password_hash?: string | null
          verified?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp?: string
          password_hash?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          featured: boolean | null
          id: number
          images: string[] | null
          is_sample: boolean | null
          max_subscription_tier: string | null
          memo: string | null
          price: number
          specifications: string | null
          subscription_tier_required: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          featured?: boolean | null
          id?: number
          images?: string[] | null
          is_sample?: boolean | null
          max_subscription_tier?: string | null
          memo?: string | null
          price: number
          specifications?: string | null
          subscription_tier_required?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          featured?: boolean | null
          id?: number
          images?: string[] | null
          is_sample?: boolean | null
          max_subscription_tier?: string | null
          memo?: string | null
          price?: number
          specifications?: string | null
          subscription_tier_required?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line_1: string | null
          ai_tokens_balance: number | null
          ai_tokens_limit: number
          ai_tokens_used: number
          city: string | null
          country: string | null
          created_at: string
          email_confirmed: boolean | null
          first_name: string | null
          free_tokens_claimed: boolean | null
          id: string
          last_name: string | null
          phone_number: string | null
          postcode: string | null
          state_region: string | null
          updated_at: string
          user_id: string
          video_results_balance: number | null
          video_results_used: number | null
        }
        Insert: {
          address_line_1?: string | null
          ai_tokens_balance?: number | null
          ai_tokens_limit?: number
          ai_tokens_used?: number
          city?: string | null
          country?: string | null
          created_at?: string
          email_confirmed?: boolean | null
          first_name?: string | null
          free_tokens_claimed?: boolean | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          postcode?: string | null
          state_region?: string | null
          updated_at?: string
          user_id: string
          video_results_balance?: number | null
          video_results_used?: number | null
        }
        Update: {
          address_line_1?: string | null
          ai_tokens_balance?: number | null
          ai_tokens_limit?: number
          ai_tokens_used?: number
          city?: string | null
          country?: string | null
          created_at?: string
          email_confirmed?: boolean | null
          first_name?: string | null
          free_tokens_claimed?: boolean | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          postcode?: string | null
          state_region?: string | null
          updated_at?: string
          user_id?: string
          video_results_balance?: number | null
          video_results_used?: number | null
        }
        Relationships: []
      }
      sso_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          redirect_url: string
          token: string
          used: boolean | null
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          redirect_url: string
          token: string
          used?: boolean | null
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          redirect_url?: string
          token?: string
          used?: boolean | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_period: string
          created_at: string
          description: string | null
          display_order: number
          features: Json | null
          file_access_tier: string
          id: string
          initial_ai_tokens: number
          is_active: boolean
          is_featured: boolean
          max_files: number
          name: string
          price: number
          updated_at: string
          video_results: number
        }
        Insert: {
          billing_period?: string
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json | null
          file_access_tier: string
          id?: string
          initial_ai_tokens?: number
          is_active?: boolean
          is_featured?: boolean
          max_files?: number
          name: string
          price: number
          updated_at?: string
          video_results?: number
        }
        Update: {
          billing_period?: string
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json | null
          file_access_tier?: string
          id?: string
          initial_ai_tokens?: number
          is_active?: boolean
          is_featured?: boolean
          max_files?: number
          name?: string
          price?: number
          updated_at?: string
          video_results?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          tokens_limit: number
          tokens_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          tokens_limit?: number
          tokens_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          tokens_limit?: number
          tokens_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_file_access: {
        Args: { p_product_id: number; p_user_id: string }
        Returns: boolean
      }
      check_guest_order_access_rate_limit: {
        Args: { client_ip?: string }
        Returns: boolean
      }
      check_recent_otp: {
        Args: { minutes_ago?: number; search_email: string }
        Returns: boolean
      }
      check_user_admin_status: {
        Args: { check_user_id: string }
        Returns: {
          is_active: boolean
          is_admin: boolean
        }[]
      }
      cleanup_expired_guest_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_guest_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_otps: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_sso_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_otp_records: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_profile_with_guest_data: {
        Args: { p_email: string; p_user_id: string }
        Returns: {
          profile_data: Json
        }[]
      }
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      deduct_ai_tokens: {
        Args: { p_amount: number; p_user_id: string }
        Returns: boolean
      }
      deduct_video_results: {
        Args: { p_count: number; p_user_id: string }
        Returns: boolean
      }
      delete_otp_by_email: {
        Args: { search_email: string }
        Returns: boolean
      }
      delete_used_otp: {
        Args: { otp_id: string }
        Returns: boolean
      }
      encrypt_sensitive_data: {
        Args: { data: string }
        Returns: string
      }
      find_otp_by_email: {
        Args: { search_email: string }
        Returns: {
          created_at: string
          email: string
          expires_at: string
          id: string
          otp: string
          password_hash: string
          verified: boolean
        }[]
      }
      generate_order_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_secure_order_token: {
        Args: Record<PropertyKey, never>
        Returns: {
          expires_at: string
          token: string
        }[]
      }
      get_active_subscription: {
        Args: { p_user_id: string }
        Returns: {
          ai_tokens_included: number
          current_period_end: string
          file_access_tier: string
          plan_id: string
          plan_name: string
          plan_price: number
          status: string
          subscription_id: string
          video_results_included: number
        }[]
      }
      get_decrypted_customer_data: {
        Args: { order_id: string }
        Returns: {
          customer_address: string
          customer_city: string
          customer_country: string
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_mobile: string
          customer_postal_code: string
          id: string
        }[]
      }
      get_default_video_url: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_guest_order_by_token: {
        Args: { order_token_param: string }
        Returns: {
          amount: number
          created_at: string
          customer_address: string
          customer_city: string
          customer_country: string
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_mobile: string
          customer_postal_code: string
          id: string
          order_number: string
          payment_description: string
          payment_method: string
          product_id: number
          status: string
          updated_at: string
        }[]
      }
      get_user_token_balance: {
        Args: { p_user_id: string }
        Returns: {
          ai_tokens: number
          free_tokens_claimed: boolean
          video_results: number
        }[]
      }
      grant_free_tokens: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_otp_code: {
        Args: { otp_code: string }
        Returns: string
      }
      insert_otp_registration: {
        Args: {
          p_email: string
          p_expires_at: string
          p_otp: string
          p_password_hash?: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_designer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_designer: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      mark_otp_verified_and_cleanup: {
        Args: { otp_id: string }
        Returns: boolean
      }
      mask_sensitive_data: {
        Args: { data: string; mask_type?: string }
        Returns: string
      }
      set_order_token_session: {
        Args: { token: string }
        Returns: undefined
      }
      store_guest_checkout_session: {
        Args: {
          p_address: string
          p_city: string
          p_country: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_mobile: string
          p_postal_code: string
          p_session_token: string
        }
        Returns: boolean
      }
      transfer_guest_order_data: {
        Args: { p_email: string; p_user_id: string }
        Returns: {
          address_line_1: string
          city: string
          country: string
          first_name: string
          last_name: string
          phone_number: string
          postal_code: string
          success: boolean
        }[]
      }
      transfer_guest_session_to_profile: {
        Args: { p_session_token: string; p_user_id: string }
        Returns: boolean
      }
      validate_payment_update: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      verify_guest_order_access: {
        Args: { order_id_param: string; order_token_param: string }
        Returns: boolean
      }
      verify_guest_order_access_secure: {
        Args: {
          client_ip?: string
          order_id_param: string
          order_token_param: string
          user_agent?: string
        }
        Returns: boolean
      }
      verify_otp_code: {
        Args: { input_otp: string; search_email: string }
        Returns: {
          created_at: string
          email: string
          expires_at: string
          id: string
          password_hash: string
          verified: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
