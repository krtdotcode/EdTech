import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { MentorProfile, MenteeProfile, MentorshipRequest } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private mentors: MentorProfile[] = [
    {
      id: 'mentor1',
      userId: 'user1',
      name: 'Juan Dela Cruz',
      email: 'juan.delacruz@example.com',
      skills: ['Web Development', 'Angular', 'TypeScript'],
      goals: ['Career Growth', 'Technical Skills'],
      location: 'Manila',
      availability: ['Weekdays', 'Evenings'],
      ratings: 4.8,
      bio: 'Experienced web developer specializing in Angular.',
      activeMentees: 1,
      maxMentees: 3,
      photoUrl: 'https://example.com/juan.jpg',
      expertise: ['Angular', 'TypeScript'],
      interests: ['Mentoring', 'Open Source'],
      preferredLanguage: 'Tagalog',
      role: 'mentor',
    },
    {
      id: 'mentor2',
      userId: 'user2',
      name: 'Maria Santos',
      email: 'maria.santos@example.com',
      skills: ['Project Management', 'Leadership'],
      goals: ['Leadership Skills', 'Project Delivery'],
      location: 'Cebu',
      availability: ['Weekends'],
      ratings: 4.5,
      bio: 'Project Manager with a passion for guiding new leaders.',
      activeMentees: 0,
      maxMentees: 2,
      photoUrl: 'https://example.com/maria.jpg',
      expertise: ['Project Planning', 'Team Leadership'],
      interests: ['Coaching', 'Innovation'],
      preferredLanguage: 'English',
      role: 'mentor',
    },
  ];

  private mentorshipRequests: MentorshipRequest[] = [];

  private mentees: MenteeProfile[] = [
    {
      id: 'mentee1',
      userId: 'user3',
      name: 'Pedro Reyes',
      email: 'pedro.reyes@example.com',
      skills: ['Web Development'],
      goals: ['Learn Angular'],
      location: 'Manila',
      availability: ['Weekdays'],
      preferredMentorSkills: ['Angular', 'TypeScript'],
      preferredMentorGoals: ['Career Growth'],
      bio: 'Aspiring web developer looking for guidance in Angular.',
      photoUrl: 'https://example.com/pedro.jpg',
      interests: ['Web Development', 'Learning'],
      preferredLanguage: 'Tagalog',
      role: 'mentee',
    },
  ];

  constructor() {}

  // Create a new mentee profile
  createMenteeProfile(profile: MenteeProfile): Observable<MenteeProfile> {
    this.mentees.push(profile);
    return of(profile);
  }

  // Create a new mentor profile
  createMentorProfile(profile: MentorProfile): Observable<MentorProfile> {
    this.mentors.push(profile);
    return of(profile);
  }

  getMentors(): Observable<MentorProfile[]> {
    return of(this.mentors);
  }

  getMentorById(id: string): Observable<MentorProfile | undefined> {
    return of(this.mentors.find((mentor) => mentor.id === id));
  }

  updateMentorProfile(profile: MentorProfile): Observable<MentorProfile> {
    const index = this.mentors.findIndex((m) => m.id === profile.id);
    if (index > -1) {
      this.mentors[index] = profile;
    }
    return of(profile);
  }

  getMentees(): Observable<MenteeProfile[]> {
    return of(this.mentees);
  }

  getMenteeById(id: string): Observable<MenteeProfile | undefined> {
    return of(this.mentees.find((mentee) => mentee.id === id));
  }

  updateMenteeProfile(profile: MenteeProfile): Observable<MenteeProfile> {
    const index = this.mentees.findIndex((m) => m.id === profile.id);
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
      requestDate: new Date(),
    };
    this.mentorshipRequests.push(newRequest);
    return of(newRequest);
  }

  updateMentorshipRequestStatus(
    requestId: string,
    status: 'accepted' | 'rejected'
  ): Observable<MentorshipRequest | undefined> {
    const request = this.mentorshipRequests.find((req) => req.id === requestId);
    if (request) {
      request.status = status;
      // If accepted, update mentor's active mentees
      if (status === 'accepted') {
        const mentor = this.mentors.find((m) => m.id === request.mentorId);
        if (
          mentor &&
          mentor.activeMentees !== undefined &&
          mentor.maxMentees !== undefined &&
          mentor.activeMentees < mentor.maxMentees
        ) {
          mentor.activeMentees++;
          this.updateMentorProfile(mentor); // Update the mentor profile
        } else {
          // If mentor is full or properties are undefined, reject the request
          request.status = 'rejected';
          console.warn(
            `Mentor ${mentor?.name} is full or has undefined activeMentees/maxMentees. Request rejected.`
          );
        }
      }
    }
    return of(request);
  }
}
