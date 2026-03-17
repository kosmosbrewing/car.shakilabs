import { z } from "zod";
import { maintenanceProfiles } from "@/data/ownershipData";

const parkingSchema = z.object({
  daysPerMonth: z.number().int().min(1).max(31),
  hoursPerDay: z.number().min(1).max(24),
  hourlyRate: z.number().min(500).max(20_000),
  monthlyPass: z.number().min(0).max(1_000_000),
});

const maintenanceSchema = z.object({
  annualKm: z.number().min(1_000).max(100_000),
  vehicleAge: z.number().int().min(0).max(20),
  fuelType: z.enum(["gasoline", "hybrid", "ev"]),
});

const evVsGasSchema = z.object({
  annualKm: z.number().min(1_000).max(100_000),
  gasPrice: z.number().min(1_000).max(3_500),
  electricityPrice: z.number().min(100).max(600),
  gasEfficiency: z.number().min(5).max(25),
  evKwhPerKm: z.number().min(0.08).max(0.4),
});

export function compareParkingOptions(input: z.input<typeof parkingSchema>) {
  const parsed = parkingSchema.parse(input);
  const hourlyTotal = Math.round(parsed.daysPerMonth * parsed.hoursPerDay * parsed.hourlyRate);
  const dayCapTotal = Math.round(parsed.daysPerMonth * Math.min(parsed.hoursPerDay * parsed.hourlyRate, 15_000));
  const monthlyTotal = Math.round(parsed.monthlyPass);
  const items = [
    { key: "hourly", label: "시간권", total: hourlyTotal },
    { key: "daycap", label: "일 최대요금", total: dayCapTotal },
    { key: "monthly", label: "월주차", total: monthlyTotal },
  ].sort((a, b) => a.total - b.total);

  return {
    items,
    bestOption: items[0],
    spread: items[items.length - 1].total - items[0].total,
  };
}

export function calculateMaintenanceBudget(input: z.input<typeof maintenanceSchema>) {
  const parsed = maintenanceSchema.parse(input);
  const profile = maintenanceProfiles[parsed.fuelType];
  const oil = Math.ceil(parsed.annualKm / profile.oilIntervalKm) * profile.oilCost;
  const tires = Math.round((parsed.annualKm / 40_000) * profile.tireCost);
  const consumables = Math.round(parsed.annualKm * profile.wearPerKm);
  const inspection = parsed.vehicleAge >= 4 ? 90_000 : 0;
  const insurance = 700_000 + parsed.vehicleAge * 35_000;
  const tax = profile.tax;
  const total = oil + tires + consumables + inspection + insurance + tax;

  return {
    profile,
    oil,
    tires,
    consumables,
    inspection,
    insurance,
    tax,
    total,
    monthlyAverage: Math.round(total / 12),
  };
}

export function compareEvVsGas(input: z.input<typeof evVsGasSchema>) {
  const parsed = evVsGasSchema.parse(input);
  const gasFuel = Math.round((parsed.annualKm / parsed.gasEfficiency) * parsed.gasPrice);
  const evFuel = Math.round(parsed.annualKm * parsed.evKwhPerKm * parsed.electricityPrice);
  const gasTotal = gasFuel + 850_000 + 520_000;
  const evTotal = evFuel + 420_000 + 130_000 + 180_000;

  return {
    gasFuel,
    evFuel,
    gasTotal,
    evTotal,
    winner: evTotal <= gasTotal ? "ev" : "gas",
    gap: Math.abs(gasTotal - evTotal),
  };
}
