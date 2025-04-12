import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * Define the database schema for IndexedDB
 */
interface ArrowTrackerDB extends DBSchema {
  // Profile information
  profile: {
    key: string;
    value: {
      id: string;
      displayName: string;
      email: string;
      skillLevel: string;
      profileImageUrl?: string;
      lastSyncedAt: string;
    };
  };
  // Practice sessions
  practiceSessions: {
    key: string;
    value: {
      id: string;
      archerId: string;
      date: string;
      location: string;
      weather: {
        temperature?: number;
        windSpeed?: number;
        windDirection?: string;
        conditions?: string;
      };
      notes: string;
      equipmentId: string;
      syncStatus: 'pending' | 'synced' | 'error';
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-archer': string; 'by-date': string; 'by-sync-status': string };
  };
  // Ends (groups of shots)
  ends: {
    key: string;
    value: {
      id: string;
      sessionId: string;
      sequenceNumber: number;
      targetType: string;
      distance: number;
      distanceUnit: 'meters' | 'yards';
      syncStatus: 'pending' | 'synced' | 'error';
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-session': string; 'by-sync-status': string };
  };
  // Individual arrow shots
  shots: {
    key: string;
    value: {
      id: string;
      endId: string;
      sequenceNumber: number;
      score: number;
      xPosition: number;
      yPosition: number;
      notes: string;
      syncStatus: 'pending' | 'synced' | 'error';
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-end': string; 'by-sync-status': string };
  };
  // Equipment tracking
  equipment: {
    key: string;
    value: {
      id: string;
      archerId: string;
      name: string;
      type: 'recurve' | 'compound' | 'traditional' | 'other';
      details: {
        bowDetails?: {
          brand?: string;
          model?: string;
          limbType?: string;
          poundage?: number;
        };
        arrowDetails?: {
          brand?: string;
          model?: string;
          length?: number;
          material?: string;
          spine?: number;
        };
      };
      isActive: boolean;
      syncStatus: 'pending' | 'synced' | 'error';
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-archer': string; 'by-type': string; 'by-sync-status': string };
  };
  // Sync queue for tracking pending changes
  syncQueue: {
    key: string;
    value: {
      id: string;
      entityType: 'profile' | 'practiceSession' | 'end' | 'shot' | 'equipment';
      entityId: string;
      operation: 'create' | 'update' | 'delete';
      data: any;
      attempts: number;
      lastAttempt?: string;
      createdAt: string;
    };
    indexes: { 'by-entity-type': string; 'by-operation': string };
  };
}

/**
 * Database version number - increment when schema changes
 */
const DB_VERSION = 1;

/**
 * Database name
 */
const DB_NAME = 'arrow-tracker-db';

/**
 * Class for handling IndexedDB operations
 */
class IndexedDBService {
  private db: Promise<IDBPDatabase<ArrowTrackerDB>>;

  constructor() {
    this.db = this.initDB();
  }

  /**
   * Initialize the database
   */
  private async initDB(): Promise<IDBPDatabase<ArrowTrackerDB>> {
    return openDB<ArrowTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create object stores with indexes
        
        // Profile store
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile');
        }
        
        // Practice sessions store
        if (!db.objectStoreNames.contains('practiceSessions')) {
          const sessionStore = db.createObjectStore('practiceSessions', { keyPath: 'id' });
          sessionStore.createIndex('by-archer', 'archerId');
          sessionStore.createIndex('by-date', 'date');
          sessionStore.createIndex('by-sync-status', 'syncStatus');
        }
        
        // Ends store
        if (!db.objectStoreNames.contains('ends')) {
          const endsStore = db.createObjectStore('ends', { keyPath: 'id' });
          endsStore.createIndex('by-session', 'sessionId');
          endsStore.createIndex('by-sync-status', 'syncStatus');
        }
        
        // Shots store
        if (!db.objectStoreNames.contains('shots')) {
          const shotsStore = db.createObjectStore('shots', { keyPath: 'id' });
          shotsStore.createIndex('by-end', 'endId');
          shotsStore.createIndex('by-sync-status', 'syncStatus');
        }
        
        // Equipment store
        if (!db.objectStoreNames.contains('equipment')) {
          const equipmentStore = db.createObjectStore('equipment', { keyPath: 'id' });
          equipmentStore.createIndex('by-archer', 'archerId');
          equipmentStore.createIndex('by-type', 'type');
          equipmentStore.createIndex('by-sync-status', 'syncStatus');
        }
        
        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncQueueStore.createIndex('by-entity-type', 'entityType');
          syncQueueStore.createIndex('by-operation', 'operation');
        }
      },
    });
  }

  /**
   * Get an item from a store by its key
   */
  async get<T extends keyof ArrowTrackerDB>(
    storeName: T,
    key: string
  ): Promise<ArrowTrackerDB[T]['value'] | undefined> {
    // Using type assertion to satisfy TypeScript
    // This is safe because we're constraining T to be a valid store name
    return (await this.db).get(storeName as any, key);
  }

  /**
   * Get all items from a store
   */
  async getAll<T extends keyof ArrowTrackerDB>(
    storeName: T
  ): Promise<ArrowTrackerDB[T]['value'][]> {
    return (await this.db).getAll(storeName as any);
  }

  /**
   * Put an item into a store
   */
  async put<T extends keyof ArrowTrackerDB>(
    storeName: T,
    value: ArrowTrackerDB[T]['value']
  ): Promise<IDBValidKey> {
    return (await this.db).put(storeName as any, value);
  }

  /**
   * Delete an item from a store
   */
  async delete<T extends keyof ArrowTrackerDB>(
    storeName: T,
    key: string
  ): Promise<void> {
    return (await this.db).delete(storeName as any, key);
  }

  /**
   * Query items using an index
   */
  async getByIndex<T extends keyof ArrowTrackerDB>(
    storeName: T,
    indexName: string,
    key: any
  ): Promise<ArrowTrackerDB[T]['value'][]> {
    // Using the most permissive type casting approach
    const db = await this.db;
    // @ts-ignore - TypeScript doesn't handle dynamic index names well
    return db.getAllFromIndex(storeName as any, indexName, key);
  }

  /**
   * Add an item to the sync queue
   */
  async addToSyncQueue(
    entityType: 'profile' | 'practiceSession' | 'end' | 'shot' | 'equipment',
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<IDBValidKey> {
    const syncItem = {
      id: `${entityType}-${entityId}-${Date.now()}`,
      entityType,
      entityId,
      operation,
      data,
      attempts: 0,
      createdAt: new Date().toISOString(),
    };
    return (await this.db).put('syncQueue', syncItem);
  }

  /**
   * Get all pending sync items
   */
  async getPendingSyncItems(): Promise<ArrowTrackerDB['syncQueue']['value'][]> {
    return (await this.db).getAll('syncQueue');
  }

  /**
   * Remove an item from the sync queue
   */
  async removeSyncItem(id: string): Promise<void> {
    return (await this.db).delete('syncQueue', id);
  }
}

// Export a singleton instance
const dbService = new IndexedDBService();
export default dbService;