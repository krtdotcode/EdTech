import { Injectable } from '@angular/core';
import { Observable, of, from, map } from 'rxjs';
import { Firestore, doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc } from '@angular/fire/firestore';

import { MentorProfile, MenteeProfile, MentorshipRequest } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private firestore: Firestore) {}

  // Create a new mentee profile in Firestore
  createMenteeProfile(profile: MenteeProfile): Observable<MenteeProfile> {
    const profileDocRef = doc(this.firestore, 'profiles', `${profile.userId}_mentee`);
    const profileWithDocId = { ...profile, id: `${profile.userId}_mentee` };
    return from(setDoc(profileDocRef, profileWithDocId)).pipe(map(() => profileWithDocId));
  }

  // Create a new mentor profile in Firestore
  createMentorProfile(profile: MentorProfile): Observable<MentorProfile> {
    const profileDocRef = doc(this.firestore, 'profiles', `${profile.userId}_mentor`);
    const profileWithDocId = { ...profile, id: `${profile.userId}_mentor` };
    return from(setDoc(profileDocRef, profileWithDocId)).pipe(map(() => profileWithDocId));
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

  // Get mentor by user ID
  getMentorById(userId: string): Observable<MentorProfile | undefined> {
    const profileDocRef = doc(this.firestore, 'profiles', `${userId}_mentor`);
    return from(getDoc(profileDocRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          return data.role === 'mentor' ? (data as MentorProfile) : undefined;
        }
        return undefined;
      })
    );
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

  // Get mentee by user ID
  getMenteeById(userId: string): Observable<MenteeProfile | undefined> {
    const profileDocRef = doc(this.firestore, 'profiles', `${userId}_mentee`);
    return from(getDoc(profileDocRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          return data.role === 'mentee' ? (data as MenteeProfile) : undefined;
        }
        return undefined;
      })
    );
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
}
