import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

let GoogleSignin: any = null;

try {
  // Only try to import on native platforms
  if (Platform.OS !== 'web') {
    const GoogleSignInModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleSignInModule.GoogleSignin;
  }
} catch (e: any) {
  // Silently fail - Google Sign-In not available in Expo Go
  // Email fallback will be used instead
  GoogleSignin = null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export class AuthManager {
  private static isInitialized = false;

  /**
   * Check if Google Sign-In is available
   */
  private static isGoogleSignInAvailable(): boolean {
    return GoogleSignin !== null;
  }

  /**
   * Initialize Google Sign-In
   */
  static async initialize() {
    if (this.isInitialized) return;

    if (!this.isGoogleSignInAvailable()) {
      console.warn('⚠️ Google Sign-In not available, skipping initialization');
      this.isInitialized = true;
      return;
    }

    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
      this.isInitialized = true;
      console.log('✅ Google Sign-In initialized');
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      // Don't throw - allow app to continue
      this.isInitialized = true;
    }
  }

  /**
   * Sign in with Google
   */
  static async signInWithGoogle(): Promise<User & AuthToken> {
    if (!this.isGoogleSignInAvailable()) {
      throw new Error('Google Sign-In không khả dụng trên nền tảng này. Sử dụng email để đăng nhập thay thế.');
    }

    try {
      console.log('🔐 Attempting Google Sign-In...');
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.user) {
        throw new Error('Failed to get user info from Google');
      }

      const user: User = {
        id: userInfo.data.user.id,
        email: userInfo.data.user.email || '',
        name: userInfo.data.user.name || '',
        photo: userInfo.data.user.photo || undefined,
      };

      const token: AuthToken = {
        accessToken: userInfo.data.idToken || '',
        expiresAt: Date.now() + 3600000, // 1 hour expiry
      };

      // Save user data and token to secure storage
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, JSON.stringify(token));

      console.log('✅ User signed in:', user.email);
      return { ...user, ...token };
    } catch (error: any) {
      console.error('Error signing in with Google:', error?.message || String(error));
      throw error;
    }
  }

  /**
   * Sign in with email (fallback/guest authentication)
   */
  static async signInWithEmail(email: string): Promise<User & AuthToken> {
    try {
      const user: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        photo: undefined,
      };

      const token: AuthToken = {
        accessToken: Math.random().toString(36).substring(7),
        expiresAt: Date.now() + 86400000, // 24 hour expiry
      };

      // Save user data and token to secure storage
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, JSON.stringify(token));

      console.log('✅ User signed in with email:', user.email);
      return { ...user, ...token };
    } catch (error: any) {
      console.error('Error signing in with email:', error?.message || String(error));
      throw error;
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    try {
      if (this.isGoogleSignInAvailable()) {
        await GoogleSignin.signOut();
      }
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      console.log('✅ User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      if (this.isGoogleSignInAvailable()) {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (!currentUser) return null;
      }

      const userDataJson = await SecureStore.getItemAsync(USER_DATA_KEY);
      if (!userDataJson) return null;

      const user = JSON.parse(userDataJson) as User;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get auth token
   */
  static async getAuthToken(): Promise<AuthToken | null> {
    try {
      const tokenJson = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (!tokenJson) return null;

      const token = JSON.parse(tokenJson) as AuthToken;

      // Check if token is expired
      if (token.expiresAt < Date.now()) {
        await this.refreshToken();
        return this.getAuthToken();
      }

      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Refresh auth token
   */
  static async refreshToken(): Promise<AuthToken | null> {
    try {
      const tokens = await GoogleSignin.getTokens();
      if (!tokens) return null;

      const token: AuthToken = {
        accessToken: tokens.idToken || '',
        expiresAt: Date.now() + 3600000,
      };

      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, JSON.stringify(token));
      console.log('✅ Token refreshed');
      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      if (this.isGoogleSignInAvailable()) {
        const currentUser = await GoogleSignin.getCurrentUser();
        return currentUser !== null && currentUser !== undefined;
      }
      // If not available, check local storage
      const userDataJson = await SecureStore.getItemAsync(USER_DATA_KEY);
      return userDataJson !== null;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Clear all auth data
   */
  static async clearAuthData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      console.log('✅ Auth data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
}
