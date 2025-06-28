import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

// Function to decode JWT token
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        return JSON.parse(jsonPayload)
    } catch (error) {
        console.error('Invalid token', error)
        return null
    }
}

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const emailFromSession = sessionStorage.getItem('email');
        if (emailFromSession) {
            setFormData(data => ({ ...data, email: emailFromSession }));
        }
    }, []);

    const onChangeHandler = (event) => {
        const name = event.target.name
        let value = event.target.value
        if (name === 'phone') {
            // Allow only digits and limit to 10 characters
            value = value.replace(/\D/g, '').slice(0, 10)
        }
        setFormData(data => ({ ...data, [name]: value }))
    }

   const initPay = (order) => {
    const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Order Payment',
        description: 'Order Payment',
        order_id: order.id,
        receipt: order.receipt, // This is your local MongoDB order _id
        handler: async (response) => {
            try {
                // Send Razorpay payment details + local order ID to backend
                await axios.post(backendUrl + '/api/order/verifyRazorpay', {
                    ...response,
                    localOrderId: order.receipt, // Important for DB update
                    userId: decodeToken(token)?.id || decodeToken(token)?._id
                }, {
                    headers: { token }
                })

                navigate('/orders')
                setCartItems({})
            } catch (error) {
                console.error(error)
                toast.error("Payment verification failed")
            }
        }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
}


    const onSubmitHandler = async (event) => {
        event.preventDefault()
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Validate phone number length
            if (formData.phone.length !== 10) {
                toast.error('Phone number must be exactly 10 digits.')
                setIsSubmitting(false);
                return
            }

            let orderItems = []

            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find(product => product._id === items))
                        if (itemInfo) {
                            itemInfo.size = item
                            itemInfo.quantity = cartItems[items][item]
                            orderItems.push(itemInfo)
                        }
                    }
                }
            }

            // Prevent order placement if cart is empty or total amount is zero
            if (orderItems.length === 0 || (getCartAmount() + delivery_fee) === 0) {
                toast.error('Your cart is empty. Please add items before placing an order.')
                setIsSubmitting(false);
                return
            }

            // Decode token to get userId
            const decodedToken = decodeToken(token)
            const userId = decodedToken ? decodedToken.id || decodedToken._id : null

            if (!userId) {
                toast.error('User not authenticated. Please login again.')
                setIsSubmitting(false);
                return
            }

            let orderData = {
                userId,
                address: formData,
                items: orderItems,
                amount: getCartAmount() + delivery_fee
            }
            
            

            switch (method) {

                // API Calls for COD
                case 'cod':
                    try {
                        const response = await axios.post(backendUrl + '/api/order/place',orderData,{headers:{token}})
                        if (response.data.success) {
                            setCartItems({})
                            navigate('/orders')
                        } else {
                            toast.error(response.data.message)
                        }
                    } catch (error) {
                        toast.error(error.message)
                    } finally {
                        setIsSubmitting(false);
                    }
                    break;

                case 'stripe':
                    try {
                        const responseStripe = await axios.post(backendUrl + '/api/order/stripe',orderData,{headers:{token}})
                        if (responseStripe.data.success) {
                            const {session_url} = responseStripe.data
                            window.location.replace(session_url)
                        } else {
                            toast.error(responseStripe.data.message)
                        }
                    } catch (error) {
                        toast.error(error.message)
                    } finally {
                        setIsSubmitting(false);
                    }
                    break;

                case 'razorpay':
                    try {
                        const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, {headers:{token}})
                        if (responseRazorpay.data.success) {
                            initPay(responseRazorpay.data.order)
                        }
                    } catch (error) {
                        toast.error(error.message)
                    } finally {
                        setIsSubmitting(false);
                    }
                    break;

                default:
                    setIsSubmitting(false);
                    break;
            }


        } catch (error) {
            console.log(error)
            toast.error(error.message)
            setIsSubmitting(false);
        }
    }


    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
                    <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
                </div>
                <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' disabled/>
                <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
                    <input onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Zipcode' />
                    <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' />
                </div>
                <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
            </div>

            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>

                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    {/* --------------- Payment Method Selection ------------- */}
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        {/* <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                        </div> */}
                        <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        {(() => {
                            const totalAmount = getCartAmount() + delivery_fee;
                            return (
                        <button
                            type='submit'
                            className={`bg-black text-white px-16 py-3 text-sm ${(totalAmount === 0 || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={totalAmount === 0 || isSubmitting}
                        >
                            {isSubmitting ? 'PLACING ORDER...' : 'PLACE ORDER'}
                        </button>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder
