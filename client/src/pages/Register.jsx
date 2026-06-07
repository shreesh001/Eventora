import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!showOTP) {
                await register(name, email, password);
                setShowOTP(true);
            } else {
                const data = await verifyOTP(email, otp);
                // after verify — redirect by role same as login
                navigate(data.role === 'admin' ? '/admin' : '/dashboard');
            }
        } catch (err) {
            setError(err.message || err);  // handles both Error objects and strings
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition shadow-sm";

    return (
        <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-lg border border-gray-100">

            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create an Account</h2>
                <p className="text-gray-500">Join Eventora today</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center border border-red-100 text-sm">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {!showOTP ? (
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="Shreesh Pathak"
                                className={inputClass}
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                className={inputClass}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                placeholder="Min. 6 characters"
                                minLength={6}           // basic password validation
                                className={inputClass}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        {/* OTP Success Info */}
                        <p className="text-sm text-green-700 bg-green-50 p-3 mb-4 rounded-lg border border-green-200">
                            OTP sent to <span className="font-semibold">{email}</span>. Please verify your account.
                        </p>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code (OTP)</label>
                        <input
                            type="text"
                            required
                            placeholder="000000"
                            inputMode="numeric"         // numeric keyboard on mobile
                            pattern="[0-9]*"            // only numbers
                            maxLength={6}
                            className={`${inputClass} font-bold tracking-widest text-center text-lg`}
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black focus:ring-4 focus:ring-gray-200 transition shadow-md mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : showOTP ? 'Verify & Complete' : 'Sign Up'}
                </button>
            </form>

            {/* Footer Link — hide on OTP screen */}
            {!showOTP && (
                <p className="text-center mt-6 text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-gray-900 font-bold hover:underline">Sign in</Link>
                </p>
            )}

        </div>
    );
};

export default Register;