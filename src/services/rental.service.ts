import { prisma } from "@/lib/prisma";
import { Prisma, Rental } from "@prisma/client";

export class RentalService {
  /**
   * Retrieve all rentals.
   *
   * @returns A list of all rentals.
   */
  async index(): Promise<Rental[]> {
    return await prisma.rental.findMany();
  }

  /**
   * Retrieve a rental by its ID.
   *
   * @param id The ID of the rental to retrieve.
   * @returns The rental with the given ID, or null if no such rental exists.
   */
  async show(id: number): Promise<Rental | null> {
    return await prisma.rental.findUnique({ where: { id } });
  }

  /**
   * Create a new rental.
   *
   * @param data The data for the rental to create.
   * @returns The created rental.
   */
  async create(data: Prisma.RentalCreateInput): Promise<Rental> {
    return await prisma.rental.create({ data });
  }
}

export const rentalService = new RentalService();
