import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { FormsModule } from '@angular/forms';
import { Review, MentorProfile, MenteeProfile } from '../../shared/models/profile.model';

interface ReviewWithDetails extends Review {
  reviewerName?: string;
  reviewerPhotoUrl?: string;
  reviewerProfile?: MentorProfile | MenteeProfile;
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, Header, Footer, FormsModule],
  templateUrl: './feedback.html',
  styleUrl: './feedback.scss'
})
export class Feedback implements OnInit {
  currentUserId = '';
  userRole: 'mentee' | 'mentor' | 'both' | null = null;

  // Tabs
  activeTab: 'received' | 'given' = 'received';

  // Reviews data
  receivedReviews: ReviewWithDetails[] = [];
  givenReviews: Review[] = [];

  // Loading states
  loadingReceived = false;
  loadingGiven = false;

  // Submit review modal
  showSubmitModal = false;
  submitReviewForm = {
    revieweeId: '',
    revieweeRole: 'mentor' as 'mentee' | 'mentor',
    rating: 5,
    comment: ''
  };
  submitLoading = false;
  submitError = '';
  submitSuccess = '';

  // Available review targets (mentors for mentees, mentees for mentors)
  availableTargets: Array<{ id: string; name: string; role: string; photoUrl?: string }> = [];

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUserId = currentUser.uid;
    this.loadUserRole();
  }

  loadUserRole(): void {
    this.authService.getUserRole(this.currentUserId).subscribe({
      next: (role) => {
        if (!role) {
          this.router.navigate(['/profile-completion']);
          return;
        }

        this.userRole = role as 'mentee' | 'mentor' | 'both';
        this.loadAvailableTargets();
        this.loadReceivedReviews();
        this.loadGivenReviews();
      },
      error: (error) => {
        console.error('Error getting user role:', error);
        this.router.navigate(['/profile-completion']);
      }
    });
  }

  loadAvailableTargets(): void {
    if (this.userRole === 'mentee' || this.userRole === 'both') {
      // Load mentors the mentee is connected with
      this.profileService.getMentorIdsForMentee(this.currentUserId).subscribe({
        next: (mentorIds) => {
          mentorIds.forEach(mentorId => {
            this.profileService.getMentorById(mentorId).subscribe(mentor => {
              if (mentor && !this.availableTargets.find(t => t.id === mentor.id)) {
                this.availableTargets.push({
                  id: mentor.id.replace('_mentor', ''),
                  name: mentor.name,
                  role: 'mentor',
                  photoUrl: mentor.photoUrl
                });
              }
            });
          });
        }
      });
    }

    if (this.userRole === 'mentor' || this.userRole === 'both') {
      // Load mentees the mentor is connected with
      this.profileService.getMenteeIdsForMentor(this.currentUserId).subscribe({
        next: (menteeIds) => {
          menteeIds.forEach(menteeId => {
            this.profileService.getMenteeById(menteeId).subscribe(mentee => {
              if (mentee && !this.availableTargets.find(t => t.id === mentee.id)) {
                this.availableTargets.push({
                  id: mentee.id.replace('_mentee', ''),
                  name: mentee.name,
                  role: 'mentee',
                  photoUrl: mentee.photoUrl
                });
              }
            });
          });
        }
      });
    }
  }

  loadReceivedReviews(): void {
    this.loadingReceived = true;
    // Load basic reviews first
    this.profileService.getReviewsForUser(this.currentUserId).subscribe({
      next: (reviews) => {
        // For each review, populate reviewer details
        const reviewsWithDetails = reviews.map(review => {
          const enhancedReview = { ...review } as ReviewWithDetails;

          // Get reviewer profile details
          if (review.reviewerRole === 'mentor') {
            this.profileService.getMentorById(review.reviewerId).subscribe(mentor => {
              if (mentor) {
                enhancedReview.reviewerName = mentor.name;
                enhancedReview.reviewerPhotoUrl = mentor.photoUrl;
              }
            });
          } else if (review.reviewerRole === 'mentee') {
            this.profileService.getMenteeById(review.reviewerId).subscribe(mentee => {
              if (mentee) {
                enhancedReview.reviewerName = mentee.name;
                enhancedReview.reviewerPhotoUrl = mentee.photoUrl;
              }
            });
          }

          return enhancedReview;
        });

        this.receivedReviews = reviewsWithDetails;
        this.loadingReceived = false;
      },
      error: (error) => {
        console.error('Error loading received reviews:', error);
        this.loadingReceived = false;
      }
    });
  }

  loadGivenReviews(): void {
    this.loadingGiven = true;
    this.profileService.getReviewsByUser(this.currentUserId).subscribe({
      next: (reviews) => {
        this.givenReviews = reviews;
        this.loadingGiven = false;
      },
      error: (error) => {
        console.error('Error loading given reviews:', error);
        this.loadingGiven = false;
      }
    });
  }

  setActiveTab(tab: 'received' | 'given'): void {
    this.activeTab = tab;
  }

  openSubmitModal(): void {
    this.showSubmitModal = true;
    this.submitError = '';
    this.submitSuccess = '';
    this.submitReviewForm = {
      revieweeId: '',
      revieweeRole: 'mentor',
      rating: 5,
      comment: ''
    };
  }

  closeSubmitModal(): void {
    this.showSubmitModal = false;
    this.submitError = '';
    this.submitSuccess = '';
  }

  onRevieweeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedTarget = this.availableTargets.find(t => t.id === target.value);
    if (selectedTarget) {
      this.submitReviewForm.revieweeRole = selectedTarget.role as 'mentee' | 'mentor';
    }
  }

  submitReview(): void {
    if (!this.submitReviewForm.revieweeId || !this.submitReviewForm.comment.trim()) {
      this.submitError = 'Please select someone to review and provide a comment.';
      return;
    }

    this.submitLoading = true;
    this.submitError = '';

    const review = {
      reviewerId: this.currentUserId,
      reviewerRole: this.userRole as 'mentee' | 'mentor',
      revieweeId: this.submitReviewForm.revieweeId,
      revieweeRole: this.submitReviewForm.revieweeRole,
      rating: this.submitReviewForm.rating,
      comment: this.submitReviewForm.comment.trim()
    };

    this.profileService.submitReview(review).subscribe({
      next: (reviewId) => {
        this.submitLoading = false;
        this.submitSuccess = 'Review submitted successfully!';
        this.loadGivenReviews(); // Refresh given reviews
        setTimeout(() => {
          this.closeSubmitModal();
        }, 2000);
      },
      error: (error) => {
        this.submitLoading = false;
        this.submitError = 'Failed to submit review. Please try again.';
        console.error('Error submitting review:', error);
      }
    });
  }

  getStarRating(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  isStarFilled(rating: number, starNumber: number): boolean {
    return starNumber <= rating;
  }

  getAverageRating(): number {
    if (this.receivedReviews.length === 0) return 0;
    const total = this.receivedReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / this.receivedReviews.length) * 10) / 10;
  }

  goBackToDashboard(): void {
    if (this.userRole === 'mentor') {
      this.router.navigate(['/mentor-dashboard']);
    } else {
      this.router.navigate(['/mentee-dashboard']);
    }
  }
}
