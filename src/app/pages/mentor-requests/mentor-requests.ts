import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../shared/services/profile.service';
import { MentorshipRequest, MentorProfile } from '../../shared/models/profile.model';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-mentor-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mentor-requests.html',
})
export class MentorRequests implements OnInit {
  mentorshipRequests: MentorshipRequest[] = [];
  currentMentorId: string = 'mentor1'; // Hardcoded for demonstration

  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
    this.loadMentorshipRequests();
  }

  loadMentorshipRequests(): void {
    this.profileService.getMentorshipRequests().subscribe(requests => {
      this.mentorshipRequests = requests.filter(req => req.mentorId === this.currentMentorId);
    });
  }

  acceptRequest(requestId: string): void {
    this.profileService.updateMentorshipRequestStatus(requestId, 'accepted').subscribe(
      response => {
        console.log('Request accepted:', response);
        alert('Mentorship request accepted!');
        this.loadMentorshipRequests(); // Refresh the list
      },
      error => {
        console.error('Error accepting request:', error);
        alert('Failed to accept mentorship request.');
      }
    );
  }

  rejectRequest(requestId: string): void {
    this.profileService.updateMentorshipRequestStatus(requestId, 'rejected').subscribe(
      response => {
        console.log('Request rejected:', response);
        alert('Mentorship request rejected!');
        this.loadMentorshipRequests(); // Refresh the list
      },
      error => {
        console.error('Error rejecting request:', error);
        alert('Failed to reject mentorship request.');
      }
    );
  }
}