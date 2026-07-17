"use client";

import type { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states";

interface PromotionLocationFieldsData {
  applicable_state?: string;
  applicable_city?: string;
}

interface PromotionLocationFieldsProps<T extends PromotionLocationFieldsData> {
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  applicableStateValue: string | undefined;
}

export function PromotionLocationFields<T extends PromotionLocationFieldsData>({
  register,
  setValue,
  applicableStateValue,
}: PromotionLocationFieldsProps<T>) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700">Restrict to State</Label>
          <Select
            value={applicableStateValue || "ALL"}
            onValueChange={(value: string) => {
              setValue(
                "applicable_state" as never,
                (value === "ALL" ? undefined : value) as never,
              );
              // The city input becomes hidden/disabled below it — clear its
              // value too, or a stale city can silently block save with a
              // "city requires state" error the admin never typed a city for.
              if (value === "ALL") {
                setValue("applicable_city" as never, undefined as never);
              }
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All States</SelectItem>
              {NIGERIAN_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="applicable_city" className="text-gray-700">
            Restrict to City
          </Label>
          <Input
            id="applicable_city"
            {...register("applicable_city" as never)}
            disabled={!applicableStateValue}
            className="mt-1"
            placeholder={
              applicableStateValue ? "e.g., Akure" : "Select a state first"
            }
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 -mt-2">
        Leave as &quot;All States&quot; for a store-wide promotion, or restrict
        it to a specific delivery destination (e.g. free shipping for Akure
        only).
      </p>
    </>
  );
}
