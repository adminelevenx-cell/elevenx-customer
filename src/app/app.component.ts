import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonApp, IonContent, IonHeader, IonToolbar, IonTitle, IonTabBar, IonTabButton, IonTabs, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, bagHandleOutline, receiptOutline, personCircleOutline, colorPaletteOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonContent, IonHeader, IonToolbar, IonTitle, IonTabBar, IonTabButton, IonTabs, IonIcon, IonLabel, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <ion-app>
    <ion-header class="topbar"><ion-toolbar><ion-title><span class="brand">ELEVEN<span>X</span></span><small> KIT</small></ion-title></ion-toolbar></ion-header>
    <ion-content><router-outlet /></ion-content>
    <ion-tab-bar slot="bottom" class="bottom-nav">
      <ion-tab-button tab="shop" routerLink="/" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="selected"><ion-icon name="home-outline"></ion-icon><ion-label>Shop</ion-label></ion-tab-button>
      <ion-tab-button tab="cart" routerLink="/cart" routerLinkActive="selected"><ion-icon name="bag-handle-outline"></ion-icon><ion-label>Cart</ion-label></ion-tab-button>
      <ion-tab-button tab="studio" routerLink="/studio" routerLinkActive="selected"><ion-icon name="color-palette-outline"></ion-icon><ion-label>Design</ion-label></ion-tab-button>
      <ion-tab-button tab="orders" routerLink="/orders" routerLinkActive="selected"><ion-icon name="receipt-outline"></ion-icon><ion-label>Orders</ion-label></ion-tab-button>
      <ion-tab-button tab="account" routerLink="/account" routerLinkActive="selected"><ion-icon name="person-circle-outline"></ion-icon><ion-label>Account</ion-label></ion-tab-button>
    </ion-tab-bar>
  </ion-app>`
})
export class AppComponent {
  constructor() { addIcons({ homeOutline, bagHandleOutline, receiptOutline, personCircleOutline, colorPaletteOutline }); }
}
