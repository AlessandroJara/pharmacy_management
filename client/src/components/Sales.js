import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [lowStockAlert, setLowStockAlert] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token for products:', token); // Log token
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }
      const response = await axios.get('http://localhost:5001/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const normalizedProducts = response.data.map(product => ({
        ...product,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      }));
      setProducts(normalizedProducts);
    } catch (err) {
      console.error('Error fetching products:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to load products');
    }
  };

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token for sales:', token); // Log token
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }
      const response = await axios.get('http://localhost:5001/api/sales', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const normalizedSales = response.data.map(sale => ({
        ...sale,
        price: typeof sale.price === 'string' ? parseFloat(sale.price) : sale.price,
      }));
      setSales(normalizedSales);
    } catch (err) {
      console.error('Error fetching sales:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to load sales history');
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
    setSelectedProduct(null);
    setQuantity(1);
    setError('');
    setLowStockAlert('');
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setFilteredProducts([]);
    setQuantity(1);
    setError('');
    setLowStockAlert('');
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value <= 0) {
      setQuantity(1);
    } else if (selectedProduct && value > selectedProduct.quantity) {
      setQuantity(selectedProduct.quantity);
      setError(`Only ${selectedProduct.quantity} units available in stock`);
    } else {
      setQuantity(value);
      setError('');
    }
  };

  const totalPrice = selectedProduct && typeof selectedProduct.price === 'number' 
    ? (selectedProduct.price * quantity).toFixed(2) 
    : '0.00';

  const handleSale = async () => {
    if (!selectedProduct || quantity <= 0) {
      setError('Please select a product and specify a valid quantity');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Sending sale request:', { productId: selectedProduct.id, quantity });
      const response = await axios.post(
        'http://localhost:5001/api/sales',
        { productId: selectedProduct.id, quantity: parseInt(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSales((prevSales) => [{
        ...response.data.sale,
        price: typeof response.data.sale.price === 'string' ? parseFloat(response.data.sale.price) : response.data.sale.price,
      }, ...prevSales]);

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === selectedProduct.id
            ? { ...product, quantity: response.data.remainingStock }
            : product
        )
      );

      if (response.data.lowStock) {
        setLowStockAlert(
          `Warning: ${selectedProduct.name} has low stock (${response.data.remainingStock} units remaining)`
        );
      } else {
        setLowStockAlert('');
      }

      setSelectedProduct(null);
      setSearchQuery('');
      setQuantity(1);
      setError('');
    } catch (err) {
      console.error('Error processing sale:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to process sale');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Sales Management
      </h1>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Record a Sale</h2>
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Product
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search for a product..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {filteredProducts.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-md">
                {filteredProducts.map((product) => (
                  <li
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="p-3 hover:bg-blue-100 cursor-pointer flex justify-between"
                  >
                    <span>{product.name}</span>
                    <span className="text-gray-500">
                      Stock: {product.quantity} | $
                      {typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={selectedProduct.quantity}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Unit Price
                </label>
                <input
                  type="text"
                  value={typeof selectedProduct.price === 'number' 
                    ? `$${selectedProduct.price.toFixed(2)}` 
                    : '$0.00'}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Total Price
                </label>
                <input
                  type="text"
                  value={`$${totalPrice}`}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            </div>
          )}

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {lowStockAlert && (
            <div className="text-yellow-600 text-sm bg-yellow-100 p-2 rounded-lg">
              {lowStockAlert}
            </div>
          )}

          <button
            onClick={handleSale}
            disabled={!selectedProduct}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
              selectedProduct
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Record Sale
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Sales History</h2>
        {sales.length === 0 ? (
          <p className="text-gray-500">No sales recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">
                    Product Name
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">
                    Quantity
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">
                    Unit Price
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">
                    Total Price
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">
                    Sale Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b text-gray-700">{sale.name}</td>
                    <td className="p-3 border-b text-gray-700">{sale.quantity}</td>
                    <td className="p-3 border-b text-gray-700">
                      ${typeof sale.price === 'number' ? sale.price.toFixed(2) : 'N/A'}
                    </td>
                    <td className="p-3 border-b text-gray-700">
                      ${(typeof sale.price === 'number' ? sale.quantity * sale.price : 0).toFixed(2)}
                    </td>
                    <td className="p-3 border-b text-gray-700">
                      {new Date(sale.sale_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;