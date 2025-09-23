import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, MentorProfile, MenteeProfile } from '../../shared/services/profile.service';
import { RecommendationService } from '../../shared/services/recommendation.service';

@Component({
  selector: 'app-matching',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matching.html',
  styleUrl: './matching.scss'
})
export class Matching implements OnInit {
  searchTerm: string = '';
  selectedSkill: string = '';
  selectedGoal: string = '';
  selectedIndustry: string = '';
  selectedLocation: string = '';
  selectedAvailability: string = '';
  minRating: number | null = null;

  allMentors: MentorProfile[] = [];
  filteredMentors: MentorProfile[] = [];
  recommendedMentors: MentorProfile[] = [];

  uniqueSkills: string[] = [];
  uniqueGoals: string[] = [];
  uniqueIndustries: string[] = [];
  uniqueLocations: string[] = [];
  uniqueAvailabilities: string[] = [];

  // For demonstration, a hardcoded mentee profile
  currentMentee: MenteeProfile = {
    id: 'mentee1',
    name: 'Pedro Reyes',
    skills: ['Web Development', 'Angular'],
    goals: ['Learn Angular', 'Career Growth'],
    industry: 'IT',
    location: 'Manila',
    bio: 'Aspiring web developer looking for guidance in Angular.'
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
    this.uniqueIndustries = [...new Set(this.allMentors.map(mentor => mentor.industry))];
    this.uniqueLocations = [...new Set(this.allMentors.map(mentor => mentor.location))];
    this.uniqueAvailabilities = [...new Set(this.allMentors.flatMap(mentor => mentor.availability))];
  }

  applyFilters(): void {
    this.filteredMentors = this.allMentors.filter(mentor => {
      const matchesSearchTerm = this.searchTerm === '' ||
        mentor.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        mentor.bio.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        mentor.skills.some(skill => skill.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        mentor.goals.some(goal => goal.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesSkill = this.selectedSkill === '' || mentor.skills.includes(this.selectedSkill);
      const matchesGoal = this.selectedGoal === '' || mentor.goals.includes(this.selectedGoal);
      const matchesIndustry = this.selectedIndustry === '' || mentor.industry === this.selectedIndustry;
      const matchesLocation = this.selectedLocation === '' || mentor.location === this.selectedLocation;
      const matchesAvailability = this.selectedAvailability === '' || mentor.availability.includes(this.selectedAvailability);
      const matchesRating = this.minRating === null || mentor.ratings >= this.minRating;

      return matchesSearchTerm && matchesSkill && matchesGoal && matchesIndustry && matchesLocation && matchesAvailability && matchesRating;
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
