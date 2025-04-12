import dbService from './indexedDBService';

/**
 * For TypeScript - define the experimental SyncManager interface
 */
interface SyncManager {
  register(tag: string): Promise<void>;
}

/**
 * For TypeScript - extend the ServiceWorkerRegistration interface
 */
interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync?: SyncManager;
}

/**
 * Class for handling data synchronization between local storage and backend
 */
class SyncService {
  private networkStatus: boolean;
  private syncInProgress: boolean;

  constructor() {
    this.networkStatus = navigator.onLine;
    this.syncInProgress = false;
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for online/offline status changes
   */
  private setupEventListeners() {
    // Listen for online status changes
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Register for sync events when service worker is active
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // Use type assertion for the experimental sync API
        const extendedRegistration = registration as ExtendedServiceWorkerRegistration;
        if (extendedRegistration.sync) {
          // Register for background sync when app comes online
          extendedRegistration.sync.register('sync-data').catch(err => {
            console.error('Failed to register sync tag:', err);
          });
        }
      }).catch(err => {
        console.error('Failed to register sync:', err);
      });
    }
  }

  /**
   * Handle the device coming online
   */
  private handleOnline() {
    console.log('Device is online. Starting sync...');
    this.networkStatus = true;
    this.syncData();
  }

  /**
   * Handle the device going offline
   */
  private handleOffline() {
    console.log('Device is offline. Sync paused.');
    this.networkStatus = false;
  }

  /**
   * Check if the device is currently online
   */
  public isOnline(): boolean {
    return this.networkStatus;
  }

  /**
   * Add a data change to the sync queue
   */
  public async queueChange(
    entityType: 'profile' | 'practiceSession' | 'end' | 'shot' | 'equipment',
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    await dbService.addToSyncQueue(entityType, entityId, operation, data);
    
    // Try to sync immediately if online
    if (this.networkStatus && !this.syncInProgress) {
      this.syncData();
    }
  }

  /**
   * Synchronize all pending changes with the backend
   */
  public async syncData(): Promise<void> {
    // Prevent multiple syncs from running simultaneously
    if (this.syncInProgress || !this.networkStatus) {
      return;
    }

    this.syncInProgress = true;

    try {
      // Get all pending items from the sync queue
      const pendingItems = await dbService.getPendingSyncItems();
      
      if (pendingItems.length === 0) {
        console.log('No pending items to sync');
        this.syncInProgress = false;
        return;
      }

      console.log(`Found ${pendingItems.length} items to sync`);

      // Process each item in order
      for (const item of pendingItems) {
        try {
          // In a real implementation, we would call specific API endpoints based on
          // entity type and operation, but for now we'll just simulate successful sync
          console.log(`Syncing item: ${item.entityType} - ${item.operation}`, item.data);
          
          // Simulated API call success
          // In production, this would be:
          // const response = await apiClient.sync(item.entityType, item.operation, item.data);

          // On successful sync, remove the item from the queue
          await dbService.removeSyncItem(item.id);
          
          // Update the entity's sync status
          if (item.entityType !== 'profile') {
            const storeMap: Record<string, string> = {
              'practiceSession': 'practiceSessions',
              'end': 'ends',
              'shot': 'shots',
              'equipment': 'equipment'
            };
            
            const storeName = storeMap[item.entityType];
            if (storeName && item.operation !== 'delete') {
              const entity = await dbService.get(storeName as any, item.entityId);
              if (entity) {
                await dbService.put(storeName as any, {
                  ...entity,
                  syncStatus: 'synced',
                  updatedAt: new Date().toISOString()
                });
              }
            }
          }
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          // Update the sync attempt count
          await dbService.put('syncQueue', {
            ...item,
            attempts: item.attempts + 1,
            lastAttempt: new Date().toISOString()
          });
          
          // Items that fail too many times could be handled differently
          // For now, we just continue with the next item
        }
      }
    } catch (error) {
      console.error('Error during sync process:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Manually trigger a sync operation
   */
  public async forceSyncData(): Promise<void> {
    if (this.networkStatus) {
      return this.syncData();
    } else {
      console.warn('Cannot force sync while offline');
    }
  }
}

// Export a singleton instance
const syncService = new SyncService();
export default syncService;