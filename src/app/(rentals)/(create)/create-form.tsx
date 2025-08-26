"use client";

import { useState } from "react";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Check, Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Car } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { createRental } from "./actions";

// Schema rental
export const rentalSchema = z.object({
  carId: z.number().int().positive("Pilih mobil"),
  customer: z.string().min(1, "Nama tidak boleh kosong").max(100),
  startDate: z.string().min(1, "Tanggal tidak boleh kosong"),
  duration: z
    .number()
    .int()
    .min(1, "Minimal penyewaan 1 hari")
    .max(30, "Maximal penyewaan 30 hari"),
  extraHours: z
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .positive()
        .min(0, "Jam ekstra tidak boleh negatif")
        .max(23, "Jam ekstra melebihi 24 jam/1 hari")
    ),
});

export type RentalFormData = z.infer<typeof rentalSchema>;

function RentalCreateForm({ cars }: { cars: Car[] }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const form = useForm<RentalFormData>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      carId: 0,
      customer: "",
      startDate: "",
      duration: 1,
      extraHours: 0,
    },
  });

  async function onSubmit(data: RentalFormData) {
    const formData = new FormData();

    formData.append("carId", data.carId.toString());
    formData.append("customer", data.customer);
    formData.append("startDate", data.startDate);
    formData.append("duration", data.duration.toString());
    formData.append("extraHours", data.extraHours.toString());

    try {
      const result = await createRental(formData);

      if (result.success) {
        toast.success("Rental berhasil dibuat");
        setIsOpen(false);
        form.reset();
      } else {
        toast.error(result.errors ?? "Rental gagal dibuat");
      }
    } catch (error) {
      toast.error("Rental gagal dibuat");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="icon" className="size-10">
          <Plus className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Rental</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Car selection */}
            <FormField
              control={form.control}
              name="carId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobil</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? cars.find((car) => car.id === field.value)?.name
                            : "Pilih mobil"}
                          <Search className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command className="w-full">
                        <CommandInput placeholder="Cari mobil..." />
                        <CommandList>
                          <CommandEmpty>Tidak ditemukan</CommandEmpty>
                          <CommandGroup>
                            {cars.map((car) => (
                              <CommandItem
                                key={car.id}
                                onSelect={() => {
                                  form.setValue("carId", car.id);
                                }}
                              >
                                {car.name}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    car.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tenant name */}
            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Penyewa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama penyewa..."
                      type="text"
                      {...field}
                    />
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
                    <Input type="date" {...field} className="cursor-pointer" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rental duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durasi penyewaan</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Extra hours */}
            <FormField
              control={form.control}
              name="extraHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jam Tambahan</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end w-full gap-2">
              <DialogClose asChild>
                <Button type="reset" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default RentalCreateForm;
