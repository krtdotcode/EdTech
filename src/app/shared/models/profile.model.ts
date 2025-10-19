export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  photoUrl?: string;
  bio: string;
  location: string;
  skills: string[];
  expertise?: string[];
  interests?: string[];
  goals: string[];
  availability: string[];
  preferredLanguage?: string;
  role: 'mentee' | 'mentor' | 'both';
}

export interface MentorProfile extends UserProfile {
  ratings?: number;
  activeMentees?: number;
  maxMentees?: number;
  mentees?: string[]; // Array of mentee user IDs
}

export interface MenteeProfile extends UserProfile {
  preferredMentorSkills?: string[];
  preferredMentorGoals?: string[];
  mentors?: string[]; // Array of mentor user IDs
}

export interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestDate: Date;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerRole: 'mentee' | 'mentor';
  revieweeId: string;
  revieweeRole: 'mentee' | 'mentor';
  rating: number; // 1-5 stars
  comment: string;
  createdAt: Date;
  mentorshipId?: string; // Reference to the mentorship relationship
  isVerified?: boolean; // Whether this was a real mentorship
}
