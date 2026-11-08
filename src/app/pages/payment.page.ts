import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { StoreService } from '../core/store.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
  <main class="page narrow">
    <p class="eyebrow">SECURE MOBILE MONEY</p><h1>Complete your <em>payment.</em></h1>
    <div class="account-card" *ngIf="order">
      <small class="muted">ORDER {{order.order_number}}</small>
      <h1>{{order.total_ugx | currency:'UGX ':'symbol':'1.0-0'}}</h1>
      <p class="muted">Amount is taken from the order record in ElevenX.</p>
    </div>
    <div *ngIf="!order && !loading" class="state">Order not found or you do not have access to it.</div>
    <section *ngIf="order">
      <div class="category-pills"><span class="hero-chip">MTN MOMO</span><span class="hero-chip">AIRTEL MONEY</span></div>
      <ion-item><ion-label position="stacked">Mobile money phone number</ion-label><ion-input [(ngModel)]="phone" type="tel" inputmode="tel" placeholder="07XXXXXXXX" maxlength="15"></ion-input></ion-item>
      <p class="muted">Enter the MTN or Airtel number that should receive the payment approval prompt. The payment provider routes the request using the number.</p>
      <ion-button expand="block" (click)="pay()" [disabled]="busy || status==='successful'">{{busy?'Sending payment request…':'Request payment prompt'}}</ion-button>
      <div class="account-card" *ngIf="status">
        <p class="eyebrow">PAYMENT STATUS</p><h2>{{statusLabel}}</h2><p>{{statusMessage}}</p>
        <small *ngIf="reference">Reference: {{reference}}</small>
        <ion-button *ngIf="status==='successful'" expand="block" routerLink="/orders">View my orders</ion-button>
        <ion-button *ngIf="status==='pending' || status==='initiated'" expand="block" fill="outline" (click)="checkStatus()">Check payment status</ion-button>
      </div>
      <p class="muted">Never share your mobile money PIN with anyone. Approve the prompt on your phone yourself. Do not retry if the provider says a request is already being processed.</p>
    </section>
  </main>`
})
export class PaymentPage implements OnInit, OnDestroy {
  orderId=''; order:any=null; phone=''; status=''; reference=''; busy=false; loading=true; statusMessage='';
  private timer?: ReturnType<typeof setInterval>;
  constructor(private store:StoreService,private route:ActivatedRoute,private router:Router,private toast:ToastController){}
  async ngOnInit(){
    this.orderId=this.route.snapshot.paramMap.get('orderId')||'';
    try { if(!this.orderId) throw new Error('Missing order reference.'); const user=await this.store.currentUser(); if(!user){this.router.navigate(['/login']);return;} this.order=await this.store.orderForPayment(this.orderId); if(!this.order)throw new Error('Order not found.'); await this.checkStatus(); }
    catch(e:any){await this.notify(e.message||'Could not load order.');} finally{this.loading=false;}
  }
  ngOnDestroy(){if(this.timer)clearInterval(this.timer);}
  get statusLabel(){return ({initiated:'Request created',pending:'Awaiting your approval',successful:'Payment confirmed',failed:'Payment failed'} as any)[this.status]||'Ready to pay';}
  async pay(){
    if(this.busy)return;
    const digits=this.phone.replace(/[^0-9]/g,'');
    const normalized=digits.startsWith('256')?'+'+digits:digits.startsWith('0')?'+256'+digits:'+256'+digits;
    if(!/^\+256[0-9]{9}$/.test(normalized)){await this.notify('Enter a valid Uganda mobile number, e.g. 07XXXXXXXX.');return;}
    if(this.status==='pending'||this.status==='initiated'){await this.notify('A payment request is already pending. Check its status instead of creating another.');return;}
    this.busy=true;
    try{
      const result=await this.store.initiateMobileMoney(this.orderId,normalized);
      this.status=result?.status||'pending'; this.reference=result?.customer_reference||'';
      this.statusMessage=result?.message||'Approve the payment prompt on your phone.';
      this.startPolling();
      await this.notify('Payment request sent. Approve it on your phone.');
    }catch(e:any){await this.notify(e.message||'Could not start payment.');}
    finally{this.busy=false;}
  }
  startPolling(){if(this.timer)clearInterval(this.timer);let count=0;this.timer=setInterval(async()=>{count++;await this.checkStatus();if(['successful','failed'].includes(this.status)||count>=24){if(this.timer)clearInterval(this.timer);}},5000);}
  async checkStatus(){try{const p=await this.store.paymentStatus(this.orderId);if(p){this.status=p.status;this.reference=p.customer_reference||'';this.statusMessage=p.status==='successful'?'Payment received and verified.':p.status==='failed'?'Payment was not completed. You may retry if no money was deducted.':'Approve the mobile money prompt and wait for confirmation.';}}catch(e:any){this.statusMessage='Status could not be refreshed. Try again shortly.';}}
  async notify(message:string){const t=await this.toast.create({message,duration:3200,position:'bottom'});await t.present();}
}
