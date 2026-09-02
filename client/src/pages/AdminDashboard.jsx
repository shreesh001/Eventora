import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';


const INITIAL_FORM = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    totalSeats: '',
    availableSeats: '',
    ticketPrice: '',
    imageUrl: ''
};

const inputClass = "border px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-700 outline-none transition w-full";

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEventForm, setShowEventForm] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);

    const fetchData = useCallback(async () => {
        try {
            const eventsRes = await api.get('/events');
            setEvents(eventsRes.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }

        try {
            const bookingsRes = await api.get('/bookings/all'); 
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate, fetchData]);

    const handleFormChange = (field, value) => {
        if (field === 'totalSeats') {
            setFormData(prev => ({ ...prev, totalSeats: value, availableSeats: value }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (Number(formData.availableSeats) > Number(formData.totalSeats)) {
            alert('Available seats cannot exceed total seats.');
            return;
        }
        try {
            await api.post('/events', formData);
            setShowEventForm(false);
            setFormData(INITIAL_FORM);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/events/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting event');
            }
        }
    };

    const handleConfirmBooking = async (id, paymentStatus) => {
        try {
            await api.put(`/bookings/${id}/confirm`, { paymentStatus });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error confirming booking');
        }
    };

    const handleCancelBooking = async (id) => {
        if (window.confirm("Cancel this user's booking request?")) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };


    const totalRevenue = bookings.reduce((sum, b) =>
        b.paymentStatus === 'paid' && b.status === 'confirmed' ? sum + b.amount : sum, 0);

    const paidClients = new Set(
        bookings
            .filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed')
            .map(b => b.user?._id)
    ).size;

    const pendingCount = bookings.filter(b => b.status === 'pending').length;

    const stats = [
        { label: 'Total Revenue', value: `₹${totalRevenue}`, color: 'green', icon: '₹' },
        { label: 'Paid Clients', value: paidClients, color: 'blue', icon: '👤' },
        { label: 'Pending Requests', value: pendingCount, color: 'yellow', icon: '⏳' },
    ];

    const statusColors = {
        confirmed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        pending: 'bg-yellow-100 text-yellow-700',
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold">Loading admin panel...</div>;

    return (
        <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="bg-black text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Admin Dashboard</h1>
                    <p className="text-gray-300">Manage events and manually confirm bookings.</p>
                </div>
                <button
                    onClick={() => setShowEventForm(!showEventForm)}
                    className="w-full md:w-auto bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition shadow-md"
                >
                    {showEventForm ? 'Cancel Creation' : '+ Create New Event'}
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{s.label}</p>
                            <h3 className={`text-3xl font-black text-${s.color}-600`}>{s.value}</h3>
                        </div>
                        <div className={`w-12 h-12 bg-${s.color}-100 text-${s.color}-500 rounded-full flex items-center justify-center text-xl font-bold`}>
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Event Form */}
            {showEventForm && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Event</h2>
                    <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input required type="text" placeholder="Event Title"
                            className={inputClass} value={formData.title}
                            onChange={e => handleFormChange('title', e.target.value)} />

                        <select
                            required
                            className={inputClass}
                            value={formData.category}
                            onChange={e => handleFormChange('category', e.target.value)}
                        >
                            <option value="" disabled>Select a category</option>
                            <option value="Music">Music</option>
                            <option value="Sports">Sports</option>
                            <option value="Tech">Tech</option>
                            <option value="Food">Food</option>
                            <option value="Art">Art</option>
                        </select>

                        <input required type="date"
                            className={inputClass} value={formData.date}
                            onChange={e => handleFormChange('date', e.target.value)} />

                        {/* time field — was completely missing */}
                        <input required type="time"
                            className={inputClass} value={formData.time}
                            onChange={e => handleFormChange('time', e.target.value)} />

                        <input required type="text" placeholder="Location"
                            className={inputClass} value={formData.location}
                            onChange={e => handleFormChange('location', e.target.value)} />

                        <input required type="number" placeholder="Ticket Price (0 for free)"
                            className={inputClass} value={formData.ticketPrice} min={0} step="0.01"
                            onChange={e => handleFormChange('ticketPrice', e.target.value)} />

                        {/* totalSeats auto-sets availableSeats */}
                        <input required type="number" placeholder="Total Seats"
                            className={inputClass} value={formData.totalSeats} min={1} step={1}
                            onChange={e => handleFormChange('totalSeats', e.target.value)} />

                        {/* availableSeats — was completely missing, auto-filled from totalSeats */}
                        <input required type="number" placeholder="Available Seats"
                            className={inputClass} value={formData.availableSeats} min={0} max={formData.totalSeats || undefined} step={1}
                            onChange={e => handleFormChange('availableSeats', e.target.value)} />

                        <div className="md:col-span-2">
                            {/* imageUrl — was 'image' */}
                            <input type="text" placeholder="Image URL (optional)"
                                className={inputClass} value={formData.imageUrl}
                                onChange={e => handleFormChange('imageUrl', e.target.value)} />
                        </div>

                        <textarea required placeholder="Event Description"
                            className={`${inputClass} md:col-span-2 h-32`}
                            value={formData.description}
                            onChange={e => handleFormChange('description', e.target.value)} />

                        <button type="submit"
                            className="md:col-span-2 bg-gray-900 text-white font-bold py-3 mt-2 rounded-lg hover:bg-black transition shadow-md">
                            Publish Event
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Events List */}
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-sm">{events.length}</span>
                        All Events
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {events.length === 0
                                ? <li className="p-6 text-gray-500 text-center">No events created yet.</li>
                                : events.map(event => (
                                    <li key={event._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition">
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1 leading-tight">{event.title}</h4>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    {new Date(event.date).toLocaleDateString()} — {event.time}
                                                </span>
                                                <span className="flex items-center gap-1 font-medium">
                                                    <div className={`w-2 h-2 rounded-full ${event.availableSeats > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {event.availableSeats}/{event.totalSeats} seats
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteEvent(event._id)}
                                            className="w-full sm:w-auto text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition shrink-0"
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 text-sm font-bold">{bookings.length}</span>
                        Booking Requests
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {bookings.length === 0
                                ? <li className="p-6 text-gray-500 text-center">No bookings yet.</li>
                                : bookings.map(booking => (
                                    <li
                                        key={booking._id}
                                        className={`p-6 hover:bg-gray-50 transition border-l-4 ${booking.status === 'pending' ? 'border-l-yellow-400'
                                                : booking.status === 'confirmed' ? 'border-l-green-400'
                                                    : 'border-l-red-400'
                                            }`}
                                    >
                                        {/* Booking Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-gray-900 text-lg leading-tight">
                                                {booking.event?.title || 'Deleted Event'} {/* was booking.eventId */}
                                            </h4>
                                            <div className="flex flex-col gap-1 items-end shrink-0 ml-4">
                                                <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${statusColors[booking.status]}`}>
                                                    {booking.status}
                                                </span>
                                                {booking.status !== 'cancelled' && (
                                                    <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.paymentStatus === 'paid' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-800'}`}>
                                                        {booking.paymentStatus.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Booking Info */}
                                        <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100 text-sm space-y-1">
                                            <p className="text-gray-700 flex items-center gap-2">
                                                <span className="font-bold w-16 text-gray-500 uppercase text-xs">User:</span>
                                                <span className="font-semibold">{booking.user?.name}</span> {/* was booking.userId */}
                                                <span className="text-gray-400">({booking.user?.email})</span>
                                            </p>
                                            <p className="text-gray-700 flex items-center gap-2">
                                                <span className="font-bold w-16 text-gray-500 uppercase text-xs">Seats:</span>
                                                <span className="font-semibold">{booking.numberOfSeats}</span>
                                            </p>
                                            <p className="text-gray-700 flex items-center gap-2">
                                                <span className="font-bold w-16 text-gray-500 uppercase text-xs">Amount:</span>
                                                <span className={`font-semibold ${booking.amount === 0 ? 'text-green-600' : ''}`}>
                                                    {booking.amount === 0 ? 'Free' : `₹${booking.amount}`}
                                                </span>
                                            </p>
                                            <p className="text-gray-700 flex items-center gap-2">
                                                <span className="font-bold w-16 text-gray-500 uppercase text-xs">Date:</span>
                                                <span>{new Date(booking.createdAt).toLocaleString()}</span> {/* was booking.bookedAt */}
                                            </p>
                                        </div>

                                        {/* Admin Actions — only for pending */}
                                        {booking.status === 'pending' && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <button
                                                    onClick={() => handleConfirmBooking(booking._id, 'paid')}
                                                    className="flex-1 min-w-[120px] bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 text-xs font-bold py-2.5 px-3 rounded-lg transition"
                                                >
                                                    ✓ Approve as Paid
                                                </button>
                                                <button
                                                    onClick={() => handleConfirmBooking(booking._id, 'not_paid')}
                                                    className="flex-1 min-w-[120px] bg-gray-50 text-gray-700 hover:bg-gray-800 hover:text-white border border-gray-200 text-xs font-bold py-2.5 px-3 rounded-lg transition"
                                                >
                                                    ✓ Approve (Unpaid)
                                                </button>
                                                <button
                                                    onClick={() => handleCancelBooking(booking._id)}
                                                    className="w-[80px] bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 text-xs font-bold py-2.5 px-3 rounded-lg transition"
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
