import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiCheckSquare } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiCheckSquare className="text-primary-600" size={24} />
          <span className="font-bold text-lg text-gray-800">Task Manager</span>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Hi, <span className="font-medium">{user.name}</span>
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
