import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';
import { MentorProfile, MenteeProfile, MentorshipRequest } from '../models/profile.model';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return mentors', (done) => {
    service.getMentors().subscribe(mentors => {
      expect(mentors.length).toBeGreaterThan(0);
      expect(mentors[0].name).toBe('Juan Dela Cruz');
      done();
    });
  });

  it('should return a mentor by ID', (done) => {
    service.getMentorById('mentor1').subscribe(mentor => {
      expect(mentor).toBeDefined();
      expect(mentor?.name).toBe('Juan Dela Cruz');
      done();
    });
  });

  it('should update a mentor profile', (done) => {
    const updatedMentor: MentorProfile = {
      id: 'mentor1',
      userId: 'user1',
      name: 'Juan Dela Cruz Updated',
      email: 'juan.delacruz@example.com',
      skills: ['Web Development', 'Angular', 'TypeScript', 'Node.js'],
      goals: ['Career Growth', 'Technical Skills'],
      industry: 'IT',
      location: 'Manila',
      availability: ['Weekdays', 'Evenings'],
      ratings: 4.9,
      bio: 'Experienced web developer specializing in Angular and Node.js.',
      activeMentees: 1,
      maxMentees: 3
    };
    service.updateMentorProfile(updatedMentor).subscribe(mentor => {
      expect(mentor.name).toBe('Juan Dela Cruz Updated');
      service.getMentorById('mentor1').subscribe(retrievedMentor => {
        expect(retrievedMentor?.name).toBe('Juan Dela Cruz Updated');
        done();
      });
    });
  });

  it('should return mentees', (done) => {
    service.getMentees().subscribe(mentees => {
      expect(mentees.length).toBeGreaterThan(0);
      expect(mentees[0].name).toBe('Pedro Reyes');
      done();
    });
  });

  it('should return a mentee by ID', (done) => {
    service.getMenteeById('mentee1').subscribe(mentee => {
      expect(mentee).toBeDefined();
      expect(mentee?.name).toBe('Pedro Reyes');
      done();
    });
  });

  it('should update a mentee profile', (done) => {
    const updatedMentee: MenteeProfile = {
      id: 'mentee1',
      userId: 'user3',
      name: 'Pedro Reyes Updated',
      email: 'pedro.reyes@example.com',
      skills: ['Web Development', 'Angular', 'React'],
      goals: ['Learn Angular', 'Career Growth'],
      industry: 'IT',
      location: 'Manila',
      availability: ['Weekdays'],
      preferredMentorSkills: ['Angular', 'TypeScript'],
      preferredMentorGoals: ['Career Growth'],
      bio: 'Aspiring web developer looking for guidance in Angular and React.'
    };
    service.updateMenteeProfile(updatedMentee).subscribe(mentee => {
      expect(mentee.name).toBe('Pedro Reyes Updated');
      service.getMenteeById('mentee1').subscribe(retrievedMentee => {
        expect(retrievedMentee?.name).toBe('Pedro Reyes Updated');
        done();
      });
    });
  });

  it('should send a mentorship request', (done) => {
    service.sendMentorshipRequest('mentee1', 'mentor2').subscribe(request => {
      expect(request).toBeDefined();
      expect(request.menteeId).toBe('mentee1');
      expect(request.mentorId).toBe('mentor2');
      expect(request.status).toBe('pending');
      service.getMentorshipRequests().subscribe(requests => {
        expect(requests.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  it('should accept a mentorship request and update mentor active mentees', (done) => {
    service.sendMentorshipRequest('mentee1', 'mentor2').subscribe(initialRequest => {
      service.updateMentorshipRequestStatus(initialRequest.id, 'accepted').subscribe(updatedRequest => {
        expect(updatedRequest?.status).toBe('accepted');
        service.getMentorById('mentor2').subscribe(mentor => {
          expect(mentor?.activeMentees).toBe(1); // Assuming initial activeMentees was 0
          done();
        });
      });
    });
  });

  it('should reject a mentorship request', (done) => {
    service.sendMentorshipRequest('mentee1', 'mentor1').subscribe(initialRequest => {
      service.updateMentorshipRequestStatus(initialRequest.id, 'rejected').subscribe(updatedRequest => {
        expect(updatedRequest?.status).toBe('rejected');
        done();
      });
    });
  });

  it('should reject a mentorship request if mentor is full', (done) => {
    // Set mentor1 to max mentees
    const mentor1Full: MentorProfile = {
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
      activeMentees: 3,
      maxMentees: 3
    };
    service.updateMentorProfile(mentor1Full).subscribe(() => {
      service.sendMentorshipRequest('mentee1', 'mentor1').subscribe(initialRequest => {
        service.updateMentorshipRequestStatus(initialRequest.id, 'accepted').subscribe(updatedRequest => {
          expect(updatedRequest?.status).toBe('rejected'); // Should be rejected due to full mentor
          service.getMentorById('mentor1').subscribe(mentor => {
            expect(mentor?.activeMentees).toBe(3); // Should remain 3
            done();
          });
        });
      });
    });
  });
});