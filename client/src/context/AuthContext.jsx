import React, { createContext, useState } from 'react';
import api from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) return null;
        try {
            const savedUser = JSON.parse(userInfo);
            if (savedUser?.token) return savedUser;
        } catch {
            // Invalid locally stored data is discarded below.
        }
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        return null;
    });
    const loading = false;

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            // The API returns 403 plus the user's email for an unverified
            // account. Convert that response into the state Login expects.
            if (error.response?.status === 403 && error.response?.data?.email) {
                const verificationError = new Error(error.response.data.message, { cause: error });
                verificationError.needsVerification = true;
                throw verificationError;
            }
            throw new Error(error.response?.data?.message || 'Login failed', { cause: error });
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            return data; // Returns { message, email }
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed', { cause: error });
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'OTP verification failed', { cause: error });
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOTP, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
