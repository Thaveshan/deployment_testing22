import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  username = '';
  email = '';
  phone = '';
  dob = '';

  message = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.message = '';

    this.authService.getProfile().subscribe({
      next: (profile: any) => {
        console.log('Profile API response:', profile);

        this.username = profile.username ?? '';
        this.email = profile.email ?? '';
        this.phone = profile.phone ?? '';

        if (profile.dob) {
          this.dob = profile.dob.substring(0, 10);
        } else {
          this.dob = '';
        }

        this.isLoading = false;

        // Force Angular to refresh the view
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Profile load error:', error);

        this.errorMessage = 'Could not load profile.';
        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });
  }

  updateProfile(): void {
    this.message = '';
    this.errorMessage = '';

    const profileData = {
      email: this.email,
      phone: this.phone,
      dob: this.dob
    };

    this.authService.updateProfile(profileData).subscribe({
      next: (response: any) => {
        console.log('Profile update response:', response);

        this.message = response.message || 'Profile updated successfully.';

        if (response.user) {
          this.username = response.user.username ?? this.username;
          this.email = response.user.email ?? this.email;
          this.phone = response.user.phone ?? this.phone;

          if (response.user.dob) {
            this.dob = response.user.dob.substring(0, 10);
          }
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Profile update error:', error);
        this.errorMessage = error.error?.message || 'Profile update failed.';

        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}