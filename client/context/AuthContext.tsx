import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from '@/api/axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define API endpoints (Node backend)
const LOGIN_URL = "/auth/login";
const REFRESH_URL = "/auth/refresh";
const USER_INFO_URL = "/auth/me";

const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState("");

 
    // Login function
    const login = async (email: string, password: string, navigation: any) => {
        try {
            const response = await axios.post(
                LOGIN_URL,
                { email, password },
                { headers: { "Content-Type": "application/json" } }
            );

            const { user, accessToken, refreshToken } = response.data;

            // save tokens and user info securely
            await AsyncStorage.setItem("access_token", accessToken);
            await AsyncStorage.setItem("refresh_roken", refreshToken);
            await AsyncStorage.setItem("user", JSON.stringify(user));

            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            setUser(user);
            setAuth(user);


            navigation.navigate("Home"); // redirect user to home/profile
        } catch (error: any) {
            if (!error.response) {
                setErrMsg("No Server Response");
            } else if (error.response.status === 401) {
                setErrMsg("Invalid credential");
            } else {
                setErrMsg("Login failed. Try again later.")
            }
        }
    };

    // Logout function
    const logout = async (navigation: any) => {
        await AsyncStorage.clear();
        setUser(null);
        setAuth(null);
        setAccessToken(null);
        setRefreshToken(null);
        navigation.navigate("Home");
    };

    // Fetch new access token using refresh token
    const refreshAccessToken = async () => {
        const storedRefresh = await AsyncStorage.getItem("refresh_token");
        if (!storedRefresh) return null;

        try {
            const res = await axios.post(REFRESH_URL, { refreshToken: storedRefresh });
            const newAccess = res.data?.accessToken;

            await AsyncStorage.setItem("access_token", newAccess);
            setAccessToken(newAccess);
            return newAccess;
        } catch (err) {
            console.error("Token refresh failed", err);
            await AsyncStorage.clear();
            setAuth(null);
            return null;
        }
    };

    // Axios interceptor for automatic token refresh
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            res => res,
            async error => {
                if (error?.response?.status === 401) {
                    const newToken = await refreshAccessToken();
                    if (newToken) {
                        error.config.headers["Authorization"] = `Bearer ${newToken}`
                        return axios(error.config)
                    }
                }
                return Promise.reject(error)
            }
        );
        return () => axios.interceptors.response.eject(interceptor);

    }, []);

    // Load stored user and tokens on app start
    useEffect(() => {
        const laodUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                const storedAccess = await AsyncStorage.getItem("access_token");
                const storedRefresh = await AsyncStorage.getItem("refresh_token");

                if (storedUser && storedAccess) {
                    setUser(JSON.parse(storedUser));
                    setAccessToken(storedAccess);
                    setRefreshToken(storedRefresh);
                    setAuth(JSON.parse(storedUser));
                }
            } catch (err) {
                console.error("Error restoring session:", err);
            } finally {
                setLoading(false);
            }
        };
        laodUser()
    }, []);

    return (
        <AuthContext.Provider
            value={{
                auth, 
                setAuth,
                accessToken,
                refreshToken,
                user,
                login,
                logout,
                loading,
                errMsg,
            }}
        >
            { children }
        </AuthContext.Provider>
    );
    
};

export default AuthContext

export const useAuth = () => useContext(AuthContext);