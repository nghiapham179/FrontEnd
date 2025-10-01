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

  // ===== Accessories + paging (cho section PHỤ KIỆN dùng mũi tên) =====
  accessories = [
    { name: 'Tai nghe Bluetooth', price: 1290000, tag: 'Âm thanh HD',      image: 'assets/accessories/headphone.jpg' },
    { name: 'Sạc nhanh 65W',     price: 690000,  tag: 'Type-C PD',         image: 'assets/accessories/charger.jpg' },
    { name: 'Ốp lưng iPhone 15', price: 390000,  tag: 'Silicon bảo vệ',    image: 'assets/accessories/case.jpg' },
    { name: 'Loa mini',          price: 990000,  tag: 'Âm trầm nổi bật',   image: 'assets/accessories/speaker.jpg' },
    { name: 'Bàn phím cơ',       price: 1890000, tag: 'Switch Red',        image: 'assets/accessories/keyboard.jpg' },
    { name: 'Cáp USB-C 1m',      price: 190000,  tag: 'Sạc & Data',        image: 'assets/accessories/cable.jpg' },
  ];
  page = 1;
  pageSize = 3;
  get totalPages() { return Math.max(1, Math.ceil(this.accessories.length / this.pageSize)); }
  get pagedAccessories() {
    const start = (this.page - 1) * this.pageSize;
    return this.accessories.slice(start, start + this.pageSize);
  }
  nextPage(){ if (this.page < this.totalPages) this.page++; }
  prevPage(){ if (this.page > 1) this.page--; }

  // ===== Menu / cookies =====
  toggleMenu(){ this.mobileMenuOpen = !this.mobileMenuOpen; }
  closeMenu(){ this.mobileMenuOpen = false; }
  acceptCookies(){ this.cookieOpen = false; }
  refuseCookies(){ this.cookieOpen = false; }
  customCookies(){ this.cookieOpen = false; }

  // ===== Lifecycle =====
  ngAfterViewInit(): void {
    // Poster vào (0.7s) + pause (1.0s) + ra (0.8s) ~ 2.5s
    this._timeouts.push(setTimeout(() => { this.showCover = false; }, 2300));

    // Cầu dao cứng nếu vì lý do gì animation không chạy
    this._timeouts.push(setTimeout(() => { this.forceOff = true; this.showCover = false; }, 3500));

    // Ép autoplay video (cần muted)
    const v = this.heroVideo?.nativeElement;
    if (v) {
      v.muted = true; // hầu hết trình duyệt yêu cầu muted để autoplay
      const p = v.play();
      if (p) {
        p.catch(() => {
          // nếu autoplay bị chặn, thử lại
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
// ===== Featured products (paging giống accessories) =====
  featured = [
    { name: 'Iphone17 ProMax', price: 31900000, image: 'assets/Phone/Iphone17PM.jpg', tags: ['OLED 120Hz','5G','50MP'] },
    { name: 'iPhone 15',       price: 22490000, image: 'assets/Phone/IPhone15.jpg',   tags: ['Super Retina','A16','USB-C'] },
    { name: 'Galaxy S24',      price: 18990000, image: 'assets/Phone/Galaxy2.jpg',    tags: ['Dynamic AMOLED','Snapdragon 8','AI'] },
    { name: 'Galaxy S24',      price: 18990000, image: 'assets/Phone/Galaxy2.jpg',    tags: ['Dynamic AMOLED','Snapdragon 8','AI'] },
    { name: 'Galaxy S24',      price: 18990000, image: 'assets/Phone/Galaxy2.jpg',    tags: ['Dynamic AMOLED','Snapdragon 8','AI'] },
    // có thể thêm nhiều sản phẩm nữa,
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
  nextFeatured(){ if(this.featuredPage < this.featuredTotalPages) this.featuredPage++; }
  prevFeatured(){ if(this.featuredPage > 1) this.featuredPage--; }
  // (tuỳ chọn) có nút Skip
  // skipCover(){ this.forceOff = true; this.showCover = false; }
}
