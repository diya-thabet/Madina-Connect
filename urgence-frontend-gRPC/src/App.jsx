import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Shield, Activity, MapPin, Phone, MessageSquare,
    Plus, Users, Upload, Send, CheckCircle, AlertTriangle, XCircle, Search
} from 'lucide-react';

// Configuration
const API_URL = "http://localhost:30090/api";

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Fetch Alerts (Server Streaming via Gateway)
    const fetchAlerts = async () => {
        try {
            const res = await axios.get(`${API_URL}/alerts`);
            // Sort by timestamp descending (newest first)
            const sorted = res.data.sort((a, b) => new Date(b.receivedTimestamp) - new Date(a.receivedTimestamp));
            setAlerts(sorted);
        } catch (error) {
            console.error("Connection error:", error);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 3000); // Live update every 3s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
            {/* --- HEADER --- */}
            <header className="bg-gradient-to-r from-red-700 to-red-600 text-white shadow-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full shadow-lg">
                            <Shield className="text-red-600" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">MADINA CONNECT</h1>
                            <p className="text-[10px] uppercase tracking-widest opacity-80">Plateforme Nationale d'Urgence</p>
                        </div>
                    </div>

                    <nav className="hidden md:flex gap-1">
                        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Activity size={18}/>}>Vue Globale</NavButton>
                        <NavButton active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon={<Users size={18}/>}>Dispatch (Admin)</NavButton>
                        <NavButton active={activeTab === 'batch'} onClick={() => setActiveTab('batch')} icon={<Upload size={18}/>}>Upload Groupé</NavButton>
                        <NavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare size={18}/>}>Live Chat</NavButton>
                    </nav>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="container mx-auto px-4 py-8">
                {activeTab === 'dashboard' && <DashboardView alerts={alerts} refresh={fetchAlerts} />}
                {activeTab === 'admin' && <AdminView alerts={alerts} refresh={fetchAlerts} />}
                {activeTab === 'batch' && <BatchView refresh={fetchAlerts} />}
                {activeTab === 'chat' && <ChatView />}
            </main>
        </div>
    );
}

// --- VIEW 1: DASHBOARD (The General Public View) ---
function DashboardView({ alerts, refresh }) {
    const [showForm, setShowForm] = useState(false);

    // Stats
    const total = alerts.length;
    const pending = alerts.filter(a => a.status === 'PENDING').length;
    const resolved = alerts.filter(a => a.status === 'RESOLVED').length;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Incidents" value={total} color="bg-blue-600" icon={<Activity />} />
                <StatCard title="Urgences en Cours" value={pending} color="bg-red-600" icon={<AlertTriangle />} />
                <StatCard title="Résolus" value={resolved} color="bg-green-600" icon={<CheckCircle />} />
                <button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg flex flex-col items-center justify-center p-4 transition transform hover:scale-105">
                    <Plus size={32} />
                    <span className="font-bold mt-1">NOUVELLE ALERTE</span>
                </button>
            </div>

            {/* Alert Feed */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-bold text-lg text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Flux en Temps Réel
                    </h2>
                    <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">gRPC Stream: Connected</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                    {alerts.map(alert => (
                        <AlertItem key={alert.alertId} alert={alert} />
                    ))}
                    {alerts.length === 0 && <EmptyState />}
                </div>
            </div>

            {showForm && <CreateAlertModal onClose={() => setShowForm(false)} onSuccess={refresh} />}
        </div>
    );
}

// --- VIEW 2: ADMIN (Update Status) ---
function AdminView({ alerts, refresh }) {
    const updateStatus = async (id, newStatus) => {
        try {
            await axios.put(`${API_URL}/alerts/${id}/status`, newStatus, { headers: { "Content-Type": "text/plain" } });
            refresh();
        } catch (e) {
            alert("Erreur update status");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="text-red-600" /> Centre de Dispatch
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="text-gray-400 text-sm border-b">
                        <th className="p-3">ID / Type</th>
                        <th className="p-3">Localisation</th>
                        <th className="p-3">Status Actuel</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {alerts.map(alert => (
                        <tr key={alert.alertId} className="border-b last:border-0 hover:bg-gray-50 group">
                            <td className="p-3">
                                <div className="font-bold text-gray-800">{alert.type}</div>
                                <div className="text-xs text-gray-400 font-mono">{alert.senderCin}</div>
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                                {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                            </td>
                            <td className="p-3">
                                <StatusBadge status={alert.status} />
                            </td>
                            <td className="p-3 text-right flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                                {alert.status !== 'IN_PROGRESS' && (
                                    <button onClick={() => updateStatus(alert.alertId, 'IN_PROGRESS')} className="px-3 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                                        Prendre en charge
                                    </button>
                                )}
                                {alert.status !== 'RESOLVED' && (
                                    <button onClick={() => updateStatus(alert.alertId, 'RESOLVED')} className="px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded hover:bg-green-200">
                                        Résoudre
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- VIEW 3: BATCH UPLOAD (Client Streaming Simulation) ---
function BatchView({ refresh }) {
    const [jsonInput, setJsonInput] = useState(JSON.stringify([
        { "type": "ACCIDENT", "latitude": 36.80, "longitude": 10.18, "description": "Crash bus", "senderCin": "1111" },
        { "type": "FIRE", "latitude": 36.81, "longitude": 10.19, "description": "Feu poubelle", "senderCin": "2222" }
    ], null, 2));
    const [status, setStatus] = useState(null);

    const handleUpload = async () => {
        try {
            setStatus('Uploading...');
            const data = JSON.parse(jsonInput);
            const res = await axios.post(`${API_URL}/alerts/batch`, data);
            setStatus(`✅ ${res.data.statusMessage} (${res.data.alertCount} items)`);
            refresh();
        } catch (e) {
            setStatus('❌ Erreur: JSON invalide ou serveur down.');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Upload className="text-red-600" /> Upload Groupé (Patrouille)
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    Simule le "Client Streaming". Copiez une liste d'alertes JSON ici.
                </p>
                <textarea
                    className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                />
                <div className="mt-4 flex justify-between items-center">
                    <span className="font-bold text-sm">{status}</span>
                    <button onClick={handleUpload} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition">
                        Streamer le Batch
                    </button>
                </div>
            </div>
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col justify-center items-center text-center">
                <Upload size={64} className="text-red-200 mb-4" />
                <h3 className="text-red-800 font-bold text-lg">Mode Patrouille</h3>
                <p className="text-red-600 text-sm max-w-xs mt-2">
                    Utilisé par les véhicules de police pour synchroniser les incidents hors-ligne une fois connectés au réseau.
                </p>
            </div>
        </div>
    );
}

// --- VIEW 4: LIVE CHAT (Bidirectional Streaming Simulation) ---
function ChatView() {
    const [messages, setMessages] = useState([
        { sender: 'System', text: 'Bienvenue sur le canal sécurisé Madina Connect.', time: 'Now' }
    ]);
    const [input, setInput] = useState('');
    const chatBoxRef = useRef(null);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message locally
        const userMsg = { sender: 'Moi', text: input, time: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            // Send to Java -> gRPC -> Java -> React
            const res = await axios.post(`${API_URL}/chat`, {
                senderCin: "12345678", // Demo CIN
                message: userMsg.text
            });

            // Add server reply
            const serverMsg = {
                sender: 'Protection Civile',
                text: res.data.message,
                time: new Date().toLocaleTimeString(),
                isOperator: true
            };
            setMessages(prev => [...prev, serverMsg]);

        } catch (e) {
            setMessages(prev => [...prev, { sender: 'Error', text: 'Connexion perdue.', time: 'Now' }]);
        }
    };

    useEffect(() => {
        chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
    }, [messages]);

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 h-[600px] flex flex-col">
            <div className="bg-red-600 p-4 text-white flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2">
                    <MessageSquare /> Support Citoyen
                </h2>
                <span className="text-xs bg-red-700 px-2 py-1 rounded-full animate-pulse">En Ligne</span>
            </div>

            <div ref={chatBoxRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'Moi' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                            m.sender === 'Moi'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : m.isOperator
                                    ? 'bg-red-100 text-red-900 rounded-tl-none border border-red-200'
                                    : 'bg-gray-200 text-gray-800'
                        }`}>
                            <div className="font-bold text-[10px] opacity-70 mb-1">{m.sender}</div>
                            {m.text}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Décrivez l'urgence..."
                    className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button type="submit" className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition">
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}

// --- COMPONENTS ---

function NavButton({ children, active, onClick, icon }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
                active
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-red-100 hover:bg-red-700/50'
            }`}
        >
            {icon} {children}
        </button>
    );
}

function AlertItem({ alert }) {
    const isFire = alert.type === 'FIRE';
    const isAccident = alert.type === 'ACCIDENT';

    return (
        <div className="p-4 hover:bg-gray-50 flex items-start gap-4 transition group">
            <div className={`p-3 rounded-2xl shrink-0 ${
                isFire ? 'bg-orange-100 text-orange-600' :
                    isAccident ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
            }`}>
                {isFire ? <AlertTriangle size={24} /> : isAccident ? <Shield size={24} /> : <Activity size={24} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800 truncate">{alert.type}</h3>
                    <span className="text-xs text-gray-400">{new Date(alert.receivedTimestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{alert.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={12}/> {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
                    <span className="flex items-center gap-1"><Users size={12}/> CIN: {alert.senderCin}</span>
                    <StatusBadge status={alert.status} />
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        PENDING: "bg-red-100 text-red-700 border-red-200",
        IN_PROGRESS: "bg-yellow-100 text-yellow-700 border-yellow-200",
        RESOLVED: "bg-green-100 text-green-700 border-green-200",
        CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles.CANCELLED}`}>
      {status}
    </span>
    );
}

function StatCard({ title, value, color, icon }) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-xl text-white ${color} shadow-lg shadow-${color}/30`}>
                {icon}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="p-12 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">Aucune alerte signalée.</p>
        </div>
    );
}

function CreateAlertModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        type: 'ACCIDENT', latitude: 36.80, longitude: 10.18, description: '', senderCin: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/alerts`, formData);
            onSuccess();
            onClose();
        } catch (e) { alert("Erreur envoi"); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-red-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><AlertTriangle size={20}/> Nouvelle Alerte</h3>
                    <button onClick={onClose}><XCircle /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                            <select className="w-full p-3 bg-gray-50 border rounded-xl mt-1" value={formData.type} onChange={e=>setFormData({...formData, type:e.target.value})}>
                                <option value="ACCIDENT">Accident</option>
                                <option value="FIRE">Incendie</option>
                                <option value="MEDICAL">Médical</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">CIN Émetteur</label>
                            <input required maxLength={8} className="w-full p-3 bg-gray-50 border rounded-xl mt-1" placeholder="12345678" value={formData.senderCin} onChange={e=>setFormData({...formData, senderCin:e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Lat</label><input type="number" step="0.0001" className="w-full p-3 bg-gray-50 border rounded-xl mt-1" value={formData.latitude} onChange={e=>setFormData({...formData, latitude:parseFloat(e.target.value)})} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Lon</label><input type="number" step="0.0001" className="w-full p-3 bg-gray-50 border rounded-xl mt-1" value={formData.longitude} onChange={e=>setFormData({...formData, longitude:parseFloat(e.target.value)})} /></div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <textarea required rows={3} className="w-full p-3 bg-gray-50 border rounded-xl mt-1" placeholder="Détails de l'incident..." value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200">ENVOYER L'ALERTE</button>
                </form>
            </div>
        </div>
    );
}