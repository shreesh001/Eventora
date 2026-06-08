import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaChair, FaMoneyBillWave, FaRegClock } from 'react-icons/fa';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [numberOfSeats, setNumberOfSeats] = useState(1);
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch (err) {
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingLoading(true);
        setError('');

        try {
            if (!showOTP) {
                await api.post('/bookings/send-otp');
                setShowOTP(true);
                setSuccessMsg('OTP sent to your email. Please verify to confirm booking.');
            } else {
                await api.post('/bookings', { eventId: event._id, otp, numberOfSeats });
                setSuccessMsg('Booking requested! Awaiting admin confirmation.');
                setShowOTP(false);
                setEvent(prev => ({ ...prev, availableSeats: prev.availableSeats - numberOfSeats }));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    const getButtonLabel = () => {
        if (bookingLoading) return 'Processing...';
        if (showOTP) return 'Verify OTP & Confirm';
        if (isBooked) return 'Request Sent ✓';
        if (isSoldOut) return 'Sold Out';
        return 'Confirm Registration';
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold">Loading...</div>;
    if (!event) return <div className="text-center py-20 text-xl text-red-500">{error || 'Event not found'}</div>; 

    const isSoldOut = event.availableSeats <= 0;
    const isBooked = !!successMsg && !showOTP;

    const detailItems = [
        {
            icon: <FaMoneyBillWave />,
            label: 'Ticket Price',
            value: event.ticketPrice === 0
                ? <span className="text-green-500">Free</span>
                : `₹${event.ticketPrice}`
        },
        {
            icon: <FaChair />,
            label: 'Availability',
            value: (
                <span>
                    <span className={event.availableSeats < 10 ? 'text-orange-500' : ''}>
                        {event.availableSeats}
                    </span> / {event.totalSeats}
                </span>
            )
        },
        {
            icon: <FaCalendarAlt />,
            label: 'Date',
            value: new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        },
        {
            icon: <FaRegClock />, 
            label: 'Time',
            value: event.time
        },
        {
            icon: <FaMapMarkerAlt />,
            label: 'Location',
            value: event.location
        },
    ];

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">

            {/* Event Image */}
            {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} className="w-full h-80 object-cover" />
            ) : (
                <div className="w-full h-64 bg-gray-900 flex items-center justify-center text-white/50 text-6xl font-black uppercase tracking-widest">
                    {event.category}
                </div>
            )}

            <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">

                    {/* Event Info */}
                    <div>
                        <div className="inline-block bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                            {event.category}
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{event.title}</h1>
                        <p className="text-gray-600 text-lg leading-relaxed">{event.description}</p>
                    </div>

                    {/* Booking Card */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 min-w-[300px] w-full md:w-auto shrink-0 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Booking Details</h3>

                        {/* Detail Items — mapped to avoid repetition */}
                        <div className="space-y-4 mb-8">
                            {detailItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 text-gray-600">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400 uppercase">{item.label}</p>
                                        <p className="font-bold text-gray-800">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Number of Seats — shown before OTP step */}
                        {!showOTP && !isBooked && !isSoldOut && (
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Seats</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={event.availableSeats}
                                    value={numberOfSeats}
                                    onChange={e => setNumberOfSeats(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-700 transition shadow-sm text-center font-bold"
                                />
                            </div>
                        )}

                        {/* OTP Input */}
                        {showOTP && (
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP to Confirm</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="000000"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-700 transition shadow-sm font-bold tracking-widest text-center text-lg"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Book Button */}
                        <button
                            onClick={handleBooking}
                            disabled={isSoldOut || bookingLoading || (showOTP && !otp) || isBooked}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg ${
                                isSoldOut || isBooked
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-900 hover:bg-black text-white hover:shadow-xl hover:-translate-y-1'
                            }`}
                        >
                            {getButtonLabel()}
                        </button>

                        {/* Error / Success */}
                        {error && (
                            <p className="text-red-500 mt-4 text-center text-sm font-medium bg-red-50 p-2 rounded">{error}</p>
                        )}
                        {successMsg && (
                            <p className="text-green-600 mt-4 text-center text-sm font-medium bg-green-50 p-2 rounded">{successMsg}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;