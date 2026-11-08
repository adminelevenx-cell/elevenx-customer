import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StoreService } from '../core/store.service';

@Component({ standalone: true, imports: [CommonModule, FormsModule, IonicModule], template: `
<main class="page narrow"><p class="eyebrow">ELEVENX ACCOUNT</p><h1>Welcome to<br><em>your club.</em></h1>
<div class="switch"><button [class.active]="mode==='login'" (click)="mode='login'">Sign in</button><button [class.active]="mode==='signup'" (click)="mode='signup'">Create account</button></div>
<form (ngSubmit)="submit()">
  <ion-input *ngIf="mode==='signup'" label="Full name" labelPlacement="stacked" fill="outline" [(ngModel)]="fullName" name="fullName" required></ion-input>
  <ion-input *ngIf="mode==='signup'" label="Phone (+256…)" labelPlacement="stacked" fill="outline" [(ngModel)]="phone" name="phone" required></ion-input>
  <ion-input label="Email" labelPlacement="stacked" fill="outline" type="email" [(ngModel)]="email" name="email" required></ion-input>
  <ion-input label="Password" labelPlacement="stacked" fill="outline" type="password" [(ngModel)]="password" name="password" required minlength="8"></ion-input>
  <ion-button expand="block" type="submit" [disabled]="busy">{{busy?'Please wait…':(mode==='login'?'Sign in':'Create account')}}</ion-button>
</form><p class="muted">Your account and orders are protected by ElevenX's shared Supabase authentication and row-level security.</p></main>` })
export class AuthPage {
  mode: 'login'|'signup' = 'login'; fullName=''; phone=''; email=''; password=''; busy=false;
  constructor(private sb: StoreService, private toast: ToastController, private router: Router) {}
  async submit() {
    this.busy=true;
    try {
      const result = this.mode==='login' ? await this.sb.signIn(this.email,this.password) : await this.sb.signUp(this.email,this.password,this.fullName,this.phone);
      if (result.error) throw result.error;
      const msg = this.mode==='signup' && !result.data.session ? 'Account created. Check your email to confirm, then sign in.' : 'You are signed in.';
      const t=await this.toast.create({message:msg,duration:3200}); await t.present();
      if (result.data.session) this.router.navigate(['/']);
    } catch(e:any) { const t=await this.toast.create({message:e.message||'Authentication failed',duration:3200}); await t.present(); }
    finally { this.busy=false; }
  }
}
