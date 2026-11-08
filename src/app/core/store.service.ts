import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { PushNotifications, Token } from '@capacitor/push-notifications';

export interface StoreProduct {
  id: string; name: string; description: string | null; base_price_ugx: number;
  featured: boolean; is_customizable: boolean; product_type: string | null;
  product_images?: { storage_path: string; alt_text: string | null; is_primary: boolean }[];
  product_variants?: { id: string; size: string | null; color: string | null; price_delta_ugx: number; stock_on_hand: number; stock_reserved: number; is_active: boolean }[];
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabasePublishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
  constructor() {}

  async currentUser(): Promise<User | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error && error.name !== 'AuthSessionMissingError') throw error;
    return data.user;
  }
  async signIn(email:string,password:string){return this.client.auth.signInWithPassword({email,password});}
  async signUp(email:string,password:string,fullName:string,phone:string){
    return this.client.auth.signUp({email,password,options:{data:{full_name:fullName,phone}}});
  }
  async signOut(){return this.client.auth.signOut();}

  async products() {
    const { data, error } = await this.client.from('products')
      .select('id,name,description,base_price_ugx,featured,is_customizable,product_type,product_images(storage_path,alt_text,is_primary),product_variants(id,size,color,price_delta_ugx,stock_on_hand,stock_reserved,is_active)')
      .eq('status', 'active').order('featured', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as StoreProduct[];
  }
  async addToCart(productId:string,variantId:string,customization:any={}) {
    const user=await this.currentUser(); if(!user) throw new Error('Sign in before adding items to your cart.');
    const {data:cart,error:ce}=await this.client.from('carts').select('id').eq('user_id',user.id).maybeSingle();
    if(ce) throw ce;
    let cartId=cart?.id;
    if(!cartId){const c=await this.client.from('carts').insert({user_id:user.id}).select('id').single();if(c.error)throw c.error;cartId=c.data.id;}
    const {data:row,error:re}=await this.client.from('cart_items').select('id,quantity').eq('cart_id',cartId).eq('variant_id',variantId).maybeSingle();
    if(re)throw re;
    if(row){const u=await this.client.from('cart_items').update({quantity:row.quantity+1,customization}).eq('id',row.id);if(u.error)throw u.error;}
    else {const i=await this.client.from('cart_items').insert({cart_id:cartId,variant_id:variantId,quantity:1,customization});if(i.error)throw i.error;}
  }
  async cartItems(){
    const u=await this.currentUser();if(!u)return [];
    const {data:cart,error:ce}=await this.client.from('carts').select('id').eq('user_id',u.id).maybeSingle();if(ce)throw ce;if(!cart)return [];
    const {data,error}=await this.client.from('cart_items').select('id,quantity,customization,product_variants(id,size,color,price_delta_ugx,stock_on_hand,stock_reserved,products(id,name,base_price_ugx,product_images(storage_path,is_primary)))').eq('cart_id',cart.id);if(error)throw error;return data??[];
  }
  async updateCartQuantity(id:string,quantity:number){if(quantity<1){const {error}=await this.client.from('cart_items').delete().eq('id',id);if(error)throw error;return;}const {error}=await this.client.from('cart_items').update({quantity}).eq('id',id);if(error)throw error;}
  async removeCartItem(id:string){const {error}=await this.client.from('cart_items').delete().eq('id',id);if(error)throw error;}
  async addresses(){
    const u=await this.currentUser(); if(!u)return [];
    const {data,error}=await this.client.from('addresses').select('id,recipient_name,phone,district,city,area,address_line,landmark,latitude,longitude,delivery_instructions,is_default').eq('user_id',u.id).order('is_default',{ascending:false});
    if(error)throw error;return data??[];
  }
  async addAddress(v:any){
    const u=await this.currentUser();if(!u)throw new Error('Sign in first.');
    const {error}=await this.client.from('addresses').insert({...v,user_id:u.id,is_default:true});
    if(error)throw error;
  }
  async checkout(addressId:string,note:string){
    const {data,error}=await this.client.rpc('checkout_cart',{p_address_id:addressId,p_customer_note:note||null});
    if(error)throw error;return data;
  }
  async orderForPayment(orderId:string){const u=await this.currentUser();if(!u)return null;const {data,error}=await this.client.from('orders').select('id,order_number,total_ugx,status').eq('id',orderId).eq('customer_id',u.id).maybeSingle();if(error)throw error;return data;}
  async initiateMobileMoney(orderId:string,msisdn:string){const {data,error}=await this.client.functions.invoke('relworx-initiate-payment',{body:{order_id:orderId,msisdn}});if(error)throw new Error(data?.error||error.message||'Payment request failed.');if(data?.error)throw new Error(data.error);return data;}
  async paymentStatus(orderId:string){const u=await this.currentUser();if(!u)return null;const {data,error}=await this.client.from('payments').select('status,customer_reference,amount_ugx,created_at').eq('order_id',orderId).eq('customer_id',u.id).order('created_at',{ascending:false}).limit(1).maybeSingle();if(error)throw error;return data;}
  async myOrders(){
    const u=await this.currentUser();if(!u)return [];
    const {data,error}=await this.client.from('orders').select('id,order_number,status,total_ugx,currency,placed_at,created_at').eq('customer_id',u.id).order('created_at',{ascending:false});
    if(error)throw error;return data??[];
  }

  async saveDesign(productId:string,name:string,designData:any){
    const user=await this.currentUser();if(!user)throw new Error('Sign in first.');
    const {data,error}=await this.client.from('custom_designs').insert({user_id:user.id,product_id:productId,name,design_data:designData,status:'draft'}).select('id').single();
    if(error)throw error;return data.id as string;
  }
  async uploadDesign(file:File,userId:string){
    const ext=(file.name.split('.').pop()||'png').toLowerCase().replace(/[^a-z0-9]/g,'');
    const path=`${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const {error}=await this.client.storage.from('customer-designs').upload(path,file,{contentType:file.type,upsert:false});
    if(error)throw error;return path;
  }
  async favorites(){const u=await this.currentUser();if(!u)return [];const {data,error}=await this.client.from('favorites').select('product_id,products(id,name,base_price_ugx,product_images(storage_path,is_primary))').eq('user_id',u.id);if(error)throw error;return data??[];}
  async toggleFavorite(productId:string){const u=await this.currentUser();if(!u)throw new Error('Sign in first.');const {data,error}=await this.client.from('favorites').select('product_id').eq('user_id',u.id).eq('product_id',productId).maybeSingle();if(error)throw error;if(data){const r=await this.client.from('favorites').delete().eq('user_id',u.id).eq('product_id',productId);if(r.error)throw r.error;return false;}const r=await this.client.from('favorites').insert({user_id:u.id,product_id:productId});if(r.error)throw r.error;return true;}
  async myNotifications(){const u=await this.currentUser();if(!u)return [];const {data,error}=await this.client.from('notifications').select('id,title,body,data,read_at,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(50);if(error)throw error;return data??[];}
  async markNotificationRead(id:string){const {error}=await this.client.from('notifications').update({read_at:new Date().toISOString()}).eq('id',id);if(error)throw error;}
  imageUrl(path:string){return this.client.storage.from('product-images').getPublicUrl(path).data.publicUrl;}

  async enablePush(){
    if(!Capacitor.isNativePlatform()) return 'Push notifications are available in the Android app.';
    const user=await this.currentUser(); if(!user)return 'Sign in to enable notifications.';
    const permission=await PushNotifications.checkPermissions();
    const result=permission.receive==='granted'?permission:await PushNotifications.requestPermissions();
    if(result.receive!=='granted')return 'Notification permission was not granted.';
    await PushNotifications.addListener('registration',async (token:Token)=>{
      const {data:existing}=await this.client.from('device_tokens').select('id').eq('fcm_token',token.value).maybeSingle();
      if(existing?.id){
        await this.client.from('device_tokens').update({user_id:user.id,platform:'android',is_active:true,last_seen_at:new Date().toISOString()}).eq('id',existing.id);
      }else{
        await this.client.from('device_tokens').insert({user_id:user.id,fcm_token:token.value,platform:'android',device_label:'ElevenX Customer Android',is_active:true,last_seen_at:new Date().toISOString()});
      }
    });
    await PushNotifications.addListener('registrationError',(err)=>console.error('FCM registration failed',err));
    await PushNotifications.register();
    return 'Notification registration started on this device.';
  }
}
