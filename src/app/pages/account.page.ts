import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StoreService } from '../core/store.service';

@Component({standalone:true,imports:[CommonModule,IonicModule],template:`
<main class="page"><p class="eyebrow">YOUR ELEVENX</p><h1>Account <em>centre.</em></h1>
<div class="account-card"><p>{{email || 'Not signed in'}}</p><p>{{name}}</p></div>
<ion-button *ngIf="!email" expand="block" routerLink="/login">Sign in / Create account</ion-button>
<section *ngIf="email"><ion-button expand="block" routerLink="/studio">Open saved-design studio</ion-button><ion-button expand="block" fill="outline" (click)="loadFavorites()">My wishlist</ion-button><ion-button expand="block" fill="outline" (click)="enablePush()">Enable order notifications</ion-button><h2>Notifications</h2><div *ngIf="!notifications.length" class="state">No notifications yet.</div><ion-card *ngFor="let n of notifications" (click)="read(n)"><ion-card-header><ion-card-title>{{n.title}}</ion-card-title><ion-card-subtitle>{{n.created_at | date:'medium'}}</ion-card-subtitle></ion-card-header><ion-card-content>{{n.body}}<p *ngIf="!n.read_at" class="eyebrow">NEW · TAP TO MARK READ</p></ion-card-content></ion-card><h2>Wishlist</h2><div *ngFor="let f of favorites" class="account-card">{{f.products?.name || f.product_id}} <span class="muted">{{f.products?.base_price_ugx | currency:'UGX ':'symbol':'1.0-0'}}</span></div><ion-button expand="block" color="medium" (click)="logout()">Sign out</ion-button></section>
<p class="muted">Your account, saved designs, wishlist and order updates use the shared ElevenX Supabase backend.</p></main>`})
export class AccountPage implements OnInit {
 email='';name='';notifications:any[]=[];favorites:any[]=[];
 constructor(private sb:StoreService,private router:Router,private toast:ToastController){}
 async ngOnInit(){const u=await this.sb.currentUser();this.email=u?.email||'';this.name=String(u?.user_metadata?.['full_name']||'');if(this.email){await this.loadNotifications();await this.loadFavorites();}}
 async loadNotifications(){try{this.notifications=await this.sb.myNotifications();}catch(e:any){this.notify(e.message);}}
 async loadFavorites(){try{this.favorites=await this.sb.favorites();}catch(e:any){this.notify(e.message);}}
 async read(n:any){if(!n.read_at){try{await this.sb.markNotificationRead(n.id);n.read_at=new Date().toISOString();}catch(e:any){this.notify(e.message);}}}
 async enablePush(){const msg=await this.sb.enablePush();this.notify(msg);}
 async logout(){const {error}=await this.sb.signOut();if(error){this.notify(error.message);return;}this.email='';this.router.navigate(['/']);}
 async notify(message:string){const t=await this.toast.create({message,duration:2800});await t.present();}
}
