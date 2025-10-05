import {
  Component, Input, TrackByFunction,
  ViewChild, ElementRef, AfterViewInit, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Product {
  id: number; name: string; price: number; image: string;
  category: string; inStock: boolean; tags?: string[]; isNew?: boolean;
}
type SortKey = 'relevance' | 'priceAsc' | 'priceDesc' | 'nameAsc';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css'],
})
export class ProductPageComponent implements AfterViewInit {
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

  /** ===== Responsive config (khớp CSS .card-grid) ===== */
  private minCard = 220;   // <-- match --card-min
  private gap = 16;        // <-- match --gap
  private heroRows = 1;    // 1 hàng cho hero
  private catalogRows = 2; // 2 hàng cho danh mục

  @ViewChild('heroGrid', { static: false }) heroGrid!: ElementRef<HTMLDivElement>;
  @ViewChild('catalogGrid', { static: false }) catalogGrid!: ElementRef<HTMLDivElement>;

  /* ===== HERO (UI only) ===== */
  heroPage = 1;
  heroPageSize = 3; // tự tính lại theo bề rộng
  get heroAll(): Product[] {
    const list = this.products.filter(p => p.isNew);
    return list.length ? list : this.products;
  }
  get heroTotalPages(): number { return Math.max(1, Math.ceil(this.heroAll.length / this.heroPageSize)); }
  get heroPaged(): Product[] {
    const start = (this.heroPage - 1) * this.heroPageSize;
    return this.heroAll.slice(start, start + this.heroPageSize);
  }
  heroNext() { /* no-op */ }
  heroPrev() { /* no-op */ }

  /* ===== Danh mục (UI only) ===== */
  searchTerm = '';
  categoryFilter = 'all';
  sortKey: SortKey = 'relevance';

  page = 1;
  pageSize = 6; // tự tính lại theo bề rộng

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
    if (q) list = list.filter(p => (p.name + ' ' + (p.tags?.join(' ') ?? '')).toLowerCase().includes(q));

    switch (this.sortKey) {
      case 'priceAsc':  list.sort((a, b) => a.price - b.price); break;
      case 'priceDesc': list.sort((a, b) => b.price - a.price); break;
      case 'nameAsc':   list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return list;
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get paged(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }
  nextPage() { /* no-op */ }
  prevPage() { /* no-op */ }

  /* ===== Lifecycle & resize ===== */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.recalcHeroPageSize();
      this.recalcCatalogPageSize();
    });
  }
  @HostListener('window:resize') onResize() {
    this.recalcHeroPageSize();
    this.recalcCatalogPageSize();
  }

  /* ===== Responsive calculations ===== */
  private recalcHeroPageSize() {
    const cols = this.estimateCols(this.heroGrid?.nativeElement);
    this.heroPageSize = Math.max(1, cols * this.heroRows);
    // giữ heroPage trong biên cho đúng UI disable state
    this.heroPage = Math.min(this.heroPage, this.heroTotalPages);
    this.heroPage = Math.max(this.heroPage, 1);
  }
  private recalcCatalogPageSize() {
    const cols = this.estimateCols(this.catalogGrid?.nativeElement);
    this.pageSize = Math.max(1, cols * this.catalogRows);
    this.page = Math.min(this.page, this.totalPages);
    this.page = Math.max(this.page, 1);
  }
  private estimateCols(el?: HTMLDivElement): number {
    if (!el) return 1;
    const w = el.clientWidth;
    return Math.max(1, Math.floor((w + this.gap) / (this.minCard + this.gap)));
  }

  /* ===== Helpers ===== */
  formatPrice(v: number) { return v.toLocaleString('vi-VN') + ' ₫'; }
  bgImg(url: string) { return { 'background-image': `url('${url}')` }; }
  add(_p: Product) { /* no-op */ }

  trackById: TrackByFunction<Product> = (_i, item) => item.id;
}
