// Auto-generated types from Supabase schema.
// Re-generate with: npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProfileType = 'shop' | 'service' | 'organizer' | 'classes_circles';
export type ProfileStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'changes_requested'
  | 'rejected';
export type PriceRange = '$' | '$$' | '$$$';
export type ServiceTypeValue = 'at_home' | 'has_studio' | 'online' | 'travels_to_client';

export interface Database {
  public: {
    Tables: {
      professionals: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          profile_type: ProfileType;
          category: string;
          subcategories: string[];
          service_types: ServiceTypeValue[];
          based_in: string;
          serves_areas: string[];
          description: string;
          inquiry_email: string;
          instagram: string | null;
          phone: string | null;
          website: string | null;
          booking_link: string | null;
          price_range: PriceRange | null;
          starting_price: string | null;
          logo_uri: string | null;
          status: ProfileStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          profile_type: ProfileType;
          category: string;
          subcategories?: string[];
          service_types?: ServiceTypeValue[];
          based_in: string;
          serves_areas?: string[];
          description: string;
          inquiry_email: string;
          instagram?: string | null;
          phone?: string | null;
          website?: string | null;
          booking_link?: string | null;
          price_range?: PriceRange | null;
          starting_price?: string | null;
          logo_uri?: string | null;
          status?: ProfileStatus;
        };
        Update: {
          business_name?: string;
          profile_type?: ProfileType;
          category?: string;
          subcategories?: string[];
          service_types?: ServiceTypeValue[];
          based_in?: string;
          serves_areas?: string[];
          description?: string;
          inquiry_email?: string;
          instagram?: string | null;
          phone?: string | null;
          website?: string | null;
          booking_link?: string | null;
          price_range?: PriceRange | null;
          starting_price?: string | null;
          logo_uri?: string | null;
          status?: ProfileStatus;
          updated_at?: string;
        };
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
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      profile_type: ProfileType;
      profile_status: ProfileStatus;
      price_range: PriceRange;
      service_type_value: ServiceTypeValue;
    };
  };
}
