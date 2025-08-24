async function RentalShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <h1>Rental {id}</h1>
    </>
  );
}

export default RentalShowPage;
