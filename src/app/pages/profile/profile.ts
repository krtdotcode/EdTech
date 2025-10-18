import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { ProfileService } from '../../shared/services/profile.service';
import { MenteeProfile, MentorProfile } from '../../shared/models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  profile: MenteeProfile | MentorProfile | null = null;
  editMode = false;
  editForm: FormGroup;
  loading = false;
  userRole: 'mentee' | 'mentor' | 'both' | null = null;

  // Predefined avatars (using free avatar services)
  predefinedAvatars = [
    'https://avatar.iran.liara.run/public/1',   // Random avatar 1
    'https://avatar.iran.liara.run/public/2',   // Random avatar 2
    'https://avatar.iran.liara.run/public/3',   // Random avatar 3
    'https://avatar.iran.liara.run/public/4',   // Random avatar 4
    'https://avatar.iran.liara.run/public/5',   // Random avatar 5
    'https://avatar.iran.liara.run/public/6',   // Random avatar 6
    'https://avatar.iran.liara.run/public/7',   // Random avatar 7
    'https://avatar.iran.liara.run/public/8',   // Random avatar 8
    'https://avatar.iran.liara.run/public/9',   // Random avatar 9
    'https://avatar.iran.liara.run/public/10',  // Random avatar 10
    'https://avatar.iran.liara.run/public/11',  // Random avatar 11
    'https://avatar.iran.liara.run/public/12',  // Random avatar 12
    'https://avatar.iran.liara.run/public/13',  // Random avatar 13
    'https://avatar.iran.liara.run/public/14',  // Random avatar 14
    'https://avatar.iran.liara.run/public/15',  // Random avatar 15
    'https://avatar.iran.liara.run/public/16',  // Random avatar 16
  ];

  selectedAvatar: string = ''; // Track selected avatar

  constructor(
    private authService: AuthService,
    private router: Router,
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      photoUrl: [''],
      bio: ['', Validators.required],
      location: ['', Validators.required],
      skills: ['', Validators.required],
      interests: [''],
      goals: ['', Validators.required],
      availability: ['', Validators.required],
      preferredLanguage: [''],
      preferredMentorSkills: [''],
      preferredMentorGoals: [''],
      expertise: [''] // For mentors, but we'll hide for mentees
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadProfile();
  }

  loadProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // First get user role
    this.authService.getUserRole(currentUser.uid).subscribe({
      next: (role) => {
        if (!role) {
          this.router.navigate(['/profile-completion']);
          return;
        }

        this.userRole = role as 'mentee' | 'mentor' | 'both';

        // Load profile based on role
        if (role === 'mentor') {
          // Load mentor profile
          this.profileService.getMentorById(currentUser.uid).subscribe((profile) => {
            if (profile) {
              this.profile = profile;
              this.populateEditForm();
            } else {
              // If no profile, redirect to completion
              this.router.navigate(['/profile-completion']);
            }
          });
        } else if (role === 'both') {
          // For both, load mentee profile (primary profile)
          this.profileService.getMenteeById(currentUser.uid).subscribe((profile) => {
            if (profile) {
              this.profile = profile;
              this.populateEditForm();
            } else {
              // If no profile, redirect to completion
              this.router.navigate(['/profile-completion']);
            }
          });
        } else {
          // Load mentee profile
          this.profileService.getMenteeById(currentUser.uid).subscribe((profile) => {
            if (profile) {
              this.profile = profile;
              this.populateEditForm();
            } else {
              // If no profile, redirect to completion
              this.router.navigate(['/profile-completion']);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error getting user role:', error);
        this.router.navigate(['/profile-completion']);
      }
    });
  }

  populateEditForm(): void {
    if (!this.profile) return;

    // Safely cast to access optional properties
    const profile = this.profile as any;

    const formData = {
      name: this.profile.name,
      photoUrl: this.profile.photoUrl || '',
      bio: this.profile.bio,
      location: this.profile.location,
      skills: this.profile.skills.join(', '),
      goals: this.profile.goals.join(', '),
      availability: this.profile.availability.join(', '),
      preferredLanguage: this.profile.preferredLanguage || '',
      interests: profile.interests ? profile.interests.join(', ') : '',
      preferredMentorSkills: profile.preferredMentorSkills ? profile.preferredMentorSkills.join(', ') : '',
      preferredMentorGoals: profile.preferredMentorGoals ? profile.preferredMentorGoals.join(', ') : '',
      expertise: profile.expertise ? profile.expertise.join(', ') : ''
    };

    this.editForm.patchValue(formData);
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.populateEditForm(); // Reset form if cancelling
    }
  }

  // Helper methods for template display
  getSkills(): string[] {
    return (this.profile as any)?.skills || [];
  }

  getExpertise(): string[] {
    return (this.profile as any)?.expertise || [];
  }

  getInterests(): string[] {
    return (this.profile as any)?.interests || [];
  }

  getGoals(): string[] {
    return (this.profile as any)?.goals || [];
  }

  getAvailability(): string[] {
    return (this.profile as any)?.availability || [];
  }

  getPreferredMentorSkills(): string[] {
    return (this.profile as any)?.preferredMentorSkills || [];
  }

  getPreferredMentorGoals(): string[] {
    return (this.profile as any)?.preferredMentorGoals || [];
  }

  saveProfile(): void {
    if (this.editForm.valid && this.profile) {
      this.loading = true;

      // Common profile data - arrays are already arrays from the form
      const commonData = {
        name: this.editForm.value.name,
        photoUrl: this.selectedAvatar || this.editForm.value.photoUrl || undefined,
        bio: this.editForm.value.bio,
        location: this.editForm.value.location,
        skills: this.editFormSkillsArray(),
        interests: this.editFormInterestsArray(),
        goals: this.editFormGoalsArray(),
        availability: this.editFormAvailabilityArray(),
        preferredLanguage: this.editForm.value.preferredLanguage || undefined,
        role: this.profile.role,
        userId: this.profile.userId,
        id: this.profile.id,
        email: this.profile.email
      };

      if (this.userRole === 'mentor') {
        // Update mentor profile
        const updatedProfile: MentorProfile = {
          ...commonData,
          expertise: this.editFormExpertiseArray(),
          ratings: (this.profile as MentorProfile).ratings || 0,
          activeMentees: (this.profile as MentorProfile).activeMentees || 0,
          maxMentees: (this.profile as MentorProfile).maxMentees || 3
        };

        this.profileService.updateMentorProfile(updatedProfile).subscribe({
          next: (savedProfile) => {
            this.profile = savedProfile;
            this.editMode = false;
            this.loading = false;
            this.populateEditForm(); // Refresh form data
          },
          error: (err) => {
            console.error('Error updating mentor profile:', err);
            this.loading = false;
          }
        });
      } else {
        // Update mentee profile (for mentee or both role)
        const updatedProfile: MenteeProfile = {
          ...commonData,
          preferredMentorSkills: this.editFormInterestsArray(), // Reuse interests
          preferredMentorGoals: this.editFormGoalsArray()
        };

        this.profileService.updateMenteeProfile(updatedProfile).subscribe({
          next: (savedProfile) => {
            this.profile = savedProfile;
            this.editMode = false;
            this.loading = false;
            this.populateEditForm(); // Refresh form data
          },
          error: (err) => {
            console.error('Error updating mentee profile:', err);
            this.loading = false;
          }
        });
      }
    }
  }

  goBackToDashboard(): void {
    // Navigate based on user role
    if (this.userRole === 'mentor') {
      this.router.navigate(['/mentor-dashboard']);
    } else {
      this.router.navigate(['/mentee-dashboard']);
    }
  }

  // Avatar methods
  selectAvatar(avatarUrl: string): void {
    this.selectedAvatar = avatarUrl;
    this.editForm.patchValue({ photoUrl: avatarUrl });
  }

  getDefaultAvatar(): string {
    return 'https://api.dicebear.com/7.x/personas/svg?seed=' + (this.profile?.name || 'default');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultAvatar();
  }

  getRoleBadgeClasses(role: string): string {
    if (role === 'mentee') {
      return 'bg-blue-100 text-blue-800';
    } else if (role === 'mentor') {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-purple-100 text-purple-800';
    }
  }

  // Edit form array methods
  editFormSkillsArray(): string[] {
    return this.editForm.get('skills')?.value?.split(',').map((s: string) => s.trim()).filter((s: string) => s) || [];
  }

  editFormExpertiseArray(): string[] {
    return this.editForm.get('expertise')?.value?.split(',').map((e: string) => e.trim()).filter((e: string) => e) || [];
  }

  editFormInterestsArray(): string[] {
    return this.editForm.get('interests')?.value?.split(',').map((i: string) => i.trim()).filter((i: string) => i) || [];
  }

  editFormGoalsArray(): string[] {
    return this.editForm.get('goals')?.value?.split(',').map((g: string) => g.trim()).filter((g: string) => g) || [];
  }

  editFormAvailabilityArray(): string[] {
    return this.editForm.get('availability')?.value?.split(',').map((a: string) => a.trim()).filter((a: string) => a) || [];
  }

  // Add/remove methods for edit form
  addSkill(skill: string): void {
    if (skill && skill.trim()) {
      const currentSkills = this.editFormSkillsArray();
      currentSkills.push(skill.trim());
      this.editForm.patchValue({ skills: currentSkills.join(', ') });
    }
  }

  removeSkill(index: number): void {
    const currentSkills = this.editFormSkillsArray();
    currentSkills.splice(index, 1);
    this.editForm.patchValue({ skills: currentSkills.join(', ') });
  }

  addExpertise(expertise: string): void {
    if (expertise && expertise.trim()) {
      const currentExpertise = this.editFormExpertiseArray();
      currentExpertise.push(expertise.trim());
      this.editForm.patchValue({ expertise: currentExpertise.join(', ') });
    }
  }

  removeExpertise(index: number): void {
    const currentExpertise = this.editFormExpertiseArray();
    currentExpertise.splice(index, 1);
    this.editForm.patchValue({ expertise: currentExpertise.join(', ') });
  }

  addInterest(interest: string): void {
    if (interest && interest.trim()) {
      const currentInterests = this.editFormInterestsArray();
      currentInterests.push(interest.trim());
      this.editForm.patchValue({ interests: currentInterests.join(', ') });
    }
  }

  removeInterest(index: number): void {
    const currentInterests = this.editFormInterestsArray();
    currentInterests.splice(index, 1);
    this.editForm.patchValue({ interests: currentInterests.join(', ') });
  }

  addGoal(goal: string): void {
    if (goal && goal.trim()) {
      const currentGoals = this.editFormGoalsArray();
      currentGoals.push(goal.trim());
      this.editForm.patchValue({ goals: currentGoals.join(', ') });
    }
  }

  removeGoal(index: number): void {
    const currentGoals = this.editFormGoalsArray();
    currentGoals.splice(index, 1);
    this.editForm.patchValue({ goals: currentGoals.join(', ') });
  }

  addAvailability(availability: string): void {
    if (availability && availability.trim()) {
      const currentAvailability = this.editFormAvailabilityArray();
      currentAvailability.push(availability.trim());
      this.editForm.patchValue({ availability: currentAvailability.join(', ') });
    }
  }

  removeAvailability(index: number): void {
    const currentAvailability = this.editFormAvailabilityArray();
    currentAvailability.splice(index, 1);
    this.editForm.patchValue({ availability: currentAvailability.join(', ') });
  }
}
