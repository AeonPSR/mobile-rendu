import AsyncStorage from '@react-native-async-storage/async-storage';
import { ILocalStorage } from './interfaces';

export class LocalStorageService implements ILocalStorage {
  private static instance: LocalStorageService;

  private constructor() {}

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  // Utility methods for common operations
  async appendToArray<T>(key: string, item: T): Promise<void> {
    const existingArray = await this.getItem<T[]>(key) || [];
    existingArray.push(item);
    await this.setItem(key, existingArray);
  }

  async removeFromArray<T>(key: string, predicate: (item: T) => boolean): Promise<void> {
    const existingArray = await this.getItem<T[]>(key) || [];
    const filteredArray = existingArray.filter(item => !predicate(item));
    await this.setItem(key, filteredArray);
  }

  async updateInArray<T>(key: string, predicate: (item: T) => boolean, updater: (item: T) => T): Promise<void> {
    const existingArray = await this.getItem<T[]>(key) || [];
    const updatedArray = existingArray.map(item => predicate(item) ? updater(item) : item);
    await this.setItem(key, updatedArray);
  }
}

export default LocalStorageService.getInstance();