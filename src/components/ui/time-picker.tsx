"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimePickerProps {
  label?: string;
  minutes: number;
  seconds: number;
  onMinutesChange: (minutes: number) => void;
  onSecondsChange: (seconds: number) => void;
  disabled?: boolean;
}

export function TimePicker({
  label = "Duration",
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange,
  disabled = false,
}: TimePickerProps) {
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      onMinutesChange(value);
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 59) {
      onSecondsChange(value);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Minutes</label>
          <Input
            type="number"
            value={minutes}
            onChange={handleMinutesChange}
            disabled={disabled}
            min="0"
            className="w-20"
            placeholder="0"
          />
        </div>
        <span className="text-2xl font-bold mt-4">:</span>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Seconds</label>
          <Input
            type="number"
            value={seconds}
            onChange={handleSecondsChange}
            disabled={disabled}
            min="0"
            max="59"
            className="w-20"
            placeholder="0"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Format: MM : SS (0-59 seconds)
      </p>
    </div>
  );
}
