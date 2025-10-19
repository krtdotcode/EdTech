import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgxParticlesModule } from "@tsparticles/angular";
import { loadSlim } from "@tsparticles/slim";
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { MenteeProfile, MentorProfile } from '../../shared/models/profile.model';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-completion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxParticlesModule],
  templateUrl: './profile-completion.html'
})
export class ProfileCompletion implements OnInit, OnDestroy {
  profileForm: FormGroup;
  roleForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  userRole: 'mentee' | 'mentor' | 'both' | null = null;
  showRoleSelection = true;

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
  private authSub: Subscription = new Subscription();

  particlesInit = async (engine: any) => {
    await loadSlim(engine);
  };

  particlesOptions: any = {
    background: {
      color: {
        value: "transparent"
      }
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: ["#ffffff", "#a855f7", "#8b5cf6", "#7c3aed"]
      },
      links: {
        color: "#ffffff",
        distance: 120,
        enable: true,
        opacity: 0.2,
        width: 1
      },
      move: {
        enable: true,
        outModes: {
          default: "bounce"
        },
        speed: 1
      },
      number: {
        density: {
          enable: true,
          area: 500
        },
        value: 120
      },
      opacity: {
        value: 0.4
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 2, max: 6 }
      }
    },
    detectRetina: true
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    this.roleForm = this.fb.group({
      role: ['', Validators.required]
    });

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      photoUrl: [''], // Optional now due to size limit
      bio: ['', Validators.required],
      location: ['', Validators.required],
      skills: this.fb.array([], Validators.required),
      expertise: this.fb.array([]),
      interests: this.fb.array([]),
      goals: this.fb.array([], Validators.required),
      availability: this.fb.array([], Validators.required),
      preferredLanguage: [''],
      preferredMentorSkills: this.fb.array([]),
      preferredMentorGoals: this.fb.array([])
    });
  }

  // Helper methods for form arrays
  getSkillsArray(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  getExpertiseArray(): FormArray {
    return this.profileForm.get('expertise') as FormArray;
  }

  getInterestsArray(): FormArray {
    return this.profileForm.get('interests') as FormArray;
  }

  getGoalsArray(): FormArray {
    return this.profileForm.get('goals') as FormArray;
  }

  getAvailabilityArray(): FormArray {
    return this.profileForm.get('availability') as FormArray;
  }

  getPreferredMentorSkillsArray(): FormArray {
    return this.profileForm.get('preferredMentorSkills') as FormArray;
  }

  getPreferredMentorGoalsArray(): FormArray {
    return this.profileForm.get('preferredMentorGoals') as FormArray;
  }

  addItem(array: FormArray, value: string): void {
    if (value && value.trim()) {
      array.push(this.fb.control(value.trim()));
    }
  }

  removeItem(array: FormArray, index: number): void {
    array.removeAt(index);
  }

  addSkill(skill: string): void {
    this.addItem(this.getSkillsArray(), skill);
  }

  removeSkill(index: number): void {
    this.removeItem(this.getSkillsArray(), index);
  }

  addExpertise(expertise: string): void {
    this.addItem(this.getExpertiseArray(), expertise);
  }

  removeExpertise(index: number): void {
    this.removeItem(this.getExpertiseArray(), index);
  }

  addInterest(interest: string): void {
    this.addItem(this.getInterestsArray(), interest);
  }

  removeInterest(index: number): void {
    this.removeItem(this.getInterestsArray(), index);
  }

  addGoal(goal: string): void {
    this.addItem(this.getGoalsArray(), goal);
  }

  removeGoal(index: number): void {
    this.removeItem(this.getGoalsArray(), index);
  }

  addAvailability(availability: string): void {
    this.addItem(this.getAvailabilityArray(), availability);
  }

  removeAvailability(index: number): void {
    this.removeItem(this.getAvailabilityArray(), index);
  }

  addPreferredMentorSkill(skill: string): void {
    this.addItem(this.getPreferredMentorSkillsArray(), skill);
  }

  removePreferredMentorSkill(index: number): void {
    this.removeItem(this.getPreferredMentorSkillsArray(), index);
  }

  addPreferredMentorGoal(goal: string): void {
    this.addItem(this.getPreferredMentorGoalsArray(), goal);
  }

  removePreferredMentorGoal(index: number): void {
    this.removeItem(this.getPreferredMentorGoalsArray(), index);
  }

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {


      // First check if user has already completed profile (should redirect if so)
      this.profileService.hasUserCompletedProfile(currentUser.uid).subscribe({
        next: (hasCompleted) => {
          if (hasCompleted) {

            // User already completed profile, get their role and redirect
            this.authService.getUserRole(currentUser.uid).subscribe({
              next: (role) => {
                if (role === 'mentor') {
                  this.router.navigate(['/mentor-dashboard']);
                } else {
                  this.router.navigate(['/mentee-dashboard']);
                }
              },
              error: (error) => {
                console.error('Error getting role after completion check:', error);
                this.router.navigate(['/mentee-dashboard']); // fallback
              }
            });
            return;
          }

          // User hasn't completed profile, proceed with role checking
        },
        error: (error) => {
          console.error('Error checking profile completion status:', error);
          // Continue with normal flow on error
        }
      });

      this.authService.getUserRole(currentUser.uid).subscribe({
        next: (role) => {

          if (role) {
            this.userRole = role as 'mentee' | 'mentor' | 'both';
            // Check if user already has a profile for their role
            this.checkExistingProfileAndRedirect(currentUser.uid, role as 'mentee' | 'mentor' | 'both');
          } else {
            console.log('Profile completion - No role found, showing role selection');
            this.showRoleSelection = true;
            this.userRole = null;
            this.loading = false;
          }
        },
        error: (err: any) => {
          console.error('Profile completion - Error fetching user role:', err);
          this.errorMessage = 'Error fetching user role.';
          this.showRoleSelection = true;
          this.userRole = null;
          this.loading = false;
        }
      });
    } else {
      console.log('Profile completion - No current user, redirecting to login');
      this.router.navigate(['/login']);
    }

    this.authSub.add(this.authService.user$.subscribe(user => {
      if (!user) {
        console.log('Profile completion - User logged out, redirecting to login');
        this.router.navigate(['/login']);
      }
    }));
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  updateFormValidators(): void {
    console.log('Profile completion - Setting up form validators for role:', this.userRole);

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

    // Form is ready, stop loading
    this.loading = false;
    console.log('Profile completion - Form setup complete, loading = false');
  }

  onRoleSelect(): void {
    if (this.roleForm.valid) {
      const selectedRole = this.roleForm.value.role;
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.authService.saveUserRole(currentUser.uid, selectedRole).subscribe({
          next: () => {
            this.userRole = selectedRole;
            this.showRoleSelection = false;
            // After role selection, check if user already has a profile
            this.checkExistingProfileAndRedirect(currentUser.uid, selectedRole);
          },
          error: (err: any) => {
            this.errorMessage = 'Failed to save role. Please try again.';
            console.error('Save role error:', err);
          }
        });
      }
    }
  }

  // CHECK IF USER ALREADY HAS A PROFILE AND REDIRECT ACCORDINGLY
  checkExistingProfileAndRedirect(userId: string, role: 'mentee' | 'mentor' | 'both'): void {
    if (role === 'mentee') {
      this.profileService.getMenteeById(userId).subscribe({
        next: (profile) => {
          if (profile) {
            // Already has mentee profile, go to mentee dashboard
            this.router.navigate(['/mentee-dashboard']);
          } else {
            // No profile, show form
            this.updateFormValidators();
          }
        },
        error: (error: any) => {
          console.error('Error checking existing mentee profile:', error);
          // Show form even if error checking
          this.updateFormValidators();
        }
      });
    } else if (role === 'mentor') {
      this.profileService.getMentorById(userId).subscribe({
        next: (profile) => {
          if (profile) {
            // Already has mentor profile, go to mentor dashboard
            this.router.navigate(['/mentor-dashboard']);
          } else {
            // No profile, show form
            this.updateFormValidators();
          }
        },
        error: (error: any) => {
          console.error('Error checking existing mentor profile:', error);
          // Show form even if error checking
          this.updateFormValidators();
        }
      });
    } else if (role === 'both') {
      // For 'both' role, check if they have either profile
      this.profileService.getMenteeById(userId).subscribe({
        next: (menteeProfile) => {
          if (menteeProfile) {
            // Has mentee profile, go to mentee dashboard (they can switch roles later)
            this.router.navigate(['/mentee-dashboard']);
          } else {
            // Check if they have mentor profile
            this.profileService.getMentorById(userId).subscribe({
              next: (mentorProfile) => {
                if (mentorProfile) {
                  // Has mentor profile only, still show form to complete mentee profile
                  this.updateFormValidators();
                } else {
                  // No profiles yet, show form
                  this.updateFormValidators();
                }
              },
              error: () => {
                // Show form even if error
                this.updateFormValidators();
              }
            });
          }
        },
        error: () => {
          // Show form even if error
          this.updateFormValidators();
        }
      });
    }
  }

  selectAvatar(avatarUrl: string): void {
    this.selectedAvatar = avatarUrl;
    this.profileForm.patchValue({ photoUrl: avatarUrl });
  }

  onProfileSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        // Get form values properly - FormArrays return arrays directly
        const formValue = this.profileForm.value;

        const commonProfile = {
          id: currentUser.uid,
          userId: currentUser.uid,
          name: formValue.name,
          email: currentUser.email!,
          photoUrl: formValue.photoUrl, // Now using selected avatar URL
          bio: formValue.bio,
          location: formValue.location,
          skills: formValue.skills, // This is already an array from FormArray
          goals: formValue.goals, // This is already an array from FormArray
          availability: formValue.availability, // This is already an array from FormArray
          preferredLanguage: formValue.preferredLanguage || '',
        };

        console.log('Creating profile with role:', this.userRole);
        console.log('Profile data:', commonProfile);

        if (this.userRole === 'both') {
          // For 'both' role, create both mentee and mentor profiles
          let menteeCreated = false;
          let mentorCreated = false;

          const menteeProfile: MenteeProfile = {
            ...commonProfile,
            interests: formValue.interests,
            preferredMentorSkills: formValue.preferredMentorSkills,
            preferredMentorGoals: formValue.preferredMentorGoals,
            role: 'mentee'
          };

          const mentorProfile: MentorProfile = {
            ...commonProfile,
            expertise: formValue.expertise,
            ratings: 0,
            activeMentees: 0,
            maxMentees: 3,
            role: 'mentor'
          };

          console.log('Creating mentee profile:', menteeProfile);
          console.log('Creating mentor profile:', mentorProfile);

          // Check required fields before creating profile
          if (!menteeProfile.name || !menteeProfile.bio || !menteeProfile.location ||
              !menteeProfile.skills || menteeProfile.skills.length === 0 ||
              !menteeProfile.goals || menteeProfile.goals.length === 0 ||
              !menteeProfile.availability || menteeProfile.availability.length === 0) {
            console.error('Missing required fields for mentee profile:', menteeProfile);
            this.errorMessage = 'Missing required fields. Please fill in all required information.';
            this.loading = false;
            return;
          }

          this.profileService.createMenteeProfile(menteeProfile).subscribe({
            next: () => {
              console.log('Mentee profile created successfully');
              menteeCreated = true;
              if (mentorCreated) {
                // Mark profile as completed
                this.profileService.markProfileCompleted(currentUser.uid, 'both').subscribe({
                  next: () => {
                    this.successMessage = 'Both mentee and mentor profiles created successfully!';
                    this.router.navigate(['/mentee-dashboard']);
                  },
                  error: (err: any) => {
                    console.error('Error marking profile completed:', err);
                    this.successMessage = 'Both profiles created successfully!';
                    this.router.navigate(['/mentee-dashboard']);
                  }
                });
              }
            },
            error: (err: any) => {
              this.errorMessage = 'Error creating mentee profile.';
              console.error('Detailed mentee profile creation error:', err);
              console.error('Profile data that failed:', menteeProfile);
              this.loading = false;
            }
          });

          this.profileService.createMentorProfile(mentorProfile).subscribe({
            next: () => {
              mentorCreated = true;
              if (menteeCreated) {
                // Mark profile as completed
                this.profileService.markProfileCompleted(currentUser.uid, 'both').subscribe({
                  next: () => {
                    this.successMessage = 'Both mentee and mentor profiles created successfully!';
                    this.router.navigate(['/mentee-dashboard']);
                  },
                  error: (err: any) => {
                    console.error('Error marking profile completed:', err);
                    this.successMessage = 'Both profiles created successfully!';
                    this.router.navigate(['/mentee-dashboard']);
                  }
                });
              }
            },
            error: (err: any) => {
              this.errorMessage = 'Error creating mentor profile.';
              console.error('Detailed mentor profile creation error:', err);
              this.loading = false;
            }
          });

        } else if (this.userRole === 'mentee') {
          const menteeProfile: MenteeProfile = {
            ...commonProfile,
            interests: formValue.interests,
            preferredMentorSkills: formValue.preferredMentorSkills,
            preferredMentorGoals: formValue.preferredMentorGoals,
            role: 'mentee'
          };

          console.log('Creating mentee profile:', menteeProfile);

          // Check required fields
          if (!menteeProfile.name || !menteeProfile.bio || !menteeProfile.location ||
              !menteeProfile.skills || menteeProfile.skills.length === 0 ||
              !menteeProfile.goals || menteeProfile.goals.length === 0 ||
              !menteeProfile.availability || menteeProfile.availability.length === 0) {
            console.error('Missing required fields for mentee profile:', menteeProfile);
            this.errorMessage = 'Missing required fields. Please fill in all required information.';
            this.loading = false;
            return;
          }

          this.profileService.createMenteeProfile(menteeProfile).subscribe({
            next: () => {
              console.log('Mentee profile created successfully');
              // Mark profile as completed
              this.profileService.markProfileCompleted(currentUser.uid, 'mentee').subscribe({
                next: () => {
                  this.successMessage = 'Mentee profile created successfully!';
                  this.loading = false;
                  this.router.navigate(['/mentee-dashboard']);
                },
                error: (err: any) => {
                  console.error('Error marking profile completed:', err);
                  this.successMessage = 'Mentee profile created successfully!';
                  this.loading = false;
                  this.router.navigate(['/mentee-dashboard']);
                }
              });
            },
            error: (err: any) => {
              this.errorMessage = 'Error creating mentee profile.';
              console.error('Detailed mentee profile creation error:', err);
              console.error('Profile data that failed:', menteeProfile);
              this.loading = false;
            }
          });

        } else if (this.userRole === 'mentor') {
          const mentorProfile: MentorProfile = {
            ...commonProfile,
            expertise: formValue.expertise,
            ratings: 0,
            activeMentees: 0,
            maxMentees: 3,
            role: 'mentor'
          };

          console.log('Creating mentor profile:', mentorProfile);

          // Check required fields
          if (!mentorProfile.name || !mentorProfile.bio || !mentorProfile.location ||
              !mentorProfile.skills || mentorProfile.skills.length === 0 ||
              !mentorProfile.goals || mentorProfile.goals.length === 0 ||
              !mentorProfile.availability || mentorProfile.availability.length === 0 ||
              !mentorProfile.expertise || mentorProfile.expertise.length === 0) {
            console.error('Missing required fields for mentor profile:', mentorProfile);
            this.errorMessage = 'Missing required fields. Please fill in all required information.';
            this.loading = false;
            return;
          }

          this.profileService.createMentorProfile(mentorProfile).subscribe({
            next: () => {
              console.log('Mentor profile created successfully');
              // Mark profile as completed
              this.profileService.markProfileCompleted(currentUser.uid, 'mentor').subscribe({
                next: () => {
                  this.successMessage = 'Mentor profile created successfully!';
                  this.loading = false;
                  this.router.navigate(['/mentor-dashboard']);
                },
                error: (err: any) => {
                  console.error('Error marking profile completed:', err);
                  this.successMessage = 'Mentor profile created successfully!';
                  this.loading = false;
                  this.router.navigate(['/mentor-dashboard']);
                }
              });
            },
            error: (err: any) => {
              this.errorMessage = 'Error creating mentor profile.';
              console.error('Detailed mentor profile creation error:', err);
              console.error('Profile data that failed:', mentorProfile);
              this.loading = false;
            }
          });
        }
      } else {
        this.errorMessage = 'User not logged in.';
        this.loading = false;
      }
    } else {
      this.errorMessage = 'Please fill in all required fields.';
      this.profileForm.markAllAsTouched();
    }
  }
}
