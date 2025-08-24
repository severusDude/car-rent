"use server";

import { rentalService } from "@/services/rental.service";
import { z } from "zod";

export const rentalSchema = z.object({
  carId: z.transform(Number).pipe(z.number().int().positive()),
  tenantName: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
});

export type RentalFormValues = z.infer<typeof rentalSchema>;

export type ActionResult = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function createRental(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    carId: formData.get("carId"),
    tenantName: formData.get("tenantName"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  };

  const parsed = rentalSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error),
    };
  }

  try {
    await rentalService.create(parsed.data);
    return { success: true };
  } catch (error: any) {
    return { success: false, errors: { _form: [error.message] } };
  }
}
