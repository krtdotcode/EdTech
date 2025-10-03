import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { MenteeProfile, MentorProfile } from '../../shared/models/profile.model';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-profile-completion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile-completion.html',
  styleUrl: './profile-completion.scss'
})
export class ProfileCompletion implements OnInit {
  profileForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  userRole: 'mentee' | 'mentor' | 'both' = 'mentee'; // Default role

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      photoUrl: [''],
      bio: ['', Validators.required],
      location: ['', Validators.required],
      skills: ['', Validators.required],
      expertise: [''],
      interests: [''],
      goals: ['', Validators.required],
      availability: ['', Validators.required],
      preferredLanguage: [''],
      preferredMentorSkills: [''],
      preferredMentorGoals: ['']
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Fetch user role from AuthService or wherever it's stored
      // For now, let's assume the role is available after registration
      // In a real app, you'd fetch this from a database or custom claims
      // This is a placeholder, actual role should be fetched
      this.authService.register(currentUser.email!, '', this.userRole).subscribe(result => {
        this.userRole = result.role;
        this.updateFormValidators();
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  updateFormValidators(): void {
    const expertiseControl = this.profileForm.get('expertise');
    const interestsControl = this.profileForm.get('interests');
    const preferredMentorSkillsControl = this.profileForm.get('preferredMentorSkills');
    const preferredMentorGoalsControl = this.profileForm.get('preferredMentorGoals');

    if (this.userRole === 'mentor' || this.userRole === 'both') {
      expertiseControl?.setValidators(Validators.required);
      interestsControl?.clearValidators();
      preferredMentorSkillsControl?.clearValidators();
      preferredMentorGoalsControl?.clearValidators();
    } else if (this.userRole === 'mentee') {
      expertiseControl?.clearValidators();
      interestsControl?.setValidators(Validators.required);
      preferredMentorSkillsControl?.setValidators(Validators.required);
      preferredMentorGoalsControl?.setValidators(Validators.required);
    } else { // 'both'
      expertiseControl?.setValidators(Validators.required);
      interestsControl?.setValidators(Validators.required);
      preferredMentorSkillsControl?.setValidators(Validators.required);
      preferredMentorGoalsControl?.setValidators(Validators.required);
    }

    expertiseControl?.updateValueAndValidity();
    interestsControl?.updateValueAndValidity();
    preferredMentorSkillsControl?.updateValueAndValidity();
    preferredMentorGoalsControl?.updateValueAndValidity();
  }

  onProfileSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        const { name, photoUrl, bio, location, skills, expertise, interests, goals, availability, preferredLanguage, preferredMentorSkills, preferredMentorGoals } = this.profileForm.value;

          if (this.userRole === 'mentee' || this.userRole === 'both') {
            const menteeProfile: MenteeProfile = {
              id: currentUser.uid, 
              userId: currentUser.uid,
              name,
              email: currentUser.email!,
              photoUrl,
              bio,
              location,
              skills: skills.split(',').map((s: string) => s.trim()),
              interests: interests.split(',').map((i: string) => i.trim()),
              goals: goals.split(',').map((g: string) => g.trim()),
              availability: availability.split(',').map((a: string) => a.trim()),
              preferredLanguage,
              preferredMentorSkills: preferredMentorSkills.split(',').map((s: string) => s.trim()),
              preferredMentorGoals: preferredMentorGoals.split(',').map((g: string) => g.trim()),
              role: 'mentee' 
            };
            this.profileService.createMenteeProfile(menteeProfile).subscribe({
              next: () => {
                this.successMessage = 'Mentee profile created successfully!';
                if (this.userRole === 'mentee') {
                  this.router.navigate(['/mentee-dashboard']);
                }
              },
              error: (err) => {
                this.errorMessage = 'Error creating mentee profile.';
                console.error(err);
              }
            });
          }

          if (this.userRole === 'mentor' || this.userRole === 'both') {
            const mentorProfile: MentorProfile = {
              id: currentUser.uid, // Use currentUser.uid as id
              userId: currentUser.uid,
              name,
              email: currentUser.email!,
              photoUrl,
              bio,
              location,
              skills: skills.split(',').map((s: string) => s.trim()),
              expertise: expertise.split(',').map((e: string) => e.trim()),
              goals: goals.split(',').map((g: string) => g.trim()),
              availability: availability.split(',').map((a: string) => a.trim()),
              preferredLanguage,
              ratings: 0, // Default rating
              activeMentees: 0, // Default
              maxMentees: 3, // Default
              role: 'mentor' // Set role for mentor profile
            };
            this.profileService.createMentorProfile(mentorProfile).subscribe({
              next: () => {
                this.successMessage = 'Mentor profile created successfully!';
                if (this.userRole === 'mentor') {
                  this.router.navigate(['/mentor-dashboard']);
                } else if (this.userRole === 'both') {
                  this.router.navigate(['/mentee-dashboard']); // Redirect to mentee dashboard if both
                }
              },
              error: (err) => {
                this.errorMessage = 'Error creating mentor profile.';
                console.error(err);
              }
            });
          }
          this.loading = false;
        } else {
          this.errorMessage = 'User not logged in.';
          this.loading = false;
        }
      } else {
        this.errorMessage = 'Please fill in all required fields.';
      }
    }
  }

