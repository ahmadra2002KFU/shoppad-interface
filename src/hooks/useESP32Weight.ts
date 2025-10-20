import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '@/config/api';

interface WeightData {
  weight: number;
  timestamp: string;
  deviceId?: string;
}

interface WeightStats {
  count: number;
  average: number;
  min: number;
  max: number;
  latest: number;
}

interface UseESP32WeightOptions {
  pollInterval?: number; // in milliseconds, default from API_CONFIG
  serverUrl?: string; // default from API_CONFIG
  enabled?: boolean; // default from API_CONFIG
}

interface UseESP32WeightReturn {
  weight: number | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  lastUpdated: Date | null;
  stats: WeightStats | null;
  refetch: () => Promise<void>;
}

export function useESP32Weight(options: UseESP32WeightOptions = {}): UseESP32WeightReturn {
  const {
    pollInterval = API_CONFIG.POLL_INTERVAL,
    serverUrl = API_CONFIG.SERVER_URL,
    enabled = API_CONFIG.ENABLED,
  } = options;

  const [weight, setWeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stats, setStats] = useState<WeightStats | null>(null);

  const fetchWeight = useCallback(async () => {
    try {
      // Fetch the latest weight reading
      const response = await fetch(`${serverUrl}/logs?limit=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Allow self-signed certificates in development
        // Note: In production, use proper SSL certificates
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const latestReading: WeightData = data.data[0];
        setWeight(latestReading.weight);
        setLastUpdated(new Date(latestReading.timestamp));
        setIsError(false);
        setError(null);
      } else {
        // No data available yet
        setWeight(0);
        setIsError(false);
        setError(null);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching ESP32 weight data:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Failed to fetch weight data');
      setIsLoading(false);
    }
  }, [serverUrl]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${serverUrl}/stats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      // Stats are optional, don't set error state
      console.warn('Could not fetch weight statistics:', err);
    }
  }, [serverUrl]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchWeight();
    await fetchStats();
  }, [fetchWeight, fetchStats]);

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
      fetchWeight();
      // Fetch stats less frequently (every 5th poll)
      if (Math.random() < 0.2) {
        fetchStats();
      }
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [enabled, pollInterval, fetchWeight, fetchStats]);

  return {
    weight,
    isLoading,
    isError,
    error,
    lastUpdated,
    stats,
    refetch,
  };
}

