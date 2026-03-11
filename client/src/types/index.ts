export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'learner' | 'mentor' | 'admin';
  is_mentor: boolean;
  phone_number?: string;
  profile_picture_url?: string;
  bio?: string;
  location?: string;
  // Learner fields
  learning_goal?: string;
  preferred_language?: string;
  time_zone?: string;
  learning_style?: string;
  experience_level?: string;
  availability?: string;
  skills_interested?: string;
  current_skills?: string;
  // Mentor fields
  skills?: string;
  expertise?: string;
  experience_years?: number;
  languages_spoken?: string;
  mentor_availability?: string;
  hourly_rate?: number;
  linkedin_url?: string;
  company?: string;
  job_title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MentorProfile {
  id: number;
  user_id: number;
  skills: string;
  expertise: string;
  experience_years: number;
  languages_spoken: string;
  availability: string;
  hourly_rate?: number;
  linkedin_url?: string;
  is_active: boolean;
  is_verified: boolean;
  rating?: number;
  max_students?: number;
  preferred_learning_styles?: string;
  company?: string;
  job_title?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}


export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
  profile_picture_url?: string;
  bio?: string;
  location?: string;
  is_mentor: boolean;

  // Learner fields
  learning_goal?: string;
  preferred_language?: string;
  time_zone?: string;
  learning_style?: string;
  experience_level?: string;
  availability?: string;
  skills_interested?: string;
  current_skills?: string;

  // Mentor fields
  skills?: string;
  expertise?: string;
  experience_years?: number;
  languages_spoken?: string;
  mentor_availability?: string;
  hourly_rate?: number;
  linkedin_url?: string;
  company?: string;
  job_title?: string;
}

export interface UserWithMentorProfile extends User {
  mentor_profile?: MentorProfile;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface MentorData {
  id: number;
  full_name: string;
  email: string;
  bio?: string;
  skills?: string;
  expertise?: string;
  experience_years?: number;
  hourly_rate?: number;
  location?: string;
  company?: string;
  job_title?: string;
  linkedin_url?: string;
  languages_spoken?: string;
  mentor_availability?: string;
  profile_picture_url?: string;
  rating?: number;
}