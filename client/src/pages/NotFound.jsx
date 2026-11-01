import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty">
      <h3>Page not found</h3>
      <p>The page you are looking for doesn't exist.</p>
      <Link to="/" className="btn">Go home</Link>
    </div>
  );
}
