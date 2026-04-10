'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// Вставляем ключи напрямую для демо-проекта и удаляем их в github 
const supabase = createClient(
  'https://xonptgfffunbtlbmdhoe.supabase.co',
  'sb_блаблаkeys',
);

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: orders } = await supabase
        .from('orders')
        .select('customer_name, total_sum, created_at')
        .order('created_at', { ascending: true });
      setData(orders || []);
    }
    fetchData();
  }, []);

  return (
    <div
      style={{
        padding: '40px',
        fontFamily: 'sans-serif',
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
      }}
    >
      <h1>Дашборд заказов (Demo)</h1>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div
          style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <p>Всего заказов</p>
          <h2 style={{ fontSize: '24px', margin: '0' }}>{data.length}</h2>
        </div>
        <div
          style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <p>Общая сумма</p>
          <h2 style={{ color: 'green', fontSize: '24px', margin: '0' }}>
            {data
              .reduce((acc, curr) => acc + Number(curr.total_sum), 0)
              .toLocaleString()}{' '}
            ₸
          </h2>
        </div>
      </div>
      <div
        style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          height: '400px',
        }}
      >
        <h3 style={{ marginBottom: '20px' }}>График продаж</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="customer_name" hide />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_sum" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
