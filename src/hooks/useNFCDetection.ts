import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '@/config/api';

interface NFCEvent {
  uid: string;
  event: string;
  timestamp: string;
  deviceId?: string;
  processed: boolean;
}

interface NFCDetectionResponse {
  success: boolean;
  count: number;
  data: NFCEvent[];
}

interface UseNFCDetectionOptions {
  pollInterval?: number; // in milliseconds, default 1000ms (1 second)
  serverUrl?: string; // default from API_CONFIG
  enabled?: boolean; // default true
  onNFCDetected?: (event: NFCEvent) => void; // callback when NFC is detected
}

interface UseNFCDetectionReturn {
  nfcEvent: NFCEvent | null;
  isDetecting: boolean;
  isError: boolean;
  error: string | null;
  markAsProcessed: (uid: string, timestamp: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNFCDetection(options: UseNFCDetectionOptions = {}): UseNFCDetectionReturn {
  const {
    pollInterval = 1000, // Check every second
    serverUrl = API_CONFIG.SERVER_URL,
    enabled = true,
    onNFCDetected,
  } = options;

  const [nfcEvent, setNfcEvent] = useState<NFCEvent | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState<string | null>(null);

  const fetchNFCEvents = useCallback(async () => {
    try {
      // Fetch unprocessed NFC events
      const response = await fetch(`${serverUrl}/nfc?unprocessed=true&limit=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data: NFCDetectionResponse = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const latestEvent = data.data[data.data.length - 1];
        
        // Only trigger if this is a new event (different timestamp)
        if (latestEvent.timestamp !== lastProcessedTimestamp) {
          setNfcEvent(latestEvent);
          setIsError(false);
          setError(null);
          
          // Call the callback if provided
          if (onNFCDetected) {
            onNFCDetected(latestEvent);
          }
        }
      } else {
        // No new NFC events
        // Don't clear the current event, just don't update
      }

      setIsDetecting(false);
    } catch (err) {
      console.error('Error fetching NFC events:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Failed to fetch NFC events');
      setIsDetecting(false);
    }
  }, [serverUrl, lastProcessedTimestamp, onNFCDetected]);

  const markAsProcessed = useCallback(async (uid: string, timestamp: string) => {
    try {
      const response = await fetch(`${serverUrl}/nfc/mark-processed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ uid, timestamp }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark event as processed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setLastProcessedTimestamp(timestamp);
        // Clear the current event after marking as processed
        setNfcEvent(null);
      }
    } catch (err) {
      console.error('Error marking NFC event as processed:', err);
      throw err;
    }
  }, [serverUrl]);

  const refetch = useCallback(async () => {
    setIsDetecting(true);
    await fetchNFCEvents();
  }, [fetchNFCEvents]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      refetch();
    }
  }, [enabled, refetch]);

  // Polling mechanism
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      fetchNFCEvents();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [enabled, pollInterval, fetchNFCEvents]);

  return {
    nfcEvent,
    isDetecting,
    isError,
    error,
    markAsProcessed,
    refetch,
  };
}

