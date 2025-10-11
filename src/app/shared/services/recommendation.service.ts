import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MentorProfile, MenteeProfile } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class RecommendationService {
  constructor() {}

  getRecommendedMentors(
    mentee: MenteeProfile,
    allMentors: MentorProfile[]
  ): Observable<MentorProfile[]> {
    console.log('Calculating recommendations for mentee:', mentee);

    const recommendedMentors = allMentors
      .map((mentor) => {
        let score = 0;
        let factors: {[key: string]: number} = {};

        // 1. Skill overlap (highest weight) - Check both general skills and preferred mentor skills
        const skillOverlap = mentee.skills.filter((skill: string) =>
          mentor.skills.includes(skill)
        ).length;
        const preferredSkillMatch = mentee.preferredMentorSkills?.filter((skill: string) =>
          mentor.skills.includes(skill)
        ).length || 0;
        factors['skill_overlap'] = skillOverlap * 3; // 3 points per mentee skill match
        factors['preferred_skill_match'] = preferredSkillMatch * 4; // 4 points per preferred skill match
        score += factors['skill_overlap'] + factors['preferred_skill_match'];

        // 2. Goal overlap (high weight) - Check both goals and preferred mentor goals
        const goalOverlap = mentee.goals.filter((goal: string) =>
          mentor.goals.includes(goal)
        ).length;
        const preferredGoalMatch = mentee.preferredMentorGoals?.filter((goal: string) =>
          mentor.goals.includes(goal)
        ).length || 0;
        factors['goal_overlap'] = goalOverlap * 2; // 2 points per goal match
        factors['preferred_goal_match'] = preferredGoalMatch * 2.5; // 2.5 points per preferred goal match
        score += factors['goal_overlap'] + factors['preferred_goal_match'];

        // 3. Location match (medium weight)
        if (mentee.location === mentor.location) {
          factors['location_match'] = 1.5; // Increased weight for location match
          score += factors['location_match'];
        }

        // 4. Availability compatibility (low-medium weight)
        const commonAvailability = mentee.availability.filter((avail: string) =>
          mentor.availability.includes(avail)
        ).length;
        if (commonAvailability > 0) {
          factors['availability_compatibility'] = commonAvailability * 0.5; // 0.5 points per matching availability slot
          score += factors['availability_compatibility'];
        }

        // 5. Mentor ratings (boost for highly rated mentors)
        const mentorRating = mentor.ratings || 0;
        if (mentorRating >= 4.5) {
          factors['high_rating'] = 1; // Bonus for top-rated mentors
          score += factors['high_rating'];
        } else if (mentorRating >= 4.0) {
          factors['good_rating'] = 0.5; // Smaller bonus for good ratings
          score += factors['good_rating'];
        }

        // 6. Capacity check - Don't recommend mentors at capacity (unless maxMentees is 0/unlimited)
        const activeMentees = mentor.activeMentees ?? 0;
        const maxMentees = mentor.maxMentees ?? 0;
        if (maxMentees > 0 && activeMentees >= maxMentees) {
          score = 0; // Don't recommend mentors who are at capacity
          factors['capacity_full'] = -999; // Mark as not available
        }

        // 7. Language compatibility (small bonus)
        if (mentee.preferredLanguage && mentor.preferredLanguage &&
            mentee.preferredLanguage.toLowerCase() === mentor.preferredLanguage.toLowerCase()) {
          factors['language_match'] = 0.2;
          score += factors['language_match'];
        }

        console.log(`Mentor ${mentor.name}: score=${score.toFixed(2)}`, factors);

        return { mentor, score, factors };
      })
      .filter((item) => item.score > 0) // Only include mentors with positive scores
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 10) // Return top 10 recommendations
      .map((item) => item.mentor);

    console.log('Final recommendations:', recommendedMentors.length, 'mentors');
    return of(recommendedMentors);
  }
}
