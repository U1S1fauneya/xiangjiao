export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed right-8 top-8 z-50 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-sm font-black text-emerald-700 shadow-soft">
      {message}
    </div>
  );
}
