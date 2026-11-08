import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreProduct, StoreService } from '../core/store.service';

@Component({standalone:true,imports:[CommonModule,FormsModule,IonicModule],template:`
<main class="page studio-page"><p class="eyebrow">ELEVENX DESIGN LAB</p><h1>Make it <em>yours.</em></h1>
<p class="muted">Personalise your merchandise before it goes to print. Your saved design is private to your account.</p>
<div class="studio-layout">
<section class="studio-preview"><div class="preview-toolbar"><span>LIVE PREVIEW</span><ion-segment [(ngModel)]="side"><ion-segment-button value="front">Front</ion-segment-button><ion-segment-button value="back">Back</ion-segment-button></ion-segment></div>
<div class="mockup" [style.background]="baseColor"><div class="mockup-brand">11<span>X</span></div><div class="mockup-art" [style.color]="textColor">{{side==='front' ? (design.nameText || 'YOUR DESIGN') : (design.backText || 'ELEVENX')}}</div><img *ngIf="imagePreview" [src]="imagePreview" class="art-upload" alt="Uploaded artwork preview"></div>
<p class="preview-note">Illustrative preview. Final print placement is confirmed during production.</p></section>
<section class="studio-controls"><ion-item><ion-label position="stacked">Product</ion-label><ion-select [(ngModel)]="productId" (ionChange)="selectProduct()" interface="popover"><ion-select-option *ngFor="let p of products" [value]="p.id">{{p.name}}</ion-select-option></ion-select></ion-item>
<ion-item><ion-label position="stacked">Design name</ion-label><ion-input [(ngModel)]="designName" maxlength="60" placeholder="My custom design"></ion-input></ion-item>
<ion-item><ion-label position="stacked">Front text / name</ion-label><ion-input [(ngModel)]="design.nameText" maxlength="24" placeholder="e.g. VISH"></ion-input></ion-item>
<ion-item><ion-label position="stacked">Back text / number</ion-label><ion-input [(ngModel)]="design.backText" maxlength="24" placeholder="e.g. 11"></ion-input></ion-item>
<ion-item><ion-label position="stacked">Product colour</ion-label><ion-select [(ngModel)]="design.baseColor" (ionChange)="baseColor=design.baseColor"><ion-select-option value="#172238">Midnight navy</ion-select-option><ion-select-option value="#ffffff">White</ion-select-option><ion-select-option value="#b91c1c">Red</ion-select-option><ion-select-option value="#166534">Green</ion-select-option><ion-select-option value="#111111">Black</ion-select-option><ion-select-option value="#d6a83c">Gold</ion-select-option></ion-select></ion-item>
<ion-item><ion-label position="stacked">Text colour</ion-label><ion-select [(ngModel)]="design.textColor" (ionChange)="textColor=design.textColor"><ion-select-option value="#ffffff">White</ion-select-option><ion-select-option value="#111827">Black</ion-select-option><ion-select-option value="#d6a83c">Gold</ion-select-option><ion-select-option value="#dc2626">Red</ion-select-option></ion-select></ion-item>
<div class="upload-box"><label for="artwork">Upload logo / artwork (PNG, JPG, WEBP; max 8 MB)</label><input id="artwork" type="file" accept="image/png,image/jpeg,image/webp" (change)="onFile($event)"><small>{{fileName || 'No artwork selected'}}</small></div>
<ion-button expand="block" fill="outline" (click)="save()" [disabled]="busy">{{busy?'Saving…':'Save design'}}</ion-button>
<ion-button expand="block" (click)="addToBag()" [disabled]="busy || !productId">Add customised item to bag</ion-button>
</section></div></main>`})
export class StudioPage implements OnInit {
 products:StoreProduct[]=[];productId='';designName='My ElevenX design';side='front';busy=false;file?:File;fileName='';imagePreview='';baseColor='#172238';textColor='#ffffff';
 design:any={nameText:'',backText:'',baseColor:'#172238',textColor:'#ffffff',artworkPath:null};
 constructor(private store:StoreService,private toast:ToastController,private route:ActivatedRoute,private router:Router){}
 async ngOnInit(){try{this.products=await this.store.products();const id=this.route.snapshot.queryParamMap.get('product');this.productId=id&&this.products.some(p=>p.id===id)?id:(this.products.find(p=>p.is_customizable)?.id||this.products[0]?.id||'');}catch(e:any){this.notify(e.message||'Could not load products.');}}
 selectProduct(){this.design.productName=this.products.find(p=>p.id===this.productId)?.name||'';}
 onFile(event:Event){const f=(event.target as HTMLInputElement).files?.[0];if(!f)return;if(f.size>8*1024*1024){this.notify('Choose an image smaller than 8 MB.');return;}if(!['image/png','image/jpeg','image/webp'].includes(f.type)){this.notify('Use a PNG, JPG or WEBP image.');return;}this.file=f;this.fileName=f.name;const reader=new FileReader();reader.onload=()=>this.imagePreview=String(reader.result||'');reader.readAsDataURL(f);}
 async save(){await this.persist(false);}
 async addToBag(){await this.persist(true);}
 async persist(add:boolean){this.busy=true;try{const user=await this.store.currentUser();if(!user){this.router.navigate(['/login']);return;}if(!this.productId)throw new Error('Choose a product first.');if(!this.designName.trim())throw new Error('Give your design a name.');if(this.file)this.design.artworkPath=await this.store.uploadDesign(this.file,user.id);
 const snapshot={...this.design,productName:this.products.find(p=>p.id===this.productId)?.name||'',sidePreview:this.side,version:1,createdFrom:'customer-studio'};
 const id=await this.store.saveDesign(this.productId,this.designName.trim(),snapshot);
 if(add){const p=this.products.find(x=>x.id===this.productId)!;const v=p.product_variants?.find(x=>x.is_active&&(x.stock_on_hand-x.stock_reserved)>0);if(!v)throw new Error('No available variant is configured for this product. Contact support for a made-to-order quote.');await this.store.addToCart(p.id,v.id,snapshot);await this.notify('Design saved and customised item added to your bag.');this.router.navigate(['/cart']);}
 else await this.notify('Design saved to your account.');
 }catch(e:any){await this.notify(e.message||'Could not save your design.');}finally{this.busy=false;}}
 async notify(message:string){const t=await this.toast.create({message,duration:3000,position:'bottom'});await t.present();}
}
