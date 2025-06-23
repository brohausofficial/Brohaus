import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
            <img src={assets.logo} className='mb-5 w-24 h-20' alt="" />
            <p className='w-full md:w-2/3 text-gray-600'>
            Brohouse isn't just a brand — it's a lifestyle. Designed for those who live boldly and dress sharper, our latest collection brings street-ready comfort with effortless style. Step into the brocode of fashion.
            </p>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                 <li><a href="/">Home</a></li>
  <li><a href="/about">About us</a></li>
                <li><a href="/return-policy">Return policy</a></li>
                <li><a href="/privacy-policy">Privacy policy</a></li>
                <li><a href="/terms-and-conditions">Terms & Conditions</a></li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>+91 7020022341</li>
                <li>brohausofficial@gmail.com</li>
            </ul>
        </div>

      </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2025@ brohaus.com - All Right Reserved.</p>
        </div>

    </div>
  )
}

export default Footer
