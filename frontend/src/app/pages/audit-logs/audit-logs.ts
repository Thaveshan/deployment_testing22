import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css'
})
export class AuditLogs implements OnInit {
  logs: any[] = [];
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getAuditLogs().subscribe({
      next: (response: any) => {
        console.log('Audit logs API response:', response);

        if (Array.isArray(response)) {
          this.logs = response;
        } else if (response.logs && Array.isArray(response.logs)) {
          this.logs = response.logs;
        } else {
          this.logs = [];
        }

        this.isLoading = false;

        // Force Angular to refresh the screen
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Audit logs error:', error);

        this.errorMessage = 'Could not load audit logs.';
        this.logs = [];
        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });
  }
}