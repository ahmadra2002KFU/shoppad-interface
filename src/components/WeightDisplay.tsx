import { Scale, Wifi, WifiOff, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useESP32Weight } from "@/hooks/useESP32Weight";
import { Badge } from "@/components/ui/badge";

interface WeightDisplayProps {
  calculatedWeight?: number; // Optional: show calculated weight for comparison
}

export function WeightDisplay({ calculatedWeight }: WeightDisplayProps) {
  const { t } = useLanguage();
  const { weight, isLoading, isError, error, lastUpdated, refetch } = useESP32Weight({
    pollInterval: 3000, // Update every 3 seconds
    enabled: true,
  });

  const displayWeight = weight !== null ? weight : 0;

  return (
    <Card className="fixed bottom-6 right-6 p-4 shadow-lg bg-card border-2 border-primary/20 z-50 min-w-[280px]">
      <div className="space-y-3">
        {/* Header with status indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold text-foreground">Live Weight Sensor</span>
          </div>
          {isLoading && !weight && (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          )}
          {!isLoading && !isError && (
            <Badge variant="default" className="bg-green-500 text-white gap-1 px-2 py-0">
              <Wifi className="w-3 h-3" />
              <span className="text-xs">Live</span>
            </Badge>
          )}
          {isError && (
            <Badge variant="destructive" className="gap-1 px-2 py-0">
              <WifiOff className="w-3 h-3" />
              <span className="text-xs">Offline</span>
            </Badge>
          )}
        </div>

        {/* Weight Display */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">{t("currentWeight")}</p>
            {isError ? (
              <div className="space-y-1">
                <p className="text-lg font-bold text-destructive">-- kg</p>
                <p className="text-xs text-destructive">{error || 'Connection failed'}</p>
              </div>
            ) : (
              <p className="text-3xl font-bold text-primary">{displayWeight.toFixed(2)} kg</p>
            )}
          </div>
          {isError && (
            <Button
              size="icon"
              variant="outline"
              onClick={() => refetch()}
              className="h-8 w-8"
              title="Retry connection"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Last Updated */}
        {lastUpdated && !isError && (
          <p className="text-xs text-muted-foreground">
            Updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {/* Optional: Show calculated weight for comparison */}
        {calculatedWeight !== undefined && calculatedWeight > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Cart estimate: {calculatedWeight.toFixed(2)} kg
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
