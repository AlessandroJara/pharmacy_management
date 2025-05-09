import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Sales() {
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    if (!token) {
      console.error('No token found in localStorage');
      setError('Por favor, inicia sesión para ver las ventas');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5001/api/sales', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched sales:', res.data);
      setSales(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching sales:', err.response?.data || err.message);
      setError('No se pudieron cargar las ventas. Intenta de nuevo.');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-gray-100">
      <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Gestión de Ventas</h2>
      {error && <p className="text-red-500 mb-4 text-center font-medium">{error}</p>}
      {loading ? (
        <p className="text-gray-600 text-center">Cargando ventas...</p>
      ) : sales.length === 0 ? (
        <p className="text-gray-500 text-center">No hay ventas registradas.</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 text-center font-semibold text-lg">ID</th>
                  <th className="p-3 text-center font-semibold text-lg">Producto ID</th>
                  <th className="p-3 text-center font-semibold text-lg">Cantidad</th>
                  <th className="p-3 text-center font-semibold text-lg">Fecha de Venta</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr
                    key={sale.id}
                    className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-200`}
                  >
                    <td className="p-3 text-center text-gray-700 font-medium">{sale.id}</td>
                    <td className="p-3 text-center text-gray-700 font-medium">{sale.product_id}</td>
                    <td className="p-3 text-center text-gray-700 font-medium">{sale.quantity}</td>
                    <td className="p-3 text-center text-gray-700 font-medium">
                      {new Date(sale.sale_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sales;