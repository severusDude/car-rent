import RentalCreateForm from "./create-form";

function RentalCreatePage() {
  return (
    <div className="flex flex-col gap-6 w-full justify-center px-[6%] py-8">
      <h1 className="text-3xl font-bold text-primary">Buat Rental</h1>
      <RentalCreateForm />
    </div>
  );
}

export default RentalCreatePage;
