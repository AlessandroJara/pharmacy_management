import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'user' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!token) {
      setError('Por favor, inicia sesión para gestionar usuarios');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5001/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err.response?.data || err.message);
      setError('No se pudieron cargar los usuarios. Intenta de nuevo.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Por favor, inicia sesión para gestionar usuarios');
      return;
    }

    const url = editId ? `http://localhost:5001/api/users/${editId}` : 'http://localhost:5001/api/users';
    const method = editId ? 'put' : 'post';

    try {
      await axios({
        method,
        url,
        data: form,
        headers: { Authorization: `Bearer ${token}` },
      });
      setError('');
      fetchUsers();
      setForm({ username: '', password: '', role: 'user' });
      setEditId(null);
    } catch (err) {
      console.error('Error submitting user:', err.response?.data || err.message);
      setError('Error al guardar el usuario. Intenta de nuevo.');
    }
  };

  const handleEdit = (user) => {
    setForm({ username: user.username, password: '', role: user.role });
    setEditId(user.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    if (!token) {
      setError('Por favor, inicia sesión para gestionar usuarios');
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setError('');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err.response?.data || err.message);
      setError('Error al eliminar el usuario. Intenta de nuevo.');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-gray-100">
      <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Gestión de Usuarios</h2>
      {error && <p className="text-red-500 mb-4 text-center font-medium">{error}</p>}
      <form onSubmit={handleSubmit} className="mb-6 bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nombre de usuario</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Nombre de usuario"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Contraseña"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!editId}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Rol</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
          {editId ? 'Actualizar' : 'Agregar'} Usuario
        </button>
      </form>
      {loading ? (
        <p className="text-gray-600 text-center">Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500 text-center">No hay usuarios registrados.</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 text-center font-semibold text-lg">Nombre de usuario</th>
                  <th className="p-3 text-center font-semibold text-lg">Rol</th>
                  <th className="p-3 text-center font-semibold text-lg">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-200`}
                  >
                    <td className="p-3 text-center text-gray-700 font-medium">{user.username}</td>
                    <td className="p-3 text-center text-gray-700 font-medium">{user.role === 'admin' ? 'Administrador' : 'Usuario'}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleEdit(user)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg mr-2 hover:bg-yellow-600 transition-colors duration-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Eliminar
                      </button>
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

export default Users;