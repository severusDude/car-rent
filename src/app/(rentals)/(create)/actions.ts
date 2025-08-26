"use server";

import { carService } from "@/services/car-service";
import { rentalService } from "@/services/rental-service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  errors?: string;
};

export async function createRental(formData: FormData): Promise<ActionResult> {
  try {
    const carId = Number(formData.get("carId"));
    const tenantName = formData.get("tenantName") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);

    const rental = await rentalService.create({
      carId,
      tenantName,
      startDate,
      endDate,
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: rental,
    };
  } catch (error) {
    return {
      success: false,
      errors: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getCars(): Promise<ActionResult> {
  try {
    const cars = await carService.index();
    return {
      success: true,
      data: cars,
    };
  } catch (error) {
    return {
      success: false,
      errors: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// export async function createRental(
//   prevState: ActionResult | null,
//   formData: FormData
// ): Promise<ActionResult> {
//   const raw = {
//     carId: formData.get("carId"),
//     tenantName: formData.get("tenantName"),
//     startDate: formData.get("startDate"),
//     endDate: formData.get("endDate"),
//   };

//   const parsed = rentalSchema.safeParse(raw);

//   if (!parsed.success) {
//     return {
//       success: false,
//       errors: z.flattenError(parsed.error),
//     };
//   }

//   try {
//     await rentalService.create(parsed.data);
//     return { success: true };
//   } catch (error: any) {
//     return { success: false, errors: { _form: [error.message] } };
//   }
// }
