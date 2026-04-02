import type { ProfessionalProfileFormData } from '@features/profile/schemas/professional-profile.schema';

/**
 * Maps form data to the Supabase `professionals` row shape.
 * Used by both the create and edit screens to avoid duplication.
 */
export function formDataToRow(data: ProfessionalProfileFormData) {
  return {
    business_name: data.businessName,
    profile_type: data.profileType,
    monetization_type: data.monetizationType,
    category: data.category,
    subcategories: data.subcategories,
    service_types: data.serviceTypes,
    based_in: data.basedIn,
    serves_areas: data.servesAreas,
    description: data.description,
    inquiry_email: data.inquiryEmail,
    instagram: data.instagram ?? null,
    phone: data.phone ?? null,
    website: data.website ?? null,
    booking_link: data.bookingLink ?? null,
    price_range: data.priceRange ?? null,
    starting_price: data.startingPrice ?? null,
    logo_uri: data.logoUri ?? null,
  };
}
