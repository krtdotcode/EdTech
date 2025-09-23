import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MentorRequests } from './mentor-requests';
import { ProfileService } from '../../shared/services/profile.service';
import { of } from 'rxjs';
import { MentorshipRequest, MentorProfile } from '../../shared/models/profile.model';
import { CommonModule } from '@angular/common';

describe('MentorRequests', () => {
  let component: MentorRequests;
  let fixture: ComponentFixture<MentorRequests>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;

  const mockMentorshipRequests: MentorshipRequest[] = [
    {
      id: 'req1',
      menteeId: 'mentee1',
      mentorId: 'mentor1',
      status: 'pending',
      requestDate: new Date()
    },
    {
      id: 'req2',
      menteeId: 'mentee2',
      mentorId: 'mentor1',
      status: 'accepted',
      requestDate: new Date()
    }
  ];

  const mockMentorProfile: MentorProfile = {
    id: 'mentor1',
    userId: 'user1',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    skills: ['Web Development'],
    goals: ['Career Growth'],
    industry: 'IT',
    location: 'Manila',
    availability: ['Weekdays'],
    ratings: 4.8,
    bio: 'Experienced web developer.',
    activeMentees: 1,
    maxMentees: 3
  };

  beforeEach(async () => {
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getMentorshipRequests', 'updateMentorshipRequestStatus', 'getMentorById']);
    profileServiceSpy.getMentorshipRequests.and.returnValue(of(mockMentorshipRequests));
    profileServiceSpy.updateMentorshipRequestStatus.and.returnValue(of({ ...mockMentorshipRequests[0], status: 'accepted' }));
    profileServiceSpy.getMentorById.and.returnValue(of(mockMentorProfile));

    await TestBed.configureTestingModule({
      imports: [CommonModule, MentorRequests],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load mentorship requests on init', () => {
    expect(profileServiceSpy.getMentorshipRequests).toHaveBeenCalled();
    expect(component.mentorshipRequests).toEqual(mockMentorshipRequests);
  });

  it('should accept a mentorship request', () => {
    component.acceptRequest('req1');
    expect(profileServiceSpy.updateMentorshipRequestStatus).toHaveBeenCalledWith('req1', 'accepted');
    expect(profileServiceSpy.getMentorshipRequests).toHaveBeenCalledTimes(2); // Called on init and after update
  });

  it('should reject a mentorship request', () => {
    component.rejectRequest('req1');
    expect(profileServiceSpy.updateMentorshipRequestStatus).toHaveBeenCalledWith('req1', 'rejected');
    expect(profileServiceSpy.getMentorshipRequests).toHaveBeenCalledTimes(2); // Called on init and after update
  });
});