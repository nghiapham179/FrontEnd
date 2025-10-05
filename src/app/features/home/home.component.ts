import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  // ===== Header/Menu/Cookies =====
  mobileMenuOpen = false;
  cookieOpen = true;

  // ===== Poster cover =====
  showCover = true;   // poster đang hiển thị
  forceOff  = false;  // cầu dao phòng kẹt (tuỳ chọn)

  // ===== Video refs & state =====
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;
  isMuted = true;

  // (optional) quản lý timeout để clear khi destroy
  private _timeouts: any[] = [];

  // ===== Accessories + paging (PHỤ KIỆN) =====
  // Chuẩn hoá dữ liệu: dùng 'tags' (mảng) để khớp template {{ it.tags?.[0] }}
  accessories = [
    { name: 'Tai nghe Bluetooth', price: 1_290_000, tags: ['Âm thanh HD'],    image: 'assets/accessories/headphone.jpg' },
    { name: 'Sạc nhanh 65W',     price:   690_000, tags: ['Type-C PD'],       image: 'assets/accessories/charger.jpg' },
    { name: 'Ốp lưng iPhone 15', price:   390_000, tags: ['Silicon bảo vệ'],  image: 'assets/accessories/case.jpg' },
    { name: 'Loa mini',          price:   990_000, tags: ['Âm trầm nổi bật'], image: 'assets/accessories/speaker.jpg' },
    { name: 'Bàn phím cơ',       price: 1_890_000, tags: ['Switch Red'],      image: 'assets/accessories/keyboard.jpg' },
    { name: 'Cáp USB-C 1m',      price:   190_000, tags: ['Sạc & Data'],      image: 'assets/accessories/cable.jpg' },
  ];
  page = 1;
  pageSize = 3;
  get totalPages() { return Math.max(1, Math.ceil(this.accessories.length / this.pageSize)); }
  private get pagedAccessories() {
    const start = (this.page - 1) * this.pageSize;
    return this.accessories.slice(start, start + this.pageSize);
  }
  // Alias khớp template: *ngFor="let it of paged"
  get paged() { return this.pagedAccessories; }
  nextPage(){ if (this.page < this.totalPages) this.page++; }
  prevPage(){ if (this.page > 1) this.page--; }

  // ===== Featured products (paging giống accessories) =====
  featured = [
    { name: 'Iphone17 ProMax', price: 31_900_000, image: 'assets/Phone/Iphone17PM.jpg', tags: ['OLED 120Hz','5G','50MP'] },
    { name: 'iPhone 15',       price: 22_490_000, image: 'assets/Phone/IPhone15.jpg',   tags: ['Super Retina','A16','USB-C'] },
    { name: 'Galaxy S24',      price: 18_990_000, image: 'assets/Phone/Galaxy2.jpg',    tags: ['Dynamic AMOLED','Snapdragon 8','AI'] },
    { name: 'Galaxy S24',      price: 18_990_000, image: 'assets/Phone/Galaxy2.jpg',    tags: ['Dynamic AMOLED','Snapdragon 8','AI'] },
    { name: 'Galaxy S24',      price: 18_990_000, image: 'assets/Phone/Galaxy2.jpg',    tags: ['Dynamic AMOLED','Snapdragon 8','AI'] },
  ];
  featuredPage = 1;
  featuredPageSize = 3;
  get featuredTotalPages() {
    return Math.max(1, Math.ceil(this.featured.length / this.featuredPageSize));
  }
  get pagedFeatured() {
    const start = (this.featuredPage - 1) * this.featuredPageSize;
    return this.featured.slice(start, start + this.featuredPageSize);
  }
  nextFeatured(){ if (this.featuredPage < this.featuredTotalPages) this.featuredPage++; }
  prevFeatured(){ if (this.featuredPage > 1) this.featuredPage--; }

  // ===== ALIASES để khớp tên trong template hiện tại =====
  // Template đang dùng heroPaged / heroPage / heroTotalPages / heroNext / heroPrev
  get heroPaged() { return this.pagedFeatured; }
  get heroPage() { return this.featuredPage; }
  get heroTotalPages() { return this.featuredTotalPages; }
  heroNext(){ this.nextFeatured(); }
  heroPrev(){ this.prevFeatured(); }

  // Template dùng trackBy: trackById
  trackById(index: number, item: any): number | string {
    // Trả về id nếu có; fallback name; cuối cùng là index
    return (item && (item.id ?? item._id ?? item.code ?? item.name)) ?? index;
  }

  // ===== Menu / cookies =====
  toggleMenu(){ this.mobileMenuOpen = !this.mobileMenuOpen; }
  closeMenu(){ this.mobileMenuOpen = false; }
  acceptCookies(){ this.cookieOpen = false; }
  refuseCookies(){ this.cookieOpen = false; }
  customCookies(){ this.cookieOpen = false; }

  // ===== Lifecycle =====
  ngAfterViewInit(): void {
    // Poster vào (0.7s) + pause (1.0s) + ra (0.8s) ~ 2.3s
    this._timeouts.push(setTimeout(() => { this.showCover = false; }, 2300));

    // Cầu dao cứng nếu vì lý do gì animation không chạy
    this._timeouts.push(setTimeout(() => { this.forceOff = true; this.showCover = false; }, 3500));

    // Ép autoplay video (đa số trình duyệt yêu cầu muted)
    const v = this.heroVideo?.nativeElement;
    if (v) {
      v.muted = true;
      const p = v.play();
      if (p) {
        p.catch(() => {
          v.muted = true;
          v.play().catch(() => {});
        });
      }
    }
  }

  ngOnDestroy(): void {
    this._timeouts.forEach(t => clearTimeout(t));
  }

  // ===== Poster cover anim handler =====
  onCoverAnimEnd(e: AnimationEvent) {
    if (e.target !== e.currentTarget) return; // chỉ lắng nghe từ <section>
    if (e.animationName === 'cover-out-up' || e.animationName === 'cover-out') {
      this.showCover = false;
    }
  }
  add(product: any): void {
    console.log('Thêm vào giỏ hàng:', product);
  }

  // ===== Video handlers used in template =====
  toggleMute(videoEl: HTMLVideoElement) {
    this.isMuted = !this.isMuted;
    videoEl.muted = this.isMuted;
    if (!this.isMuted) videoEl.play().catch(() => {});
  }

  onVideoError(evt: Event) {
    const v = evt.target as HTMLVideoElement;
    console.error('VIDEO ERROR:', v?.error);
    // v.poster = 'assets/fallback.jpg'; // (tuỳ chọn) fallback poster
  }

  onVideoCanPlay() {
    // Hook khi video đã đủ dữ liệu để play (nếu cần bỏ loader, thêm class...)
  }

  // (tuỳ chọn) có nút Skip
  // skipCover(){ this.forceOff = true; this.showCover = false; }
}
