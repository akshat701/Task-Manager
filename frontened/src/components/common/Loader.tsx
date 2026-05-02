export default function Loader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm z-50">

      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

      <p className="mt-3 text-white font-medium">Loading...</p>
    </div>
  );
}