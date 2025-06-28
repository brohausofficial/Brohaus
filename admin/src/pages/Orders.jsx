import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import xlsIcon from "../assets/xls.png";

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(5)
  const [statusFilter, setStatusFilter] = useState('All')

  const fetchAllOrders = async () => {

    if (!token) {
      return null;
    }

    try {

      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { Authorization: `Bearer ${token}` } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }


  }

  const statusHandler = async ( event, orderId ) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status' , {orderId, status:event.target.value}, { headers: { Authorization: `Bearer ${token}` } })
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(response.data.message)
    }
  }

    //excel
  const downloadExcel = () => {
    const filtered = statusFilter === 'All'
      ? orders
      : (statusFilter === 'Payment Done'
        ? orders.filter(order => order.payment === true)
        : (statusFilter === 'Pending'
          ? orders.filter(order => order.payment === false)
          : orders.filter(order => order.status === statusFilter)
        )
      )

    const data = filtered.map(order => ({
      Name: order.address.firstName + ' ' + order.address.lastName,
      Items: order.items.map(i => `${i.name} x ${i.quantity} (${i.size})`).join(', '),
      Address: `${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country} - ${order.address.zipcode}`,
      Phone: order.address.phone,
      Amount: `${currency}${order.amount}`,
      Payment: order.payment ? 'Done' : 'Pending',
      Status: order.status,
      Date: new Date(order.date).toLocaleDateString()
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, 'filtered_orders.xlsx')
  }


  // Filter + Pagination
  const filteredOrders = statusFilter === 'All'
    ? orders
    : (statusFilter === 'Payment Done'
      ? orders.filter(order => order.payment === true)
      : (statusFilter === 'Pending'
        ? orders.filter(order => order.payment === false)
        : orders.filter(order => order.status === statusFilter)
      )
    )

  const totalPages = Math.ceil(filteredOrders.length / entriesPerPage)
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  useEffect(() => {
    fetchAllOrders()
    const intervalId = setInterval(() => {
      fetchAllOrders()
    }, 3000)
    return () => clearInterval(intervalId)
  }, [token])

  return (
   <div className='p-4'>
      <h3 className='text-lg font-semibold mb-4'>Order Page</h3>

      {/* Top Actions */}
      <div className='flex flex-col md:flex-row justify-between items-center gap-4 mb-4'>
        

        {/* Filter by status */}
        <div className='flex items-center'>
          <label className='mr-2 text-sm font-medium'>Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className='p-1 border rounded'
          >
            <option value="All">All</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Packing">Packing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for delivery">Out for delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Payment Done">Payment Done</option>
            <option value="Pending">Pending</option>
          </select>
          <div className='ml-2'>
          <img
           src={xlsIcon} alt="XLS" className="w-7 h-7 cursor-pointer"
            onClick={downloadExcel}
            title="Download Excel"
          />
          </div>
        </div>


        {/* Entries per page */}
        <div>
          <label className='mr-2 font-medium'>Entries per page:</label>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className='p-1 border'
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>

      {/* Order List */}
      <div>
        {
          currentOrders.map((order, index) => (
            <div key={index} className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700'>
              <img className='w-12' src={assets.parcel_icon} alt="Parcel" />
              <div>
                <div>
                  {order.items.map((item, i) => (
                    <p key={i} className='py-0.5'>
                      {item.name} x {item.quantity} <span>{item.size}</span>{i !== order.items.length - 1 ? ',' : ''}
                    </p>
                  ))}
                </div>
                <p className='mt-3 mb-2 font-medium'>{order.address.firstName} {order.address.lastName}</p>
                <div>
                  <p>{order.address.street},</p>
                  <p>{order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}</p>
                </div>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p className='text-sm sm:text-[15px]'>Items: {order.items.length}</p>
                <p className='mt-3'>Method: {order.paymentMethod}</p>
                <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className='text-sm sm:text-[15px]'>{currency}. {order.amount}</p>
              <select onChange={(e) => statusHandler(e, order._id)} value={order.status} className='p-2 font-semibold'>
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        }
      </div>

      {/* Pagination Controls */}
      <div className='flex justify-end mt-6 space-x-2'>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className='px-2 py-1 border rounded'>First</button>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className='px-2 py-1 border rounded'>Prev</button>
        <span className='px-4 py-1 border rounded bg-gray-100'>{currentPage} / {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className='px-2 py-1 border rounded'>Next</button>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className='px-2 py-1 border rounded'>Last</button>
      </div>
    </div>
  )
}

export default Orders
