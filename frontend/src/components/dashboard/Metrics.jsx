export default function Metrics({ success, failure, total }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-green-100 rounded shadow">
        <p className="text-sm">Success</p>
        <h2 className="text-xl font-bold">{success}</h2>
      </div>

      <div className="p-4 bg-red-100 rounded shadow">
        <p className="text-sm">Failure</p>
        <h2 className="text-xl font-bold">{failure}</h2>
      </div>

      <div className="p-4 bg-blue-100 rounded shadow">
        <p className="text-sm">Total Jobs</p>
        <h2 className="text-xl font-bold">{total}</h2>
      </div>
    </div>
  );
}
