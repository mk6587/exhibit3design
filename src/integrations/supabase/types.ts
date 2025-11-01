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
      admin_activity_log: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_agent_id: string | null
          admin_user_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_agent_id?: string | null
          admin_user_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_agent_id?: string | null
          admin_user_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_log_admin_agent_id_fkey"
            columns: ["admin_agent_id"]
            isOneToOne: false
            referencedRelation: "admin_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_agents: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login: string | null
          password_hash: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          password_hash: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          password_hash?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      admin_ip_whitelist: {
        Row: {
          created_at: string
          description: string | null
          id: string
          ip_address: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          ip_address: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      admin_login_attempts: {
        Row: {
          attempt_time: string
          created_at: string
          email: string
          id: string
          ip_address: string
          success: boolean
        }
        Insert: {
          attempt_time?: string
          created_at?: string
          email: string
          id?: string
          ip_address: string
          success?: boolean
        }
        Update: {
          attempt_time?: string
          created_at?: string
          email?: string
          id?: string
          ip_address?: string
          success?: boolean
        }
        Relationships: []
      }
      admins: {
        Row: {
          admin_agent_id: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login: string | null
          updated_at: string
          user_id: string | null
          username: string
        }
        Insert: {
          admin_agent_id?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          updated_at?: string
          user_id?: string | null
          username: string
        }
        Update: {
          admin_agent_id?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_admin_agent_id_fkey"
            columns: ["admin_agent_id"]
            isOneToOne: false
            referencedRelation: "admin_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_demo_configs: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          mock_input_url: string
          mock_output_url: string
          mock_text_prompt: string | null
          service_key: string
          service_name: string
          service_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          mock_input_url: string
          mock_output_url: string
          mock_text_prompt?: string | null
          service_key: string
          service_name: string
          service_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          mock_input_url?: string
          mock_output_url?: string
          mock_text_prompt?: string | null
          service_key?: string
          service_name?: string
          service_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_generation_history: {
        Row: {
          created_at: string
          id: string
          input_image_url: string | null
          is_public_sample: boolean | null
          output_image_url: string
          prompt: string
          service_type: string
          tokens_used: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          input_image_url?: string | null
          is_public_sample?: boolean | null
          output_image_url: string
          prompt: string
          service_type: string
          tokens_used?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          input_image_url?: string | null
          is_public_sample?: boolean | null
          output_image_url?: string
          prompt?: string
          service_type?: string
          tokens_used?: number
          user_id?: string | null
        }
        Relationships: []
      }
      ai_samples: {
        Row: {
          after_image_url: string | null
          after_video_url: string | null
          before_image_url: string | null
          before_video_url: string | null
          created_at: string
          external_link: string | null
          id: string
          is_active: boolean
          mode_label: string
          name: string
          show_on_homepage: boolean
          show_on_samples_page: boolean
          sort_order: number
          type: string
          updated_at: string
        }
        Insert: {
          after_image_url?: string | null
          after_video_url?: string | null
          before_image_url?: string | null
          before_video_url?: string | null
          created_at?: string
          external_link?: string | null
          id?: string
          is_active?: boolean
          mode_label: string
          name: string
          show_on_homepage?: boolean
          show_on_samples_page?: boolean
          sort_order?: number
          type: string
          updated_at?: string
        }
        Update: {
          after_image_url?: string | null
          after_video_url?: string | null
          before_image_url?: string | null
          before_video_url?: string | null
          created_at?: string
          external_link?: string | null
          id?: string
          is_active?: boolean
          mode_label?: string
          name?: string
          show_on_homepage?: boolean
          show_on_samples_page?: boolean
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      application_attempts: {
        Row: {
          attempt_time: string
          id: string
          job_slug: string
          user_id: string
        }
        Insert: {
          attempt_time?: string
          id?: string
          job_slug: string
          user_id: string
        }
        Update: {
          attempt_time?: string
          id?: string
          job_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_generation_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          keyword: string | null
          post_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          keyword?: string | null
          post_id?: string | null
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          keyword?: string | null
          post_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_generation_log_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          ai_metadata: Json | null
          author_id: string | null
          content: string
          created_at: string
          ctas: Json | null
          featured_image_url: string | null
          generated_keyword: string | null
          id: string
          internal_links: Json | null
          keywords: string[] | null
          meta_description: string
          published_at: string | null
          quality_score: number | null
          readability_score: number | null
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number
          word_count: number | null
        }
        Insert: {
          ai_metadata?: Json | null
          author_id?: string | null
          content: string
          created_at?: string
          ctas?: Json | null
          featured_image_url?: string | null
          generated_keyword?: string | null
          id?: string
          internal_links?: Json | null
          keywords?: string[] | null
          meta_description: string
          published_at?: string | null
          quality_score?: number | null
          readability_score?: number | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number
          word_count?: number | null
        }
        Update: {
          ai_metadata?: Json | null
          author_id?: string | null
          content?: string
          created_at?: string
          ctas?: Json | null
          featured_image_url?: string | null
          generated_keyword?: string | null
          id?: string
          internal_links?: Json | null
          keywords?: string[] | null
          meta_description?: string
          published_at?: string | null
          quality_score?: number | null
          readability_score?: number | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      blog_settings: {
        Row: {
          auto_approve_enabled: boolean
          auto_generate_enabled: boolean
          created_at: string
          id: string
          topics_source: string
          updated_at: string
        }
        Insert: {
          auto_approve_enabled?: boolean
          auto_generate_enabled?: boolean
          created_at?: string
          id?: string
          topics_source?: string
          updated_at?: string
        }
        Update: {
          auto_approve_enabled?: boolean
          auto_generate_enabled?: boolean
          created_at?: string
          id?: string
          topics_source?: string
          updated_at?: string
        }
        Relationships: []
      }
      career_applications: {
        Row: {
          admin_notes: string | null
          cover_note: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          job_slug: string
          linkedin_url: string | null
          portfolio_url: string | null
          resume_url: string
          status: string
          token_usage_snapshot: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          cover_note?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          job_slug: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          resume_url: string
          status?: string
          token_usage_snapshot?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          cover_note?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          job_slug?: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          resume_url?: string
          status?: string
          token_usage_snapshot?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      file_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          product_id: number
          product_name: string
          requested_at: string
          status: string
          updated_at: string
          uploaded_at: string | null
          uploaded_file_url: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          product_id: number
          product_name: string
          requested_at?: string
          status?: string
          updated_at?: string
          uploaded_at?: string | null
          uploaded_file_url?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          product_id?: number
          product_name?: string
          requested_at?: string
          status?: string
          updated_at?: string
          uploaded_at?: string | null
          uploaded_file_url?: string | null
          user_id?: string
        }
        Relationships: []
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
          deactivated_at: string | null
          deactivation_reason: string | null
          email: string | null
          email_confirmed: boolean | null
          first_name: string | null
          free_tokens_claimed: boolean | null
          id: string
          is_active: boolean
          last_name: string | null
          phone_number: string | null
          postcode: string | null
          reserved_tokens: number
          selected_files: Json | null
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
          deactivated_at?: string | null
          deactivation_reason?: string | null
          email?: string | null
          email_confirmed?: boolean | null
          first_name?: string | null
          free_tokens_claimed?: boolean | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone_number?: string | null
          postcode?: string | null
          reserved_tokens?: number
          selected_files?: Json | null
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
          deactivated_at?: string | null
          deactivation_reason?: string | null
          email?: string | null
          email_confirmed?: boolean | null
          first_name?: string | null
          free_tokens_claimed?: boolean | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone_number?: string | null
          postcode?: string | null
          reserved_tokens?: number
          selected_files?: Json | null
          state_region?: string | null
          updated_at?: string
          user_id?: string
          video_results_balance?: number | null
          video_results_used?: number | null
        }
        Relationships: []
      }
      subscription_orders: {
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
          payment_description: string | null
          payment_method: string | null
          plan_id: string
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
          payment_description?: string | null
          payment_method?: string | null
          plan_id: string
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
          payment_description?: string | null
          payment_method?: string | null
          plan_id?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
          yekpay_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_orders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
      token_audit_log: {
        Row: {
          action: string
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          id: string
          metadata: Json | null
          source: string
          token_type: string
          user_id: string
        }
        Insert: {
          action: string
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          id?: string
          metadata?: Json | null
          source: string
          token_type: string
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          source?: string
          token_type?: string
          user_id?: string
        }
        Relationships: []
      }
      token_reservations: {
        Row: {
          ai_result_url: string | null
          created_at: string
          expires_at: string
          failure_reason: string | null
          id: string
          service_type: string
          status: string
          tokens_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_result_url?: string | null
          created_at?: string
          expires_at?: string
          failure_reason?: string | null
          id?: string
          service_type: string
          status: string
          tokens_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_result_url?: string | null
          created_at?: string
          expires_at?: string
          failure_reason?: string | null
          id?: string
          service_type?: string
          status?: string
          tokens_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          balance_after: number
          created_at: string
          id: string
          reservation_id: string | null
          tokens_amount: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          balance_after: number
          created_at?: string
          id?: string
          reservation_id?: string | null
          tokens_amount: number
          transaction_type: string
          user_id: string
        }
        Update: {
          balance_after?: number
          created_at?: string
          id?: string
          reservation_id?: string | null
          tokens_amount?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "token_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          admin_agent_id: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          admin_agent_id?: string | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          admin_agent_id?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_admin_agent_id_fkey"
            columns: ["admin_agent_id"]
            isOneToOne: false
            referencedRelation: "admin_agents"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_toggle_user_status: {
        Args: {
          p_admin_id: string
          p_is_active: boolean
          p_reason?: string
          p_user_id: string
        }
        Returns: Json
      }
      admin_update_user_tokens: {
        Args: {
          p_admin_id: string
          p_ai_tokens: number
          p_reason: string
          p_user_id: string
          p_video_results: number
        }
        Returns: Json
      }
      check_admin_ip_whitelist: {
        Args: { p_ip_address: string }
        Returns: boolean
      }
      check_admin_rate_limit: {
        Args: { p_email: string; p_ip_address: string }
        Returns: Json
      }
      check_application_eligibility: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_application_rate_limit: {
        Args: { p_job_slug: string; p_user_id: string }
        Returns: Json
      }
      check_file_access: {
        Args: { p_product_id: number; p_user_id: string }
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
      cleanup_expired_guest_tokens: { Args: never; Returns: undefined }
      cleanup_expired_otps: { Args: never; Returns: undefined }
      cleanup_expired_reservations: { Args: never; Returns: undefined }
      cleanup_old_otp_records: { Args: never; Returns: undefined }
      commit_reservation_atomic: {
        Args: {
          p_ai_result_url: string
          p_reservation_id: string
          p_user_id: string
        }
        Returns: Json
      }
      correct_user_tokens: {
        Args: {
          p_ai_tokens: number
          p_user_id: string
          p_video_results: number
        }
        Returns: Json
      }
      create_profile_with_guest_data: {
        Args: { p_email: string; p_user_id: string }
        Returns: {
          profile_data: Json
        }[]
      }
      create_subscription_for_user: {
        Args: { p_period_days?: number; p_plan_id: string; p_user_id: string }
        Returns: {
          message: string
          subscription_id: string
          success: boolean
        }[]
      }
      current_user_is_admin: { Args: never; Returns: boolean }
      deduct_ai_tokens: {
        Args: { p_amount: number; p_user_id: string }
        Returns: boolean
      }
      deduct_tokens_atomic: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_source?: string
          p_token_type: string
          p_user_id: string
        }
        Returns: Json
      }
      deduct_video_results: {
        Args: { p_count: number; p_user_id: string }
        Returns: boolean
      }
      delete_otp_by_email: { Args: { search_email: string }; Returns: boolean }
      delete_used_otp: { Args: { otp_id: string }; Returns: boolean }
      encrypt_sensitive_data: { Args: { data: string }; Returns: string }
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
      generate_order_token: { Args: never; Returns: string }
      generate_secure_order_token: {
        Args: never
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
          max_files: number
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
      get_default_video_url: { Args: never; Returns: string }
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
      get_user_admin_role: {
        Args: { p_user_id: string }
        Returns: {
          is_active: boolean
          role: string
        }[]
      }
      get_user_token_balance: {
        Args: { p_user_id: string }
        Returns: {
          ai_tokens: number
          ai_tokens_limit: number
          free_tokens_claimed: boolean
          video_results: number
          video_results_limit: number
        }[]
      }
      grant_free_tokens: { Args: { p_user_id: string }; Returns: boolean }
      grant_tokens_atomic: {
        Args: {
          p_ai_tokens: number
          p_metadata?: Json
          p_source: string
          p_user_id: string
          p_video_results: number
        }
        Returns: Json
      }
      has_admin_agent_role: {
        Args: {
          p_agent_id: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      has_any_admin_role: { Args: { p_user_id: string }; Returns: boolean }
      has_content_creator_role: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      has_operator_role: { Args: { p_user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_super_admin_role: { Args: { p_user_id: string }; Returns: boolean }
      hash_otp_code: { Args: { otp_code: string }; Returns: string }
      insert_otp_registration: {
        Args: {
          p_email: string
          p_expires_at: string
          p_otp: string
          p_password_hash?: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_admin_agent_email: { Args: { p_email: string }; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      log_admin_login_attempt: {
        Args: { p_email: string; p_ip_address: string; p_success: boolean }
        Returns: undefined
      }
      log_user_activity: {
        Args: {
          p_action_details?: Json
          p_action_type: string
          p_admin_id: string
          p_ip_address?: string
          p_user_id: string
        }
        Returns: string
      }
      mark_otp_verified_and_cleanup: {
        Args: { otp_id: string }
        Returns: boolean
      }
      mask_sensitive_data: {
        Args: { data: string; mask_type?: string }
        Returns: string
      }
      reserve_tokens_atomic: {
        Args: {
          p_service_type: string
          p_tokens_amount: number
          p_user_id: string
        }
        Returns: Json
      }
      rollback_reservation_atomic: {
        Args: { p_reason: string; p_reservation_id: string; p_user_id: string }
        Returns: Json
      }
      set_order_token_session: { Args: { token: string }; Returns: undefined }
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
      trigger_auto_blog_generation: { Args: never; Returns: undefined }
      validate_payment_update: { Args: never; Returns: boolean }
      verify_guest_order_access: {
        Args: { order_id_param: string; order_token_param: string }
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
      app_role: "super_admin" | "content_creator" | "operator" | "user"
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
      app_role: ["super_admin", "content_creator", "operator", "user"],
    },
  },
} as const
