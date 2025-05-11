import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const getDashboardData = async () => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard`);
    return res.data;
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    return null;
  }
};
