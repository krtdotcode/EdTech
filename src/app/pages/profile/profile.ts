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
  profile: MenteeProfile | null = null;
  editMode = false;
  editForm: FormGroup;
  loading = false;

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

    // Assuming user is mentee for now - in a real app, check user role
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

  populateEditForm(): void {
    if (!this.profile) return;

    const menteeProfile = this.profile as MenteeProfile;

    // Filter mentee-specific fields
    this.editForm.patchValue({
      name: menteeProfile.name,
      photoUrl: menteeProfile.photoUrl || '',
      bio: menteeProfile.bio,
      location: menteeProfile.location,
      skills: menteeProfile.skills.join(', '),
      goals: menteeProfile.goals.join(', '),
      availability: menteeProfile.availability.join(', '),
      preferredLanguage: menteeProfile.preferredLanguage || '',
      interests: menteeProfile.interests ? menteeProfile.interests.join(', ') : '',
      preferredMentorSkills: menteeProfile.preferredMentorSkills ? menteeProfile.preferredMentorSkills.join(', ') : '',
      preferredMentorGoals: menteeProfile.preferredMentorGoals ? menteeProfile.preferredMentorGoals.join(', ') : ''
    });
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.populateEditForm(); // Reset form if cancelling
    }
  }

  saveProfile(): void {
    if (this.editForm.valid && this.profile) {
      this.loading = true;
      const formValue = this.editForm.value;

      const updatedProfile: MenteeProfile = {
        ...this.profile,
        name: formValue.name,
        photoUrl: formValue.photoUrl || undefined,
        bio: formValue.bio,
        location: formValue.location,
        skills: formValue.skills.split(',').map((s: string) => s.trim()),
        interests: formValue.interests.split(',').map((i: string) => i.trim()),
        goals: formValue.goals.split(',').map((g: string) => g.trim()),
        availability: formValue.availability.split(',').map((a: string) => a.trim()),
        preferredLanguage: formValue.preferredLanguage || undefined,
        preferredMentorSkills: formValue.preferredMentorSkills.split(',').map((s: string) => s.trim()),
        preferredMentorGoals: formValue.preferredMentorGoals.split(',').map((g: string) => g.trim())
      };

      this.profileService.updateMenteeProfile(updatedProfile).subscribe({
        next: (savedProfile) => {
          this.profile = savedProfile;
          this.editMode = false;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.loading = false;
        }
      });
    }
  }
}
