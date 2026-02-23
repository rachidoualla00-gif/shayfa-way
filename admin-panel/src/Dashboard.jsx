import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const QuranAdmin = () => {
    const [pdfs, setPdfs] = useState([]);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('full');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPdfs();
    }, []);

    const fetchPdfs = async () => {
        const res = await axios.get(`${API_BASE}/quran/pdfs`);
        setPdfs(res.data);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('title', title);
        formData.append('category', category);

        try {
            await axios.post(`${API_BASE}/admin/quran/upload`, formData);
            alert('PDF Uploaded Successfully!');
            fetchPdfs();
            setTitle('');
            setFile(null);
        } catch (err) {
            alert('Upload failed');
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        await axios.delete(`${API_BASE}/admin/quran/pdf/${id}`);
        fetchPdfs();
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-8">Quran Management Console</h1>

            {/* Upload Section */}
            <form onSubmit={handleUpload} className="bg-white p-6 rounded-xl shadow-sm border mb-8 max-w-2xl">
                <h3 className="text-xl font-bold mb-4">Upload New PDF</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        className="p-3 border rounded-lg"
                        placeholder="Title..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                    <select
                        className="p-3 border rounded-lg"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="full">Full Quran</option>
                        <option value="juz">Juz</option>
                        <option value="surah">Surah</option>
                    </select>
                </div>
                <input
                    type="file"
                    className="mt-4 w-full p-4 border-2 border-dashed rounded-lg"
                    onChange={e => setFile(e.target.files[0])}
                    required
                />
                <button
                    disabled={loading}
                    className="mt-6 w-full p-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Deploy to Cloud'}
                </button>
            </form>

            {/* List Section */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 italic">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pdfs.map(p => (
                            <tr key={p._id} className="border-t">
                                <td className="p-4 font-semibold">{p.title}</td>
                                <td className="p-4 uppercase text-xs font-bold text-blue-600">{p.category}</td>
                                <td className="p-4 text-gray-500">{new Date(p.uploadedAt).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <button onClick={() => handleDelete(p._id)} className="text-red-500 font-bold">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuranAdmin;
