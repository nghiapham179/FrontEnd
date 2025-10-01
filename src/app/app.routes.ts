import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

import { LoginComponent } from './features/auth/login.component'; // nếu có

export const routes: Routes = [
  { path: '', redirectTo: 'intro', pathMatch: 'full' },  // vào intro trước

  { path: 'home',  component: HomeComponent },
  { path: 'login', component: LoginComponent },
  // { path: 'register', component: RegisterComponent }, ...
  { path: '**', redirectTo: 'home' }
];
