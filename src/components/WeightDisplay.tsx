import { Scale } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WeightDisplayProps {
  weight: number;
}

export function WeightDisplay({ weight }: WeightDisplayProps) {
  return (
    <Card className="fixed bottom-6 right-6 p-4 shadow-lg bg-card border-2 border-primary/20 z-50">
      <div className="flex items-center gap-3">
        <Scale className="w-8 h-8 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground font-medium">Current Weight</p>
          <p className="text-2xl font-bold text-primary">{weight.toFixed(2)} kg</p>
        </div>
      </div>
    </Card>
  );
}
