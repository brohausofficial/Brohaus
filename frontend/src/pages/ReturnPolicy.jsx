import React from 'react'
import Title from '../components/Title'
import NewsletterBox from '../components/NewsletterBox'

const ReturnPolicy = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
          <Title text1={'RETURN'} text2={'POLICY'} />
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-center'>
        <div className='flex flex-col justify-center items-center gap-6 px-4 md:px-0'>
          <p className='font-semibold text-xl text-gray-600'>Return Policy</p>
          <p className='text-gray-500'>
            📦 Return Policy – Brohaus
            At Brohaus, we stand by the quality of our products. If you're not completely satisfied with your purchase, we’re here to help.
          </p>
          <p className='text-gray-500'>
            ✅ Returns
            You may return most new, unworn items within 7 days of delivery for a full refund or exchange.
          </p>
          <p className='text-gray-500'>
            Items must be returned in original condition, with tags attached and in original packaging.
          </p>
          <p className='text-gray-500'>
            We do not accept returns on final sale items, underwear, or customized products.
          </p>
          <p className='text-gray-500'>
            💸 Refunds
            Once we receive and inspect your return, we’ll send an email to confirm receipt.
          </p>
          <p className='text-gray-500'>
            Approved refunds will be processed to your original payment method within 5–7 business days.
          </p>
          <p className='text-gray-500'>
            🔄 Exchanges
            Need a different size or color? Contact us at brohausofficial@gmail.com and we’ll make it right.
          </p>
          <p className='text-gray-500'>
            🚚 Return Shipping
            Customers are responsible for return shipping costs unless the item was damaged or incorrect upon arrival.
          </p>
          <p className='text-gray-500'>
            Got questions? Email us at brohausofficial@gmail.com — our team’s got your back.
          </p>
        </div>
      </div>

      <NewsletterBox/>
    </div>
  )
}

export default ReturnPolicy
