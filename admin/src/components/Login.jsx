import { useState, useRef, useEffect } from "react"
import { toast } from "react-toastify"
import { Loader2, Phone, Shield, RotateCcw, AlertCircle, CheckCircle } from "lucide-react"
import {backendUrl} from "../App.jsx";
import {publicAxios} from "../../service/axios.service.js";
import {useNavigate} from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("")
    // Change otp state to array of 4 strings
    const [otp, setOTP] = useState(["", "", "", ""])
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

    // Validation functions
    const validatePhone = (phoneNumber) => {
        const phoneRegex = /^\d{10}$/
        return phoneRegex.test(phoneNumber.trim())
    }

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return emailRegex.test(email.trim())
    }

    // Adjust validateOTP to check joined string
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
        const response = await publicAxios.post(`${backendUrl}/api/user/verifyOTP`, {
            phone: phoneNumber,
            otp: otpCode,
        })
        return response.data
    }

    // Send OTP function
    const sendOTP = async () => {
        clearMessages()

        if (!validatePhone(phone)) {
            setError("Please enter a valid phone number")
            toast.error("Please enter a valid phone number", { autoClose: 3000 })
            return
        }

        try {
            setLoading(true)
            const response = await sendOTPAPI(phone)

            if (response.success) {
                setOtpSent(true)
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
            toast.error("Please enter a valid 4-digit OTP", { autoClose: 3000 })
            return
        }

        try {
            setLoading(true)
            const response = await verifyOTPAPI(phone, otp)

            if (response.success) {
                setSuccess("Login successful!")
                console.log("Printing response", response.token)
                localStorage.setItem("token", response.token)
                toast.success("Login successful!", { autoClose: 2000 })
                navigate(0);
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

    // Create refs for the 4 OTP inputs
    const otpRefs = useRef([])

    // Handle OTP input change for each input
    const handleOTPChangeSingle = (e, index) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 1)
        if (!value && otp[index] === "") {
            // No change
            return
        }
        const newOTP = [...otp]
        newOTP[index] = value
        setOTP(newOTP)
        clearMessages()

        if (value && index < 3) {
            // Move focus to next input
            otpRefs.current[index + 1].focus()
        }
    }

    // Handle key down for backspace to move focus back
    const handleOTPKeyDown = (e, index) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            otpRefs.current[index - 1].focus()
        }
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
        setOTP(["", "", "", ""])
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
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                        Admin Panel
                    </h1>
                    <p className="text-gray-600 text-sm">
                        {!otpSent ? "Enter your phone number to receive OTP" : "Enter the 4-digit OTP sent to your phone"}
                    </p>
                </div>

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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-900 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                            required
                        />
                    </div>

                    {/* OTP Input */}
                    {otpSent && (
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                4-Digit OTP
                            </label>
                            <div className="flex justify-center gap-2 mb-6">
                                {[0, 1, 2, 3].map((index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength={1}
                                        pattern="[0-9]"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        required
                                        className="w-12 h-12 text-center border rounded-md shadow-sm focus:border-gray-800 focus:ring-gray-900"
                                        value={otp[index]}
                                        onChange={(e) => handleOTPChangeSingle(e, index)}
                                        onKeyDown={(e) => handleOTPKeyDown(e, index)}
                                        disabled={loading}
                                        ref={(el) => (otpRefs.current[index] = el)}
                                    />
                                ))}
                            </div>

                            {/* Resend OTP Section */}
                            <div className="flex items-center justify-between mt-3 text-sm">
                                <span className="text-gray-800">Didn&#39;t receive OTP?</span>
                                {resendTimer > 0 ? (
                                    <span className="text-gray-800 font-medium">Resend in {resendTimer}s</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={resendOTP}
                                        disabled={resendLoading}
                                        className="text-gray-800 hover:text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors duration-200"
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
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Enter email address"
                                className="w-full px-4 py-2 text-md font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-900 outline-none transition-all duration-200 disabled:bg-gray-50"
                                disabled={loading}
                                required
                            />

                            {/* Resend OTP Section */}
                            <div className="flex items-center justify-between mt-3 text-sm">
                                <span className="text-gray-800">Didn&#39;t receive OTP?</span>
                                {resendTimer > 0 ? (
                                    <span className="text-gray-800 font-medium">Resend in {resendTimer}s</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={resendOTP}
                                        disabled={resendLoading}
                                        className="text-gray-800 hover:text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors duration-200"
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
                        className="w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-800 hover:from-gray-900 hover:to-gray-900 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        disabled={
                            loading ||
                            !phone.trim() ||
                            (otpSent && otp.some((digit) => digit === "")) ||
                            (otpSent && !isVerified && !email.trim())
                        }
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
                            className="w-full py-3 px-4 border border-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
