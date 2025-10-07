import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface Product {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  image?: string;      // URL ảnh chính
  gallery?: string[];  // (tuỳ chọn) nhiều ảnh
  category?: string;
  stock?: number;
  [key: string]: any;
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
  loading = true;
  notFound = false;

  qty = 1;

  ngOnInit(): void {
    // Ưu tiên lấy từ navigation state
    const st = history.state?.product as Product | undefined;
    if (st?.id !== undefined && st !== null) {
      this.product = st;
      this.loading = false;
      return;
    }

    // Nếu không có state -> lấy id từ route và tìm trong localStorage
    this.route.paramMap.subscribe((p) => {
      const id = p.get('id');
      this.lookupProduct(id);
    });
  }

  private lookupProduct(id: string | null) {
    const list = this.readLocalProducts();
    if (id && list?.length) {
      const found = list.find(p => String(p.id) === String(id));
      if (found) {
        this.product = found;
        this.loading = false;
        return;
      }
    }
    this.notFound = true;
    this.loading = false;
  }

  private readLocalProducts(): Product[] | null {
    try {
      const raw = localStorage.getItem('products');
      return raw ? (JSON.parse(raw) as Product[]) : null;
    } catch { return null; }
  }

  dec(){ if (this.qty > 1) this.qty--; }
  inc(){ this.qty++; }

  addToCart(){
    // demo nhẹ: lưu vào localStorage "cart" (bạn có thể thay bằng service riêng)
    if (!this.product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({ ...this.product, qty: this.qty, addedAt: Date.now() });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Đã thêm vào giỏ!');
  }

  goBack(){ this.router.navigate(['/product']); }
}
