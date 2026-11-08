import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabasePublishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });

  async currentUser(): Promise<User | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error && error.name !== 'AuthSessionMissingError') throw error;
    return data.user;
  }

  async signIn(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string, fullName: string, phone: string) {
    return this.client.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone } }
    });
  }

  async signOut() { return this.client.auth.signOut(); }
}
