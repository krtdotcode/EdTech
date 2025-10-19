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


    const recommendedMentors = allMentors
      .map((mentor) => {
        let score = 0;
        let factors: {[key: string]: number} = {};

        const skillOverlap = mentee.skills.filter((skill: string) =>
          mentor.skills.includes(skill)
        ).length;
        const preferredSkillMatch = mentee.preferredMentorSkills?.filter((skill: string) =>
          mentor.skills.includes(skill)
        ).length || 0;
        factors['skill_overlap'] = skillOverlap * 3;
        factors['preferred_skill_match'] = preferredSkillMatch * 4;
        score += factors['skill_overlap'] + factors['preferred_skill_match'];

        const goalOverlap = mentee.goals.filter((goal: string) =>
          mentor.goals.includes(goal)
        ).length;
        const preferredGoalMatch = mentee.preferredMentorGoals?.filter((goal: string) =>
          mentor.goals.includes(goal)
        ).length || 0;
        factors['goal_overlap'] = goalOverlap * 2;
        factors['preferred_goal_match'] = preferredGoalMatch * 2.5;
        score += factors['goal_overlap'] + factors['preferred_goal_match'];

        if (mentee.location === mentor.location) {
          factors['location_match'] = 1.5;
          score += factors['location_match'];
        }

        const commonAvailability = mentee.availability.filter((avail: string) =>
          mentor.availability.includes(avail)
        ).length;
        if (commonAvailability > 0) {
          factors['availability_compatibility'] = commonAvailability * 0.5;
          score += factors['availability_compatibility'];
        }

        const mentorRating = mentor.ratings || 0;
        if (mentorRating >= 4.5) {
          factors['high_rating'] = 1;
          score += factors['high_rating'];
        } else if (mentorRating >= 4.0) {
          factors['good_rating'] = 0.5;
          score += factors['good_rating'];
        }

        const activeMentees = mentor.activeMentees ?? 0;
        const maxMentees = mentor.maxMentees ?? 0;
        if (maxMentees > 0 && activeMentees >= maxMentees) {
          score = 0;
          factors['capacity_full'] = -999;
        }

        if (mentee.preferredLanguage && mentor.preferredLanguage &&
            mentee.preferredLanguage.toLowerCase() === mentor.preferredLanguage.toLowerCase()) {
          factors['language_match'] = 0.2;
          score += factors['language_match'];
        }

        return { mentor, score, factors };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.mentor);


    return of(recommendedMentors);
  }
}
