import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: '', price: '' });
  const [editProduct, setEditProduct] = useState({ id: '', name: '', quantity: '', price: '' });
  const token = localStorage.getItem('token');

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      console.log('Fetching products, token:', token);
      if (!token) {
        console.error('No token found in localStorage');
        if (isMounted) setError('Please log in to view inventory');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5001/api/inventory', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched products:', res.data);
        if (isMounted) setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching products:', err.response?.data || err.message);
        if (isMounted) {
          setError('Failed to load inventory. Please try again.');
          setProducts([]);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/inventory', newProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts([...products, res.data]);
      setNewProduct({ name: '', quantity: '', price: '' });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding product:', err.response?.data || err.message);
      setError('Failed to add product. Please try again.');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5001/api/inventory/${editProduct.id}`, editProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.map(p => (p.id === editProduct.id ? res.data : p)));
      setIsEditModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error updating product:', err.response?.data || err.message);
      setError('Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este medicamento?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err.response?.data || err.message);
      setError('Failed to delete product. Please try again.');
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditProduct({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Gestión de Inventario</h2>
      {error && <p className="text-red-500 mb-4 text-center font-medium">{error}</p>}
      <div className="mb-4 text-right">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          Agregar Medicamento
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-center font-semibold text-lg">ID</th>
                <th className="p-3 text-left font-semibold text-lg">Nombre</th>
                <th className="p-3 text-center font-semibold text-lg">Cantidad</th>
                <th className="p-3 text-right font-semibold text-lg">Precio</th>
                <th className="p-3 text-center font-semibold text-lg">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => {
                  const isLowStock = product.quantity < 10;
                  return (
                    <tr
                      key={product.id}
                      className={`border-b ${isLowStock ? 'bg-red-100' : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-200`}
                    >
                      <td className="p-3 text-center text-gray-700 font-medium">{product.id}</td>
                      <td className="p-3 text-left text-gray-700 font-medium">{product.name}</td>
                      <td className={`p-3 text-center text-gray-700 font-medium ${isLowStock ? 'border-b-2 border-red-500 relative group' : ''}`}>
                        {product.quantity}
                        {isLowStock && (
                          <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 hidden group-hover:block bg-red-500 text-white text-xs rounded py-1 px-2">
                            Stock bajo: menos de 10 unidades
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right text-gray-700 font-medium">
                        ${parseFloat(product.price).toFixed(2) || '0.00'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openEditModal(product)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg mr-2 hover:bg-blue-600 transition-colors duration-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors duration-200"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-500 font-medium">
                    No hay productos en el inventario
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Agregar Medicamento</h3>
            <form onSubmit={handleAddProduct}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Nombre</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Cantidad</label>
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Editar Medicamento</h3>
            <form onSubmit={handleEditProduct}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Nombre</label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Cantidad</label>
                <input
                  type="number"
                  value={editProduct.quantity}
                  onChange={(e) => setEditProduct({ ...editProduct, quantity: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;