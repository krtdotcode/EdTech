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
      const formValue = this.editForm.value;

      // Common profile data
      const commonData = {
        name: formValue.name,
        photoUrl: formValue.photoUrl || undefined,
        bio: formValue.bio,
        location: formValue.location,
        skills: formValue.skills.split(',').map((s: string) => s.trim()),
        interests: formValue.interests.split(',').map((i: string) => i.trim()).filter((i: string) => i.length > 0),
        goals: formValue.goals.split(',').map((g: string) => g.trim()),
        availability: formValue.availability.split(',').map((a: string) => a.trim()),
        preferredLanguage: formValue.preferredLanguage || undefined,
        role: this.profile.role,
        userId: this.profile.userId,
        id: this.profile.id,
        email: this.profile.email
      };

      if (this.userRole === 'mentor') {
        // Update mentor profile
        const updatedProfile: MentorProfile = {
          ...commonData,
          expertise: formValue.expertise.split(',').map((e: string) => e.trim()).filter((e: string) => e),
          ratings: (this.profile as MentorProfile).ratings || 0,
          activeMentees: (this.profile as MentorProfile).activeMentees || 0,
          maxMentees: (this.profile as MentorProfile).maxMentees || 3
        };

        this.profileService.updateMentorProfile(updatedProfile).subscribe({
          next: (savedProfile) => {
            this.profile = savedProfile;
            this.editMode = false;
            this.loading = false;
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
          preferredMentorSkills: formValue.preferredMentorSkills.split(',').map((s: string) => s.trim()).filter((s: string) => s),
          preferredMentorGoals: formValue.preferredMentorGoals.split(',').map((g: string) => g.trim()).filter((g: string) => g)
        };

        this.profileService.updateMenteeProfile(updatedProfile).subscribe({
          next: (savedProfile) => {
            this.profile = savedProfile;
            this.editMode = false;
            this.loading = false;
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
}
