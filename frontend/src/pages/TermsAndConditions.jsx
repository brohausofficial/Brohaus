import React from 'react'
import Title from '../components/Title'
import NewsletterBox from '../components/NewsletterBox'

const TermsAndConditions = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
          <Title text1={'TERMS &'} text2={'CONDITIONS'} />
      </div>

      <div className='my-10 flex flex-col justify-center items-center md:flex-row gap-10 mb-28'>
        <div className='flex flex-col justify-center items-center gap-6 px-4 md:px-0 text-gray-600 text-center'>
          <h1 className='font-bold text-2xl mb-4'>Terms and Conditions – Brohaus</h1>
          <p className='mb-4'>
            Welcome to Brohaus. By using our site, you agree to the following terms:
          </p>

          <h2 className='font-semibold text-xl mt-4 mb-2'>Use of Our Site</h2>
          <p className='mb-2'>
            All content, including images and branding, is owned by Brohaus and may not be reproduced without permission.
          </p>
          <p className='mb-4'>
            You agree not to misuse the website or violate any applicable laws.
          </p>

          <h2 className='font-semibold text-xl mt-4 mb-2'>Orders</h2>
          <p className='mb-2'>
            We reserve the right to cancel or refuse any order at our discretion.
          </p>
          <p className='mb-4'>
            Prices, products, and availability are subject to change without notice.
          </p>

          <h2 className='font-semibold text-xl mt-4 mb-2'>Shipping & Delivery</h2>
          <p className='mb-2'>
            Delivery times may vary depending on your location.
          </p>
          <p className='mb-4'>
            We are not liable for delays due to customs, weather, or courier issues.
          </p>

          <h2 className='font-semibold text-xl mt-4 mb-2'>Limitation of Liability</h2>
          <p className='mb-4'>
            Brohaus is not liable for any indirect or consequential damages arising from the use or misuse of our products or services.
          </p>
        </div>
      </div>

      <NewsletterBox/>
    </div>
  )
}

export default TermsAndConditions
