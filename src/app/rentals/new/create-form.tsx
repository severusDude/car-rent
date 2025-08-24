"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { createRental } from "./actions";
import { toast } from "sonner";

export const rentalSchema = z.object({
  carId: z.transform(Number).pipe(z.number().int().positive()),
  tenantName: z.string().min(1).max(100),
  startDate: z.string(),
  endDate: z.string(),
});

export type RentalFormData = z.infer<typeof rentalSchema>;

function RentalCreateForm() {
  const form = useForm<RentalFormData>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      carId: 0,
      tenantName: "",
      startDate: "",
      endDate: "",
    },
  });

  async function onSubmit(data: RentalFormData) {
    const formData = new FormData();

    formData.append("carId", data.carId.toString());
    formData.append("tenantName", data.tenantName);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);

    try {
      const result = await createRental(formData);

      if (result.success) {
        toast.success("Rental berhasil dibuat");
      } else {
        toast.error(result.errors ?? "Rental gagal dibuat");
      }
    } catch (error) {
      toast.error("Rental gagal dibuat");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Car selection */}
        <FormField
          control={form.control}
          name="carId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobil</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tenant name */}
        <FormField
          control={form.control}
          name="tenantName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Penyewa</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rental start */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Mulai</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rental end */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Berakhir</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Simpan</Button>
      </form>
    </Form>
  );
}

export default RentalCreateForm;
