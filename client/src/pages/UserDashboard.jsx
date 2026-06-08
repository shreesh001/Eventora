import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { FaTicketAlt, FaTimesCircle } from 'react-icons/fa';

const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
};

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchBookings();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold">Loading dashboard...</div>;

    return (
        <div className="max-w-6xl mx-auto">

            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8 border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
                <div className="w-20 h-20 bg-gray-200 text-gray-900 rounded-full flex items-center justify-center text-3xl font-bold uppercase shrink-0">
                    {user?.name.charAt(0)}
                </div>
                <div className="flex flex-col items-center sm:items-start">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Welcome, {user?.name}!</h1>
                    <p className="text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> User Dashboard
                    </p>
                </div>
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FaTicketAlt className="text-gray-700" /> My Booking Requests
                </h2>
                <span className="text-gray-500 text-sm font-medium">{bookings.length} total</span>
            </div>

            {/* Empty State */}
            {bookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTicketAlt className="text-gray-300 text-3xl" />
                    </div>
                    <p className="text-xl text-gray-500 mb-6 mt-4 font-medium">You haven't booked any events yet.</p>
                    <Link to="/" className="inline-block bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg transition shadow-md">
                        Browse Events
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map(booking => (
                        <div key={booking._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col">
                            <div className="p-6 flex-grow">

                                {booking.event ? ( // was booking.eventId
                                    <>
                                        {/* Card Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                                {booking.event.title} {/* was booking.eventId.title */}
                                            </h3>
                                            <div className="flex flex-col gap-1 items-end shrink-0 ml-2">
                                                <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${statusColors[booking.status]}`}>
                                                    {booking.status}
                                                </span>
                                                {booking.status !== 'cancelled' && (
                                                    <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {booking.paymentStatus.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Booking Info */}
                                        <div className="text-sm text-gray-500 space-y-1">
                                            <p>
                                                <strong className="text-gray-700">Date: </strong>
                                                {new Date(booking.event.date).toLocaleDateString()} {/* was booking.eventId.date */}
                                            </p>
                                            <p>
                                                <strong className="text-gray-700">Time: </strong>
                                                {booking.event.time} {/* time field added */}
                                            </p>
                                            <p>
                                                <strong className="text-gray-700">Location: </strong>
                                                {booking.event.location}
                                            </p>
                                            <p>
                                                <strong className="text-gray-700">Seats: </strong>
                                                {booking.numberOfSeats} {/* numberOfSeats field added */}
                                            </p>
                                            <p>
                                                <strong className="text-gray-700">Amount: </strong>
                                                {booking.amount === 0 ? 'Free' : `₹${booking.amount}`}
                                            </p>
                                            <p>
                                                <strong className="text-gray-700">Requested: </strong>
                                                {new Date(booking.createdAt).toLocaleDateString()} {/* was booking.bookedAt */}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-red-500 italic text-sm">Event details unavailable (may have been deleted)</p>
                                )}
                            </div>

                            {/* Card Footer */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                                {booking.event && booking.status !== 'cancelled' ? (
                                    <>
                                        <Link
                                            to={`/events/${booking.event._id}`} // was booking.eventId._id
                                            className="text-gray-900 font-semibold text-sm hover:underline"
                                        >
                                            View Event
                                        </Link>
                                        {booking.status === 'confirmed' && ( // only confirmed bookings can be cancelled
                                            <button
                                                onClick={() => cancelBooking(booking._id)}
                                                className="text-red-500 font-semibold text-sm hover:text-red-700 transition flex items-center gap-1"
                                            >
                                                <FaTimesCircle /> Cancel
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full text-center text-sm text-gray-500 italic">
                                        {booking.event ? 'Booking Cancelled' : 'Event Deleted'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;