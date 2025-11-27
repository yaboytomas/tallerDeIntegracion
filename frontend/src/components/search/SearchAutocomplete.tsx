import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCLP } from '../../utils/currency';
import type { Product } from '../../types';

interface SearchAutocompleteProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchAutocomplete({ 
  placeholder = "Buscar productos...", 
  onSearch,
  className = ""
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<number | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        const products = await api.searchProducts(query, 8);
        setResults(products);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleProductClick = (product: Product) => {
    navigate(`/productos/${product._id}`);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/productos?search=${encodeURIComponent(query)}`);
      }
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleProductClick(results[selectedIndex]);
        } else {
          handleSearchSubmit(e);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 pl-11 text-sm shadow-sm outline-none transition-all duration-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
          aria-label="Buscar productos"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="search-results"
        />
        
        {/* Search Icon */}
        <svg
          className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
          </div>
        )}

        {/* Clear Button */}
        {query && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div
          id="search-results"
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border-2 border-purple-200 bg-white shadow-2xl animate-scale-in"
        >
          <div className="max-h-96 overflow-y-auto">
            {results.map((product, index) => (
              <button
                key={product._id}
                onClick={() => handleProductClick(product)}
                onMouseEnter={() => setSelectedIndex(index)}
                role="option"
                aria-selected={selectedIndex === index}
                className={`flex w-full items-center gap-4 border-b border-neutral-100 p-4 text-left transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 ${
                  selectedIndex === index ? 'bg-gradient-to-r from-purple-50 to-pink-50' : ''
                } last:border-b-0`}
              >
                {/* Product Image */}
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 shadow-sm">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      📦
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-semibold text-neutral-900 text-sm">
                    {product.name}
                  </h3>
                  {product.brand && (
                    <p className="text-xs text-neutral-500 mt-0.5">{product.brand}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-gradient">
                      {formatCLP(product.basePrice)}
                    </span>
                    {product.stock > 0 ? (
                      <span className="text-xs text-green-600 font-medium">✓ Stock</span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium">Sin stock</span>
                    )}
                  </div>
                </div>

                {/* Arrow Icon */}
                <svg
                  className="h-5 w-5 flex-shrink-0 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>

          {/* View All Results Footer */}
          <div className="border-t-2 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-3">
            <button
              onClick={handleSearchSubmit}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              Ver todos los resultados para "{query}" →
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border-2 border-neutral-200 bg-white p-6 text-center shadow-xl animate-scale-in">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm font-semibold text-neutral-700">
            No se encontraron productos
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}

