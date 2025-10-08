import {
  Component, Input, TrackByFunction,
  ViewChild, ElementRef, AfterViewInit, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css'],
})
export class ProductPageComponent implements AfterViewInit {
  constructor(private router: Router) {}

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

  private minCard = 220;
  private gap = 16;

  private readonly HERO_MAX_COLS = 3;
  private heroRows = 1;

  heroPageSize = 3;
  private heroStart = 0;

  @ViewChild('heroGrid', { static: false }) heroGrid!: ElementRef<HTMLDivElement>;
  @ViewChild('catalogGrid', { static: false }) catalogGrid!: ElementRef<HTMLDivElement>;

  get heroAll(): Product[] {
    const list = this.products.filter(p => p.isNew);
    return list.length ? list : this.products;
  }

  get heroWindow(): Product[] {
    const data = this.heroAll;
    const n = data.length;
    if (!n) return [];
    const k = Math.min(this.heroPageSize, n);
    const out: Product[] = [];
    for (let i = 0; i < k; i++) out.push(data[(this.heroStart + i) % n]);
    return out;
  }

  heroNext(): void {
    const n = this.heroAll.length;
    if (n > this.heroPageSize) this.heroStart = (this.heroStart + 1) % n;
  }
  heroPrev(): void {
    const n = this.heroAll.length;
    if (n > this.heroPageSize) this.heroStart = (this.heroStart - 1 + n) % n;
  }

  searchTerm = '';
  categoryFilter: string = 'all';
  sortKey: SortKey = 'relevance';

  page = 1;
  pageSize = 6;

  get categories(): string[] {
    const set = new Set(this.products.map(p => p.category));
    return ['all', ...Array.from(set)];
  }

  get filtered(): Product[] {
    let list = [...this.products];
    if (this.categoryFilter !== 'all') list = list.filter(p => p.category === this.categoryFilter);

    const q = this.searchTerm.trim().toLowerCase();
    if (q) list = list.filter(p => (p.name + ' ' + (p.tags?.join(' ') ?? '')).toLowerCase().includes(q));

    switch (this.sortKey) {
      case 'priceAsc':  list.sort((a, b) => a.price - b.price); break;
      case 'priceDesc': list.sort((a, b) => b.price - a.price); break;
      case 'nameAsc':   list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'relevance':
      default: break;
    }
    return list;
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get paged(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

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
  recalcAndSlice(): void {
    this.recalcHeroPageSize();
    this.recalcCatalogPageSize();
  }

  private recalcHeroPageSize(): void {
    const rawCols = this.estimateCols(this.heroGrid?.nativeElement);
    const cols = Math.min(this.HERO_MAX_COLS, rawCols);
    const newSize = Math.max(1, cols * this.heroRows);

    if (newSize !== this.heroPageSize) {
      const n = Math.max(1, this.heroAll.length);
      const center = (this.heroStart + Math.floor(this.heroPageSize / 2)) % n;
      this.heroPageSize = newSize;
      this.heroStart = (center - Math.floor(this.heroPageSize / 2) + n) % n;
    } else {
      this.heroPageSize = newSize;
    }
  }

  private recalcCatalogPageSize(): void {
    this.page = Math.min(this.page, this.totalPages);
    this.page = Math.max(this.page, 1);
  }

  private estimateCols(el?: HTMLDivElement): number {
    if (!el) return 1;
    const w = el.clientWidth;
    return Math.max(1, Math.floor((w + this.gap) / (this.minCard + this.gap)));
  }

  nextPage(): void { if (this.page < this.totalPages) this.page++; }
  prevPage(): void { if (this.page > 1) this.page--; }
  goToPage(n: number): void { this.page = Math.max(1, Math.min(n, this.totalPages)); }

  formatPrice(v: number): string { return v.toLocaleString('vi-VN') + ' ₫'; }
  bgImg(url: string) { return { 'background-image': `url('${url}')` }; }

  /* Điều hướng chi tiết */
  viewProduct(p: Product): void {
    this.router.navigate(['/product', p.id], { state: { product: p } });
  }

  trackById: TrackByFunction<Product> = (_i, item) => item.id;
}
