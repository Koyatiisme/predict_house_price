import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ScatterChart, Scatter, CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import './index.css'; // đảm bảo đã import Tailwind

function App() {
  const [formData, setFormData] = useState({
    GrLivArea: '',
    BedroomAbvGr: '',
    FullBath: '',
    Neighborhood: ''
  });
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [priceDistData, setPriceDistData] = useState([]);
  const [areaVsPriceData, setAreaVsPriceData] = useState([]);
  const [avgPriceByNeighborhoodData, setAvgPriceByNeighborhoodData] = useState([]);

  useEffect(() => {
    fetch('/chart/price-distribution').then(res => res.json()).then(setPriceDistData);
    fetch('/chart/area-vs-price').then(res => res.json()).then(setAreaVsPriceData);
    fetch('/chart/average-price-by-neighborhood').then(res => res.json()).then(setAvgPriceByNeighborhoodData);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePredict = async () => {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        GrLivArea: Number(formData.GrLivArea),
        BedroomAbvGr: Number(formData.BedroomAbvGr),
        FullBath: Number(formData.FullBath)
      })
    });
    const data = await res.json();
    setPredictedPrice(data.predicted_price);
  };

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-8">
      {/* Form nhập */}
      <div className="bg-white p-4 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Dự đoán giá nhà</h2>
        <div className="grid grid-cols-2 gap-4">
          <input className="border p-2 rounded" name="GrLivArea" placeholder="Diện tích (GrLivArea)" onChange={handleChange} />
          <input className="border p-2 rounded" name="BedroomAbvGr" placeholder="Số phòng ngủ" onChange={handleChange} />
          <input className="border p-2 rounded" name="FullBath" placeholder="Số phòng tắm" onChange={handleChange} />
          <input className="border p-2 rounded" name="Neighborhood" placeholder="Khu vực (ví dụ: CollgCr)" onChange={handleChange} />
        </div>
        <button onClick={handlePredict} className="bg-blue-500 text-white px-4 py-2 rounded">Dự đoán</button>
        {predictedPrice !== null && (
          <div className="text-lg text-green-600 font-semibold">Giá nhà dự đoán: ${predictedPrice}</div>
        )}
      </div>

      {/* Biểu đồ 1: Phân phối giá */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">Phân phối giá nhà</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={priceDistData}>
            <XAxis dataKey="range" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Biểu đồ 2: Diện tích vs Giá */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">Diện tích vs Giá nhà</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey="GrLivArea" name="Diện tích" />
            <YAxis dataKey="SalePrice" name="Giá nhà" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={areaVsPriceData} fill="#82ca9d" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Biểu đồ 3: Giá trung bình theo khu vực */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">Giá trung bình theo khu vực</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={avgPriceByNeighborhoodData} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="neighborhood" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="avg_price" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;
