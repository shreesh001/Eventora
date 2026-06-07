import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    // Extracted — was repeated twice in try block
    const redirectByRole = (role) => {
        navigate(role === 'admin' ? '/admin' : '/dashboard');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!showOTP) {
                const data = await login(email, password);
                redirectByRole(data.role);
            } else {
                const data = await verifyOTP(email, otp);
                redirectByRole(data.role);
            }
        } catch (err) {
            if (err.needsVerification) {
                setShowOTP(true);
                setError('Account not verified. A new OTP has been sent to your email.');
            } else {
                setError(err.message || err);
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition shadow-sm";

    return (
        <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-gray-100">

            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-500">Sign in to your Eventora account</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center border border-red-100 text-sm">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {!showOTP ? (
                    <>
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
                                placeholder="Enter your password"
                                className={inputClass}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code (OTP)</label>
                        <p className="text-gray-400 text-xs mb-3">Enter the 6-digit code sent to {email}</p>
                        <input
                            type="text"
                            required
                            placeholder="000000"
                            inputMode="numeric"         
                            pattern="[0-9]*"          
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
                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black focus:ring-4 focus:ring-gray-200 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : showOTP ? 'Verify OTP & Log In' : 'Sign In'}
                </button>
            </form>

            {/* Footer Link */}
            <p className="text-center mt-8 text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-gray-900 font-bold hover:underline">Sign up</Link>
            </p>

        </div>
    );
};

export default Login;