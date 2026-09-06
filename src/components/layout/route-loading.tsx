export function RouteLoading() {
  return (
    <main className="namou-container min-h-[70vh] animate-pulse py-8">
      <div className="bg-muted h-3 w-32 rounded" />
      <div className="bg-muted mt-6 h-24 max-w-2xl rounded-xl sm:h-36" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="bg-muted aspect-[4/3] rounded-xl" />
        ))}
      </div>
    </main>
  );
}
