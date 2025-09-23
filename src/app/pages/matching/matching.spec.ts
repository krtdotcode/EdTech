import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Matching } from './matching';
import { ProfileService } from '../../shared/services/profile.service';
import { RecommendationService } from '../../shared/services/recommendation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { MentorProfile, MenteeProfile } from '../../shared/models/profile.model';

describe('Matching', () => {
  let component: Matching;
  let fixture: ComponentFixture<Matching>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let recommendationServiceSpy: jasmine.SpyObj<RecommendationService>;

  const mockMentors: MentorProfile[] = [
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

  const mockMentee: MenteeProfile = {
    id: 'mentee1',
    userId: 'user3',
    name: 'Pedro Reyes',
    email: 'pedro.reyes@example.com',
    skills: ['Web Development', 'Angular'],
    goals: ['Learn Angular', 'Career Growth'],
    industry: 'IT',
    location: 'Manila',
    availability: ['Weekdays'],
    preferredMentorSkills: ['Angular', 'TypeScript'],
    preferredMentorGoals: ['Career Growth'],
    bio: 'Aspiring web developer looking for guidance in Angular.'
  };

  beforeEach(async () => {
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getMentors', 'sendMentorshipRequest']);
    recommendationServiceSpy = jasmine.createSpyObj('RecommendationService', ['getRecommendedMentors']);

    profileServiceSpy.getMentors.and.returnValue(of(mockMentors));
    recommendationServiceSpy.getRecommendedMentors.and.returnValue(of([mockMentors[0]]));
    profileServiceSpy.sendMentorshipRequest.and.returnValue(of({
      id: 'req1',
      menteeId: mockMentee.id,
      mentorId: mockMentors[0].id,
      status: 'pending',
      requestDate: new Date()
    }));

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, Matching],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: RecommendationService, useValue: recommendationServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Matching);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load mentors on init', () => {
    expect(profileServiceSpy.getMentors).toHaveBeenCalled();
    expect(component.allMentors).toEqual(mockMentors);
    expect(component.filteredMentors).toEqual(mockMentors);
    expect(component.recommendedMentors).toEqual([mockMentors[0]]);
  });

  it('should populate filter options', () => {
    expect(component.uniqueSkills).toEqual(['Web Development', 'Angular', 'TypeScript', 'Project Management', 'Leadership']);
    expect(component.uniqueGoals).toEqual(['Career Growth', 'Technical Skills', 'Leadership Skills', 'Project Delivery']);
    expect(component.uniqueIndustries).toEqual(['IT', 'Consulting']);
    expect(component.uniqueLocations).toEqual(['Manila', 'Cebu']);
    expect(component.uniqueAvailabilities).toEqual(['Weekdays', 'Evenings', 'Weekends']);
  });

  it('should filter mentors by skill', () => {
    component.selectedSkill = 'Angular';
    component.applyFilters();
    expect(component.filteredMentors.length).toBe(1);
    expect(component.filteredMentors[0].name).toBe('Juan Dela Cruz');
  });

  it('should filter mentors by search term', () => {
    component.searchTerm = 'Juan';
    component.applyFilters();
    expect(component.filteredMentors.length).toBe(1);
    expect(component.filteredMentors[0].name).toBe('Juan Dela Cruz');
  });

  it('should send a mentorship request', () => {
    component.sendRequest('mentor1');
    expect(profileServiceSpy.sendMentorshipRequest).toHaveBeenCalledWith(mockMentee.id, 'mentor1');
  });
});
