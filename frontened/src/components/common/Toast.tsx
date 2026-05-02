export default function Toast({ message, type }: any) {
  return (
    <div
      className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white z-50
        ${type === "error" ? "bg-red-500" : "bg-green-500"}`}
    >
      {message}
    </div>
  );
}