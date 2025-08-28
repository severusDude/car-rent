"use client";

import { useState } from "react";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Check, Loader2, Minus, Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Car } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Slider } from "@/components/ui/slider";

// Schema rental
export const rentalSchema = z.object({
  carId: z.number().int().positive("Pilih mobil"),
  customer: z.string().min(1, "Nama tidak boleh kosong").max(100),
  startDate: z.string().min(1, "Tanggal tidak boleh kosong"),
  duration: z
    .number()
    .int()
    .positive()
    .min(1, "Minimal penyewaan 1 hari")
    .max(30, "Maximal penyewaan 30 hari"),
  extraHours: z
    .number()
    .int()
    .min(0, "Jam ekstra tidak boleh negatif")
    .max(23, "Jam ekstra melebihi 24 jam/1 hari"),
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

    // Append form data
    formData.append("carId", data.carId.toString());
    formData.append("customer", data.customer);
    formData.append("startDate", data.startDate);
    formData.append("duration", data.duration.toString());
    formData.append("extraHours", data.extraHours.toString());

    try {
      const result = await createRental(formData);

      // Handle result
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
            {/* Car selection & Date Field */}
            <div className="flex items-center gap-4">
              {/* Car selection */}
              <FormField
                control={form.control}
                name="carId"
                render={({ field }) => (
                  <FormItem className="flex-1">
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

              {/* Rental start */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="cursor-pointer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Customer name */}
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

            <div className="flex items-center w-full gap-4">
              {/* Rental duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field: { value, onChange } }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Durasi - {value} hari</FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[value]}
                        min={1}
                        max={30}
                        onValueChange={(vals) => {
                          onChange(vals[0]);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Durasi penyewaan mobil dalam hari
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Extra hours */}
              <FormField
                control={form.control}
                name="extraHours"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Ekstra (Jam)</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center gap-2 rounded-lg outline-1 outline-accent">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={value <= 0}
                          className="flex-1 disabled:cursor-not-allowed"
                          onClick={() => onChange(value > 0 ? value - 1 : 0)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-5 py-1 text-center select-none">
                          {value}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={value >= 23}
                          className="flex-1 disabled:cursor-not-allowed"
                          onClick={() =>
                            onChange(value <= 23 ? value + 1 : value)
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </FormControl>
                    <div className="h-5">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Rangkuman harga */}
            <div></div>

            {/* Actions */}
            <div className="flex justify-end w-full gap-2">
              <Button
                type="reset"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  form.reset();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                {form.formState.isSubmitting ? (
                  <>
                    Menyimpan...
                    <Loader2 className="ml-2 animate-spin" />
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default RentalCreateForm;
