"use server";

import { carService } from "@/services/car-service";
import { promotionService } from "@/services/promotion-service";
import { rentalService } from "@/services/rental-service";
import { revalidatePath } from "next/cache";

export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  errors?: string;
};

export async function createRental(formData: FormData): Promise<ActionResult> {
  try {
    // extract form data
    const carId = Number(formData.get("carId"));
    const customer = formData.get("customer") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const duration = Number(formData.get("duration"));
    const extraHours = Number(formData.get("extraHours"));

    // Validate required fields
    if (!carId || !customer || !startDate || !duration || duration <= 0) {
      return {
        success: false,
        errors: "Missing required fields or invalid duration",
      };
    }

    // Get car detail
    const car = await carService.show(carId);
    if (!car) {
      return {
        success: false,
        errors: "Car not found",
      };
    }

    // calculate payment base amount
    const baseAmount = car.price * duration;

    // calculate payment extra amount
    const extraAmount = extraHours * (100 * 1000);

    // find applicable promotion
    const promotion = await promotionService.findBestApplicable(
      duration,
      baseAmount
    );

    // apply promotion
    let discountAmount = 0;
    let promotionId = null;

    if (promotion) {
      promotionId = promotion.id;

      // apply discount
      if (promotion.type === "PERCENTAGE") {
        discountAmount = (baseAmount * promotion.value) / 100;
      } else if (promotion.type === "FIXED") {
        discountAmount = promotion.value;
      }

      // ensure discount not exceed price
      if (discountAmount > baseAmount) {
        discountAmount = baseAmount;
      }
    }

    //calculate total amount
    const totalAmount = baseAmount - discountAmount + extraAmount;

    // // insert to db
    // const rental = await rentalService.create({
    //   car: { connect: { id: car.id } },
    //   customer,
    //   startDate,
    //   duration,
    //   extraHours,
    // });

    // initiate transaction with create rental and payment
    const result = await rentalService.createWithPayment({
      rental: {
        carId,
        customer,
        startDate,
        duration,
        extraHours,
      },
      payment: {
        baseAmount,
        discountAmount,
        extraAmount,
        totalAmount,
        promotionId,
      },
    });

    // refresh
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        rental: result.rental,
        payment: result.payment,
        promotion: promotion,
      },
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
