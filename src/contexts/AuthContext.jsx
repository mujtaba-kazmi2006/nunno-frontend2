import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { generateUUID } from '../utils/uuid';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            // Retrieve or generate a persistent device fingerprint
            let fingerprint = localStorage.getItem('nunno_device_fingerprint');
            if (!fingerprint) {
                fingerprint = generateUUID();
                localStorage.setItem('nunno_device_fingerprint', fingerprint);
            }

            if (token) {
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get('/api/v1/me');
                    setUser(response.data);
                } catch (error) {
                    console.error('Failed to load user:', error);
                    logout();
                }
            } else {
                // Try IP-based auto-login WITH device fingerprint
                try {
                    const response = await axios.post('/api/auth/ip-auto-login', {
                        device_fingerprint: fingerprint
                    });
                    if (response.data.token) {
                        setToken(response.data.token);
                        setUser(response.data.user);
                        localStorage.setItem('token', response.data.token);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                    }
                } catch (error) {
                    console.log('No valid IP+Device session found');
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const fingerprint = localStorage.getItem('nunno_device_fingerprint');
            const response = await axios.post('/api/auth/login', {
                email,
                password,
                device_fingerprint: fingerprint
            });
            setToken(response.data.token);
            setUser(response.data.user);
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            return { success: true };
        } catch (error) {
            const detail = error.response?.data?.detail;
            const requiresVerification = error.response?.headers?.['x-requires-verification'] === 'true';

            return {
                success: false,
                error: detail || 'Login failed',
                requiresVerification
            };
        }
    };

    const signup = async (email, password, name, experienceLevel = 'pro') => {
        try {
            const fingerprint = localStorage.getItem('nunno_device_fingerprint');
            const response = await axios.post('/api/auth/signup', {
                email,
                password,
                name,
                experience_level: experienceLevel,
                device_fingerprint: fingerprint
            });
            if (response.data.requires_verification) {
                return {
                    success: true,
                    requiresVerification: true,
                    email: response.data.email
                };
            }

            setToken(response.data.token);
            setUser(response.data.user);
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Signup failed'
            };
        }
    };

    const verifyEmail = async (email, code) => {
        try {
            const response = await axios.post('/api/auth/verify-email', { email, code });
            setToken(response.data.token);
            setUser(response.data.user);
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Verification failed'
            };
        }
    };

    const resendVerification = async (email) => {
        try {
            await axios.post(`/api/auth/resend-verification?email=${email}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Resend failed'
            };
        }
    };

    const googleLogin = async (googleToken) => {
        try {
            const fingerprint = localStorage.getItem('nunno_device_fingerprint');
            const response = await axios.post('/api/auth/google', {
                token: googleToken,
                device_fingerprint: fingerprint
            });
            setToken(response.data.token);
            setUser(response.data.user);
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            
            // For returning Google users, mark tutorial/language as already seen
            // so TutorialController doesn't show them again
            const userData = response.data.user;
            const userKey = userData.email || userData.id;
            if (!response.data.is_new_user) {
                localStorage.setItem(`tutorial_seen_${userKey}`, 'true');
                localStorage.setItem(`language_set_${userKey}`, 'true');
            }
            
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Google login failed'
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const refreshUser = async () => {
        if (token) {
            try {
                const response = await axios.get('/api/v1/me');
                setUser(response.data);
            } catch (error) {
                console.error('Failed to refresh user:', error);
            }
        }
    };

    const updateProfile = async (data) => {
        try {
            const response = await axios.patch('/api/auth/profile', data);
            setUser(prev => ({ ...prev, ...response.data.user }));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Update context failed'
            };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            signup,
            verifyEmail,
            resendVerification,
            googleLogin,
            logout,
            loading,
            refreshUser,
            updateProfile,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
