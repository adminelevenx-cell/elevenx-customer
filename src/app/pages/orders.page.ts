import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { StoreService } from '../core/store.service';

@Component({standalone:true,imports:[CommonModule,IonicModule],template:`
<main class="page"><p class="eyebrow">ORDER HISTORY</p><h1>Your <em>orders.</em></h1>
<ion-button fill="outline" (click)="load()">Refresh</ion-button>
<div *ngIf="!orders.length" class="state">Sign in to view your orders. New orders will appear here.</div>
<ion-card *ngFor="let o of orders"><ion-card-header><ion-card-subtitle>{{o.order_number}} · {{o.status}}</ion-card-subtitle><ion-card-title>{{o.total_ugx | currency:'UGX ':'symbol':'1.0-0'}}</ion-card-title></ion-card-header><ion-card-content>{{o.created_at | date:'mediumDate'}}</ion-card-content></ion-card></main>`})
export class OrdersPage implements OnInit {
 orders:any[]=[];
 constructor(private store:StoreService,private toast:ToastController){}
 ngOnInit(){void this.load();}
 async load(){try{this.orders=await this.store.myOrders();}catch(e:any){const t=await this.toast.create({message:e.message||'Sign in to view orders.',duration:2600});await t.present();}}
}
