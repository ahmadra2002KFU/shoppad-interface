import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '@/config/api';

interface NFCEvent {
  uid: string;
  event: string;
  timestamp: string;
  deviceId?: string;
  processed: boolean;
  // Payment-specific fields
  transactionId?: string;
  userName?: string;
  total?: number;
}

interface NFCDetectionResponse {
  success: boolean;
  count: number;
  data: NFCEvent[];
}

// Payment event types
export type NFCPaymentEventType = 'nfc_detected' | 'payment_success' | 'payment_failed';

interface UseNFCDetectionOptions {
  pollInterval?: number; // in milliseconds, default 1000ms (1 second)
  serverUrl?: string; // default from API_CONFIG
  enabled?: boolean; // default true
  onNFCDetected?: (event: NFCEvent) => void; // callback when NFC is detected
  onPaymentSuccess?: (event: NFCEvent) => void; // callback when NFC auto-payment succeeds
  onPaymentFailed?: (event: NFCEvent) => void; // callback when NFC auto-payment fails
}

interface UseNFCDetectionReturn {
  nfcEvent: NFCEvent | null;
  isDetecting: boolean;
  isError: boolean;
  error: string | null;
  lastPaymentEvent: NFCEvent | null; // Last payment event (success or failure)
  markAsProcessed: (uid: string, timestamp: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNFCDetection(options: UseNFCDetectionOptions = {}): UseNFCDetectionReturn {
  const {
    pollInterval = 1000, // Check every second
    serverUrl = API_CONFIG.SERVER_URL,
    enabled = true,
    onNFCDetected,
    onPaymentSuccess,
    onPaymentFailed,
  } = options;

  const [nfcEvent, setNfcEvent] = useState<NFCEvent | null>(null);
  const [lastPaymentEvent, setLastPaymentEvent] = useState<NFCEvent | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState<string | null>(null);

  const fetchNFCEvents = useCallback(async () => {
    try {
      // Fetch unprocessed NFC events
      const response = await fetch(`${serverUrl}/nfc?unprocessed=true&limit=5`, {
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
        // Process all unprocessed events
        for (const event of data.data) {
          // Only trigger if this is a new event (different timestamp)
          if (event.timestamp !== lastProcessedTimestamp) {
            // Handle different event types
            switch (event.event) {
              case 'payment_success':
                setLastPaymentEvent(event);
                if (onPaymentSuccess) {
                  onPaymentSuccess(event);
                }
                break;

              case 'payment_failed':
                setLastPaymentEvent(event);
                if (onPaymentFailed) {
                  onPaymentFailed(event);
                }
                break;

              case 'nfc_detected':
              default:
                setNfcEvent(event);
                if (onNFCDetected) {
                  onNFCDetected(event);
                }
                break;
            }

            setIsError(false);
            setError(null);
          }
        }
      }

      setIsDetecting(false);
    } catch (err) {
      console.error('Error fetching NFC events:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Failed to fetch NFC events');
      setIsDetecting(false);
    }
  }, [serverUrl, lastProcessedTimestamp, onNFCDetected, onPaymentSuccess, onPaymentFailed]);

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
    lastPaymentEvent,
    markAsProcessed,
    refetch,
  };
}

// Export the NFCEvent type for use in other components
export type { NFCEvent };

