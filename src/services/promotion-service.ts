import { prisma } from "@/lib/prisma";

export const promotionService = {
  async findBestApplicable(duration: number, baseAmount: number) {
    const promotions = await prisma.promotion.findMany({
      where: {
        AND: [
          // duration criteria
          { OR: [{ minDuration: null }, { minDuration: { lte: duration } }] },
          { OR: [{ maxDuration: null }, { maxDuration: { gte: duration } }] },
          // amount criteria
          { OR: [{ minAmount: null }, { minAmount: { lte: baseAmount } }] },
        ],
      },
      orderBy: [
        { value: "desc" }, // prefer higher discount values
        { minDuration: "desc" }, // prefer promotions with higher minimum duration
      ],
    });

    return promotions[0] || null; // return the best promotion or null
  },
};
