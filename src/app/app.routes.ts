import { Routes } from '@angular/router';
import { StorePage } from './pages/store.page';
import { AuthPage } from './pages/auth.page';
import { CartPage } from './pages/cart.page';
import { OrdersPage } from './pages/orders.page';
import { AccountPage } from './pages/account.page';
import { StudioPage } from './pages/studio.page';
import { PaymentPage } from './pages/payment.page';

export const routes: Routes = [
  { path: '', component: StorePage },
  { path: 'login', component: AuthPage },
  { path: 'cart', component: CartPage },
  { path: 'orders', component: OrdersPage },
  { path: 'account', component: AccountPage },
  { path: 'studio', component: StudioPage },
  { path: 'payment/:orderId', component: PaymentPage },
  { path: '**', redirectTo: '' }
];
