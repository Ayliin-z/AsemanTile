// frontend/src/components/ui/Breadcrumb.jsx
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumb">
      <Link to="/" className="breadcrumb-home">
        🏠 خانه
      </Link>
      {items.map((item, index) => (
        <span key={index} className="breadcrumb-item">
          <span className="breadcrumb-separator">›</span>
          {item.link ? (
            <Link to={item.link}>{item.label}</Link>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
