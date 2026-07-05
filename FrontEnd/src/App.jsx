/*
 * App shell + route table.
 *
 * Public routes:
 *   /            → Browse all items
 *   /items/:id   → Single item details
 *
 * Auth-only routes (wrapped in <ProtectedRoute>):
 *   /inventory              → My inventory
 *   /inventory/new          → Create a new item
 *   /inventory/:id/edit     → Edit an item
 *
 * Anything else falls back to "/" so a bad URL doesn't leave the user stuck.
 */
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
      {/* Navbar sits above every page and manages the login modal. */}
      <Navbar />

      <main className="container">
        <Routes>
          {/* ---------- Public routes ---------- */}
          <Route path="/" element={<AllItems />} />
          <Route path="/items/:id" element={<ItemDetail />} />

          {/* ---------- Auth-only routes ---------- */}
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

          {/* ---------- Catch-all fallback ---------- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
