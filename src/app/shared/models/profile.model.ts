export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  photoUrl?: string; // Temporarily disabled due to Firestore 1MB limit
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
}

export interface MenteeProfile extends UserProfile {
  preferredMentorSkills?: string[];
  preferredMentorGoals?: string[];
}

export interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestDate: Date;
}
