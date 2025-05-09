import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components for 3.x
Chart.register(...registerables);

function Dashboard() {
  const [lowStock, setLowStock] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [recentSales, setRecentSales] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    if (chartRef.current && lowStock.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: lowStock.map(p => p.name),
          datasets: [{
            label: 'Cantidad',
            data: lowStock.map(p => p.quantity),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [lowStock]);

  const fetchDashboardData = async () => {
    if (!token) {
      setError('Please log in to view dashboard');
      return;
    }

    try {
      // Fetch inventory data
      const inventoryRes = await axios.get('http://localhost:5001/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const products = Array.isArray(inventoryRes.data) ? inventoryRes.data : [];
      setLowStock(products.filter((p) => p.quantity <= 10));
      setTotalValue(
        products.reduce((sum, p) => sum + (p.quantity * p.price), 0).toFixed(2)
      );

      // Fetch sales data
      const salesRes = await axios.get('http://localhost:5001/api/sales', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sales = Array.isArray(salesRes.data) ? salesRes.data : [];
      setRecentSales(sales.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date)).slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err.response?.data || err.message);
      setError('Failed to load dashboard data. Please try again.');
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Panel de Control</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Low Stock Card */}
        <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-blue-600 mb-4">Productos en Stock Bajo</h3>
          <ul className="space-y-2">
            {lowStock.length > 0 ? (
              lowStock.map((product) => (
                <li key={product.id} className="text-gray-700">
                  {product.name} - {product.quantity} unidades
                </li>
              ))
            ) : (
              <li className="text-gray-500">No hay productos en stock bajo</li>
            )}
          </ul>
        </div>

        {/* Total Inventory Value Card */}
        <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-green-600 mb-4">Valor Total del Inventario</h3>
          <p className="text-2xl font-bold text-gray-800">${totalValue}</p>
        </div>

        {/* Recent Sales Card */}
        <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-purple-600 mb-4">Ventas Recientes</h3>
          <ul className="space-y-2">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <li key={sale.id} className="text-gray-700">
                  {sale.quantity} x Producto #{sale.product_id} - {new Date(sale.sale_date).toLocaleString()}
                </li>
              ))
            ) : (
              <li className="text-gray-500">No hay ventas recientes</li>
            )}
          </ul>
        </div>
      </div>

      {/* Low Stock Chart */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-blue-600 mb-4">Gráfico de Stock Bajo</h3>
        <canvas ref={chartRef} className="w-full h-64"></canvas>
      </div>
    </div>
  );
}

export default Dashboard;