import { useState, useRef, useEffect } from "react"
import { toast } from "react-toastify"
import { Loader2, Phone, Shield, RotateCcw, AlertCircle, CheckCircle } from "lucide-react"
import {publicAxios} from "../../service/axios.service.js";
import {useNavigate} from "react-router-dom";
import {backendUrl} from "../App.jsx";

const Login = () => {
    const [phone, setPhone] = useState("")
    const [otp, setOTP] = useState("")
    const [email, setEmail] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [error, setError] = useState("")
    const [resendTimer, setResendTimer] = useState(0)
    const [success, setSuccess] = useState("")
    const [isVerified, setIsVerified] = useState(false)
    const timerRef = useRef(null)
    const errorToastId = useRef(null)
    const navigate = useNavigate();
    // Validation functions
    const validatePhone = (phoneNumber) => {
        const phoneRegex = /^\d{10}$/
        return phoneRegex.test(phoneNumber.trim())
    }

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return emailRegex.test(email.trim())
    }

    const validateOTP = (otpValue) => {
        return /^\d{4}$/.test(otpValue)
    }

    // Clear messages
    const clearMessages = () => {
        setError("")
        setSuccess("")
        if (errorToastId.current) {
            toast.dismiss(errorToastId.current)
            errorToastId.current = null
        }
    }

    // Start resend timer
    const startResendTimer = () => {
        setResendTimer(60)
        timerRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current)
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    // Send OTP API call
    const sendOTPAPI = async (phoneNumber) => {
        console.log("Printing phone number", phoneNumber)
        const response = await publicAxios.post(`${backendUrl}/api/user/sendOTP`, {
            phone: phoneNumber,
        })
        return response.data
    }

    const resendOTPAPI = async (phoneNumber) => {
        const response = await publicAxios.post(`${backendUrl}/api/user/resendOTP`, {
            phone: phoneNumber,
        })
        return response.data
    }

    // Verify OTP API call
    const verifyOTPAPI = async (phoneNumber, otpCode) => {
        let requestData = isVerified ?  {
            phone: phoneNumber,
            otp: otpCode
        } : {
            phone: phoneNumber,
            otp: otpCode,
            email: email
        }
        const response = await publicAxios.post(`${backendUrl}/api/user/verifyOTP`, requestData)
        return response.data
    }

    // Send OTP function
    const sendOTP = async () => {
        clearMessages()

        if (!validatePhone(phone)) {
            setError("Please enter a valid phone number")
            return
        }

        try {
            setLoading(true)
            const response = await sendOTPAPI(phone)
            if (response.success) {
                setOtpSent(true)
                setIsVerified(response.isVerified)
                setSuccess("OTP sent successfully to your phone")
                toast.success("OTP sent successfully!", { autoClose: 3000 })
                startResendTimer()
            } else {
                setError(response.message || "Failed to send OTP")
                if (!errorToastId.current) {
                    errorToastId.current = toast.error(response.message, { autoClose: 3000 })
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Network error. Please try again."
            setError(errorMessage)
            if (!errorToastId.current) {
                errorToastId.current = toast.error(errorMessage, { autoClose: 3000 })
            }
            console.error("Send OTP error:", error)
        } finally {
            setLoading(false)
        }
    }

    // Resend OTP function
    const resendOTP = async () => {
        clearMessages()

        try {
            setResendLoading(true)
            const response = await resendOTPAPI(phone)

            if (response.success) {
                setSuccess("OTP resent successfully")
                setOtpSent(true)
                setIsVerified(response.isVerified)
                toast.success("OTP resent successfully!", { autoClose: 3000 })
                startResendTimer()
            } else {
                setError(response.message || "Failed to resend OTP")
                if (!errorToastId.current) {
                    errorToastId.current = toast.error(response.message, { autoClose: 3000 })
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Network error. Please try again."
            setError(errorMessage)
            if (!errorToastId.current) {
                errorToastId.current = toast.error(errorMessage, { autoClose: 3000 })
            }
            console.error("Resend OTP error:", error)
        } finally {
            setResendLoading(false)
        }
    }

    // Verify OTP function
    const verifyOTP = async () => {
        clearMessages()

        if (!validateOTP(otp)) {
            setError("Please enter a valid 4-digit OTP")
            return
        }

        if (email.trim() !== "") {
            if (!validateEmail(email)) {
                setError("Please enter a valid email address")
                return
            }
        }

        try {
            setLoading(true)
            const response = await verifyOTPAPI(phone, otp, email)
            if (response.success) {
                setSuccess("Login successful!")
                console.log("Printing response", response.token)
                localStorage.setItem("token", response.token)
                sessionStorage.setItem('email', response.email)
                sessionStorage.setItem('mobileNumber', phone)
                navigate('/')
                toast.success("Login successful!", { autoClose: 2000 })
            } else {
                setError(response.message || "Invalid OTP")
                if (!errorToastId.current) {
                    errorToastId.current = toast.error(response.message, { autoClose: 3000 })
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Network error. Please try again."
            setError(errorMessage)
            if (!errorToastId.current) {
                errorToastId.current = toast.error(errorMessage, { autoClose: 3000 })
            }
            console.error("Verify OTP error:", error)
        } finally {
            setLoading(false)
        }
    }

    // Form submit handler
    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (!otpSent) {
            await sendOTP()
        } else {
            await verifyOTP()
        }
    }

    // Handle OTP input change with validation
    const handleOTPChange = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 4)
        setOTP(value)
        clearMessages()
    }

    // Handle phone input change
    const handlePhoneChange = (e) => {
        setPhone(e.target.value)
        clearMessages()
    }

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
        clearMessages()
    }

    // Reset form
    const resetForm = () => {
        setPhone("")
        setOTP("")
        setEmail("")
        setOtpSent(false)
        setIsVerified(false)
        setError("")
        setSuccess("")
        setResendTimer(0)
        clearMessages()
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
    }

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white shadow-2xl rounded-2xl px-8 py-8 max-w-md w-full border border-gray-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Register or Sign In to explore!
                    </h1>
                    <p className="text-gray-600 text-sm">
                        {!otpSent ? "Enter your phone number to receive OTP" : "Enter the 4-digit OTP sent to your phone"}
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Success Alert */}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-green-800 text-sm">{success}</p>
                    </div>
                )}

                <form onSubmit={onSubmitHandler} className="space-y-6">
                    {/* Phone Number Input */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="Enter your phone number"
                            disabled={otpSent || loading}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                            required
                        />
                    </div>

                    {/* OTP Input */}
                    {otpSent && (
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                4-Digit OTP
                            </label>
                            <input
                                id="otp"
                                type="text"
                                value={otp}
                                onChange={handleOTPChange}
                                placeholder="Enter 4-digit OTP"
                                maxLength={4}
                                className="w-full px-4 py-3 text-center text-xl font-mono tracking-[0.5em] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 disabled:bg-gray-50"
                                disabled={loading}
                                required
                            />

                            {/* Resend OTP Section */}
                            <div className="flex items-center justify-between mt-3 text-sm">
                                <span className="text-gray-600">Didn&#39;t receive OTP?</span>
                                {resendTimer > 0 ? (
                                    <span className="text-blue-600 font-medium">Resend in {resendTimer}s</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={resendOTP}
                                        disabled={resendLoading}
                                        className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors duration-200"
                                    >
                                        {resendLoading ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw className="w-3 h-3" />
                                                Resend OTP
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {otpSent && !isVerified && (
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Enter email address"
                                className="w-full px-4 py-3 text-center text-xl font-mono tracking-[0.5em] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 disabled:bg-gray-50"
                                disabled={loading}
                                required
                            />

                            {/* Resend OTP Section */}
                            <div className="flex items-center justify-between mt-3 text-sm">
                                <span className="text-gray-600">Didn&#39;t receive OTP?</span>
                                {resendTimer > 0 ? (
                                    <span className="text-blue-600 font-medium">Resend in {resendTimer}s</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={resendOTP}
                                        disabled={resendLoading}
                                        className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors duration-200"
                                    >
                                        {resendLoading ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw className="w-3 h-3" />
                                                Resend OTP
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        disabled={loading || !phone.trim() || (otpSent && !otp.trim()) || ((otpSent && !isVerified && !email.trim()))}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {!otpSent ? "Sending OTP..." : "Verifying..."}
                            </>
                        ) : !otpSent ? (
                            "Send OTP"
                        ) : (
                            "Verify & Login"
                        )}
                    </button>

                    {/* Back Button */}
                    {otpSent && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            Change Phone Number
                        </button>
                    )}
                </form>
            </div>
        </div>
    )
}

export default Login
