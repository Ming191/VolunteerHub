import { LoaderCircle } from 'lucide-react';

const Loading = () => {
    return (
        <div className="flex items-center justify-center space-x-2">
            <LoaderCircle className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-gray-500">Loading...</span>
        </div>
    );
};

export default Loading;