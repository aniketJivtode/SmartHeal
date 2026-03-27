import {
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function Metrics({ success, failure, total }) {
  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      <div className="bg-white p-4 rounded-xl shadow flex items-center gap-2">
        <CheckCircle2 className="text-green-600" size={18} />
        <div>
          <p className="text-xs text-gray-500">Resolved</p>
          <p className="font-semibold">{success}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow flex items-center gap-2">
        <XCircle className="text-red-600" size={18} />
        <div>
          <p className="text-xs text-gray-500">Failed</p>
          <p className="font-semibold">{failure}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow flex items-center gap-2">
        <Activity size={18} />
        <div>
          <p className="text-xs text-gray-500">Total Runs</p>
          <p className="font-semibold">{total}</p>
        </div>
      </div>
    </div>
  );
}
