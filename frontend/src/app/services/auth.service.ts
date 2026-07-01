import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://backendprofileapp-bzfjcycfdbb2b4bq.centralindia-01.azurewebsites.net/api';
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, {
      username,
      password
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, {
      headers: this.getAuthHeaders().set('Cache-Control', 'no-cache')
    });
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData, {
      headers: this.getAuthHeaders().set('Cache-Control', 'no-cache')
    });
  }

  getAuditLogs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/audit-logs`, {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache'
      })
    });
  }

  saveToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.tokenKey);
    }

    return null;
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    if (!token) {
      return new HttpHeaders({
        'Cache-Control': 'no-cache'
      });
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache'
    });
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}