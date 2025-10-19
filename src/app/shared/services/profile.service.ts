import { Injectable } from '@angular/core';
import { Observable, of, from, map, tap, catchError } from 'rxjs';
import { Firestore, doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, onSnapshot, query, where, orderBy } from '@angular/fire/firestore';

import { MentorProfile, MenteeProfile, MentorshipRequest, Review } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
constructor(private firestore: Firestore) {}
  // Create a new mentee profile in Firestore
  createMenteeProfile(profile: MenteeProfile): Observable<MenteeProfile> {
    const profileDocRef = doc(this.firestore, 'profiles', `${profile.userId}_mentee`);
    const profileWithDocId = { ...profile, id: `${profile.userId}_mentee` };

    return from(setDoc(profileDocRef, profileWithDocId)).pipe(
      map(() => profileWithDocId),
      catchError((error) => {
        console.error('Error creating mentee profile:', error);
        throw error;
      })
    );
  }

  // Create a new mentor profile in Firestore
  createMentorProfile(profile: MentorProfile): Observable<MentorProfile> {
    const profileDocRef = doc(this.firestore, 'profiles', `${profile.userId}_mentor`);
    const profileWithDocId = { ...profile, id: `${profile.userId}_mentor` };

    return from(setDoc(profileDocRef, profileWithDocId)).pipe(
      map(() => profileWithDocId),
      catchError((error) => {
        console.error('Error creating mentor profile:', error);
        throw error;
      })
    );
  }

  // Get all mentors from Firestore
  getMentors(): Observable<MentorProfile[]> {
    const profilesRef = collection(this.firestore, 'profiles');
    return from(getDocs(profilesRef)).pipe(
      map((querySnapshot) => {
        const mentors: MentorProfile[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as any;
          if (data.role === 'mentor') {
            mentors.push(data as MentorProfile);
          }
        });
        return mentors;
      })
    );
  }

  // Get mentor by user ID with real-time updates
  getMentorById(userId: string): Observable<MentorProfile | undefined> {
    const profileDocRef = doc(this.firestore, 'profiles', `${userId}_mentor`);
    return new Observable<MentorProfile | undefined>((observer) => {
      const unsubscribe = onSnapshot(profileDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          const mentor = data.role === 'mentor' ? (data as MentorProfile) : undefined;
          observer.next(mentor);
        } else {
          observer.next(undefined);
        }
      }, (error) => {
        console.error('Error getting mentor profile:', error);
        observer.error(error);
      });

      // Return unsubscribe function for cleanup
      return () => unsubscribe();
    });
  }

  // Update mentor profile in Firestore
  updateMentorProfile(profile: MentorProfile): Observable<MentorProfile> {
    // Extract userId from the profile ID (which should be {userId}_mentor)
    const userId = profile.id.replace('_mentor', '');
    const profileDocRef = doc(this.firestore, 'profiles', `${userId}_mentor`);
    return from(setDoc(profileDocRef, profile)).pipe(map(() => profile));
  }

  // Get all mentees from Firestore
  getMentees(): Observable<MenteeProfile[]> {
    const profilesRef = collection(this.firestore, 'profiles');
    return from(getDocs(profilesRef)).pipe(
      map((querySnapshot) => {
        const mentees: MenteeProfile[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as any;
          if (data.role === 'mentee') {
            mentees.push(data as MenteeProfile);
          }
        });
        return mentees;
      })
    );
  }

  // Get mentee by user ID with real-time updates
  getMenteeById(userId: string): Observable<MenteeProfile | undefined> {
    const profileDocRef = doc(this.firestore, 'profiles', `${userId}_mentee`);
    return new Observable<MenteeProfile | undefined>((observer) => {
      const unsubscribe = onSnapshot(profileDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          const mentee = data.role === 'mentee' ? (data as MenteeProfile) : undefined;
          observer.next(mentee);
        } else {
          observer.next(undefined);
        }
      }, (error) => {
        console.error('Error getting mentee profile:', error);
        observer.error(error);
      });

      // Return unsubscribe function for cleanup
      return () => unsubscribe();
    });
  }

  // Update mentee profile in Firestore
  updateMenteeProfile(profile: MenteeProfile): Observable<MenteeProfile> {
    // Extract userId from the profile ID (which should be {userId}_mentee)
    const userId = profile.id.replace('_mentee', '');
    const profileDocRef = doc(this.firestore, 'profiles', `${userId}_mentee`);
    return from(setDoc(profileDocRef, profile)).pipe(map(() => profile));
  }

  // Get mentorship requests from Firestore
  getMentorshipRequests(): Observable<MentorshipRequest[]> {
    const requestsRef = collection(this.firestore, 'mentorshipRequests');
    return from(getDocs(requestsRef)).pipe(
      map((querySnapshot) => {
        const requests: MentorshipRequest[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as any;
          requests.push({
            id: doc.id,
            menteeId: data.menteeId,
            mentorId: data.mentorId,
            status: data.status,
            requestDate: data.requestDate.toDate()
          });
        });
        return requests;
      })
    );
  }

  // Send mentorship request (save to Firestore)
  sendMentorshipRequest(menteeId: string, mentorId: string): Observable<MentorshipRequest> {
    const requestsRef = collection(this.firestore, 'mentorshipRequests');
    const newRequest: Omit<MentorshipRequest, 'id'> = {
      menteeId,
      mentorId,
      status: 'pending',
      requestDate: new Date()
    };

    return from(addDoc(requestsRef, newRequest)).pipe(
      map((docRef) => ({
        ...newRequest,
        id: docRef.id
      }))
    );
  }

  // Update mentorship request status in Firestore
  updateMentorshipRequestStatus(requestId: string, status: 'accepted' | 'rejected'): Observable<MentorshipRequest | undefined> {
    const requestDocRef = doc(this.firestore, 'mentorshipRequests', requestId);
    const updateData = { status };

    return from(updateDoc(requestDocRef, updateData)).pipe(
      map(() => {
        return {
          id: requestId,
          status,
          menteeId: '', // Will be filled when read
          mentorId: '', // Will be filled when read
          requestDate: new Date()
        };
      })
    );
  }

  // Accept mentorship request and establish relationship
  acceptMentorshipRequest(requestId: string): Observable<boolean> {
    const requestDocRef = doc(this.firestore, 'mentorshipRequests', requestId);

    return from(getDoc(requestDocRef)).pipe(
      tap((requestDoc) => {
        if (requestDoc.exists()) {
          const requestData = requestDoc.data() as any;
          updateDoc(requestDocRef, { status: 'accepted' });

          const mentorUserId = requestData.mentorId.replace('_mentor', '').replace('_mentee', '');
          const menteeUserId = requestData.menteeId.replace('_mentor', '').replace('_mentee', '');

          this.addMenteeToMentorRelation(mentorUserId, menteeUserId);
          this.addMentorToMenteeRelation(menteeUserId, mentorUserId);
        }
      }),
      map(() => true),
      catchError((error) => {
        console.error('Error accepting mentorship request:', error);
        throw error;
      })
    );
  }

  // Reject mentorship request
  rejectMentorshipRequest(requestId: string): Observable<boolean> {
    const requestDocRef = doc(this.firestore, 'mentorshipRequests', requestId);
    const updateData = { status: 'rejected' };

    return from(updateDoc(requestDocRef, updateData)).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Error rejecting mentorship request:', error);
        throw error;
      })
    );
  }

  // Add mentee to mentor's mentees array and update active count
  private addMenteeToMentorRelation(mentorUserId: string, menteeUserId: string): void {
    this.getMentorById(mentorUserId).subscribe(mentor => {
      if (mentor) {
        const mentees = mentor.mentees || [];
        if (!mentees.includes(menteeUserId)) {
          mentees.push(menteeUserId);
          const updatedMentor: MentorProfile = {
            ...mentor,
            mentees: mentees,
            activeMentees: (mentor.activeMentees || 0) + 1
          };
          this.updateMentorProfile(updatedMentor).subscribe({
            error: (error) => console.error('Error updating mentor profile:', error)
          });
        }
      }
    });
  }

  // Add mentor to mentee's mentors array
  private addMentorToMenteeRelation(menteeUserId: string, mentorUserId: string): void {
    this.getMenteeById(menteeUserId).subscribe(mentee => {
      if (mentee) {
        const mentors = mentee.mentors || [];
        if (!mentors.includes(mentorUserId)) {
          mentors.push(mentorUserId);
          const updatedMentee: MenteeProfile = {
            ...mentee,
            mentors: mentors
          };
          this.updateMenteeProfile(updatedMentee).subscribe({
            error: (error) => console.error('Error updating mentee profile:', error)
          });
        }
      }
    });
  }

  // Get mentorship requests for a specific mentor
  getMentorshipRequestsForMentor(mentorId: string): Observable<MentorshipRequest[]> {
    const requestsRef = collection(this.firestore, 'mentorshipRequests');
    return from(getDocs(requestsRef)).pipe(
      map((querySnapshot) => {
        const requests: MentorshipRequest[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as any;
          if (data.mentorId === mentorId && data.status === 'pending') {
            requests.push({
              id: doc.id,
              menteeId: data.menteeId,
              mentorId: data.mentorId,
              status: data.status,
              requestDate: data.requestDate.toDate()
            });
          }
        });
        return requests;
      })
    );
  }


  sendMentorshipRequestWithNotification(menteeId: string, mentorId: string): Observable<MentorshipRequest> {
    return this.sendMentorshipRequest(menteeId, mentorId);
  }

  // Get user's profile completion status
  getProfileCompletionStatus(userId: string): Observable<any> {
    const statusDocRef = doc(this.firestore, 'userStatus', userId);
    return from(getDoc(statusDocRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return docSnap.data();
        }
        return { hasCompletedProfile: false, completedAt: null, role: null };
      })
    );
  }

  // Mark user's profile as completed
  markProfileCompleted(userId: string, role: 'mentee' | 'mentor' | 'both'): Observable<void> {
    const statusDocRef = doc(this.firestore, 'userStatus', userId);
    const completionStatus = {
      hasCompletedProfile: true,
      completedAt: new Date(),
      role: role,
      userId: userId
    };

    return from(setDoc(statusDocRef, completionStatus)).pipe(map(() => undefined));
  }

  // Check if user has completed their profile (professional implementation)
  hasUserCompletedProfile(userId: string): Observable<boolean> {
    return this.getProfileCompletionStatus(userId).pipe(
      map(status => status.hasCompletedProfile === true)
    );
  }

  // Get mentees for a specific mentor (from their mentees array) - returns IDs for now
  getMenteeIdsForMentor(mentorId: string): Observable<string[]> {
    return this.getMentorById(mentorId).pipe(
      map(mentor => mentor?.mentees || [])
    );
  }

  // Get mentors for a specific mentee (from their mentors array) - returns IDs for now
  getMentorIdsForMentee(menteeId: string): Observable<string[]> {
    return this.getMenteeById(menteeId).pipe(
      map(mentee => mentee?.mentors || [])
    );
  }

  // Verify mentorship relationship exists
  isMentorshipActive(mentorId: string, menteeId: string): Observable<boolean> {
    return this.getMenteeById(menteeId).pipe(
      map(mentee => mentee?.mentors?.includes(mentorId) || false)
    );
  }

  // Remove relationship (useful for future features)
  removeMentorshipRelationship(mentorId: string, menteeId: string): Observable<void> {
    return new Observable<void>(observer => {
      // Remove from mentor's mentees array
      this.getMentorById(mentorId).subscribe(mentor => {
        if (mentor) {
          const mentees = mentor.mentees || [];
          const updatedMentees = mentees.filter(id => id !== menteeId);
          const updatedMentor: MentorProfile = {
            ...mentor,
            mentees: updatedMentees,
            activeMentees: (mentor.activeMentees || 1) - 1
          };
          this.updateMentorProfile(updatedMentor).subscribe();
        }
      });

      // Remove from mentee's mentors array
      this.getMenteeById(menteeId).subscribe(mentee => {
        if (mentee) {
          const mentors = mentee.mentors || [];
          const updatedMentors = mentors.filter(id => id !== mentorId);
          const updatedMentee: MenteeProfile = {
            ...mentee,
            mentors: updatedMentors
          };
          this.updateMenteeProfile(updatedMentee).subscribe();
        }
      });

      observer.next();
      observer.complete();
    });
  }

  // REVIEWS FUNCTIONALITY
  // Submit a review for a mentor or mentee
  submitReview(review: Omit<Review, 'id' | 'createdAt'>): Observable<string> {
    const reviewsRef = collection(this.firestore, 'reviews');
    const newReview = {
      ...review,
      createdAt: new Date()
    };

    return from(addDoc(reviewsRef, newReview)).pipe(
      map((docRef) => docRef.id),
      tap((reviewId) => {
        // Update the reviewee's average rating if they're a mentor
        if (review.revieweeRole === 'mentor') {
          this.updateMentorAverageRating(review.revieweeId);
        }
      }),
      catchError((error) => {
        console.error('Error submitting review:', error);
        throw error;
      })
    );
  }

  // Get all reviews for a specific user (received reviews)
  getReviewsForUser(userId: string): Observable<Review[]> {
    const reviewsRef = collection(this.firestore, 'reviews');
    const q = query(reviewsRef, where('revieweeId', '==', userId), orderBy('createdAt', 'desc'));

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        const reviews: Review[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as any;
          reviews.push({
            id: doc.id,
            reviewerId: data.reviewerId,
            reviewerRole: data.reviewerRole,
            revieweeId: data.revieweeId,
            revieweeRole: data.revieweeRole,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.createdAt.toDate(),
            mentorshipId: data.mentorshipId,
            isVerified: data.isVerified
          });
        });
        return reviews;
      }),
      catchError((error) => {
        console.error('Error getting reviews for user:', error);
        throw error;
      })
    );
  }

  // Get all reviews submitted by a specific user (given reviews)
  getReviewsByUser(userId: string): Observable<Review[]> {
    const reviewsRef = collection(this.firestore, 'reviews');
    const q = query(reviewsRef, where('reviewerId', '==', userId), orderBy('createdAt', 'desc'));

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        const reviews: Review[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as any;
          reviews.push({
            id: doc.id,
            reviewerId: data.reviewerId,
            reviewerRole: data.reviewerRole,
            revieweeId: data.revieweeId,
            revieweeRole: data.revieweeRole,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.createdAt.toDate(),
            mentorshipId: data.mentorshipId,
            isVerified: data.isVerified
          });
        });
        return reviews;
      }),
      catchError((error) => {
        console.error('Error getting reviews by user:', error);
        throw error;
      })
    );
  }

  // Get reviews with reviewer details populated (for displaying review lists)
  getReviewsForUserWithDetails(userId: string): Observable<(Review & { reviewerName?: string; reviewerPhotoUrl?: string })[]> {
    return this.getReviewsForUser(userId).pipe(
      // Enhance with reviewer profile details
      map(reviews => {
        return reviews.map(review => {
          // Don't synchronously fetch here to avoid complexity
          // Return reviews and let component handle populating details asynchronously
          return {
            ...review,
            reviewerName: 'Loading...',
            reviewerPhotoUrl: undefined
          };
        });
      })
    );
  }

  private updateMentorAverageRating(mentorId: string): void {
    this.getReviewsForUser(mentorId).subscribe({
      next: (reviews) => {
        if (reviews.length === 0) return;

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        this.getMentorById(mentorId).subscribe(mentor => {
          if (mentor) {
            const updatedMentor: MentorProfile = {
              ...mentor,
              ratings: Math.round(averageRating * 10) / 10
            };
            this.updateMentorProfile(updatedMentor).subscribe({
              error: (error) => console.error('Error updating mentor rating:', error)
            });
          }
        });
      },
      error: (error) => console.error('Error updating mentor average rating:', error)
    });
  }

  // Check if a mentor-mentee pair has already been reviewed
  hasUserReviewed(reviewerId: string, revieweeId: string): Observable<boolean> {
    const reviewsRef = collection(this.firestore, 'reviews');
    const q = query(
      reviewsRef,
      where('reviewerId', '==', reviewerId),
      where('revieweeId', '==', revieweeId)
    );

    return from(getDocs(q)).pipe(
      map((querySnapshot) => !querySnapshot.empty),
      catchError((error) => {
        console.error('Error checking if user has reviewed:', error);
        return of(false);
      })
    );
  }
}
