import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { StoreProduct, StoreService } from '../core/store.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({ standalone: true, imports: [CommonModule, IonicModule, FormsModule, RouterLink], template: `
<main class="page">
  <section class="hero">
    <p class="eyebrow">WEAR YOUR PASSION</p><h1>Match day<br><em>starts here.</em></h1>
    <p>Jerseys, apparel, gifts and personalised merchandise made your way.</p><ion-button routerLink="/studio" color="primary">Open Customisation Studio</ion-button>
    <div class="hero-chip">DELIVERING ACROSS KAMPALA & WAKISO</div>
  </section>
  <div class="section-head"><div><small>THE COLLECTION</small><h2>Shop merchandise</h2></div><span>{{filtered.length}} items</span></div>
  <ion-searchbar [(ngModel)]="query" placeholder="Search jerseys, hoodies, mugs…" [debounce]="250"></ion-searchbar>
  <div class="category-pills"><button *ngFor="let c of categories" [class.active]="category===c" (click)="category=c">{{c}}</button></div>
  <div *ngIf="loading" class="state">Loading the collection…</div>
  <div *ngIf="!loading && !products.length" class="state">No products are published yet. Please check back soon.</div>
  <div class="grid">
    <article class="product" *ngFor="let p of filtered">
      <div class="product-image">
        <img *ngIf="p.product_images?.length" [src]="image(p)" [alt]="p.name">
        <div *ngIf="!p.product_images?.length" class="shirt">11</div>
        <span *ngIf="p.featured" class="tag">FEATURED</span>
      </div>
      <div class="product-info"><small>{{p.product_type || 'FOOTBALL WEAR'}}</small><h3>{{p.name}}</h3><p>{{p.base_price_ugx | currency:'UGX ':'symbol':'1.0-0'}}</p>
        <ion-button expand="block" fill="outline" [routerLink]="['/studio']" [queryParams]="{product:p.id}" *ngIf="p.is_customizable">Customise</ion-button><ion-button expand="block" (click)="quickAdd(p)" [disabled]="!activeVariant(p)">Add to bag</ion-button>
      </div>
    </article>
  </div>
</main>` })
export class StorePage implements OnInit {
  products: StoreProduct[] = []; loading = true; query=''; category='All';
  get categories(){return ['All',...Array.from(new Set(this.products.map(p=>p.product_type||'Merchandise')))];}
  get filtered(){const q=this.query.toLowerCase().trim();return this.products.filter(p=>(this.category==='All'||(p.product_type||'Merchandise')===this.category)&&(!q||`${p.name} ${p.description||''} ${p.product_type||''}`.toLowerCase().includes(q)));}
  constructor(private store: StoreService, private toast: ToastController, private router: Router) {}
  async ngOnInit() {
    try { this.products = await this.store.products(); }
    catch (e: any) { await this.notify(e.message || 'Could not load products.'); }
    finally { this.loading = false; }
  }
  activeVariant(p: StoreProduct) { return p.product_variants?.find(v => v.is_active && (v.stock_on_hand - v.stock_reserved) > 0); }
  image(p: StoreProduct) { const img = p.product_images?.find(x => x.is_primary) || p.product_images?.[0]; return img ? this.store.imageUrl(img.storage_path) : ''; }
  async quickAdd(p: StoreProduct) {
    const user = await this.store.currentUser();
    if (!user) { this.router.navigate(['/login']); return; }
    const v = this.activeVariant(p);
    if (!v) return this.notify('This item is currently out of stock.');
    try { await this.store.addToCart(p.id, v.id); await this.notify('Added to your bag.'); }
    catch (e: any) { await this.notify(e.message || 'Could not add item.'); }
  }
  async notify(message: string) { const t = await this.toast.create({ message, duration: 2600, position: 'bottom' }); await t.present(); }
}
