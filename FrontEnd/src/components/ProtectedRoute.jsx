/*
 * Route guard.
 * Wrap any route element that requires a logged-in user.
 * Unauthenticated visitors get bounced back to the browse page.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthed } = useAuth();
  if (!isAuthed) return <Navigate to="/" replace />;
  return children;
}
