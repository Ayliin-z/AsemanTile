// frontend/src/components/ui/SearchBar.jsx
import { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = 'جستجو کنید...', initialValue = '' }) => {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <form className={`search-bar ${isFocused ? 'focused' : ''}`} onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="search-input"
      />
      {value && (
        <button type="button" onClick={handleClear} className="search-clear">
          ✕
        </button>
      )}
      <button type="submit" className="search-submit">
        🔍
      </button>
    </form>
  );
};

export default SearchBar;
