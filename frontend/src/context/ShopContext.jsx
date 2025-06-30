import { createContext, useEffect, useState, useCallback, useRef } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { privateAxios, publicAxios } from "../../service/axios.service.js"

export const ShopContext = createContext()

const ShopContextProvider = (props) => {
    const currency = "₹"
    const delivery_fee = 1
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    // State management
    const [search, setSearch] = useState("")
    const [showSearch, setShowSearch] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [cartLoading, setCartLoading] = useState(false)

    const navigate = useNavigate()
    const abortControllerRef = useRef(null)
    const syncInProgressRef = useRef(false)

    // Enhanced localStorage operations with error handling
    const loadCartFromLocalStorage = useCallback(() => {
        try {
            const savedCart = localStorage.getItem("cartItems")
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart)
                // Validate cart structure
                if (typeof parsedCart === "object" && parsedCart !== null) {
                    setCartItems(parsedCart)
                    return parsedCart
                }
            }
        } catch (error) {
            console.error("Error loading cart from localStorage:", error)
            // Clear corrupted data
            localStorage.removeItem("cartItems")
        }
        return {}
    }, [])

    const saveCartToLocalStorage = useCallback((cart) => {
        try {
            if (typeof cart === "object" && cart !== null) {
                localStorage.setItem("cartItems", JSON.stringify(cart))
            }
        } catch (error) {
            console.error("Error saving cart to localStorage:", error)
            if (error.name === "QuotaExceededError") {
                toast.error("Storage quota exceeded. Please clear some data.")
            }
        }
    }, [])

    // Enhanced addToCart with better error handling and optimization
    const addToCart = useCallback(
        async (itemId, size) => {
            if (!itemId) {
                toast.error("Invalid product")
                return false
            }

            if (!size) {
                toast.error("Select Product Size")
                return false
            }

            try {
                setCartLoading(true)

                // Update local state immediately for better UX
                const cartData = structuredClone(cartItems)

                if (cartData[itemId]) {
                    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1
                } else {
                    cartData[itemId] = { [size]: 1 }
                }

                setCartItems(cartData)
                saveCartToLocalStorage(cartData)

                // Sync with server if user is logged in
                const token = localStorage.getItem("token")
                if (token) {
                    try {
                        await privateAxios.post(`${backendUrl}/api/cart/add`, {
                            itemId,
                            size,
                        })
                    } catch (error) {
                        console.error("Server sync failed:", error)

                        // Revert local changes if server sync fails
                        const revertedCart = structuredClone(cartItems)
                        setCartItems(revertedCart)
                        saveCartToLocalStorage(revertedCart)

                        if (error.response?.status === 401) {
                            toast.error("Session expired. Please login again.")
                            localStorage.removeItem("token")
                            navigate("/login")
                        } else {
                            toast.error("Failed to sync with server. Changes saved locally.")
                        }
                        return false
                    }
                }

                toast.success("Item added to cart")
                return true
            } catch (error) {
                console.error("Error adding to cart:", error)
                toast.error("Failed to add item to cart")
                return false
            } finally {
                setCartLoading(false)
            }
        },
        [cartItems, backendUrl, navigate, saveCartToLocalStorage],
    )

    // Optimized cart count calculation with memoization
    const getCartCount = useCallback(() => {
        let totalCount = 0

        try {
            for (const itemId in cartItems) {
                const sizes = cartItems[itemId]
                if (typeof sizes === "object" && sizes !== null) {
                    for (const size in sizes) {
                        const quantity = sizes[size]
                        if (typeof quantity === "number" && quantity > 0) {
                            totalCount += quantity
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error calculating cart count:", error)
        }

        return totalCount
    }, [cartItems])

    // Enhanced updateQuantity with better validation
    const updateQuantity = useCallback(
        async (itemId, size, quantity) => {
            if (!itemId || !size) {
                toast.error("Invalid item or size")
                return false
            }

            if (quantity < 0) {
                toast.error("Quantity cannot be negative")
                return false
            }

            try {
                setCartLoading(true)

                const cartData = structuredClone(cartItems)

                if (quantity === 0) {
                    // Remove item if quantity is 0
                    if (cartData[itemId]?.[size]) {
                        delete cartData[itemId][size]

                        // Remove item completely if no sizes left
                        if (Object.keys(cartData[itemId]).length === 0) {
                            delete cartData[itemId]
                        }
                    }
                } else {
                    // Ensure item structure exists
                    if (!cartData[itemId]) {
                        cartData[itemId] = {}
                    }
                    cartData[itemId][size] = quantity
                }

                setCartItems(cartData)
                saveCartToLocalStorage(cartData)

                // Sync with server
                const token = localStorage.getItem("token")
                if (token) {
                    try {
                        await privateAxios.post(`${backendUrl}/api/cart/update`, {
                            itemId,
                            size,
                            quantity,
                        })
                    } catch (error) {
                        console.error("Server sync failed:", error)

                        // Revert changes if server sync fails
                        const revertedCart = structuredClone(cartItems)
                        setCartItems(revertedCart)
                        saveCartToLocalStorage(revertedCart)

                        if (error.response?.status === 401) {
                            toast.error("Session expired. Please login again.")
                            localStorage.removeItem("token")
                            navigate("/login")
                        } else {
                            toast.error("Failed to sync with server")
                        }
                        return false
                    }
                }

                return true
            } catch (error) {
                console.error("Error updating quantity:", error)
                toast.error("Failed to update quantity")
                return false
            } finally {
                setCartLoading(false)
            }
        },
        [cartItems, backendUrl, navigate, saveCartToLocalStorage],
    )

    // Enhanced cart amount calculation with error handling
    const getCartAmount = useCallback(() => {
        let totalAmount = 0

        try {
            for (const itemId in cartItems) {
                const itemInfo = products.find((product) => product._id === itemId)

                if (itemInfo && typeof itemInfo.price === "number") {
                    const sizes = cartItems[itemId]

                    if (typeof sizes === "object" && sizes !== null) {
                        for (const size in sizes) {
                            const quantity = sizes[size]
                            if (typeof quantity === "number" && quantity > 0) {
                                totalAmount += itemInfo.price * quantity
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error calculating cart amount:", error)
        }

        return totalAmount
    }, [cartItems, products])

    // Enhanced products data fetching with abort controller
    const getProductsData = useCallback(async () => {
        try {
            setIsLoading(true)

            // Cancel previous request if still pending
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }

            abortControllerRef.current = new AbortController()

            const response = await publicAxios.get(`${backendUrl}/api/product/list`, {
                signal: abortControllerRef.current.signal,
            })

            if (response.data.success && Array.isArray(response.data.products)) {
                setProducts(response.data.products.reverse())
            } else {
                toast.error(response.data.message || "Failed to load products")
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Error fetching products:", error)
                toast.error("Failed to load products")
            }
        } finally {
            setIsLoading(false)
        }
    }, [backendUrl])

    // Optimized cart synchronization
    const syncLocalCartToServer = useCallback(
        async (localCart) => {
            if (syncInProgressRef.current) {
                return
            }

            try {
                syncInProgressRef.current = true

                // Batch sync operations
                const syncPromises = []

                for (const itemId in localCart) {
                    const sizes = localCart[itemId]
                    if (typeof sizes === "object" && sizes !== null) {
                        for (const size in sizes) {
                            const quantity = sizes[size]
                            if (typeof quantity === "number" && quantity > 0) {
                                // Use update endpoint instead of multiple add calls
                                syncPromises.push(
                                    privateAxios.post(`${backendUrl}/api/cart/update`, {
                                        itemId,
                                        size,
                                        quantity,
                                    }),
                                )
                            }
                        }
                    }
                }

                // Execute all sync operations
                await Promise.allSettled(syncPromises)
            } catch (error) {
                console.error("Error syncing cart to server:", error)
                throw error
            } finally {
                syncInProgressRef.current = false
            }
        },
        [backendUrl],
    )

    // Enhanced getUserCart with better error handling
    const getUserCart = useCallback(async () => {
        try {
            setCartLoading(true)
            const token = localStorage.getItem("token")

            if (token) {
                try {
                    const response = await privateAxios.post(`${backendUrl}/api/cart/get`, {})

                    if (response.data.success) {
                        const serverCart = response.data.cartData || {}
                        const localCart = loadCartFromLocalStorage()

                        // Check if local cart has items to sync
                        const hasLocalItems = Object.keys(localCart).length > 0

                        if (hasLocalItems) {
                            try {
                                await syncLocalCartToServer(localCart)

                                // Get updated cart after sync
                                const updatedResponse = await privateAxios.post(`${backendUrl}/api/cart/get`, {})
                                if (updatedResponse.data.success) {
                                    setCartItems(updatedResponse.data.cartData || {})
                                }

                                // Clear local storage after successful sync
                                localStorage.removeItem("cartItems")
                            } catch (syncError) {
                                console.error("Sync failed, using local cart:", syncError)
                                setCartItems(localCart)
                            }
                        } else {
                            setCartItems(serverCart)
                        }
                    }
                } catch (error) {
                    if (error.response?.status === 401) {
                        localStorage.removeItem("token")
                        navigate("/login")
                    }
                    throw error
                }
            } else {
                // Load from localStorage for non-authenticated users
                loadCartFromLocalStorage()
            }
        } catch (error) {
            console.error("Error in getUserCart:", error)
            // Fallback to localStorage
            loadCartFromLocalStorage()
        } finally {
            setCartLoading(false)
        }
    }, [backendUrl, navigate, loadCartFromLocalStorage, syncLocalCartToServer])

    // Enhanced clearCart function
    const clearCart = useCallback(async () => {
        try {
            setCartItems({})
            localStorage.removeItem("cartItems")

            // Also clear server cart if user is logged in
            const token = localStorage.getItem("token")
            if (token) {
                try {
                    await privateAxios.post(`${backendUrl}/api/cart/clear`, {})
                } catch (error) {
                    console.error("Failed to clear server cart:", error)
                }
            }
        } catch (error) {
            console.error("Error clearing cart:", error)
        }
    }, [backendUrl])

    // Initialize data on mount
    useEffect(() => {
        getProductsData()

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [getProductsData])

    // Initialize cart
    useEffect(() => {
        getUserCart()
    }, [getUserCart])

    // Context value with all functions and state
    const value = {
        // State
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        setCartItems,
        isLoading,
        cartLoading,

        // Functions
        addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        clearCart,
        getUserCart,

        // Navigation
        navigate,
        backendUrl,
    }

    return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
}

export default ShopContextProvider
