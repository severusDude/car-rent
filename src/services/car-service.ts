import { prisma } from "@/lib/prisma";
import { Car } from "@prisma/client";

export class CarService {
  async index(): Promise<Car[]> {
    return await prisma.car.findMany();
  }

  async show(id: number): Promise<Car | null> {
    return await prisma.car.findUnique({ where: { id } });
  }

  async create(data: Car): Promise<Car> {
    return await prisma.car.create({ data });
  }
}

export const carService = new CarService();
