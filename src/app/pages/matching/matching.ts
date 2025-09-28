import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../shared/services/profile.service';
import { MentorProfile, MenteeProfile } from '../../shared/models/profile.model';
import { RecommendationService } from '../../shared/services/recommendation.service';

@Component({
  selector: 'app-matching',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matching.html',
})
export class Matching implements OnInit {
  searchTerm: string = '';
  selectedSkill: string = '';
  selectedGoal: string = '';
  selectedLocation: string = '';
  selectedAvailability: string = '';
  minRating: number | null = null;

  allMentors: MentorProfile[] = [];
  filteredMentors: MentorProfile[] = [];
  recommendedMentors: MentorProfile[] = [];

  uniqueSkills: string[] = [];
  uniqueGoals: string[] = [];
  uniqueLocations: string[] = [];
  uniqueAvailabilities: string[] = [];

  // For demonstration, a hardcoded mentee profile
  currentMentee: MenteeProfile = {
    id: 'mentee1',
    userId: 'user3',
    name: 'Pedro Reyes',
    email: 'pedro.reyes@example.com',
    skills: ['Web Development', 'Angular'],
    goals: ['Learn Angular', 'Career Growth'],
    location: 'Manila',
    availability: ['Weekdays'],
    preferredMentorSkills: ['Angular', 'TypeScript'],
    preferredMentorGoals: ['Career Growth'],
    bio: 'Aspiring web developer looking for guidance in Angular.',
    role: 'mentee',
    photoUrl: '', // Added photoUrl
    interests: ['Web Development'], // Added interests
    preferredLanguage: 'English' // Added preferredLanguage
  };

  constructor(
    private profileService: ProfileService,
    private recommendationService: RecommendationService
  ) { }

  ngOnInit(): void {
    this.profileService.getMentors().subscribe(mentors => {
      this.allMentors = mentors;
      this.populateFilterOptions();
      this.applyFilters();
      this.getRecommendations();
    });
  }

  populateFilterOptions(): void {
    this.uniqueSkills = [...new Set(this.allMentors.flatMap(mentor => mentor.skills))];
    this.uniqueGoals = [...new Set(this.allMentors.flatMap(mentor => mentor.goals))];
    this.uniqueLocations = [...new Set(this.allMentors.map(mentor => mentor.location))];
    this.uniqueAvailabilities = [...new Set(this.allMentors.flatMap(mentor => mentor.availability))];
  }

  applyFilters(): void {
    this.filteredMentors = this.allMentors.filter(mentor => {
      const matchesSearchTerm = this.searchTerm === '' ||
        mentor.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        mentor.bio.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        mentor.skills.some((skill: string) => skill.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        mentor.goals.some((goal: string) => goal.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesSkill = this.selectedSkill === '' || mentor.skills.includes(this.selectedSkill);
      const matchesGoal = this.selectedGoal === '' || mentor.goals.includes(this.selectedGoal);
      const matchesLocation = this.selectedLocation === '' || mentor.location === this.selectedLocation;
      const matchesAvailability = this.selectedAvailability === '' || mentor.availability.includes(this.selectedAvailability);
      const matchesRating = this.minRating === null || (mentor.ratings !== undefined && mentor.ratings >= this.minRating);

      return matchesSearchTerm && matchesSkill && matchesGoal && matchesLocation && matchesAvailability && matchesRating;
    });
  }

  getRecommendations(): void {
    this.recommendationService.getRecommendedMentors(this.currentMentee, this.allMentors).subscribe(
      recommended => {
        this.recommendedMentors = recommended;
      }
    );
  }

  sendRequest(mentorId: string): void {
    // For demonstration, assuming current mentee is 'mentee1'
    const menteeId = this.currentMentee.id;
    this.profileService.sendMentorshipRequest(menteeId, mentorId).subscribe(
      response => {
        console.log('Mentorship request sent:', response);
        alert('Mentorship request sent successfully!');
        // Optionally, update the mentor's active mentees count or refresh the list
        this.profileService.getMentors().subscribe(mentors => {
          this.allMentors = mentors;
          this.applyFilters();
          this.getRecommendations();
        });
      },
      error => {
        console.error('Error sending mentorship request:', error);
        alert('Failed to send mentorship request.');
      }
    );
  }
}
