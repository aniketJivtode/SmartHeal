import { useDispatch } from "react-redux";
import { fetchJobs } from "../jobs/jobSlice";
import { triggerError } from "../../services/api";

export default function TriggerButton() {
  const dispatch = useDispatch();

  const handleTrigger = async () => {
    await triggerError();

    // wait for daemon to process
    setTimeout(() => {
      dispatch(fetchJobs());
    }, 3500);
  };

  return (
    <button
      onClick={handleTrigger}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Trigger Error
    </button>
  );
}
