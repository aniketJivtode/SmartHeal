export default function Topbar({ onTrigger }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <button
        onClick={onTrigger}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Trigger Error
      </button>
    </div>
  );
}
