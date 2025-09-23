import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MentorProfile {
  id: string;
  name: string;
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
  name: string;
  skills: string[];
  goals: string[];
  industry: string;
  location: string;
  bio: string;
}

export interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private mentors: MentorProfile[] = [
    {
      id: 'mentor1',
      name: 'Juan Dela Cruz',
      skills: ['Web Development', 'Angular', 'TypeScript'],
      goals: ['Career Growth', 'Technical Skills'],
      industry: 'IT',
      location: 'Manila',
      availability: ['Weekdays', 'Evenings'],
      ratings: 4.8,
      bio: 'Experienced web developer specializing in Angular.',
      activeMentees: 1,
      maxMentees: 3
    },
    {
      id: 'mentor2',
      name: 'Maria Santos',
      skills: ['Project Management', 'Leadership'],
      goals: ['Leadership Skills', 'Project Delivery'],
      industry: 'Consulting',
      location: 'Cebu',
      availability: ['Weekends'],
      ratings: 4.5,
      bio: 'Project Manager with a passion for guiding new leaders.',
      activeMentees: 0,
      maxMentees: 2
    }
  ];

  private mentorshipRequests: MentorshipRequest[] = [];

  private mentees: MenteeProfile[] = [
    {
      id: 'mentee1',
      name: 'Pedro Reyes',
      skills: ['Web Development'],
      goals: ['Learn Angular'],
      industry: 'IT',
      location: 'Manila',
      bio: 'Aspiring web developer looking for guidance in Angular.'
    }
  ];

  constructor() { }

  getMentors(): Observable<MentorProfile[]> {
    return of(this.mentors);
  }

  getMentorById(id: string): Observable<MentorProfile | undefined> {
    return of(this.mentors.find(mentor => mentor.id === id));
  }

  updateMentorProfile(profile: MentorProfile): Observable<MentorProfile> {
    const index = this.mentors.findIndex(m => m.id === profile.id);
    if (index > -1) {
      this.mentors[index] = profile;
    }
    return of(profile);
  }

  getMentees(): Observable<MenteeProfile[]> {
    return of(this.mentees);
  }

  getMenteeById(id: string): Observable<MenteeProfile | undefined> {
    return of(this.mentees.find(mentee => mentee.id === id));
  }

  updateMenteeProfile(profile: MenteeProfile): Observable<MenteeProfile> {
    const index = this.mentees.findIndex(m => m.id === profile.id);
    if (index > -1) {
      this.mentees[index] = profile;
    }
    return of(profile);
  }

  getMentorshipRequests(): Observable<MentorshipRequest[]> {
    return of(this.mentorshipRequests);
  }

  sendMentorshipRequest(menteeId: string, mentorId: string): Observable<MentorshipRequest> {
    const newRequest: MentorshipRequest = {
      id: `req${this.mentorshipRequests.length + 1}`,
      menteeId,
      mentorId,
      status: 'pending',
      requestDate: new Date()
    };
    this.mentorshipRequests.push(newRequest);
    return of(newRequest);
  }

  updateMentorshipRequestStatus(requestId: string, status: 'accepted' | 'rejected'): Observable<MentorshipRequest | undefined> {
    const request = this.mentorshipRequests.find(req => req.id === requestId);
    if (request) {
      request.status = status;
      // If accepted, update mentor's active mentees
      if (status === 'accepted') {
        const mentor = this.mentors.find(m => m.id === request.mentorId);
        if (mentor && mentor.activeMentees < mentor.maxMentees) {
          mentor.activeMentees++;
          this.updateMentorProfile(mentor); // Update the mentor profile
        } else {
          // If mentor is full, reject the request
          request.status = 'rejected';
          console.warn(`Mentor ${mentor?.name} is full. Request rejected.`);
        }
      }
    }
    return of(request);
  }
}