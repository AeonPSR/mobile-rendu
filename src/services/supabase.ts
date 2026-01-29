import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Config } from '@/utils/config';
import * as SecureStore from 'expo-secure-store';

// Supabase client singleton
class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient;

  private constructor() {
    this.client = createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY, {
      auth: {
        storage: {
          getItem: async (key: string) => {
            return await SecureStore.getItemAsync(key);
          },
          setItem: async (key: string, value: string) => {
            await SecureStore.setItemAsync(key, value);
          },
          removeItem: async (key: string) => {
            await SecureStore.deleteItemAsync(key);
          },
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient(): SupabaseClient {
    return this.client;
  }

  // Authentication methods
  async signUp(email: string, password: string, firstName?: string, lastName?: string) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.client.auth.getUser();
    return { user, error };
  }

  async getCurrentSession() {
    const { data: { session }, error } = await this.client.auth.getSession();
    return { session, error };
  }

  // Database operations
  async query(table: string) {
    return this.client.from(table);
  }

  // Real-time subscriptions
  subscribe(table: string, callback: (payload: any) => void) {
    return this.client
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  }

  // File upload (for receipt images)
  async uploadFile(bucket: string, path: string, file: File | Blob) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  }

  async getFileUrl(bucket: string, path: string) {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }
}

export default SupabaseService.getInstance();