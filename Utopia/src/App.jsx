import React, { useState, useEffect, useRef } from 'react';
import { 
  Bus, 
  Wind, 
  Calendar, 
  AlertTriangle, 
  BrainCircuit, 
  Activity, 
  MapPin, 
  Search, 
  Navigation,
  CheckCircle2,
  XCircle,
  Loader2,
  ThermometerSun,
  ShieldAlert,
  FileText,
  Megaphone,
  X,
  Menu,
  TrafficCone,
  Signal,
  Info,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- API CONFIGURATION ---
const GATEWAY_URL = 'http://localhost:8080';
const PLANNER_URL = '/planner-api'; // Uses Vite Proxy

// --- UTILITY COMPONENTS ---

// Custom Markdown Renderer to handle AI responses without external libs
const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  // 1. Split text into segments based on double newlines (paragraphs)
  const segments = content.split('\n\n');

  return (
    <div className="space-y-4 text-slate-300 leading-relaxed">
      {segments.map((segment, index) => {
        // Header Detection (## Title)
        if (segment.startsWith('##')) {
          return <h3 key={index} className="text-xl font-bold text-cyan-400 mt-4">{segment.replace('##', '').trim()}</h3>;
        }
        
        // List Detection (- item)
        if (segment.trim().startsWith('-') || segment.trim().startsWith('*')) {
          const items = segment.split('\n').filter(line => line.trim().length > 0);
          return (
            <ul key={index} className="space-y-2 pl-4 border-l-2 border-slate-700 my-2">
              {items.map((item, i) => {
                const cleanItem = item.replace(/^[-*]\s/, '');
                // Handle bolding inside list items
                const parts = cleanItem.split(/(\*\*.*?\*\*)/g);
                return (
                  <li key={i} className="text-sm">
                    {parts.map((part, j) => 
                      part.startsWith('**') && part.endsWith('**') 
                        ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong> 
                        : part
                    )}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard Paragraph with Bold support
        const parts = segment.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index}>
            {parts.map((part, j) => 
              part.startsWith('**') && part.endsWith('**') 
                ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong> 
                : part
            )}
          </p>
        );
      })}
    </div>
  );
};

const Header = ({ title, subtitle }) => (
  <div className="mb-6 md:mb-8 mt-4 md:mt-0">
    <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-slate-400 mb-2">
      {title}
    </h1>
    <p className="text-slate-400 text-sm md:text-lg font-light">{subtitle}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'GOOD': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'MODERATE': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'POOR': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'PENDING': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'RESOLVED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  const style = styles[status] || styles['PENDING'];
  return (
    <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold border ${style} uppercase tracking-wider`}>
      {status}
    </span>
  );
};

// --- SIDEBAR ITEM COMPONENT ---
const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 group relative overflow-hidden ${
      active 
        ? 'text-cyan-400 bg-cyan-900/10 border-r-2 border-cyan-400' 
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
    }`}
  >
    <Icon size={22} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="font-medium tracking-wide">{label}</span>
    {active && (
      <motion.div 
        layoutId="activeGlow"
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent pointer-events-none"
      />
    )}
  </button>
);

// --- VIEWS ---

const MobilityView = () => {
  const [lineId, setLineId] = useState('TGM');
  const [schedule, setSchedule] = useState([]);
  const [traffic, setTraffic] = useState(null); // New State for Traffic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${GATEWAY_URL}/api/mobility/lines/${lineId}/schedule`);
      if (!res.ok) throw new Error('Schedule unavailable');
      const data = await res.json();
      setSchedule(data);
    } catch (err) {
      setError(err.message);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrafficStatus = async () => {
    // Mocking a traffic endpoint since it wasn't strictly defined in the provided snippets, 
    // but demonstrating how the UI handles multiple mobility endpoints.
    setLoading(true);
    setTimeout(() => {
      setTraffic({
        status: 'MODERATE',
        congestionLevel: '45%',
        activeAlerts: 2,
        message: 'Construction work near Carthage Station. Expect 5min delays.'
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Header title="Urban Mobility" subtitle="Live transit network & traffic status" />
      
      {/* Action Bar */}
      <div className="glass-panel rounded-2xl p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              className="input-field w-full pl-12"
              placeholder="Enter Line ID (e.g., TGM)..." 
            />
          </div>
          <div className="flex gap-2">
            <button onClick={fetchSchedule} className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Navigation size={20} />}
              <span className="hidden md:inline">Find Schedule</span>
              <span className="md:hidden">Search</span>
            </button>
            <button onClick={fetchTrafficStatus} className="px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors">
              <Signal size={20} />
            </button>
          </div>
        </div>

        {/* Traffic Alert Banner (New Feature) */}
        <AnimatePresence>
          {traffic && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-4">
                <TrafficCone className="text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-amber-500 font-bold text-sm uppercase">Network Alert: {traffic.status}</h4>
                  <p className="text-slate-300 text-sm mt-1">{traffic.message}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-center gap-3">
            <XCircle size={20} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-4">
          {schedule.map((stop, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-4 md:p-5 rounded-xl group hover:bg-slate-800/80 border-l-4 border-l-cyan-500"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-cyan-950 rounded-lg text-cyan-400">
                  <Bus size={20} />
                </div>
                <span className="text-xl md:text-2xl font-bold text-slate-100 font-mono">{stop.departure_time}</span>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Direction</p>
                <p className="text-base md:text-lg text-white font-medium truncate">{stop.direction}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AirQualityView = () => {
  const [zone, setZone] = useState('Tunis');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkAir = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GATEWAY_URL}/api/air-quality/${zone}`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkAir(); }, []);

  const getAqiConfig = (aqi) => {
    if (aqi <= 50) return { color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
    if (aqi <= 100) return { color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
    return { color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' };
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Header title="Eco Monitor" subtitle="Air quality sensors & forecasting" />
      
      <div className="flex gap-2 md:gap-4 mb-6">
        <input 
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="input-field flex-1 min-w-0"
          placeholder="Zone..."
        />
        <button onClick={checkAir} className="btn-primary whitespace-nowrap px-4 md:px-6">Analyze</button>
      </div>

      {data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <motion.div 
            initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className={`glass-panel p-6 md:p-8 rounded-2xl border ${getAqiConfig(data.aqi || 50).border} ${getAqiConfig(data.aqi || 50).bg} flex flex-col items-center justify-center text-center relative overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/20`} />
            <ThermometerSun size={56} className={`mb-4 md:mb-6 opacity-90 ${getAqiConfig(data.aqi || 50).color}`} />
            <h2 className="text-5xl md:text-7xl font-black mb-2 text-white tracking-tighter">{data.aqi || '--'}</h2>
            <p className={`text-lg md:text-xl font-bold uppercase tracking-widest ${getAqiConfig(data.aqi || 50).color}`}>{data.status || 'Unknown'}</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { label: 'PM 2.5', value: data.pm25, unit: 'µg/m³' },
              { label: 'PM 10', value: data.pm10, unit: 'µg/m³' },
              { label: 'NO2', value: data.no2, unit: 'ppb' },
              { label: 'CO2', value: data.co2 || 400, unit: 'ppm' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-4 md:p-6 rounded-xl flex flex-col justify-between bg-slate-800/40"
              >
                <p className="text-slate-500 font-medium text-xs md:text-sm uppercase">{stat.label}</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-xl md:text-2xl font-bold text-slate-100">{stat.value}</span>
                  <span className="text-[10px] md:text-xs text-slate-600">{stat.unit}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 opacity-50"><Loader2 className="animate-spin mx-auto" /></div>
      )}
    </div>
  );
};

const EventsView = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // State for Modal
  
  useEffect(() => {
    fetch(`${GATEWAY_URL}/api/events/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: "query { getAllEvents { id title description category location date } }" })
    })
    .then(res => res.json())
    .then(data => setEvents(data.data?.getAllEvents || []))
    .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-0 relative">
      <Header title="City Events" subtitle="Discover culture, tech & sports" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {events.map((event) => (
          <motion.div 
            key={event.id}
            layoutId={`card-${event.id}`}
            onClick={() => setSelectedEvent(event)}
            whileHover={{ y: -5 }}
            className="glass-card rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-white/5 hover:border-cyan-500/50 shadow-lg"
          >
            <div className="h-32 md:h-40 bg-gradient-to-br from-indigo-900 to-slate-900 relative p-6 overflow-hidden">
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10 uppercase tracking-wide">
                {event.category}
              </div>
              <Calendar className="text-white/5 absolute -bottom-4 -left-4" size={140} />
            </div>
            <div className="p-5 md:p-6 flex-1 flex flex-col">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-tight">{event.title}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm mb-4">
                <MapPin size={14} className="text-cyan-500" /> {event.location}
              </div>
              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-mono">{new Date(event.date || Date.now()).toLocaleDateString()}</span>
                <span className="text-cyan-400 text-xs font-bold flex items-center gap-1 group">
                  Details <Navigation size={10} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              layoutId={`card-${selectedEvent.id}`}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedEvent(null); }} 
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-rose-500 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="h-48 bg-gradient-to-r from-cyan-900 to-blue-900 p-8 flex items-end">
                <div>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white mb-2 inline-block backdrop-blur-md border border-white/20">
                    {selectedEvent.category}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-white">{selectedEvent.title}</h2>
                </div>
              </div>

              <div className="p-8 overflow-y-auto">
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Calendar className="text-cyan-500" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Date & Time</p>
                        <p>{selectedEvent.date || 'TBA'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <MapPin className="text-cyan-500" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Location</p>
                        <p>{selectedEvent.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <h3 className="text-lg font-bold text-white mb-2">About this Event</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {selectedEvent.description || "Join us for this exciting event in the heart of Utopia city. Connect with the community, learn new things, and experience the vibrant culture of our smart city."}
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-800 flex justify-end">
                  <button className="btn-primary">Register Now</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ReportsView = () => {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newReport, setNewReport] = useState({ description: '', location: '', category: 'General', reporterName: '' });
  const [loading, setLoading] = useState(false);

  const fetchReports = () => {
    fetch(`${GATEWAY_URL}/api/events/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `query { getAllReports { id description location category status timestamp } }` })
    })
    .then(res => res.json())
    .then(data => setReports(data.data?.getAllReports || []))
    .catch(console.error);
  };

  const submitReport = async () => {
    setLoading(true);
    const mutation = `mutation {
      createReport(
        description: "${newReport.description}",
        location: "${newReport.location}",
        category: "${newReport.category}",
        reporterName: "${newReport.reporterName}"
      ) { id }
    }`;
    try {
      await fetch(`${GATEWAY_URL}/api/events/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: mutation })
      });
      setShowForm(false);
      setNewReport({ description: '', location: '', category: 'General', reporterName: '' });
      fetchReports();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <Header title="Citizen Reports" subtitle="Community issues & requests" />
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center">
          <Megaphone size={20} /> Report Issue
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-4 md:p-6 rounded-2xl mb-8 border border-cyan-500/30 overflow-hidden"
          >
            <h3 className="text-lg md:text-xl font-bold text-white mb-4">Submit New Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input className="input-field" placeholder="Your Name" value={newReport.reporterName} onChange={e => setNewReport({...newReport, reporterName: e.target.value})} />
              <input className="input-field" placeholder="Location" value={newReport.location} onChange={e => setNewReport({...newReport, location: e.target.value})} />
              <select className="input-field" value={newReport.category} onChange={e => setNewReport({...newReport, category: e.target.value})}>
                <option value="General">General</option>
                <option value="Roads">Roads & Traffic</option>
                <option value="Lighting">Street Lighting</option>
                <option value="Trash">Waste Management</option>
              </select>
              <input className="input-field" placeholder="Description" value={newReport.description} onChange={e => setNewReport({...newReport, description: e.target.value})} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
              <button onClick={submitReport} disabled={loading} className="btn-primary py-2 px-6">{loading ? <Loader2 className="animate-spin" /> : 'Submit'}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {reports.map((report) => (
          <motion.div key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 md:p-5 rounded-xl flex items-center gap-4 md:gap-6">
            <div className="p-3 bg-slate-800 rounded-full text-cyan-400 shrink-0"><FileText size={20} /></div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="text-base font-bold text-slate-200 truncate">{report.category} Issue</h4>
                <StatusBadge status={report.status} />
              </div>
              <p className="text-slate-400 text-sm truncate">{report.description}</p>
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1"><MapPin size={10}/> {report.location}</span>
                <span>• {new Date(parseInt(report.timestamp)).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
        {reports.length === 0 && <div className="text-center py-12 text-slate-500">No reports found.</div>}
      </div>
    </div>
  );
};

const UrgenceView = () => {
  const [form, setForm] = useState({ type: 'ACCIDENT', description: '', sender_cin: '' });
  const [alertStatus, setAlertStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendAlert = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GATEWAY_URL}/api/urgence/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, latitude: 36.8065, longitude: 10.1815 })
      });
      const data = await res.json();
      setAlertStatus(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-0">
      <div className="text-center space-y-4 pt-4 md:pt-0">
        <div className="inline-flex p-4 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-4 animate-pulse-slow">
          <ShieldAlert size={48} />
        </div>
        <Header title="Emergency Response" subtitle="Secure gRPC-encrypted channel to HQ" />
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-rose-500/20 shadow-[0_0_50px_-12px_rgba(244,63,94,0.2)]">
        {alertStatus ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8 md:py-12">
            <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-2">Alert Dispatched</h3>
            <p className="text-slate-400 mb-8 font-mono text-sm">{alertStatus.alert_id}</p>
            <button onClick={() => setAlertStatus(null)} className="btn-primary w-full md:w-auto">Send New Alert</button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-400">Emergency Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['ACCIDENT', 'FIRE', 'MEDICAL', 'SECURITY'].map(type => (
                  <button key={type} onClick={() => setForm({...form, type})} className={`p-4 rounded-xl border font-bold text-xs transition-all ${form.type === type ? 'bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-500/20' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <textarea className="input-field w-full h-32 resize-none" placeholder="Situation description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <input className="input-field w-full" placeholder="Sender CIN ID" value={form.sender_cin} onChange={e => setForm({...form, sender_cin: e.target.value})} />
              <button onClick={sendAlert} disabled={loading} className="btn-danger w-full flex justify-center items-center gap-2 mt-4">
                {loading ? <Loader2 className="animate-spin" /> : <AlertTriangle />} DISPATCH ALERT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- REDESIGNED PLANNER VIEW (CHAT STYLE) ---
const PlannerView = () => {
  const [messages, setMessages] = useState([
    { 
      id: 'welcome', 
      role: 'ai', 
      content: "👋 Hi there! I'm your AI City Planner.\n\nTell me where you want to go (e.g., *\"I want to visit Sidi Bou Said\"*), and I'll build a live itinerary checking traffic, air quality, and events for you." 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // For the modal
  const scrollRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput(''); // Clear input immediately
    
    // Add User Message
    const userMsg = { id: Date.now(), role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${PLANNER_URL}/plan-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_preferences: userText })
      });

      if (!res.ok) throw new Error(`Server Error: ${res.statusText}`);
      
      const data = await res.json();
      
      // Add AI Message
      const aiMsg = { 
        id: Date.now() + 1, 
        role: 'ai', 
        content: data.generated_plan,
        data: data // Store full response for the modal
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      const errorMsg = { 
        id: Date.now() + 1, 
        role: 'ai', 
        content: `**System Error:** I couldn't generate a plan right now. \n\n*Reason: ${err.message}*` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="h-full flex flex-col relative">
      <Header title="AI Planner" subtitle="Chat with Utopia's Urban Intelligence" />

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 md:p-6 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none shadow-lg' 
                : 'glass-card border border-white/10 rounded-tl-none'
            }`}>
              {msg.role === 'ai' && (
                <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <BrainCircuit size={14} /> Utopia AI
                </div>
              )}
              
              <div className={msg.role === 'user' ? 'text-white' : ''}>
                {msg.role === 'ai' ? <MarkdownRenderer content={msg.content} /> : msg.content}
              </div>

              {/* Action Button for AI Messages with Data */}
              {msg.data && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => setSelectedPlan(msg.data)}
                    className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/30 px-3 py-2 rounded-lg border border-cyan-500/20 hover:bg-cyan-900/50"
                  >
                    <Activity size={14} /> View Real-time Analysis
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass-card p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
              <Loader2 className="animate-spin text-cyan-400" size={20} />
              <span className="text-slate-400 text-sm">Analyzing city data...</span>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4 glass-panel p-2 rounded-xl flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask for a plan..."
          className="bg-transparent border-0 text-white placeholder-slate-500 focus:ring-0 w-full resize-none max-h-32 py-3 px-3 outline-none"
          rows={1}
        />
        <button 
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="p-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-1 mr-1"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="text-cyan-500" /> Real-time Diagnostics
                  </h3>
                  <p className="text-slate-400 text-sm">Source data used for this plan</p>
                </div>
                <button onClick={() => setSelectedPlan(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPlan.raw_data_summary?.map((service, idx) => (
                    <div key={idx} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-slate-200 text-sm">{service.service_name}</span>
                        <StatusBadge status={service.status === 'Fetched' ? 'RESOLVED' : 'POOR'} />
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                        <pre className="text-[10px] md:text-xs text-slate-400 whitespace-pre-wrap font-mono overflow-x-auto">
                          {typeof service.data === 'string' ? service.data : JSON.stringify(service.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN LAYOUT COMPONENT ---

const App = () => {
  const [activeTab, setActiveTab] = useState('mobility');

  const renderContent = () => {
    switch (activeTab) {
      case 'mobility': return <MobilityView />;
      case 'air': return <AirQualityView />;
      case 'events': return <EventsView />;
      case 'reports': return <ReportsView />;
      case 'urgence': return <UrgenceView />;
      case 'planner': return <PlannerView />;
      default: return <MobilityView />;
    }
  };

  const navItems = [
    { id: 'mobility', icon: Bus, label: 'Transit' },
    { id: 'air', icon: Wind, label: 'Air' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'planner', icon: BrainCircuit, label: 'AI Plan' },
    { id: 'urgence', icon: AlertTriangle, label: 'Alert' },
  ];

  return (
    <div className="flex min-h-screen bg-[url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-fixed bg-center">
      {/* Background Dimmer */}
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-0" />
      
      <div className="relative z-10 flex w-full max-w-[1600px] mx-auto min-h-screen shadow-2xl overflow-hidden flex-col md:flex-row">
        
        {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
        <div className="hidden md:flex w-72 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 flex-col shrink-0">
          <div className="p-8">
            <div className="flex items-center gap-3 text-white mb-1">
              <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Activity />
              </div>
              <span className="text-2xl font-black tracking-tighter">UTOPIA</span>
            </div>
            <p className="text-slate-500 text-xs pl-14 tracking-widest uppercase">Smart City OS v3.0</p>
          </div>

          <nav className="flex-1 py-6 space-y-1">
            {navItems.map(item => (
              <SidebarItem 
                key={item.id}
                icon={item.icon} 
                label={item.label} 
                active={activeTab === item.id} 
                onClick={() => setActiveTab(item.id)} 
              />
            ))}
          </nav>

          <div className="p-6">
             <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE TOP BAR */}
        <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
           <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity size={18} />
              </div>
              <span className="text-xl font-black tracking-tighter">UTOPIA</span>
           </div>
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth w-full">
          <div className="p-4 md:p-12 min-h-full pb-28 md:pb-12">
            <AnimatePresence mode='wait'>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 z-50 px-6 py-2 pb-6 flex justify-between items-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
           {navItems.map(item => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === item.id ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}
             >
               <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
               <span className="text-[10px] font-medium">{item.label}</span>
               {activeTab === item.id && <motion.div layoutId="mobileGlow" className="w-1 h-1 bg-cyan-400 rounded-full mt-1" />}
             </button>
           ))}
        </div>

      </div>
    </div>
  );
};

export default App;