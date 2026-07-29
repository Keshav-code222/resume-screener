import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchResumes();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get('/api/users/me');
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const fetchResumes = async () => {
    try {
      const res = await API.get('/api/resumes');
      setResumes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/api/resumes/upload', formData);
      setResumes([...resumes, { id: res.data.resume_id, file_name: file.name, created_at: new Date() }]);
      alert('Resume uploaded! Skills detected: ' + res.data.skills.join(', '));
    } catch (err) {
      alert('Upload failed: ' + err.response?.data?.error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Resume Screener</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user?.full_name}</span>
            <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Upload Your Resume</h2>
          <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50">
            <span className="text-center">
              <p className="text-gray-600">Click to upload PDF or DOCX</p>
            </span>
            <input type="file" accept=".pdf,.docx" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-4">Your Resumes</h2>
          {resumes.length === 0 ? (
            <p className="text-gray-600">No resumes uploaded yet</p>
          ) : (
            <ul className="space-y-2">
              {resumes.map((resume) => (
                <li key={resume.id} className="flex justify-between items-center p-3 bg-gray-100 rounded">
                  <span>{resume.file_name}</span>
                  <button onClick={() => navigate(`/analyze/${resume.id}`)} className="bg-blue-600 text-white px-4 py-1 rounded text-sm">
                    Analyze
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}