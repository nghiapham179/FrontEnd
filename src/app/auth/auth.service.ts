// src/app/auth/auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpAuthService } from './http-auth.service';
import { User, Tokens, AuthPayload } from './auth.models';

const LS_USER = 'auth_user';
const LS_TOKENS = 'auth_tokens';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(HttpAuthService);

  private _user   = signal<User | null>(load<User>(LS_USER, localStorage) ?? load<User>(LS_USER, sessionStorage));
  private _tokens = signal<Tokens | null>(load<Tokens>(LS_TOKENS, localStorage) ?? load<Tokens>(LS_TOKENS, sessionStorage));

  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._tokens()?.accessToken && !!this._user());

  // 👇 thêm tham số remember
  async login(email: string, password: string, remember = true) {
    const payload = await this.api.login({ email, password });
    this.apply(payload, remember);
  }

  async register(name: string, email: string, password: string, remember = true) {
    const payload = await this.api.register({ name, email, password });
    this.apply(payload, remember);
  }

  async refresh(refreshToken: string) {
    const payload = await this.api.refresh(refreshToken);
    // giữ nguyên storage strategy hiện tại (ưu tiên localStorage nếu đang dùng)
    const usingLocal = !!localStorage.getItem(LS_TOKENS);
    this.apply(payload, usingLocal);
  }

  logout() {
    this._user.set(null);
    this._tokens.set(null);
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(LS_TOKENS);
    sessionStorage.removeItem(LS_USER);
    sessionStorage.removeItem(LS_TOKENS);
  }

  async ensureFreshToken(): Promise<string | null> {
    const t = this._tokens(); if (!t?.accessToken) return null;
    if (!isExpired(t.expiresAt)) return t.accessToken;
    if (!t.refreshToken) { this.logout(); return null; }
    try {
      const payload = await this.api.refresh(t.refreshToken);
      const usingLocal = !!localStorage.getItem(LS_TOKENS);
      this.apply(payload, usingLocal);
      return payload.tokens.accessToken;
    } catch {
      this.logout(); return null;
    }
  }

  private apply(p: AuthPayload, remember: boolean) {
    this._user.set(p.user);
    this._tokens.set(p.tokens);
    const store: Storage = remember ? localStorage : sessionStorage;
    const other: Storage = remember ? sessionStorage : localStorage;
    save(LS_USER, p.user, store);
    save(LS_TOKENS, p.tokens, store);
    // dọn kho còn lại để tránh lệch trạng thái
    other.removeItem(LS_USER);
    other.removeItem(LS_TOKENS);
  }
}

function load<T>(k: string, store: Storage): T | null { try { return JSON.parse(store.getItem(k) || 'null'); } catch { return null; } }
function save(k: string, v: unknown, store: Storage) { store.setItem(k, JSON.stringify(v)); }
function isExpired(exp?: number){ return exp ? Date.now() > exp - 5000 : false; }
