// src/app/auth/auth.service.ts
import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
}

const LS_USER = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(loadLS<User>(LS_USER));
  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());

  login(email: string, password: string, name?: string) {
    const u: User = {
      id: crypto.randomUUID(),
      name: name || email.split('@')[0] || 'Người dùng',
      email,
    };
    this._user.set(u);
    saveLS(LS_USER, u);
  }

  register(name: string, email: string, password: string) {
    this.login(email, password, name); // auto login
  }

  logout() {
    this._user.set(null);
    localStorage.removeItem(LS_USER);
  }
}

function loadLS<T>(k: string): T | null {
  try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; }
}
function saveLS(k: string, v: unknown) {
  localStorage.setItem(k, JSON.stringify(v));
}
