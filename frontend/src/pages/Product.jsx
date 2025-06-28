import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchProductData = () => {
      products.forEach((item) => {
        if (item._id === productId) {
          setProductData(item);
          setImage(item.image[0]);
        }
      });
    };

    fetchProductData();
  }, [productId, products]);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const accordionData = productData
    ? [
        {
          title: 'Description',
          content: productData.description || 'No description available.',
        },
        {
          title: 'Return & Exchange Policy',
          content: ` Hassle-free returns within 7 days of delivery. Items must be unused, unworn, and have tags intact.`,
        },
        {
          title: ' Refund Policy',
          content: `Will be refunded to Original payment Method Exchanges: Allowed once per item for a same or different product, size, or color of equal or higher value (price difference must be paid). Defective, incorrect, or damaged items must be reported within 24 hours of delivery. . Shipping charges are non-refundable.`,
        },
        {
          title: 'Payment Process',
          content: `We accept credit/debit cards, net banking, and UPI. You can also opt for Cash on Delivery during checkout.`,
        },
      ]
    : [];

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product Section */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt=""
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt="" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(4)].map((_, i) => (
              <img key={i} src={assets.star_icon} alt="" className="w-3.5" />
            ))}
            <img src={assets.star_dull_icon} alt="" className="w-3.5" />
            <p className="pl-2">(122)</p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>


          {/* Sizes */}
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? 'border-orange-500' : ''
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={() => addToCart(productData._id, size)}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>

          
          {/* Accordion */}
          <div className="accordion-group mt-6">
            {accordionData.map((item, index) => (
              <div
                key={index}
                className={`accordion py-6 border-b border-gray-200 ${
                  openIndex === index ? 'active' : ''
                }`}
              >
                <button
                  className="accordion-toggle group flex justify-between w-full text-xl text-gray-700 font-medium hover:text-indigo-600 transition duration-300"
                  onClick={() => toggleAccordion(index)}
                >
                  <h5>{item.title}</h5>
                  <svg
                    className={`transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.5 8.25L12.4142 12.3358C11.7475 13.0025 11.4142 13.3358 11 13.3358C10.5858 13.3358 10.2525 13.0025 9.58579 12.3358L5.5 8.25"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div
                  className={`accordion-content transition-all duration-300 ease-in-out mt-2 ${
                    openIndex === index ? 'block' : 'hidden'
                  }`}
                >
                  <p className="text-base text-gray-600">{item.content}</p>
                </div>
              </div>
            ))}
          </div>

          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description + Reviews */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">Description</b>
          <p className="border px-5 py-3 text-sm">Reviews (122)</p>
        </div>
        <div
          className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: productData.description }}
        ></div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0">Loading...</div>
  );
};

export default Product;
