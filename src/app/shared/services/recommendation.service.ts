import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MentorProfile, MenteeProfile } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {

  constructor() { }

  getRecommendedMentors(mentee: MenteeProfile, allMentors: MentorProfile[]): Observable<MentorProfile[]> {
    // Simple recommendation logic based on skill overlap and goals
    const recommendedMentors = allMentors
      .map(mentor => {
        let score = 0;

        // Skill overlap (higher weight)
        const skillOverlap = mentee.skills.filter(skill => mentor.skills.includes(skill)).length;
        score += skillOverlap * 3; // Weight skills higher

        // Goal overlap
        const goalOverlap = mentee.goals.filter(goal => mentor.goals.includes(goal)).length;
        score += goalOverlap * 2; // Weight goals moderately

        // Industry match
        if (mentee.industry === mentor.industry) {
          score += 1;
        }

        // Location match
        if (mentee.location === mentor.location) {
          score += 0.5; // Lower weight for location
        }

        // Availability (simple check for now, can be more complex)
        const commonAvailability = mentee.skills.filter(avail => mentor.availability.includes(avail)).length;
        if (commonAvailability > 0) {
            score += 0.2; // Even lower weight for availability
        }


        // Consider mentor's active mentees to avoid overloading
        if (mentor.activeMentees >= mentor.maxMentees) {
          score = 0; // Do not recommend if mentor is full
        }

        return { mentor, score };
      })
      .filter(item => item.score > 0) // Only include mentors with a positive score
      .sort((a, b) => b.score - a.score) // Sort by score in descending order
      .map(item => item.mentor);

    return of(recommendedMentors);
  }
}