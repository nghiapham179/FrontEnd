import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

export interface Product {
  id: number;
  name: string;
  price: number;          // giá hiện bán
  oldPrice?: number;      // giá gốc (nếu có, sẽ hiện gạch)
  discountPercent?: number; // nếu không có oldPrice, có thể set % ở đây
  image: string;
  category: string;
  inStock: boolean;
  tags?: string[];
  description?: string;
  gallery?: string[];
  [k: string]: any;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
})
export class DetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  product?: Product;
  notFound = false;
  qty = 1;

  ngOnInit(): void {
    const st = history.state?.product as Product | undefined;
    if (st && st.id != null) { this.product = st; return; }
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.notFound = Number.isNaN(id) || !st;
  }

  // ====== helpers (giá, promo) ======
  get hasPromo(): boolean {
    const p = this.product;
    return !!(p && (p.oldPrice || p.discountPercent));
  }
  get promoText(): string {
    const p = this.product;
    if (!p) return '';
    if (p.oldPrice && p.oldPrice > p.price) {
      const percent = Math.round((1 - p.price / p.oldPrice) * 100);
      return `Giảm ${percent}%`;
    }
    if (p.discountPercent) return `Giảm ${p.discountPercent}%`;
    return '';
  }
  formatPrice(v: number | undefined | null): string {
    if (v == null) return '';
    return v.toLocaleString('vi-VN') + ' ₫';
  }

  // ====== actions ======
  dec(){ if (this.qty > 1) this.qty--; }
  inc(){ this.qty++; }

  addToCart(){
    if (!this.product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({ ...this.product, qty: this.qty, addedAt: Date.now() });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Đã thêm vào giỏ!');
  }
  buyNow(){
    if (!this.product) return;
    this.addToCart();
    this.router.navigate(['/checkout']); // hoặc chuyển sang /cart nếu bạn có route
  }
  goBack(){ this.router.navigate(['/products']); }
}
