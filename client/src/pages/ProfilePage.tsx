import { useAuth } from '../context';
import { LoadingSpinner } from '../components/ui';

const ProfilePage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Profile</h1>
      
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-bold text-2xl">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.displayName}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
