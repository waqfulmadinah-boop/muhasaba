import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((r) => r, (error) => {
  if (error.response?.status === 401) { sessionStorage.clear(); window.location.reload(); }
  return Promise.reject(error);
});

const CATEGORIES = [
  { id: 'general', label: 'সাধারণ', color: '#6c5ce7' },
  { id: 'work', label: 'কাজ', color: '#0984e3' },
  { id: 'study', label: 'পড়াশোনা', color: '#00b894' },
  { id: 'health', label: 'স্বাস্থ্য', color: '#e17055' },
  { id: 'personal', label: 'ব্যক্তিগত', color: '#fd79a8' },
];
const PRIORITIES = [
  { id: 'low', label: 'কম', color: '#00b894', icon: '🟢' },
  { id: 'medium', label: 'মাঝারি', color: '#fdcb6e', icon: '🟡' },
  { id: 'high', label: 'বেশি', color: '#e17055', icon: '🔴' },
];
const MOODS = { happy: '😊', sad: '😢', neutral: '😐', excited: '🤩', angry: '😤', grateful: '🙏', love: '❤️', thinking: '🤔' };
const BADGES = [
  { id: 'first_task', label: 'প্রথম কাজ', emoji: '🌱', desc: 'প্রথম কাজ যোগ করেছেন', check: (s) => s.totalTasks >= 1 },
  { id: 'task_10', label: '১০ কাজ', emoji: '📋', desc: '১০টি কাজ সম্পন্ন', check: (s) => s.completedTasks >= 10 },
  { id: 'task_50', label: '৫০ কাজ', emoji: '🏅', desc: '৫০টি কাজ সম্পন্ন', check: (s) => s.completedTasks >= 50 },
  { id: 'task_100', label: '১০০ কাজ', emoji: '🏆', desc: '১০০টি কাজ সম্পন্ন', check: (s) => s.completedTasks >= 100 },
  { id: 'streak_3', label: '৩ দিন ধারা', emoji: '🔥', desc: '৩ দিন ধারাবাহিক', check: (s) => s.streak >= 3 },
  { id: 'streak_7', label: '৭ দিন ধারা', emoji: '⚡', desc: '৭ দিন ধারাবাহিক', check: (s) => s.streak >= 7 },
  { id: 'streak_30', label: '৩০ দিন ধারা', emoji: '💎', desc: '৩০ দিন ধারাবাহিক', check: (s) => s.streak >= 30 },
  { id: 'perfect_5', label: '৫ পারফেক্ট দিন', emoji: '⭐', desc: '৫ দিন ১০০% সম্পন্ন', check: (s) => s.totalPerfectDays >= 5 },
  { id: 'perfect_10', label: '১০ পারফেক্ট দিন', emoji: '🌟', desc: '১০ দিন ১০০% সম্পন্ন', check: (s) => s.totalPerfectDays >= 10 },
  { id: 'note_10', label: 'ডায়েরি লেখক', emoji: '📝', desc: '১০টি নোট লিখেছেন', check: (s) => s.totalNotes >= 10 },
];

const getTheme = () => {
  const saved = localStorage.getItem('theme');
  return saved || 'light';
};

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post(isLogin ? '/login' : '/register',
        isLogin ? { username, password } : { username, password, full_name: fullName });
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) { setError(err.response?.data?.error || 'কিছু ভুল হয়েছে'); }
    setLoading(false);
  };
  const S = (dark) => ({
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', background: dark ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', animation: 'fadeIn 0.6s ease' },
    card: { background: dark ? '#1e272e' : 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.3)', animation: 'slideUp 0.5s ease' },
    title: { textAlign: 'center', fontSize: '32px', fontWeight: '700', background: dark ? 'linear-gradient(135deg, #a29bfe, #74b9ff)' : 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' },
    subtitle: { textAlign: 'center', fontSize: '14px', color: dark ? '#aaa' : '#888', marginBottom: '30px' },
    tabs: { display: 'flex', marginBottom: '25px', borderRadius: '12px', background: dark ? '#2d3436' : '#f0f0f0', padding: '4px' },
    tab: { flex: 1, padding: '12px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', transition: 'all 0.3s', background: 'transparent', color: dark ? '#aaa' : '#666' },
    tabActive: { background: dark ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' },
    input: { width: '100%', padding: '14px 16px', border: `2px solid ${dark ? '#3d3d3d' : '#e0e0e0'}`, borderRadius: '12px', fontSize: '15px', marginBottom: '15px', outline: 'none', background: dark ? '#2d3436' : 'white', color: dark ? '#eee' : '#333', transition: 'border 0.3s' },
    btn: { width: '100%', padding: '14px', border: 'none', borderRadius: '12px', background: dark ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', opacity: loading ? 0.7 : 1 },
    error: { color: '#ff6b6b', fontSize: '14px', marginBottom: '10px', textAlign: 'center' },
  });
  const [dark, setDark] = useState(getTheme() === 'dark');
  useEffect(() => { setDark(getTheme() === 'dark'); }, []);
  const s = S(dark);
  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.title}>মুহাসাবত্র</div>
        <div style={s.subtitle}>দৈনন্দিন কাজের হিসাব</div>
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(isLogin ? s.tabActive : {}) }} onClick={() => { setIsLogin(true); setError(''); }}>লগইন</button>
          <button style={{ ...s.tab, ...(!isLogin ? s.tabActive : {}) }} onClick={() => { setIsLogin(false); setError(''); }}>রেজিস্ট্রেশন</button>
        </div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && <input style={s.input} type="text" placeholder="পুরো নাম" value={fullName} onChange={e => setFullName(e.target.value)} required />}
          <input style={s.input} type="text" placeholder="ব্যবহারকারী নাম" value={username} onChange={e => setUsername(e.target.value)} required />
          <input style={s.input} type="password" placeholder="পাসওয়ার্ড" value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={s.btn} type="submit" disabled={loading}>{loading ? 'অপেক্ষা করুন...' : (isLogin ? 'লগইন করুন' : 'রেজিস্টার করুন')}</button>
        </form>
      </div>
    </div>
  );
}

function Navbar({ user, onLogout, currentPage, setCurrentPage, dark, setDark }) {
  const pages = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: '📊' },
    { id: 'tasks', label: 'কাজ', icon: '✅' },
    { id: 'notes', label: 'নোট', icon: '📝' },
    { id: 'calendar', label: 'ক্যালেন্ডার', icon: '📅' },
    { id: 'achievements', label: 'ব্যাজ', icon: '🏅' },
    { id: 'settings', label: 'সেটিংস', icon: '⚙️' },
  ];
  return (
    <nav style={{ background: dark ? '#1e272e' : 'white', padding: '12px 20px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100, animation: 'slideDown 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', background: dark ? 'linear-gradient(135deg, #a29bfe, #74b9ff)' : 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>মুহাসাবত্র</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {pages.map(p => (
            <button key={p.id} onClick={() => setCurrentPage(p.id)} style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.3s', background: currentPage === p.id ? (dark ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'linear-gradient(135deg, #667eea, #764ba2)') : 'transparent', color: currentPage === p.id ? 'white' : (dark ? '#aaa' : '#666') }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => { setDark(!dark); localStorage.setItem('theme', !dark ? 'dark' : 'light'); }} style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', background: dark ? '#2d3436' : '#f0f0f0', cursor: 'pointer', fontSize: '18px', transition: 'all 0.3s' }}>{dark ? '☀️' : '🌙'}</button>
          <button onClick={onLogout} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#ff6b6b', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>লগআউট</button>
        </div>
      </div>
    </nav>
  );
}

function Dashboard({ selectedDate, dark }) {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const load = useCallback(async () => {
    try {
      const [d, s] = await Promise.all([api.get(`/dashboard?date=${selectedDate}`), api.get('/stats')]);
      setData(d.data); setStats(s.data);
    } catch (e) { console.error(e); }
  }, [selectedDate]);
  useEffect(() => { load(); }, [load]);
  if (!data) return <div style={{ textAlign: 'center', padding: '60px', color: dark ? '#aaa' : '#aaa' }}><div style={{ fontSize: '50px', animation: 'spin 1s linear infinite' }}>⏳</div></div>;
  const c = dark ? '#2d3436' : 'white';
  const tc = dark ? '#eee' : '#333';
  const sc = dark ? '#aaa' : '#888';
  const getProgressColor = (p) => p >= 90 ? 'linear-gradient(135deg, #00b894, #00cec9)' : p >= 70 ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : p >= 50 ? 'linear-gradient(135deg, #fdcb6e, #e17055)' : 'linear-gradient(135deg, #ff7675, #d63031)';
  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        {[
          { num: stats?.totalTasks || 0, label: 'মোট কাজ', icon: '📋' },
          { num: stats?.completedTasks || 0, label: 'সম্পন্ন', icon: '✅' },
          { num: `${data.streak || 0} 🔥`, label: 'ধারা', icon: '' },
          { num: stats?.totalPerfectDays || 0, label: 'পারফেক্ট দিন', icon: '⭐' },
          { num: stats?.totalNotes || 0, label: 'নোট', icon: '📝' },
        ].map((item, i) => (
          <div key={i} style={{ background: c, borderRadius: '18px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', textAlign: 'center', transition: 'transform 0.3s', cursor: 'default', animation: `slideUp 0.4s ease ${i * 0.1}s both` }}>
            <div style={{ fontSize: '28px', fontWeight: '700', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{item.num}</div>
            <div style={{ fontSize: '12px', color: sc, marginTop: '4px' }}>{item.icon} {item.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: c, borderRadius: '24px', padding: '35px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', textAlign: 'center', marginBottom: '25px', animation: 'slideUp 0.5s ease' }}>
        <div style={{ fontSize: '70px', marginBottom: '10px', animation: 'bounce 1s ease' }}>{data.emoji}</div>
        <div style={{ fontSize: '26px', fontWeight: '700', color: tc, marginBottom: '10px' }}>আজকের ফলাফল: {data.percentage}%</div>
        <div style={{ fontSize: '16px', lineHeight: '1.8', color: sc, marginBottom: '20px' }}>{data.message}</div>
        <div style={{ width: '100%', height: '18px', background: dark ? '#3d3d3d' : '#e9ecef', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: '10px', transition: 'width 1s ease', background: getProgressColor(data.percentage), width: `${data.percentage}%` }}></div>
        </div>
      </div>
      <div style={{ background: c, borderRadius: '20px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: tc, marginBottom: '20px' }}>📊 সাপ্তাহিক পারফরম্যান্স</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', gap: '8px' }}>
          {data.weeklyStats.map((day, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: dark ? '#a29bfe' : '#667eea' }}>{day.percentage}%</div>
              <div style={{ width: '100%', borderRadius: '8px 8px 0 0', background: day.total === 0 ? (dark ? '#3d3d3d' : '#e9ecef') : 'linear-gradient(180deg, #667eea, #764ba2)', transition: 'height 0.5s', height: `${Math.max(day.percentage * 1.3, 5)}px`, opacity: day.total === 0 ? 0.3 : 1 }}></div>
              <div style={{ fontSize: '10px', color: sc, fontWeight: '600' }}>{day.day.substring(0, 3)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tasks({ selectedDate, dark }) {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const load = useCallback(async () => {
    try { const { data } = await api.get(`/tasks?date=${selectedDate}`); setTasks(data); } catch (e) { console.error(e); }
  }, [selectedDate]);
  useEffect(() => { load(); }, [load]);
  const addTask = async (e) => {
    e.preventDefault(); if (!title.trim()) return;
    await api.post('/tasks', { title, description, date: selectedDate, category, priority });
    setTitle(''); setDescription(''); setCategory('general'); setPriority('medium'); setShowModal(false); load();
  };
  const toggleTask = async (task) => { await api.put(`/tasks/${task.id}`, { completed: !task.completed }); load(); };
  const deleteTask = async (id) => { if (window.confirm('নিশ্চিত?')) { await api.delete(`/tasks/${id}`); load(); } };
  const completedCount = tasks.filter(t => t.completed).length;
  const percentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const filtered = tasks.filter(t => {
    if (filter === 'completed' && !t.completed) return false;
    if (filter === 'pending' && t.completed) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const c = dark ? '#2d3436' : 'white';
  const tc = dark ? '#eee' : '#333';
  const sc = dark ? '#aaa' : '#888';
  const ic = dark ? '#3d3d3d' : '#f0f0f0';
  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '22px', color: tc }}>আজকের কাজ</h2>
          <p style={{ color: sc, fontSize: '14px' }}>{completedCount}/{tasks.length} সম্পন্ন ({percentage}%)</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: dark ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s' }}>+ নতুন কাজ</button>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 কাজ খুঁজুন..." style={{ flex: 1, minWidth: '200px', padding: '10px 16px', borderRadius: '12px', border: `2px solid ${dark ? '#3d3d3d' : '#e0e0e0'}`, background: dark ? '#1e272e' : 'white', color: dark ? '#eee' : '#333', fontSize: '14px', outline: 'none' }} />
        {['all', 'pending', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: filter === f ? (dark ? '#6c5ce7' : '#667eea') : ic, color: filter === f ? 'white' : (dark ? '#aaa' : '#666') }}>
            {f === 'all' ? 'সব' : f === 'pending' ? 'বাকি' : 'সম্পন্ন'}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: sc }}><div style={{ fontSize: '50px', marginBottom: '10px' }}>📋</div>কোনো কাজ নেই</div>
      ) : (
        filtered.map((task, i) => {
          const cat = CATEGORIES.find(c2 => c2.id === task.category) || CATEGORIES[0];
          const pri = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[1];
          return (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '14px', marginBottom: '10px', background: task.completed ? (dark ? '#1a3a2a' : '#f0fff4') : c, borderLeft: `4px solid ${cat.color}`, transition: 'all 0.3s', animation: `slideUp 0.3s ease ${i * 0.05}s both`, cursor: 'pointer' }} onClick={() => toggleTask(task)}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `3px solid ${task.completed ? '#00b894' : dark ? '#555' : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: task.completed ? '#00b894' : 'transparent', transition: 'all 0.3s', marginRight: '15px' }}>
                {task.completed && <span style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', color: task.completed ? (dark ? '#666' : '#aaa') : tc, textDecoration: task.completed ? 'line-through' : 'none', fontWeight: '500' }}>{task.title}</div>
                {task.description && <div style={{ fontSize: '12px', color: sc, marginTop: '3px' }}>{task.description}</div>}
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', background: cat.color + '22', color: cat.color, fontSize: '11px', fontWeight: '600' }}>{cat.label}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', background: pri.color + '22', color: pri.color, fontSize: '11px', fontWeight: '600' }}>{pri.icon} {pri.label}</span>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#ff6b6b', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>মুছুন</button>
            </div>
          );
        })
      )}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', animation: 'fadeIn 0.3s ease' }} onClick={() => setShowModal(false)}>
          <div style={{ background: c, borderRadius: '24px', padding: '30px', width: '100%', maxWidth: '450px', animation: 'slideUp 0.3s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: tc }}>নতুন কাজ যোগ করুন</div>
            <form onSubmit={addTask}>
              <input style={{ width: '100%', padding: '14px', border: `2px solid ${dark ? '#3d3d3d' : '#e0e0e0'}`, borderRadius: '12px', fontSize: '15px', marginBottom: '12px', outline: 'none', background: dark ? '#1e272e' : 'white', color: dark ? '#eee' : '#333' }} placeholder="কাজের শিরোনাম" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
              <textarea style={{ width: '100%', padding: '14px', border: `2px solid ${dark ? '#3d3d3d' : '#e0e0e0'}`, borderRadius: '12px', fontSize: '15px', marginBottom: '12px', outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit', background: dark ? '#1e272e' : 'white', color: dark ? '#eee' : '#333' }} placeholder="বিস্তারিত (ঐচ্ছিক)" value={description} onChange={e => setDescription(e.target.value)} />
              <label style={{ fontSize: '13px', color: sc, fontWeight: '600', marginBottom: '6px', display: 'block' }}>ক্যাটাগরি:</label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: `2px solid ${category === cat.id ? cat.color : 'transparent'}`, background: category === cat.id ? cat.color + '22' : ic, color: category === cat.id ? cat.color : sc, fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{cat.label}</button>
                ))}
              </div>
              <label style={{ fontSize: '13px', color: sc, fontWeight: '600', marginBottom: '6px', display: 'block' }}>প্রায়োরিটি:</label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '15px', flexWrap: 'wrap' }}>
                {PRIORITIES.map(p => (
                  <button key={p.id} type="button" onClick={() => setPriority(p.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: `2px solid ${priority === p.id ? p.color : 'transparent'}`, background: priority === p.id ? p.color + '22' : ic, color: priority === p.id ? p.color : sc, fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{p.icon} {p.label}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '12px', background: dark ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>যোগ করুন</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '12px', background: dark ? '#3d3d3d' : '#e0e0e0', color: dark ? '#aaa' : '#666', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>বাতিল</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Notes({ selectedDate, dark }) {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [search, setSearch] = useState('');
  const load = useCallback(async () => {
    try { const { data } = await api.get(`/notes?date=${selectedDate}&search=${search}`); setNotes(data); } catch (e) { console.error(e); }
  }, [selectedDate, search]);
  useEffect(() => { load(); }, [load]);
  const addNote = async (e) => {
    e.preventDefault(); if (!content.trim()) return;
    await api.post('/notes', { content, date: selectedDate, mood });
    setContent(''); setMood('neutral'); setShowModal(false); load();
  };
  const deleteNote = async (id) => { if (window.confirm('নিশ্চিত?')) { await api.delete(`/notes/${id}`); load(); } };
  const c = dark ? '#2d3436' : 'white';
  const tc = dark ? '#eee' : '#333';
  const sc = dark ? '#aaa' : '#888';
  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '22px', color: tc }}>📝 নোট/ডায়েরি</h2>
        <button onClick={() => setShowModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: dark ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>+ নতুন নোট</button>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 নোট খুঁজুন..." style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `2px solid ${dark ? '#3d3d3d' : '#e0e0e0'}`, background: dark ? '#1e272e' : 'white', color: dark ? '#eee' : '#333', fontSize: '14px', outline: 'none', marginBottom: '20px' }} />
      {notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: sc }}><div style={{ fontSize: '50px', marginBottom: '10px' }}>📒</div>কোনো নোট নেই</div>
      ) : (
        notes.map((note, i) => (
          <div key={note.id} style={{ background: c, borderRadius: '16px', padding: '20px', marginBottom: '15px', borderLeft: '4px solid #667eea', animation: `slideUp 0.3s ease ${i * 0.05}s both` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', color: sc, fontWeight: '600' }}>{note.day}, {note.date}</div>
              <div style={{ fontSize: '24px' }}>{MOODS[note.mood] || '😐'}</div>
            </div>
            <div style={{ fontSize: '15px', color: tc, lineHeight: '1.7', marginTop: '10px', whiteSpace: 'pre-wrap' }}>{note.content}</div>
            <button onClick={() => deleteNote(note.id)} style={{ marginTop: '10px', padding: '5px 12px', borderRadius: '8px', border: 'none', background: '#ff6b6b', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>মুছুন</button>
          </div>
        ))
      )}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', animation: 'fadeIn 0.3s ease' }} onClick={() => setShowModal(false)}>
          <div style={{ background: c, borderRadius: '24px', padding: '30px', width: '100%', maxWidth: '450px', animation: 'slideUp 0.3s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: tc }}>নতুন নোট লিখুন</div>
            <form onSubmit={addNote}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', color: sc, fontWeight: '600', display: 'block', marginBottom: '8px' }}>মনের অবস্থা:</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.entries(MOODS).map(([key, emoji]) => (
                    <div key={key} onClick={() => setMood(key)} style={{ padding: '8px 12px', borderRadius: '10px', border: `2px solid ${mood === key ? '#667eea' : 'transparent'}`, background: mood === key ? '#667eea22' : (dark ? '#3d3d3d' : '#f0f0f0'), cursor: 'pointer', fontSize: '22px', transition: 'all 0.2s' }}>{emoji}</div>
                  ))}
                </div>
              </div>
              <textarea style={{ width: '100%', padding: '14px', border: `2px solid ${dark ? '#3d3d3d' : '#e0e0e0'}`, borderRadius: '12px', fontSize: '15px', marginBottom: '15px', outline: 'none', resize: 'vertical', minHeight: '150px', fontFamily: 'inherit', background: dark ? '#1e272e' : 'white', color: dark ? '#eee' : '#333' }} placeholder="আজকের দিন সম্পর্কে লিখুন..." value={content} onChange={e => setContent(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '12px', background: dark ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>সংরক্ষণ</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '12px', background: dark ? '#3d3d3d' : '#e0e0e0', color: dark ? '#aaa' : '#666', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>বাতিল</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Calendar({ dark }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const banglaDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
  const load = useCallback(async () => {
    try { const { data: d } = await api.get(`/calendar?month=${month}&year=${year}`); setData(d); } catch (e) { console.error(e); }
  }, [month, year]);
  useEffect(() => { load(); }, [load]);
  const firstDay = new Date(year, month, 1).getDay();
  const c = dark ? '#2d3436' : 'white';
  const tc = dark ? '#eee' : '#333';
  const sc = dark ? '#aaa' : '#888';
  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: dark ? '#3d3d3d' : '#f0f0f0', cursor: 'pointer', fontSize: '16px', color: tc }}>←</button>
        <div style={{ fontSize: '20px', fontWeight: '700', color: tc }}>{months[month]} {year}</div>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: dark ? '#3d3d3d' : '#f0f0f0', cursor: 'pointer', fontSize: '16px', color: tc }}>→</button>
      </div>
      <div style={{ background: c, borderRadius: '20px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '10px' }}>
          {banglaDays.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '700', color: sc, padding: '8px' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {data.map((day, i) => {
            const today = new Date().toISOString().split('T')[0];
            const isToday = day.date === today;
            const getColor = (p) => p >= 90 ? '#00b894' : p >= 70 ? '#6c5ce7' : p >= 50 ? '#fdcb6e' : day.total > 0 ? '#e17055' : (dark ? '#3d3d3d' : '#f0f0f0');
            return (
              <div key={i} style={{ aspectRatio: '1', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isToday ? (dark ? '#6c5ce722' : '#667eea22') : 'transparent', border: isToday ? '2px solid #667eea' : '2px solid transparent', transition: 'all 0.2s', cursor: 'default' }}>
                <div style={{ fontSize: '14px', fontWeight: isToday ? '700' : '500', color: tc }}>{parseInt(day.date.split('-')[2])}</div>
                {day.total > 0 && (
                  <>
                    <div style={{ width: '80%', height: '6px', borderRadius: '3px', background: dark ? '#3d3d3d' : '#e9ecef', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${day.percentage}%`, borderRadius: '3px', background: getColor(day.percentage), transition: 'width 0.5s' }}></div>
                    </div>
                    <div style={{ fontSize: '9px', color: sc, marginTop: '2px' }}>{day.percentage}%</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Achievements({ dark }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/stats').then(r => setStats(r.data)).catch(console.error); }, []);
  const c = dark ? '#2d3436' : 'white';
  const tc = dark ? '#eee' : '#333';
  const sc = dark ? '#aaa' : '#888';
  if (!stats) return <div style={{ textAlign: 'center', padding: '50px' }}><div style={{ fontSize: '50px', animation: 'spin 1s linear infinite' }}>⏳</div></div>;
  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ fontSize: '22px', color: tc, marginBottom: '25px', textAlign: 'center' }}>🏅 আপনার ব্যাজ</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
        {BADGES.map((badge, i) => {
          const earned = badge.check(stats);
          return (
            <div key={badge.id} style={{ background: c, borderRadius: '18px', padding: '20px', textAlign: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', opacity: earned ? 1 : 0.4, transition: 'all 0.3s', animation: `slideUp 0.4s ease ${i * 0.08}s both`, transform: earned ? 'scale(1)' : 'scale(0.95)' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px', filter: earned ? 'none' : 'grayscale(1)' }}>{badge.emoji}</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: tc }}>{badge.label}</div>
              <div style={{ fontSize: '11px', color: sc, marginTop: '4px' }}>{badge.desc}</div>
              {earned && <div style={{ marginTop: '8px', padding: '3px 10px', borderRadius: '6px', background: '#00b89422', color: '#00b894', fontSize: '11px', fontWeight: '700' }}>অর্জিত ✓</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Settings({ dark, setDark }) {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { api.get('/me').then(r => { setUser(r.data); setFullName(r.data.full_name); }).catch(console.error); }, []);
  const saveName = async () => {
    try { await api.put('/profile', { full_name: fullName }); setMsg('নাম আপডেট হয়েছে!'); setErr(''); } catch (e) { setErr(e.response?.data?.error || 'ত্রুটি'); }
  };
  const savePass = async () => {
    try { await api.put('/profile', { old_password: oldPass, new_password: newPass }); setMsg('পাসওয়ার্ড পরিবর্তন হয়েছে!'); setErr(''); setOldPass(''); setNewPass(''); } catch (e) { setErr(e.response?.data?.error || 'ত্রুটি'); }
  };
  const c = dark ? '#2d3436' : 'white';
  const tc = dark ? '#eee' : '#333';
  const sc = dark ? '#aaa' : '#888';
  const ic = dark ? '#3d3d3d' : '#f0f0f0';
  const inputS = { width: '100%', padding: '14px', border: `2px solid ${dark ? '#3d3d3d' : '#e0e0e0'}`, borderRadius: '12px', fontSize: '15px', marginBottom: '12px', outline: 'none', background: dark ? '#1e272e' : 'white', color: dark ? '#eee' : '#333' };
  return (
    <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '22px', color: tc, marginBottom: '25px', textAlign: 'center' }}>⚙️ সেটিংস</h2>
      {msg && <div style={{ padding: '12px', borderRadius: '10px', background: '#00b89422', color: '#00b894', textAlign: 'center', marginBottom: '15px', fontWeight: '600' }}>{msg}</div>}
      {err && <div style={{ padding: '12px', borderRadius: '10px', background: '#ff6b6b22', color: '#ff6b6b', textAlign: 'center', marginBottom: '15px', fontWeight: '600' }}>{err}</div>}
      <div style={{ background: c, borderRadius: '20px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: tc, marginBottom: '15px' }}>প্রোফাইল আপডেট</div>
        <input style={inputS} placeholder="পুরো নাম" value={fullName} onChange={e => setFullName(e.target.value)} />
        <button onClick={saveName} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '12px', background: dark ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>নাম সংরক্ষণ</button>
      </div>
      <div style={{ background: c, borderRadius: '20px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: tc, marginBottom: '15px' }}>পাসওয়ার্ড পরিবর্তন</div>
        <input style={inputS} type="password" placeholder="পুরো পাসওয়ার্ড" value={oldPass} onChange={e => setOldPass(e.target.value)} />
        <input style={inputS} type="password" placeholder="নতুন পাসওয়ার্ড" value={newPass} onChange={e => setNewPass(e.target.value)} />
        <button onClick={savePass} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '12px', background: '#ff6b6b', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>পাসওয়ার্ড পরিবর্তন</button>
      </div>
      <div style={{ background: c, borderRadius: '20px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: tc, marginBottom: '15px' }}>থিম</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { setDark(false); localStorage.setItem('theme', 'light'); }} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `2px solid ${!dark ? '#667eea' : 'transparent'}`, background: !dark ? '#667eea22' : ic, cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: tc }}>☀️ লাইট</button>
          <button onClick={() => { setDark(true); localStorage.setItem('theme', 'dark'); }} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `2px solid ${dark ? '#6c5ce7' : 'transparent'}`, background: dark ? '#6c5ce722' : ic, cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: tc }}>🌙 ডার্ক</button>
        </div>
      </div>
    </div>
  );
}

function DateNav({ selectedDate, setSelectedDate, dark }) {
  const changeDate = (days) => { const d = new Date(selectedDate); d.setDate(d.getDate() + days); setSelectedDate(d.toISOString().split('T')[0]); };
  const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const banglaMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const d = new Date(selectedDate);
  const tc = dark ? '#eee' : '#333';
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
      <button onClick={() => changeDate(-1)} style={{ padding: '10px 18px', borderRadius: '12px', border: 'none', background: dark ? '#3d3d3d' : '#f0f0f0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: tc }}>← গতকাল</button>
      <div style={{ fontSize: '16px', fontWeight: '700', color: tc }}>{d.getDate()} {banglaMonths[d.getMonth()]} {d.getFullYear()}, {banglaDays[d.getDay()]}</div>
      <button onClick={() => changeDate(1)} style={{ padding: '10px 18px', borderRadius: '12px', border: 'none', background: dark ? '#3d3d3d' : '#f0f0f0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: tc }}>আগামীকাল →</button>
      <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} style={{ padding: '10px 18px', borderRadius: '12px', border: 'none', background: dark ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>আজ</button>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dark, setDark] = useState(getTheme() === 'dark');
  useEffect(() => { const t = sessionStorage.getItem('token'); const u = sessionStorage.getItem('user'); if (t && u) setUser(JSON.parse(u)); }, []);
  const handleLogout = () => { sessionStorage.clear(); setUser(null); setCurrentPage('dashboard'); };
  const bg = dark ? '#0f0f23' : '#f0f2f5';
  if (!user) return <LoginPage onLogin={setUser} />;
  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background 0.3s' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { scrollbar-width: thin; scrollbar-color: #667eea ${dark ? '#1e272e' : '#f0f0f0'}; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${dark ? '#1e272e' : '#f0f0f0'}; }
        ::-webkit-scrollbar-thumb { background: #667eea; border-radius: 4px; }
        input:focus, textarea:focus { border-color: #667eea !important; }
        button:hover { transform: translateY(-1px); }
      `}</style>
      <Navbar user={user} onLogout={handleLogout} currentPage={currentPage} setCurrentPage={setCurrentPage} dark={dark} setDark={setDark} />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '25px 20px' }}>
        {currentPage !== 'settings' && <DateNav selectedDate={selectedDate} setSelectedDate={setSelectedDate} dark={dark} />}
        {currentPage === 'dashboard' && <Dashboard selectedDate={selectedDate} dark={dark} />}
        {currentPage === 'tasks' && <Tasks selectedDate={selectedDate} dark={dark} />}
        {currentPage === 'notes' && <Notes selectedDate={selectedDate} dark={dark} />}
        {currentPage === 'calendar' && <Calendar dark={dark} />}
        {currentPage === 'achievements' && <Achievements dark={dark} />}
        {currentPage === 'settings' && <Settings dark={dark} setDark={setDark} />}
      </div>
    </div>
  );
}

export default App;
