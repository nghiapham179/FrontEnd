import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { ProductPageComponent } from './features/product/product-page.component'; // <-- đường dẫn mới

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },

  { path: 'products', component: ProductPageComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },

  { path: '**', redirectTo: 'products' }
];
