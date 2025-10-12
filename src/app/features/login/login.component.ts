// src/app/features/auth/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  model = {
    username: '',
    password: '',
    remember: false
  };

  isSubmitting = false;
  errorMsg = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  async onSubmit(): Promise<void> {
    this.errorMsg = '';
    if (!this.model.username || !this.model.password) {
      this.errorMsg = 'Vui lòng nhập đủ Username và Password';
      return;
    }

    this.isSubmitting = true;
    try {
      // BE mong chờ email -> dùng username như email
      await this.auth.login(this.model.username, this.model.password, this.model.remember);

      // Điều hướng: ưu tiên ?redirect=/... nếu có
      const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
      this.router.navigateByUrl(redirect);
    } catch (err: any) {
      // Hiển thị lỗi từ BE (nếu BE trả message)
      this.errorMsg = err?.error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!';
    } finally {
      this.isSubmitting = false;
    }
  }

  onForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  onRegister(): void {
    // Nếu muốn auto-redirect về trang đang xem sau khi register xong
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    this.router.navigate(['/register'], { queryParams: redirect ? { redirect } : undefined });
  }
}
