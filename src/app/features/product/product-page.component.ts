import { Component, EventEmitter, Input, Output, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  tags?: string[];
  isNew?: boolean;
}

type SortKey = 'relevance' | 'priceAsc' | 'priceDesc' | 'nameAsc';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css'],
})
export class ProductPageComponent {
  @Input() products: Product[] = [
    { id: 1, name: 'Beats Studio Pro', price: 5_990_000, image: 'https://via.placeholder.com/1000x750?text=Beats+Studio+Pro', category: 'Headphone', inStock: true,  tags: ['ANC','USB-C'], isNew: true },
    { id: 2, name: 'MX Mechanical Mini', price: 3_190_000, image: 'https://via.placeholder.com/1000x750?text=MX+Mechanical+Mini', category: 'Keyboard', inStock: true,  tags: ['Low-profile','Backlight'], isNew: true },
    { id: 3, name: 'Razer Basilisk V3', price: 1_490_000, image: 'https://via.placeholder.com/1000x750?text=Basilisk+V3', category: 'Mouse', inStock: false, tags: ['26K DPI','RGB'], isNew: false },
    { id: 4, name: 'Keychron K2 Pro', price: 2_590_000, image: 'https://via.placeholder.com/1000x750?text=Keychron+K2+Pro', category: 'Keyboard', inStock: true,  tags: ['Hot-swap','BT 5.1'] },
    { id: 5, name: 'Sony WH-1000XM5', price: 7_990_000, image: 'https://via.placeholder.com/1000x750?text=WH-1000XM5', category: 'Headphone', inStock: true,  tags: ['ANC','LDAC'], isNew: true },
    { id: 6, name: 'G Pro X Superlight', price: 2_590_000, image: 'https://via.placeholder.com/1000x750?text=G+Pro+X+Superlight', category: 'Mouse', inStock: true, tags: ['Wireless','63g'] },
    { id: 7, name: 'Apple Magic Keyboard', price: 2_990_000, image: 'https://via.placeholder.com/1000x750?text=Magic+Keyboard', category: 'Keyboard', inStock: true, isNew: true },
    { id: 8, name: 'HyperX Pulsefire Haste', price: 1_190_000, image: 'https://via.placeholder.com/1000x750?text=Pulsefire+Haste', category: 'Mouse', inStock: true },
    { id: 9, name: 'Bose QC Ultra', price: 8_490_000, image: 'https://via.placeholder.com/1000x750?text=Bose+QC+Ultra', category: 'Headphone', inStock: true },
  ];

  @Output() addToCart = new EventEmitter<Product>();

  /* ====== HERO (New Arrivals) with paging ====== */
  heroPage = 1;
  heroPageSize = 3; // ⬅️ giảm xuống 3 để có nhiều trang hơn

  get heroAll(): Product[] {
    const list = this.products.filter(p => p.isNew);
    return list.length ? list : this.products; // fallback: dùng toàn bộ nếu chưa set isNew
  }
  get heroTotalPages(): number {
    return Math.max(1, Math.ceil(this.heroAll.length / this.heroPageSize));
  }
  get heroPaged(): Product[] {
    const start = (this.heroPage - 1) * this.heroPageSize;
    return this.heroAll.slice(start, start + this.heroPageSize);
  }
  heroNext() { if (this.heroPage < this.heroTotalPages) this.heroPage++; }
  heroPrev() { if (this.heroPage > 1) this.heroPage--; }

  /* ====== Danh mục (filters + paging) ====== */
  searchTerm = '';
  categoryFilter = 'all';
  sortKey: SortKey = 'relevance';

  page = 1;
  pageSize = 6;

  get categories(): string[] {
    const set = new Set(this.products.map(p => p.category));
    return ['all', ...Array.from(set)];
  }

  get filtered(): Product[] {
    let list = [...this.products];

    if (this.categoryFilter !== 'all') {
      list = list.filter(p => p.category === this.categoryFilter);
    }

    const q = this.searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        (p.name + ' ' + (p.tags?.join(' ') ?? '')).toLowerCase().includes(q)
      );
    }

    switch (this.sortKey) {
      case 'priceAsc':  list.sort((a, b) => a.price - b.price); break;
      case 'priceDesc': list.sort((a, b) => b.price - a.price); break;
      case 'nameAsc':   list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'relevance':
      default: break;
    }
    return list;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get paged(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  nextPage() { if (this.page < this.totalPages) this.page++; }
  prevPage() { if (this.page > 1) this.page--; }

  /* ====== Helpers ====== */
  formatPrice(v: number) { return v.toLocaleString('vi-VN') + ' ₫'; }
  bgImg(url: string) { return { 'background-image': `url('${url}')` }; }
  add(p: Product) { if (p.inStock) this.addToCart.emit(p); }

  /** trackBy cho *ngFor */
  public trackById: TrackByFunction<Product> = (_i, item) => item.id;
}
