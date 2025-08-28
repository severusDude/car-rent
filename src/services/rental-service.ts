import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type RentalPayload = Prisma.RentalGetPayload<{
  include: {
    car: true;
    payment: { include: { promotion: true } };
  };
}>;

export class RentalService {
  /**
   * Retrieve all rentals.
   *
   * @returns A list of all rentals.
   */
  async index(): Promise<RentalPayload[]> {
    return await prisma.rental.findMany({
      include: {
        car: true,
        payment: { include: { promotion: true } },
      },
    });
  }

  /**
   * Retrieve a rental by its ID.
   *
   * @param id The ID of the rental to retrieve.
   * @returns The rental with the given ID, or null if no such rental exists.
   */
  async show(id: number): Promise<RentalPayload | null> {
    return await prisma.rental.findUnique({
      where: { id },
      include: {
        car: true,
        payment: { include: { promotion: true } },
      },
    });
  }

  /**
   * Create a new rental.
   *
   * @param data The data for the rental to create.
   * @returns The created rental.
   */
  async create(data: Prisma.RentalCreateInput): Promise<RentalPayload> {
    return await prisma.rental.create({
      data,
      include: {
        car: true,
        payment: { include: { promotion: true } },
      },
    });
  }

  async createWithPayment({
    rental,
    payment,
  }: {
    rental: {
      carId: number;
      customer: string;
      startDate: Date;
      duration: number;
      extraHours: number;
    };
    payment: {
      baseAmount: number;
      discountAmount: number;
      extraAmount: number;
      totalAmount: number;
      promotionId?: number | null;
    };
  }) {
    return await prisma.$transaction(async (tx) => {
      //create rental first
      const newRental = await tx.rental.create({
        data: {
          carId: rental.carId,
          customer: rental.customer,
          startDate: rental.startDate,
          duration: rental.duration,
          extraHours: rental.extraHours,
        },
        include: {
          car: true,
        },
      });

      // create payment
      const newPayment = await tx.payment.create({
        data: {
          rentalId: newRental.id,
          baseAmount: payment.baseAmount,
          discountAmount: payment.discountAmount,
          extraAmount: payment.extraAmount,
          totalAmount: payment.totalAmount,
          promotionId: payment.promotionId,
          status: "PENDING",
        },
        include: {
          promotion: true,
        },
      });

      return { rental: newRental, payment: newPayment };
    });
  }
}

export const rentalService = new RentalService();
