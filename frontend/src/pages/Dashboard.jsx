import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function Sidebar({ user, active, setActive, navigate }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'resumes', label: 'My Resumes', icon: '◻' },
    { id: 'analyze', label: 'Analyze', icon: '◈' },
  ];

  return (
    <div style={{ width: '220px', background: '#050505', borderRight: '1px solid #111', display: 'flex', flexDirection: 'column', padding: '24px 0', height: '100vh', position: 'fixed', left: 0, top: 0 }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #111' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', background: 'white', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'black', fontWeight: '900', fontSize: '12px' }}>R</span>
          </div>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>resumap.</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {links.map((link) => (
          <motion.button
            key={link.id}
            whileHover={{ background: '#111' }}
            onClick={() => setActive(link.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', background: active === link.id ? '#111' : 'transparent',
              border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px',
              color: active === link.id ? 'white' : '#6b7280',
              fontSize: '14px', fontWeight: active === link.id ? '600' : '400',
              textAlign: 'left',
            }}
          >
            <span>{link.icon}</span> {link.label}
          </motion.button>
        ))}
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid #111' }}>
        <div style={{ padding: '10px 12px', marginBottom: '8px' }}>
          <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: 0 }}>{user?.full_name || 'User'}</p>
          <p style={{ color: '#444', fontSize: '12px', margin: '2px 0 0' }}>{user?.email}</p>
        </div>
        <motion.button
          whileHover={{ color: '#fff' }}
          onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#444', fontSize: '14px', textAlign: 'left' }}
        >
          ↩ Sign out
        </motion.button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [active, setActive] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchResumes();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get('/api/users/me');
      setUser(res.data);
      setLoading(false);
    } catch {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const fetchResumes = async () => {
    try {
      const res = await API.get('/api/resumes');
      setResumes(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post('/api/resumes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResumes(prev => [{ id: res.data.resume_id, file_name: file.name, created_at: new Date().toISOString() }, ...prev]);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
        <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <span style={{ color: 'black', fontWeight: '900', fontSize: '24px' }}>R</span>
        </div>
      </motion.div>
      <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ color: '#6b7280', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Loading Dashboard...
      </motion.p>
    </div>
  );

  return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar user={user} active={active} setActive={setActive} navigate={navigate} />

      <main style={{ marginLeft: '220px', flex: 1, padding: '48px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '48px' }}>
          <p style={{ color: '#444', fontSize: '13px', letterSpacing: '0.05em', marginBottom: '8px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.full_name?.split(' ')[0] || 'there'}.
          </h1>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#111', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}
        >
          {[
            { label: 'Resumes', value: resumes.length },
            { label: 'Analyses Run', value: 0 },
            { label: 'Plan', value: 'Free' },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#080808', padding: '24px 28px' }}>
              <p style={{ color: '#444', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>{stat.label}</p>
              <p style={{ color: 'white', fontSize: '28px', fontWeight: '800', letterSpacing: '-1px' }}>{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Upload */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ marginBottom: '32px' }}
        >
          <p style={{ color: '#6b7280', fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>Upload Resume</p>
          <label style={{ display: 'block', border: '1px dashed #222', borderRadius: '10px', padding: '40px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}>
            <input type="file" accept=".pdf,.docx" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
            {uploading ? (
              <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ color: '#6b7280', fontSize: '14px' }}>
                Uploading...
              </motion.p>
            ) : (
              <>
                <p style={{ color: 'white', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Drop your resume here</p>
                <p style={{ color: '#444', fontSize: '13px' }}>PDF or DOCX · Max 10MB</p>
              </>
            )}
          </label>
        </motion.div>

        {/* Resumes List */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p style={{ color: '#6b7280', fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Your Resumes {resumes.length > 0 && `— ${resumes.length}`}
          </p>

          {resumes.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ border: '1px solid #111', borderRadius: '10px', padding: '48px', textAlign: 'center' }}>
              <p style={{ color: '#444', fontSize: '14px' }}>No resumes yet. Upload one above to get started.</p>
            </motion.div>
          ) : (
            <div style={{ border: '1px solid #111', borderRadius: '10px', overflow: 'hidden' }}>
              <AnimatePresence>
                {resumes.map((resume, i) => (
                  <motion.div
                    key={resume.id}
                    layout
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ opacity: { duration: 0.3 }, layout: { duration: 0.4, type: "spring", bounce: 0.2 } }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px 24px',
                      borderBottom: i < resumes.length - 1 ? '1px solid #111' : 'none',
                      background: '#080808',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#444', fontFamily: 'monospace', fontSize: '12px' }}>DOC</span>
                      <div>
                        <p style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>{resume.file_name}</p>
                        <p style={{ color: '#6b7280', fontSize: '12px' }}>{new Date(resume.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ background: '#3B82F6', color: 'white', borderColor: 'transparent' }}
                      onClick={() => navigate(`/analyze/${resume.id}`)}
                      style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #222', borderRadius: '6px', color: '#9ca3af', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Analyze →
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}