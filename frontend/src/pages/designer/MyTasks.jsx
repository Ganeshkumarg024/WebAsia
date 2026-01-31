import Navbar from '../../components/layout/Navbar';

const MyTasks = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tasks</h1>
                <div className="card">
                    <p className="text-gray-600">Tasks list coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default MyTasks;
