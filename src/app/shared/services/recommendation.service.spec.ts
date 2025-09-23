import { TestBed } from '@angular/core/testing';
import { RecommendationService } from './recommendation.service';
import { MentorProfile, MenteeProfile } from '../models/profile.model';

describe('RecommendationService', () => {
  let service: RecommendationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecommendationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should recommend mentors based on skill overlap', (done) => {
    const mentee: MenteeProfile = {
      id: 'mentee1',
      userId: 'user3',
      name: 'Pedro Reyes',
      email: 'pedro.reyes@example.com',
      skills: ['Web Development', 'Angular'],
      goals: ['Learn Angular'],
      industry: 'IT',
      location: 'Manila',
      availability: ['Weekdays'],
      preferredMentorSkills: ['Angular', 'TypeScript'],
      preferredMentorGoals: ['Career Growth'],
      bio: 'Aspiring web developer looking for guidance in Angular.'
    };

    const mentors: MentorProfile[] = [
      {
        id: 'mentor1',
        userId: 'user1',
        name: 'Juan Dela Cruz',
        email: 'juan.delacruz@example.com',
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
        userId: 'user2',
        name: 'Maria Santos',
        email: 'maria.santos@example.com',
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

    service.getRecommendedMentors(mentee, mentors).subscribe(recommended => {
      expect(recommended.length).toBeGreaterThan(0);
      expect(recommended[0].id).toBe('mentor1'); // Juan Dela Cruz has Angular skill overlap
      done();
    });
  });

  it('should recommend mentors based on goal overlap', (done) => {
    const mentee: MenteeProfile = {
      id: 'mentee1',
      userId: 'user3',
      name: 'Pedro Reyes',
      email: 'pedro.reyes@example.com',
      skills: ['Project Management'],
      goals: ['Leadership Skills'],
      industry: 'IT',
      location: 'Manila',
      availability: ['Weekends'],
      preferredMentorSkills: ['Project Management'],
      preferredMentorGoals: ['Leadership Skills'],
      bio: 'Aspiring project manager.'
    };

    const mentors: MentorProfile[] = [
      {
        id: 'mentor1',
        userId: 'user1',
        name: 'Juan Dela Cruz',
        email: 'juan.delacruz@example.com',
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
        userId: 'user2',
        name: 'Maria Santos',
        email: 'maria.santos@example.com',
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

    service.getRecommendedMentors(mentee, mentors).subscribe(recommended => {
      expect(recommended.length).toBeGreaterThan(0);
      expect(recommended[0].id).toBe('mentor2'); // Maria Santos has Leadership Skills goal overlap
      done();
    });
  });

  it('should prioritize skill overlap over other factors', (done) => {
    const mentee: MenteeProfile = {
      id: 'mentee1',
      userId: 'user3',
      name: 'Pedro Reyes',
      email: 'pedro.reyes@example.com',
      skills: ['Angular'],
      goals: ['Career Growth'],
      industry: 'IT',
      location: 'Manila',
      availability: ['Weekdays'],
      preferredMentorSkills: ['Angular'],
      preferredMentorGoals: ['Career Growth'],
      bio: 'Aspiring web developer.'
    };

    const mentors: MentorProfile[] = [
      {
        id: 'mentor1',
        userId: 'user1',
        name: 'Juan Dela Cruz',
        email: 'juan.delacruz@example.com',
        skills: ['Angular'],
        goals: ['Career Growth'],
        industry: 'IT',
        location: 'Manila',
        availability: ['Weekdays'],
        ratings: 4.8,
        bio: 'Experienced Angular developer.',
        activeMentees: 1,
        maxMentees: 3
      },
      {
        id: 'mentor2',
        userId: 'user2',
        name: 'Maria Santos',
        email: 'maria.santos@example.com',
        skills: ['Leadership'],
        goals: ['Career Growth'],
        industry: 'Consulting',
        location: 'Manila',
        availability: ['Weekdays'],
        ratings: 4.5,
        bio: 'Experienced leader.',
        activeMentees: 0,
        maxMentees: 2
      }
    ];

    service.getRecommendedMentors(mentee, mentors).subscribe(recommended => {
      expect(recommended.length).toBeGreaterThan(0);
      expect(recommended[0].id).toBe('mentor1'); // Mentor1 has skill overlap, Mentor2 only goal overlap
      done();
    });
  });
});