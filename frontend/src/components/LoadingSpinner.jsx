import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-primary-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
