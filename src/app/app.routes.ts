import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { ProductPageComponent } from './features/product/product-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },

  // Danh sách sản phẩm
  { path: 'products', component: ProductPageComponent },

  // Trang chi tiết sản phẩm (standalone component)
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./features/Detail/detail.component').then(m => m.DetailComponent),
  },

  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },

  { path: '**', redirectTo: 'products' },
];
