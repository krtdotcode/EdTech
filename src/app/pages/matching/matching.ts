import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../shared/services/profile.service';
import { MentorProfile, MenteeProfile } from '../../shared/models/profile.model';
import { RecommendationService } from '../../shared/services/recommendation.service';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Header } from '../../shared/components/header/header';

declare var window: any;

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
  selectedIndustry: string = '';
  minRating: number | null = null;

  allMentors: MentorProfile[] = [];
  filteredMentors: MentorProfile[] = [];
  recommendedMentors: MentorProfile[] = [];

  uniqueSkills: string[] = [];
  uniqueGoals: string[] = [];
  uniqueLocations: string[] = [];
  uniqueAvailabilities: string[] = [];
  uniqueIndustries: string[] = [];

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
    private recommendationService: RecommendationService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Load current user's mentee profile
    this.profileService.getMenteeById(currentUser.uid).subscribe({
      next: (mentee) => {
        if (mentee) {
          // Use the actual mentee profile from database
          this.currentMentee = mentee;

          // Now load mentors
          this.profileService.getMentors().subscribe(mentors => {
            console.log('Loaded mentors:', mentors);
            console.log('Mentor userIds:', mentors.map(m => m.userId));
            this.allMentors = mentors;
            this.populateFilterOptions();
            this.applyFilters();
            this.getRecommendations();
          });
        } else {
          // No mentee profile found, redirect to profile completion
          this.router.navigate(['/profile-completion']);
        }
      },
      error: (error) => {
        console.error('Error loading mentee profile:', error);
        this.router.navigate(['/profile-completion']);
      }
    });
  }

  populateFilterOptions(): void {
    this.uniqueSkills = [...new Set(this.allMentors.flatMap(mentor => mentor.skills))];
    this.uniqueGoals = [...new Set(this.allMentors.flatMap(mentor => mentor.goals))];
    this.uniqueLocations = [...new Set(this.allMentors.map(mentor => mentor.location))];
    this.uniqueAvailabilities = [...new Set(this.allMentors.flatMap(mentor => mentor.availability))];
    // For now, derive industries from existing skills (could be made more sophisticated later)
    this.uniqueIndustries = [...new Set(this.allMentors.flatMap(mentor => {
      // Simple mapping of skills to potential industries
      return mentor.skills.map(skill => this.skillToIndustry(skill));
    }).filter(industry => industry !== ''))];
  }

  skillToIndustry(skill: string): string {
    const skillToIndustryMap: {[key: string]: string} = {
      'Web Development': 'Technology',
      'Angular': 'Technology',
      'TypeScript': 'Technology',
      'Project Management': 'Business',
      'Leadership': 'Business',
      'Machine Learning': 'Technology',
      'UI/UX': 'Design',
      'Frontend': 'Technology',
      'Backend': 'Technology',
      'DevOps': 'Technology',
      'Data Science': 'Technology',
      'Marketing': 'Business',
      'Sales': 'Business',
      'Finance': 'Business',
      'HR': 'Business',
      'Consulting': 'Business',
      'Teaching': 'Education',
      'Research': 'Technology',
      'Product Management': 'Business'
    };
    return skillToIndustryMap[skill] || '';
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

      // Check if mentor's industry matches selected industry
      const matchesIndustry = this.selectedIndustry === '' ||
        mentor.skills.some(skill => this.skillToIndustry(skill) === this.selectedIndustry);

      return matchesSearchTerm && matchesSkill && matchesGoal && matchesLocation &&
             matchesAvailability && matchesRating && matchesIndustry;
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
    // Find mentor by their document ID
    const mentor = this.allMentors.find(m => m.id === mentorId);
    if (!mentor) {
      alert('Mentor not found.');
      return;
    }

    // Check mentor capacity
    const maxMentees = mentor.maxMentees || 3;
    const activeMentees = mentor.activeMentees || 0;

    if (activeMentees >= maxMentees) {
      alert(`This mentor has reached their maximum capacity of ${maxMentees} mentees. Please choose another mentor.`);
      return;
    }

    const menteeId = this.currentMentee.id;
    const mentorUserId = mentor.userId || mentor.id.replace('_mentor', '');

    console.log('Sending mentorship request:');
    console.log('- From mentee:', menteeId, '(userId:', this.currentMentee.userId, ')');
    console.log('- To mentor:', mentorId, '(userId:', mentorUserId, ')');

    this.profileService.sendMentorshipRequestWithNotification(menteeId, mentorId).subscribe(
      response => {
        console.log('Mentorship request sent:', response);

        // Create notification for mentor about the new request
        this.notificationService.createMentorshipRequestNotification(
          mentorUserId,
          this.currentMentee.name,
          response.id // Request ID from response
        ).then(() => {
          console.log('Notification created for mentor');
        }).catch(error => console.error('Failed to create notification:', error));

        // Show success message
        alert('Mentorship request sent successfully!');

        // Temporarily increment mentor's active count for UI update
        mentor.activeMentees = (mentor.activeMentees || 0) + 1;

        // Refresh data after a short delay to allow backend processing
        setTimeout(() => {
          this.applyFilters();
          this.getRecommendations();
        }, 500);
      },
      error => {
        console.error('Error sending mentorship request:', error);
        alert('Failed to send mentorship request. Please try again.');
      }
    );
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSkill = '';
    this.selectedGoal = '';
    this.selectedLocation = '';
    this.selectedAvailability = '';
    this.selectedIndustry = '';
    this.minRating = null;
    this.applyFilters();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchTerm) count++;
    if (this.selectedSkill) count++;
    if (this.selectedGoal) count++;
    if (this.selectedIndustry) count++;
    if (this.selectedLocation) count++;
    if (this.selectedAvailability) count++;
    if (this.minRating) count++;
    return count;
  }

  goBackToDashboard(): void {
    this.router.navigate(['/mentee-dashboard']);
  }
}
