import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// ============ API Helper ============
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ============ Styles ============
const styles = {
  app: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  authContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' },
  authCard: { background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  title: { textAlign: 'center', fontSize: '28px', fontWeight: '700', color: '#333', marginBottom: '8px' },
  subtitle: { textAlign: 'center', fontSize: '14px', color: '#888', marginBottom: '30px' },
  tabContainer: { display: 'flex', marginBottom: '25px', borderRadius: '12px', background: '#f0f0f0', padding: '4px' },
  tab: { flex: 1, padding: '12px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', transition: 'all 0.3s', background: 'transparent', color: '#666' },
  tabActive: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' },
  input: { width: '100%', padding: '14px 16px', border: '2px solid #e0e0e0', borderRadius: '12px', fontSize: '15px', marginBottom: '15px', outline: 'none', transition: 'border 0.3s' },
  button: { width: '100%', padding: '14px', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' },
  nav: { background: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 20px rgba(0,0,0,0.1)' },
  navTitle: { fontSize: '22px', fontWeight: '700', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  navUser: { display: 'flex', alignItems: 'center', gap: '15px' },
  navBtn: { padding: '8px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { background: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', transition: 'transform 0.3s' },
  statNumber: { fontSize: '42px', fontWeight: '700', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  statLabel: { fontSize: '14px', color: '#888', marginTop: '5px' },
  messageCard: { background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', marginBottom: '30px', textAlign: 'center' },
  messageEmoji: { fontSize: '60px', marginBottom: '15px' },
  messageText: { fontSize: '18px', lineHeight: '1.8', color: '#444' },
  progressBar: { width: '100%', height: '20px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden', marginTop: '15px' },
  progressFill: { height: '100%', borderRadius: '10px', transition: 'width 0.5s ease', background: 'linear-gradient(135deg, #667eea, #764ba2)' },
  weekChart: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', padding: '20px 0', gap: '8px' },
  weekBar: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' },
  barFill: { width: '100%', borderRadius: '8px 8px 0 0', background: 'linear-gradient(180deg, #667eea, #764ba2)', transition: 'height 0.5s', minHeight: '5px' },
  barLabel: { fontSize: '11px', color: '#888', fontWeight: '600' },
  barPercent: { fontSize: '12px', fontWeight: '700', color: '#667eea' },
  section: { background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', marginBottom: '30px' },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },
  taskItem: { display: 'flex', alignItems: 'center', padding: '15px', borderRadius: '12px', marginBottom: '10px', background: '#f8f9fa', transition: 'all 0.3s', gap: '15px' },
  taskCheckbox: { width: '24px', height: '24px', borderRadius: '50%', border: '3px solid #667eea', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' },
  taskCheckboxDone: { background: 'linear-gradient(135deg, #667eea, #764ba2)', borderColor: '#764ba2' },
  taskTitle: { flex: 1, fontSize: '15px', color: '#333' },
  taskTitleDone: { textDecoration: 'line-through', color: '#aaa' },
  taskDelete: { padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#ff6b6b', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  noteCard: { background: '#f8f9fa', borderRadius: '15px', padding: '20px', marginBottom: '15px', borderLeft: '4px solid #667eea' },
  noteDate: { fontSize: '13px', color: '#888', marginBottom: '8px', fontWeight: '600' },
  noteContent: { fontSize: '15px', color: '#444', lineHeight: '1.6' },
  noteMood: { marginTop: '10px', fontSize: '20px' },
  noteDelete: { marginTop: '10px', padding: '5px 12px', borderRadius: '8px', border: 'none', background: '#ff6b6b', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  addButton: { padding: '12px 25px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
  modalContent: { background: 'white', borderRadius: '20px', padding: '30px', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflow: 'auto' },
  modalTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#333' },
  select: { width: '100%', padding: '14px 16px', border: '2px solid #e0e0e0', borderRadius: '12px', fontSize: '15px', marginBottom: '15px', outline: 'none', background: 'white' },
  textarea: { width: '100%', padding: '14px 16px', border: '2px solid #e0e0e0', borderRadius: '12px', fontSize: '15px', marginBottom: '15px', outline: 'none', resize: 'vertical', minHeight: '100px', fontFamily: 'inherit' },
  dateNav: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' },
  dateBtn: { padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#f0f0f0', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s' },
  dateText: { fontSize: '18px', fontWeight: '700', color: '#333' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' },
  tabBtn: { padding: '12px 24px', borderRadius: '12px', border: '2px solid #e0e0e0', background: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: '600', transition: 'all 0.3s', color: '#666' },
  tabBtnActive: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', borderColor: '#667eea' },
  emptyState: { textAlign: 'center', padding: '40px 20px', color: '#aaa' },
  emptyEmoji: { fontSize: '60px', marginBottom: '15px' },
  emptyText: { fontSize: '16px' },
  error: { color: '#ff6b6b', fontSize: '14px', marginBottom: '10px', textAlign: 'center' },
  moodSelect: { display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' },
  moodOption: { padding: '10px 15px', borderRadius: '12px', border: '2px solid #e0e0e0', cursor: 'pointer', fontSize: '24px', transition: 'all 0.3s' },
  moodOptionActive: { borderColor: '#667eea', background: '#f0f0ff' },
};

// ============ Components ============

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin ? { username, password } : { username, password, full_name: fullName };
      const { data } = await api.post(endpoint, payload);
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'কিছু ভুল হয়েছে');
    }
    setLoading(false);
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <div style={styles.title}>আমার সৃতি</div>
        <div style={styles.subtitle}>দৈনন্দিন কাজের হিসাব</div>
        <div style={styles.tabContainer}>
          <button style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }} onClick={() => { setIsLogin(true); setError(''); }}>লগইন</button>
          <button style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }} onClick={() => { setIsLogin(false); setError(''); }}>রেজিস্ট্রেশন</button>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input style={styles.input} type="text" placeholder="পুরো নাম" value={fullName} onChange={e => setFullName(e.target.value)} required />
          )}
          <input style={styles.input} type="text" placeholder="ব্যবহারকারী নাম" value={username} onChange={e => setUsername(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="পাসওয়ার্ড" value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'অপেক্ষা করুন...' : (isLogin ? 'লগইন করুন' : 'রেজিস্টার করুন')}
          </button>
        </form>
      </div>
    </div>
  );
}

function Navbar({ user, onLogout, currentPage, setCurrentPage }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.navTitle}>আমার সৃতি</div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['dashboard', 'tasks', 'notes'].map(page => (
          <button key={page} style={{ ...styles.navBtn, background: currentPage === page ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f0f0f0', color: currentPage === page ? 'white' : '#666' }} onClick={() => setCurrentPage(page)}>
            {page === 'dashboard' ? 'ড্যাশবোর্ড' : page === 'tasks' ? 'কাজ' : 'নোট'}
          </button>
        ))}
      </div>
      <div style={styles.navUser}>
        <span style={{ fontSize: '14px', color: '#666' }}>স্বাগতম, {user.full_name}</span>
        <button style={{ ...styles.navBtn, background: '#ff6b6b', color: 'white' }} onClick={onLogout}>লগআউট</button>
      </div>
    </nav>
  );
}

function Dashboard({ selectedDate }) {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      const [dashRes, statsRes] = await Promise.all([
        api.get(`/dashboard?date=${selectedDate}`),
        api.get('/stats')
      ]);
      setData(dashRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
  }, [selectedDate]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (!data) return <div style={styles.emptyState}><div style={styles.emptyEmoji}>⏳</div><div style={styles.emptyText}>লোড হচ্ছে...</div></div>;

  const getProgressColor = (pct) => {
    if (pct >= 90) return 'linear-gradient(135deg, #00b894, #00cec9)';
    if (pct >= 70) return 'linear-gradient(135deg, #6c5ce7, #a29bfe)';
    if (pct >= 50) return 'linear-gradient(135deg, #fdcb6e, #e17055)';
    return 'linear-gradient(135deg, #ff7675, #d63031)';
  };

  return (
    <div>
      <div style={styles.dashboardGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats?.totalTasks || 0}</div>
          <div style={styles.statLabel}>মোট কাজ</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats?.completedTasks || 0}</div>
          <div style={styles.statLabel}>সম্পন্ন</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats?.totalNotes || 0}</div>
          <div style={styles.statLabel}>নোট</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats?.totalDays || 0}</div>
          <div style={styles.statLabel}>দিন সক্রিয়</div>
        </div>
      </div>

      <div style={styles.messageCard}>
        <div style={styles.messageEmoji}>{data.emoji}</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '10px' }}>
          আজকের ফলাফল: {data.percentage}%
        </div>
        <div style={styles.messageText}>{data.message}</div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${data.percentage}%`, background: getProgressColor(data.percentage) }}></div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>📊 সাপ্তাহিক পারফরম্যান্স</div>
        <div style={styles.weekChart}>
          {data.weeklyStats.map((day, i) => (
            <div key={i} style={styles.weekBar}>
              <div style={styles.barPercent}>{day.percentage}%</div>
              <div style={{ ...styles.barFill, height: `${Math.max(day.percentage * 1.5, 5)}px`, opacity: day.total === 0 ? 0.3 : 1 }}></div>
              <div style={styles.barLabel}>{day.day.substring(0, 3)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tasks({ selectedDate }) {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      const { data } = await api.get(`/tasks?date=${selectedDate}`);
      setTasks(data);
    } catch (err) { console.error(err); }
  }, [selectedDate]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.post('/tasks', { title, description, date: selectedDate });
      setTitle('');
      setDescription('');
      setShowModal(false);
      loadTasks();
    } catch (err) { alert('কাজ যোগ করা যায়নি'); }
  };

  const toggleTask = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, { completed: !task.completed });
      loadTasks();
    } catch (err) { alert('আপডেট করা যায়নি'); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই কাজটি মুছে ফেলতে চান?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      loadTasks();
    } catch (err) { alert('মুছে ফেলা যায়নি'); }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const percentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '22px', color: '#333' }}>আজকের কাজ</h2>
          <p style={{ color: '#888', fontSize: '14px' }}>{completedCount}/{tasks.length} সম্পন্ন ({percentage}%)</p>
        </div>
        <button style={styles.addButton} onClick={() => setShowModal(true)}>+ নতুন কাজ</button>
      </div>

      {tasks.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyEmoji}>📋</div>
          <div style={styles.emptyText}>আজকে কোনো কাজ নেই। নতুন কাজ যোগ করুন!</div>
        </div>
      ) : (
        tasks.map(task => (
          <div key={task.id} style={{ ...styles.taskItem, background: task.completed ? '#f0fff4' : '#f8f9fa' }}>
            <div style={{ ...styles.taskCheckbox, ...(task.completed ? styles.taskCheckboxDone : {}) }} onClick={() => toggleTask(task)}>
              {task.completed && <span style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>✓</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...styles.taskTitle, ...(task.completed ? styles.taskTitleDone : {}) }}>{task.title}</div>
              {task.description && <div style={{ fontSize: '13px', color: '#aaa', marginTop: '3px' }}>{task.description}</div>}
            </div>
            <button style={styles.taskDelete} onClick={() => deleteTask(task.id)}>মুছুন</button>
          </div>
        ))
      )}

      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>নতুন কাজ যোগ করুন</div>
            <form onSubmit={addTask}>
              <input style={styles.input} type="text" placeholder="কাজের শিরোনাম" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
              <textarea style={styles.textarea} placeholder="বিস্তারিত (ঐচ্ছিক)" value={description} onChange={e => setDescription(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ ...styles.button, flex: 1 }} type="submit">যোগ করুন</button>
                <button style={{ ...styles.button, flex: 1, background: '#e0e0e0', color: '#666' }} type="button" onClick={() => setShowModal(false)}>বাতিল</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Notes({ selectedDate }) {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');

  const loadNotes = useCallback(async () => {
    try {
      const { data } = await api.get(`/notes?date=${selectedDate}`);
      setNotes(data);
    } catch (err) { console.error(err); }
  }, [selectedDate]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post('/notes', { content, date: selectedDate, mood });
      setContent('');
      setMood('neutral');
      setShowModal(false);
      loadNotes();
    } catch (err) { alert('নোট যোগ করা যায়নি'); }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই নোটটি মুছে ফেলতে চান?')) return;
    try {
      await api.delete(`/notes/${id}`);
      loadNotes();
    } catch (err) { alert('মুছে ফেলা যায়নি'); }
  };

  const moodEmojis = { happy: '😊', sad: '😢', neutral: '😐', excited: '🤩', angry: '😤', grateful: '🙏', love: '❤️', thinking: '🤔' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '22px', color: '#333' }}>📝 আজকের নোট/ডায়েরি</h2>
        <button style={styles.addButton} onClick={() => setShowModal(true)}>+ নতুন নোট</button>
      </div>

      {notes.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyEmoji}>📒</div>
          <div style={styles.emptyText}>আজকে কোনো নোট নেই। আপনার মনের কথা লিখুন!</div>
        </div>
      ) : (
        notes.map(note => (
          <div key={note.id} style={styles.noteCard}>
            <div style={styles.noteDate}>{note.day}, {note.date}</div>
            <div style={styles.noteContent}>{note.content}</div>
            <div style={styles.noteMood}>{moodEmojis[note.mood] || '😐'}</div>
            <button style={styles.noteDelete} onClick={() => deleteNote(note.id)}>মুছুন</button>
          </div>
        ))
      )}

      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>নতুন নোট লিখুন</div>
            <form onSubmit={addNote}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '14px', color: '#666', marginBottom: '8px', display: 'block' }}>আপনার মনের অবস্থা:</label>
                <div style={styles.moodSelect}>
                  {Object.entries(moodEmojis).map(([key, emoji]) => (
                    <div key={key} style={{ ...styles.moodOption, ...(mood === key ? styles.moodOptionActive : {}) }} onClick={() => setMood(key)}>
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
              <textarea style={{ ...styles.textarea, minHeight: '150px' }} placeholder="আজকের দিন সম্পর্কে আপনার মনের কথা লিখুন..." value={content} onChange={e => setContent(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ ...styles.button, flex: 1 }} type="submit">সংরক্ষণ করুন</button>
                <button style={{ ...styles.button, flex: 1, background: '#e0e0e0', color: '#666' }} type="button" onClick={() => setShowModal(false)}>বাতিল</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DateNavigator({ selectedDate, setSelectedDate }) {
  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const banglaMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const d = new Date(selectedDate);
  const dateStr = `${d.getDate()} ${banglaMonths[d.getMonth()]} ${d.getFullYear()}, ${banglaDays[d.getDay()]}`;

  return (
    <div style={styles.dateNav}>
      <button style={styles.dateBtn} onClick={() => changeDate(-1)}>← গতকাল</button>
      <div style={styles.dateText}>{dateStr}</div>
      <button style={styles.dateBtn} onClick={() => changeDate(1)}>আগামীকাল →</button>
      <button style={{ ...styles.dateBtn, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }} onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>আজ</button>
    </div>
  );
}

// ============ Main App ============
function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div style={styles.app}>
      <Navbar user={user} onLogout={handleLogout} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div style={styles.main}>
        <DateNavigator selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        {currentPage === 'dashboard' && <Dashboard selectedDate={selectedDate} />}
        {currentPage === 'tasks' && <Tasks selectedDate={selectedDate} />}
        {currentPage === 'notes' && <Notes selectedDate={selectedDate} />}
      </div>
    </div>
  );
}

export default App;
