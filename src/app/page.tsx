import { ChevronDown } from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { carService } from "@/services/car-service";
import { rentalService } from "@/services/rental-service";
import RentalCreateForm from "@/app/(rentals)/(create)/create-form";

export default async function Home() {
  const rentals = await rentalService.index();
  const cars = await carService.index();

  return (
    <div className="flex flex-col gap-6 w-full min-h-screen px-[6%] py-12">
      {/* Header & Reports */}
      <div className="flex justify-between w-full p-6 rounded-lg bg-secondary">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          {/* Company identity/Left side */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">MoRent</h1>
            <p className="text-muted-foreground">Rekap rental bulan ini</p>
          </div>

          {/* Actions/Right side */}
          <div className="flex items-end gap-2">
            {/* Date Filter */}
            <Button variant="outline" size="lg">
              {/* Month&Year */}
              <div className="space-x-1 text-muted-foreground">
                <span>Agustus</span>
                <span>2025</span>
              </div>
              <ChevronDown className="ml-2" />
            </Button>

            {/* CTA */}
            <RentalCreateForm cars={cars} />
            {/* <ThemeToggle /> */}
          </div>
        </div>
      </div>

      {/* Main body */}
      <div className="flex flex-col flex-1 w-full h-full gap-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-primary">Rekap rental</h1>

        {/* Content */}
        <div className="flex flex-1 w-full gap-4">
          {/* Table */}
          <div className="flex-1 w-full overflow-hidden outline-1 outline-muted rounded-xl">
            <table className="w-full table-auto">
              <thead className="border-b border-muted bg-secondary">
                <tr>
                  {[
                    "ID",
                    "Penyewa",
                    "Mobil",
                    "Tanggal Mulai",
                    "Durasi",
                    "Biaya",
                    "Jam Ekstra",
                    "Diskon",
                    "Total Harga",
                  ].map((header) => (
                    <th
                      key={header}
                      className="self-center p-4 font-normal text-center text-muted-foreground"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="">
                {rentals.length > 0 ? (
                  rentals.map((rental, index) => (
                    <tr
                      key={rental.id}
                      className={cn(index % 2 !== 0 && "bg-muted")}
                    >
                      <td className="p-4 text-center">{rental.id}</td>
                      <td className="p-4 text-center">{rental.customer}</td>
                      <td className="p-4 text-center">{rental.car.name}</td>
                      <td className="p-4 text-center">
                        {rental.startDate.toDateString()}
                      </td>
                      <td className="p-4 text-center">
                        {rental.duration} hari
                      </td>
                      <td className="p-4 text-center">
                        {formatCurrency(rental.payment?.baseAmount ?? 0)}
                      </td>
                      <td className="p-4 text-center">
                        {formatCurrency(rental.payment?.extraAmount ?? 0)}
                      </td>
                      <td className="p-4 text-center">
                        {formatCurrency(rental.payment?.discountAmount ?? 0)}
                      </td>
                      <td className="p-4 text-center">
                        {formatCurrency(rental.payment?.totalAmount ?? 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Side Details */}
          {/* <div className="flex flex-col flex-shrink-0 gap-4 w-80 rounded-xl outline-1 outline-muted"></div> */}
        </div>
      </div>
    </div>
  );
}
