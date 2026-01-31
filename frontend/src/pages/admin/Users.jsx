import DashboardLayout from '../../components/layout/DashboardLayout';

const Users = () => {
    return (
        <DashboardLayout breadcrumbs={['Admin', 'Users']}>
            <div className="max-w-7xl mx-auto py-8">
                <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <p className="text-gray-400">User management coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Users;
