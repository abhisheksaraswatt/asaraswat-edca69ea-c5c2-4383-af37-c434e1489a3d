import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  get token(): string | null {
    return localStorage.getItem('accessToken');
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
}
