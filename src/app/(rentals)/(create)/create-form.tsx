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
import { createRental, getCars } from "./actions";
import { toast } from "sonner";
import { Car } from "@prisma/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Plus, Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DialogClose } from "@/components/ui/dialog";
import { useState } from "react";

// Schema rental
export const rentalSchema = z.object({
  carId: z.transform(Number).pipe(z.number().int().positive()),
  tenantName: z.string().min(1).max(100),
  startDate: z.string(),
  endDate: z.string(),
});

export type RentalFormData = z.infer<typeof rentalSchema>;

function RentalCreateForm({ cars }: { cars: Car[] }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
        setIsOpen(false);
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
                Simpan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default RentalCreateForm;
