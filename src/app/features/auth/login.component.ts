import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  model: { username: string; password: string; remember: boolean } = {
    username: '',
    password: '',
    remember: false
  };

  isSubmitting: boolean = false;

  constructor(private router: Router) {}

  onSubmit(): void {
    if (!this.model.username || !this.model.password) {
      alert('Vui lòng nhập đủ Username và Password');
      return;
    }

    this.isSubmitting = true;

    setTimeout(() => {
      this.isSubmitting = false;

      if (this.model.remember) {
        localStorage.setItem('rememberUser', this.model.username);
      } else {
        localStorage.removeItem('rememberUser');
      }

      this.router.navigate(['/']);
    }, 500);
  }

  onForgotPassword(): void {
    // Điều hướng đến trang quên mật khẩu
    this.router.navigate(['/forgot-password']);
    console.log('Forgot password clicked');
  }

  onRegister(): void {
    // Điều hướng đến trang đăng ký
    this.router.navigate(['/register']);
    console.log('Register clicked');
  }
}
