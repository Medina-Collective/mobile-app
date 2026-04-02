// Auto-generated types from Supabase schema.
// Re-generate with: npx supabase gen types typescript --project-id bvpuvwlfygpfcttxulcv > src/types/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      professionals: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          profile_type: string;
          monetization_type: 'nonprofit' | 'for_profit' | null;
          category: string;
          subcategories: string[];
          service_types: string[];
          based_in: string;
          serves_areas: string[];
          description: string;
          inquiry_email: string;
          instagram: string | null;
          phone: string | null;
          website: string | null;
          booking_link: string | null;
          price_range: '$' | '$$' | '$$$' | null;
          starting_price: string | null;
          logo_uri: string | null;
          status:
            | 'draft'
            | 'pending_review'
            | 'approved'
            | 'changes_requested'
            | 'rejected'
            | 'needs_follow_up';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          profile_type: string;
          monetization_type?: 'nonprofit' | 'for_profit' | null;
          category: string;
          subcategories?: string[];
          service_types?: string[];
          based_in: string;
          serves_areas?: string[];
          description: string;
          inquiry_email: string;
          instagram?: string | null;
          phone?: string | null;
          website?: string | null;
          booking_link?: string | null;
          price_range?: '$' | '$$' | '$$$' | null;
          starting_price?: string | null;
          logo_uri?: string | null;
          status?:
            | 'draft'
            | 'pending_review'
            | 'approved'
            | 'changes_requested'
            | 'rejected'
            | 'needs_follow_up';
        };
        Update: {
          business_name?: string;
          profile_type?: string;
          monetization_type?: 'nonprofit' | 'for_profit' | null;
          category?: string;
          subcategories?: string[];
          service_types?: string[];
          based_in?: string;
          serves_areas?: string[];
          description?: string;
          inquiry_email?: string;
          instagram?: string | null;
          phone?: string | null;
          website?: string | null;
          booking_link?: string | null;
          price_range?: '$' | '$$' | '$$$' | null;
          starting_price?: string | null;
          logo_uri?: string | null;
          status?:
            | 'draft'
            | 'pending_review'
            | 'approved'
            | 'changes_requested'
            | 'rejected'
            | 'needs_follow_up';
          updated_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          user_id: string;
          professional_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          professional_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          professional_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          professional_id: string;
          type: 'activity_event' | 'bazaar' | 'brand_popup' | 'halaqa' | 'limited_offer' | 'other';
          title: string;
          description: string | null;
          cover_image_url: string | null;
          location: string | null;
          event_start: string | null;
          event_end: string | null;
          visibility_start: string;
          visibility_end: string;
          audience: 'public' | 'pro_only';
          participation_enabled: boolean;
          max_capacity: number | null;
          participant_count: number;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          professional_id: string;
          type: 'activity_event' | 'bazaar' | 'brand_popup' | 'halaqa' | 'limited_offer' | 'other';
          title: string;
          description?: string | null;
          cover_image_url?: string | null;
          location?: string | null;
          event_start?: string | null;
          event_end?: string | null;
          audience?: 'public' | 'pro_only';
          visibility_start: string;
          visibility_end: string;
          participation_enabled?: boolean;
          max_capacity?: number | null;
          participant_count?: number;
          status?: 'draft' | 'published' | 'archived';
        };
        Update: {
          type?: 'activity_event' | 'bazaar' | 'brand_popup' | 'halaqa' | 'limited_offer' | 'other';
          title?: string;
          description?: string | null;
          cover_image_url?: string | null;
          location?: string | null;
          event_start?: string | null;
          event_end?: string | null;
          visibility_start?: string;
          visibility_end?: string;
          audience?: 'public' | 'pro_only';
          participation_enabled?: boolean;
          max_capacity?: number | null;
          participant_count?: number;
          status?: 'draft' | 'published' | 'archived';
          updated_at?: string;
        };
        Relationships: [];
      };
      followers: {
        Row: {
          user_id: string;
          professional_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          professional_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          professional_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      announcement_participants: {
        Row: {
          user_id: string;
          announcement_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          announcement_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          announcement_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      profile_status:
        | 'draft'
        | 'pending_review'
        | 'approved'
        | 'changes_requested'
        | 'rejected'
        | 'needs_follow_up';
      price_range: '$' | '$$' | '$$$';
      announcement_type:
        | 'activity_event'
        | 'bazaar'
        | 'brand_popup'
        | 'halaqa'
        | 'limited_offer'
        | 'other';
      announcement_status: 'draft' | 'published' | 'archived';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
