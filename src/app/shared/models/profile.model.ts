export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  skills: string[];
  goals: string[];
  industry: string;
  location: string;
  availability: string[];
  ratings: number;
  bio: string;
  activeMentees: number;
  maxMentees: number;
}

export interface MenteeProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  skills: string[];
  goals: string[];
  industry: string;
  location: string;
  availability: string[];
  preferredMentorSkills: string[];
  preferredMentorGoals: string[];
  bio: string;
}

export interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestDate: Date;
}