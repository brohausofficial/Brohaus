import React from 'react'
import Title from '../components/Title'
import NewsletterBox from '../components/NewsletterBox'

const PrivacyPolicy = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
          <Title text1={'PRIVACY'} text2={'POLICY'} />
      </div>

      <div className='my-10 flex flex-col justify-center items-center md:flex-row gap-10 mb-28'>
        <div className='flex flex-col justify-center items-center gap-6 px-4 md:px-0 text-gray-600 text-center'>
          <h1 className='font-bold text-2xl mb-4'>Privacy Policy – Brohaus</h1>
          <p className='mb-4'>
            Your privacy matters. At Brohaus, we are committed to protecting your personal information.
          </p>

          <h2 className='font-semibold text-xl mt-4 mb-2'>What We Collect</h2>
          <p className='mb-1'>Name, email, phone number</p>
          <p className='mb-1'>Shipping and billing address</p>
          <p className='mb-1'>Payment details (secured via third-party processors)</p>
          <p className='mb-4'>Site usage data (via cookies &amp; analytics tools)</p>

          <h2 className='font-semibold text-xl mt-4 mb-2'>How We Use It</h2>
          <p className='mb-2'>
            To process and fulfill your orders
          </p>
          <p className='mb-2'>
            To communicate order updates and offers
          </p>
          <p className='mb-4'>
            To improve our website and personalize your shopping experience
          </p>

          <h2 className='font-semibold text-xl mt-4 mb-2'>Data Protection</h2>
          <p className='mb-2'>
            We use SSL encryption and trusted payment gateways to keep your data safe.
          </p>
          <p className='mb-2'>
            We never sell or share your personal info with third parties for marketing purposes.
          </p>
          <p className='mb-4'>
            You may request access to or deletion of your personal data anytime by contacting brohausofficial@gmail.com
          </p>
        </div>
      </div>

      <NewsletterBox/>
    </div>
  )
}

export default PrivacyPolicy
