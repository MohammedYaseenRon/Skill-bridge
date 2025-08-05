export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
  profile_picture_url?: string;
  bio?: string;
  location?: string;
  is_mentor: boolean;
  // Mentor-specific fields
  skills?: string;
  expertise?: string;
  experience_years?: number;
  languages_spoken?: string;
  availability?: string;
  hourly_rate?: number;
  linkedin_url?: string;
}