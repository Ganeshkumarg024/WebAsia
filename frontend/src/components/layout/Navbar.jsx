import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center">
                            <img
                                src="/assets/webasia-logo.png"
                                alt="WebAsia"
                                className="h-12 w-auto"
                            />
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* User Menu */}
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-700">
                                {user?.firstName} {user?.lastName}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                                {user?.role}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
