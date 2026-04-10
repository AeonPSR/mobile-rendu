// DEAD CODE - Auth is handled directly via UserRepository (Supabase as DB, not auth service).
// This file used Supabase Auth but was abandoned due to rate limiting.
// Kept for reference only.

/*
import { User, ApiResponse } from '@/models';
import { IAuthRepository } from './interfaces';
import SupabaseService from '@/services/supabase';
import LocalStorage from './localStorage';

export class AuthRepository implements IAuthRepository {
  private static instance: AuthRepository;
  private readonly USER_KEY = 'current_user';
  private readonly AUTH_TOKEN_KEY = 'auth_token';

  private constructor() {}

  public static getInstance(): AuthRepository {
    if (!AuthRepository.instance) {
      AuthRepository.instance = new AuthRepository();
    }
    return AuthRepository.instance;
  }

  async signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await SupabaseService.signUp(email, password, firstName, lastName);
      
      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Store user data locally
      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          firstName,
          lastName,
          createdAt: new Date(data.user.created_at!),
          updatedAt: new Date(),
        };
        
        await LocalStorage.setItem(this.USER_KEY, user);
        
        if (data.session) {
          await LocalStorage.setItem(this.AUTH_TOKEN_KEY, data.session.access_token);
        }
      }

      return {
        success: true,
        data: data.user,
        message: 'Account created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create account',
      };
    }
  }

  async signIn(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await SupabaseService.signIn(email, password);
      
      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Store user data locally
      if (data.user && data.session) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          firstName: data.user.user_metadata?.first_name,
          lastName: data.user.user_metadata?.last_name,
          createdAt: new Date(data.user.created_at!),
          updatedAt: new Date(),
        };
        
        await LocalStorage.setItem(this.USER_KEY, user);
        await LocalStorage.setItem(this.AUTH_TOKEN_KEY, data.session.access_token);
      }

      return {
        success: true,
        data: data.user,
        message: 'Signed in successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to sign in',
      };
    }
  }

  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await SupabaseService.signOut();
      
      // Clear local storage regardless of API result
      await LocalStorage.removeItem(this.USER_KEY);
      await LocalStorage.removeItem(this.AUTH_TOKEN_KEY);
      
      if (error) {
        console.warn('Error signing out from Supabase:', error.message);
        // Still return success since local data is cleared
      }

      return {
        success: true,
        message: 'Signed out successfully',
      };
    } catch (error) {
      // Clear local storage even if API call fails
      await LocalStorage.removeItem(this.USER_KEY);
      await LocalStorage.removeItem(this.AUTH_TOKEN_KEY);
      
      return {
        success: true,
        message: 'Signed out locally',
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      // First try local storage for offline capability
      const localUser = await LocalStorage.getItem<User>(this.USER_KEY);
      
      if (localUser) {
        // Also try to refresh from server if online
        try {
          const { user, error } = await SupabaseService.getCurrentUser();
          if (user && !error) {
            const updatedUser: User = {
              id: user.id,
              email: user.email!,
              firstName: user.user_metadata?.first_name,
              lastName: user.user_metadata?.last_name,
              createdAt: new Date(user.created_at!),
              updatedAt: new Date(),
            };
            
            await LocalStorage.setItem(this.USER_KEY, updatedUser);
            return {
              success: true,
              data: updatedUser,
            };
          }
        } catch (networkError) {
          // Network error - return local data
          console.warn('Network error, using local user data');
        }
        
        return {
          success: true,
          data: localUser,
        };
      }

      // No local user, try server
      const { user, error } = await SupabaseService.getCurrentUser();
      
      if (error || !user) {
        return {
          success: false,
          error: 'No authenticated user',
        };
      }

      const userData: User = {
        id: user.id,
        email: user.email!,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        createdAt: new Date(user.created_at!),
        updatedAt: new Date(),
      };
      
      await LocalStorage.setItem(this.USER_KEY, userData);
      
      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get current user',
      };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      // Check local storage first
      const localUser = await LocalStorage.getItem<User>(this.USER_KEY);
      const token = await LocalStorage.getItem<string>(this.AUTH_TOKEN_KEY);
      
      if (!localUser || !token) {
        return false;
      }

      // Verify with server if online
      try {
        const { session } = await SupabaseService.getCurrentSession();
        return !!session;
      } catch (networkError) {
        // If offline, trust local data
        return true;
      }
    } catch (error) {
      return false;
    }
  }
}

export default AuthRepository.getInstance();
*/