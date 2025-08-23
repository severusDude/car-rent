import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full min-h-screen px-[6%] py-12">
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
            <Button variant="default" size="icon" className="size-10">
              <Plus className="size-5" />
            </Button>
            {/* <ThemeToggle /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
