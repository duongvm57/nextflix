export default function Loading() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <h2 className="text-xl font-semibold">Đang tải...</h2>
      </div>
    </div>
  );
}
