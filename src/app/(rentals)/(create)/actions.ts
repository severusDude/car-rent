"use server";

import { carService } from "@/services/car-service";
import { promotionService } from "@/services/promotion-service";
import { rentalService } from "@/services/rental-service";
import { revalidatePath } from "next/cache";

// Define the server action return type
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  errors?: string;
};

/**
 * Create a new rental and associated payment.
 *
 * @param formData The form data to create the rental.
 * @returns An object with success, data, and errors properties.
 * The data property contains the created rental and payment objects.
 * The errors property contains a string describing the error if any.
 */
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

/**
 * Retrieve all available cars.
 *
 * @returns A list of all cars, or an error response if the operation fails.
 */
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
