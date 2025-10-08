import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { ProductPageComponent } from './features/product/product-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },

  { path: 'products', component: ProductPageComponent },

  // ✅ CHÚ Ý đường dẫn đúng file: './features/Detail/detail.component'
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./features/Detail/detail.component').then(m => m.DetailComponent),
  },

  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },

  { path: '**', redirectTo: 'products' },
];
