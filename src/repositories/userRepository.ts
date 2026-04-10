// Simple user repository - uses Supabase as a database, NOT as auth service
import { User, ApiResponse } from '@/models';
import SupabaseService from '@/services/supabase';
import LocalStorage from './localStorage';

export class UserRepository {
  private static instance: UserRepository;
  private readonly USER_KEY = 'current_user';
  private readonly TABLE_NAME = 'users';

  private constructor() {}

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  /**
   * Create a new user (sign up) - just inserts into database
   */
  async createUser(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<ApiResponse<User>> {
    try {
      const client = SupabaseService.getClient();
      
      // Check if user already exists
      const { data: existingUser } = await client
        .from(this.TABLE_NAME)
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Create new user - storing password as plain text for demo
      // In production, you'd hash it!
      const newUser = {
        email,
        password, // Demo only - should be hashed in production
        first_name: firstName,
        last_name: lastName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await client
        .from(this.TABLE_NAME)
        .insert(newUser)
        .select()
        .single();

      if (error) {
        console.warn('Supabase error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const user: User = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      // Store locally
      await LocalStorage.setItem(this.USER_KEY, user);

      return {
        success: true,
        data: user,
        message: 'Account created successfully',
      };
    } catch (error) {
      console.warn('Error creating user:', error);
      return {
        success: false,
        error: 'Failed to create account',
      };
    }
  }

  /**
   * Sign in - just checks email/password in database
   */
  async signIn(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const client = SupabaseService.getClient();

      const { data, error } = await client
        .from(this.TABLE_NAME)
        .select('*')
        .eq('email', email)
        .eq('password', password) // Demo only - should compare hashed passwords
        .single();

      if (error || !data) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      const user: User = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      // Store locally
      await LocalStorage.setItem(this.USER_KEY, user);

      return {
        success: true,
        data: user,
        message: 'Signed in successfully',
      };
    } catch (error) {
      console.warn('Error signing in:', error);
      return {
        success: false,
        error: 'Failed to sign in',
      };
    }
  }

  /**
   * Sign out - just clears local storage
   */
  async signOut(): Promise<ApiResponse<void>> {
    await LocalStorage.removeItem(this.USER_KEY);
    return {
      success: true,
      message: 'Signed out successfully',
    };
  }

  /**
   * Get current user from local storage
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const user = await LocalStorage.getItem<User>(this.USER_KEY);
    
    if (user) {
      return {
        success: true,
        data: user,
      };
    }

    return {
      success: false,
      error: 'No user logged in',
    };
  }

  /**
   * Check if user is authenticated (has local session)
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await LocalStorage.getItem<User>(this.USER_KEY);
    return !!user;
  }
}

export default UserRepository.getInstance();
