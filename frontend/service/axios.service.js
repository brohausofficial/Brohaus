import axios from "axios";
import { toast } from "react-toastify";
import {handleLogout} from "../helper/logoutHelper.js";

// Public instance (no auth)
export const publicAxios = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Private instance (with credentials + token)
export const privateAxios = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

// Request interceptor
privateAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            toast.error("Session expired. Redirecting to login...");
            handleLogout();
            return Promise.reject(new Error("No auth token found"));
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
privateAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("error is in interceptor is", error.response)
        if (error.response?.status === 401) {
            switch (error.response.data.message) {
                case "You don't have subscription, subscribe first.":
                    toast.error("Please subscribe first to use our services. Redirecting to services page");
                    break;
                case "You are not authorized to access this resource":
                    toast.error("Unauthorized! Redirecting to login...");
                    handleLogout();
                    break;
                case "Invalid Username or Password":
                    break;
                case "Incorrect old password":
                    break;
                case "Unauthorized, Token is missing":
                    toast.error("Unauthorized! Redirecting to login...");
                    handleLogout();
                    break;
            }
        }
        if (error.response?.status === 500) {
            if (error.response.data.data.error.name === "JsonWebTokenError") {
                toast.error("Unauthorized! Redirecting to login...");
                handleLogout();
            }
        }
        return Promise.reject(error);
    }
);
