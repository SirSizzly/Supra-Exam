import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import AllItems from './pages/AllItems.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import MyInventory from './pages/MyInventory.jsx';
import CreateItem from './pages/CreateItem.jsx';
import EditItem from './pages/EditItem.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<AllItems />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <MyInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/new"
            element={
              <ProtectedRoute>
                <CreateItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/:id/edit"
            element={
              <ProtectedRoute>
                <EditItem />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
