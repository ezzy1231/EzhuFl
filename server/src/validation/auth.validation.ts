import { z } from "zod";

const optionalTrimmedString = (maxLength: number) =>
  z.string().trim().max(maxLength, `Must be ${maxLength} characters or fewer`).optional();

const optionalNullableUrl = z.union([
  z.string().trim().url("Must be a valid URL"),
  z.null(),
]).optional();

const optionalNullableHandle = z.union([
  z.string().trim().max(100, "Must be 100 characters or fewer"),
  z.null(),
]).optional();

const optionalNullableCoordinate = z.union([
  z.number().finite("Must be a valid number"),
  z.null(),
]).optional();

export const createProfileSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120, "name must be 120 characters or fewer"),
  role: z.enum(["BUSINESS", "INFLUENCER"]),
}).strict();

export const updateBusinessProfileSchema = z.object({
  business_name: optionalTrimmedString(160),
  owner_name: optionalTrimmedString(120),
  phone: optionalTrimmedString(40),
  city: optionalTrimmedString(120),
  address: optionalTrimmedString(240),
  license_number: optionalTrimmedString(120),
  license_file_url: optionalNullableUrl,
  profile_photo_url: optionalNullableUrl,
  map_lat: optionalNullableCoordinate,
  map_lng: optionalNullableCoordinate,
}).strict();

export const updateInfluencerProfileSchema = z.object({
  display_name: optionalTrimmedString(120),
  bio: optionalTrimmedString(1000),
  phone: optionalTrimmedString(40),
  city: optionalTrimmedString(120),
  profile_photo_url: optionalNullableUrl,
  id_document_url: optionalNullableUrl,
  tiktok_handle: optionalNullableHandle,
  instagram_handle: optionalNullableHandle,
}).strict();