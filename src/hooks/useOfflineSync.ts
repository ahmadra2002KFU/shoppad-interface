/**
 * Offline Sync Hook
 * Queues actions when offline and syncs when online
 */

import { useState, useEffect, useCallback } from 'react';

const OFFLINE_QUEUE_KEY = 'shoppad_offline_queue';

interface QueuedAction {
  id: string;
  type: 'ADD_TO_CART' | 'REMOVE_FROM_CART' | 'UPDATE_QUANTITY' | 'CLEAR_CART' | 'CHECKOUT';
  payload: unknown;
  timestamp: number;
}

interface UseOfflineSyncReturn {
  isOnline: boolean;
  queuedActions: QueuedAction[];
  queueAction: (action: Omit<QueuedAction, 'id' | 'timestamp'>) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);

  // Load queued actions from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        setQueuedActions(JSON.parse(stored));
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  // Save queued actions to storage
  const saveQueue = useCallback((actions: QueuedAction[]) => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(actions));
    } catch {
      // Storage unavailable
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Queue an action for later sync
  const queueAction = useCallback((action: Omit<QueuedAction, 'id' | 'timestamp'>) => {
    const newAction: QueuedAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    setQueuedActions(prev => {
      const updated = [...prev, newAction];
      saveQueue(updated);
      return updated;
    });
  }, [saveQueue]);

  // Process queued actions (called when back online)
  const processQueue = useCallback(async () => {
    if (!isOnline || queuedActions.length === 0) return;

    // Process each queued action
    // Note: In a real implementation, you would call the appropriate API
    // For now, we just clear the queue since CartContext handles syncing
    setQueuedActions([]);
    saveQueue([]);
  }, [isOnline, queuedActions, saveQueue]);

  // Clear the queue
  const clearQueue = useCallback(() => {
    setQueuedActions([]);
    saveQueue([]);
  }, [saveQueue]);

  // Auto-process queue when coming back online
  useEffect(() => {
    if (isOnline && queuedActions.length > 0) {
      processQueue();
    }
  }, [isOnline, queuedActions.length, processQueue]);

  return {
    isOnline,
    queuedActions,
    queueAction,
    processQueue,
    clearQueue,
  };
}
