import {
  Component, Input, TrackByFunction,
  ViewChild, ElementRef, AfterViewInit, HostListener
} from '@angular/core';
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
export class ProductPageComponent implements AfterViewInit {
  /* ======== DEMO DATA (có thể @Input override) ======== */
  @Input() products: Product[] = [
    { id: 1, name: 'Beats Studio Pro',     price: 5_990_000, image: 'https://via.placeholder.com/1000x750?text=Beats+Studio+Pro',     category: 'Headphone', inStock: true,  tags: ['ANC','USB-C'], isNew: true },
    { id: 2, name: 'MX Mechanical Mini',   price: 3_190_000, image: 'https://via.placeholder.com/1000x750?text=MX+Mechanical+Mini',   category: 'Keyboard', inStock: true,  tags: ['Low-profile','Backlight'], isNew: true },
    { id: 3, name: 'Razer Basilisk V3',    price: 1_490_000, image: 'https://via.placeholder.com/1000x750?text=Basilisk+V3',          category: 'Mouse',     inStock: false, tags: ['26K DPI','RGB'], isNew: false },
    { id: 4, name: 'Keychron K2 Pro',      price: 2_590_000, image: 'https://via.placeholder.com/1000x750?text=Keychron+K2+Pro',      category: 'Keyboard', inStock: true,  tags: ['Hot-swap','BT 5.1'] },
    { id: 5, name: 'Sony WH-1000XM5',      price: 7_990_000, image: 'https://via.placeholder.com/1000x750?text=WH-1000XM5',           category: 'Headphone', inStock: true,  tags: ['ANC','LDAC'], isNew: true },
    { id: 6, name: 'G Pro X Superlight',   price: 2_590_000, image: 'https://via.placeholder.com/1000x750?text=G+Pro+X+Superlight',   category: 'Mouse',     inStock: true,  tags: ['Wireless','63g'] },
    { id: 7, name: 'Apple Magic Keyboard', price: 2_990_000, image: 'https://via.placeholder.com/1000x750?text=Magic+Keyboard',       category: 'Keyboard', inStock: true,  isNew: true },
    { id: 8, name: 'HyperX Pulsefire Haste', price: 1_190_000, image: 'https://via.placeholder.com/1000x750?text=Pulsefire+Haste',   category: 'Mouse',     inStock: true },
    { id: 9, name: 'Bose QC Ultra',        price: 8_490_000, image: 'https://via.placeholder.com/1000x750?text=Bose+QC+Ultra',        category: 'Headphone', inStock: true },
  ];

  /** ===== Responsive config (hero) ===== */
  private minCard = 220;   // khớp CSS
  private gap = 16;

  /** ===== HERO (tối đa 3 khung, trượt 1 item/lần) ===== */
  private readonly HERO_MAX_COLS = 3; // tối đa 3 cột
  private heroRows = 1;

  heroPageSize = 3;        // số khung hiển thị, auto theo bề rộng, nhưng <=3
  private heroStart = 0;   // index bắt đầu của cửa sổ trượt (circular)

  @ViewChild('heroGrid', { static: false }) heroGrid!: ElementRef<HTMLDivElement>;
  @ViewChild('catalogGrid', { static: false }) catalogGrid!: ElementRef<HTMLDivElement>;

  /** Dữ liệu ưu tiên "isNew", rỗng thì dùng toàn bộ */
  get heroAll(): Product[] {
    const list = this.products.filter(p => p.isNew);
    return list.length ? list : this.products;
  }

  /** Cửa sổ hiển thị k phần tử từ heroStart (vòng lặp) */
  get heroWindow(): Product[] {
    const data = this.heroAll;
    const n = data.length;
    if (!n) return [];
    const k = Math.min(this.heroPageSize, n);
    const out: Product[] = [];
    for (let i = 0; i < k; i++) out.push(data[(this.heroStart + i) % n]);
    return out;
  }

  /** Điều hướng hero: trượt 1 sp/lần, hai chiều, vòng lặp */
  heroNext(): void {
    const n = this.heroAll.length;
    if (n > this.heroPageSize) this.heroStart = (this.heroStart + 1) % n;
  }
  heroPrev(): void {
    const n = this.heroAll.length;
    if (n > this.heroPageSize) this.heroStart = (this.heroStart - 1 + n) % n;
  }

  /** ===== DANH MỤC / LỌC / SẮP XẾP / PHÂN TRANG ===== */
  searchTerm = '';
  categoryFilter: string = 'all';
  sortKey: SortKey = 'relevance';

  page = 1;
  pageSize = 6; // luôn 6 sp/trang (CỐ ĐỊNH)

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

  /* ===== LIFECYCLE & RESIZE ===== */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.recalcHeroPageSize();
      this.recalcCatalogPageSize();
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.recalcHeroPageSize();
    this.recalcCatalogPageSize();
  }

  recalcAndSlice(): void {
    this.recalcHeroPageSize();
    this.recalcCatalogPageSize();
  }

  /* ===== Responsive calculations ===== */
  private recalcHeroPageSize(): void {
    const rawCols = this.estimateCols(this.heroGrid?.nativeElement);
    const cols = Math.min(this.HERO_MAX_COLS, rawCols);
    const newSize = Math.max(1, cols * this.heroRows);

    if (newSize !== this.heroPageSize) {
      // giữ trung tâm tương đối khi số khung thay đổi
      const n = Math.max(1, this.heroAll.length);
      const center = (this.heroStart + Math.floor(this.heroPageSize / 2)) % n;
      this.heroPageSize = newSize;
      this.heroStart = (center - Math.floor(this.heroPageSize / 2) + n) % n;
    } else {
      this.heroPageSize = newSize;
    }
  }

  /** CỐ ĐỊNH pageSize = 6: chỉ clamp page, không tính lại theo bề rộng */
  private recalcCatalogPageSize(): void {
    this.page = Math.min(this.page, this.totalPages);
    this.page = Math.max(this.page, 1);
  }

  private estimateCols(el?: HTMLDivElement): number {
    if (!el) return 1;
    const w = el.clientWidth;
    // Số cột ≈ (width + gap) / (minCard + gap)
    return Math.max(1, Math.floor((w + this.gap) / (this.minCard + this.gap)));
  }

  /* ===== Catalog pager buttons ===== */
  nextPage(): void {
    if (this.page < this.totalPages) this.page++;
  }
  prevPage(): void {
    if (this.page > 1) this.page--;
  }
  // (tuỳ chọn)
  goToPage(n: number): void {
    const clamped = Math.max(1, Math.min(n, this.totalPages));
    this.page = clamped;
  }

  /* ===== Helpers ===== */
  formatPrice(v: number): string {
    return v.toLocaleString('vi-VN') + ' ₫';
  }
  bgImg(url: string) {
    return { 'background-image': `url('${url}')` };
  }
  add(_p: Product) { /* TODO: handle add to cart */ }

  trackById: TrackByFunction<Product> = (_i, item) => item.id;
}
