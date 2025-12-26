import { Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/layout';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  RestaurantsPage,
  RestaurantDetailPage,
  MenuItemDetailPage,
  DiscoverPage,
  ProfilePage,
  AddRestaurantPage,
  AddMenuItemPage,
  NotFoundPage,
} from './pages';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurants/add" element={<AddRestaurantPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="/restaurants/:restaurantId/add-item" element={<AddMenuItemPage />} />
          <Route path="/menu-items/:id" element={<MenuItemDetailPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
