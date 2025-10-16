"use client"

import { useRouter } from "next/navigation";
import ProductGrid from "../components/product-grid";
import { Hero } from "../components/sections/hero";
import { ChevronRightIcon } from "../components/ui/icons";
import { mockProducts } from "@/utils/mock-data";

export default function Page() {
  const router = useRouter();

  const collections = [
    { name: 'Hair', imageUrl: '/product-4.png' },
    { name: 'Skin', imageUrl: '/product-2.png' },
    { name: 'Perfumes', imageUrl: '/product-3.png' },
    { name: 'Eyeliners', imageUrl: '/product-1.png' },
];


  return (
    <main>
      <Hero />

         <section className="py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-semibold text-left mb-4">Our Collection</h2>
                    <div className="w-62 h-0.5 bg-[#343A40]  mb-12 flex justify-left"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {collections.map(col => (
                            <div key={col.name} className="text-center group">
                                <div className="overflow-hidden  mb-4">
                                    <img src={col.imageUrl} alt={col.name} className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <button className="w-full text-lg font-semibold py-3 border border-[#343A40] rounded-full hover:bg-[#343A40] hover:text-white transition-colors">{col.name}</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        {/* Featured Items */}
            <section className="py-20 bg-white">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-semibold text-left mb-4">Featured Items</h2>
                    <div className="w-62 h-0.5 bg-[#343A40] mb-12 flex justify-left"></div>
                    <ProductGrid products={mockProducts.slice(0,4)} />
                    <div className="text-center mt-12">
                        <button onClick={() => router.push('/shop')} className="text-lg font-semibold flex items-center justify-center mx-auto">
                            View All <ChevronRightIcon />
                        </button>
                    </div>
                </div>
            </section>

            {/* Top Sellers */}
            <section className="py-20 bg-[#D4C394]">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-semibold text-left mb-4">Top Sellers</h2>
                    <div className="w-62 h-0.5 bg-[#343A40] mb-12 flex justify-left"></div>
                    <ProductGrid products={mockProducts.slice(0,4)}  />
                     <div className="text-center mt-12">
                        <button onClick={() => router.push('/shop')} className="text-lg font-semibold flex items-center justify-center mx-auto">
                            View All <ChevronRightIcon />
                        </button>
                    </div>
                </div>
            </section>

            {/* Banners */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 bg-cover bg-center rounded-lg min-h-[400px] flex items-end p-8" style={{backgroundImage: "url('/back-instock.png')"}}>
                        <button className="bg-[#D4C394] text-black font-semibold py-3 px-8 rounded-full text-lg hover:bg-opacity-90 transition-transform hover:scale-105">
                            Top Sellers <ChevronRightIcon className="inline-block" />
                        </button>
                    </div>
                     <div className="flex-1 bg-cover bg-center rounded-lg min-h-[400px] flex items-end p-8" style={{backgroundImage: "url('/new-arrival.png')"}}>
                         <button className="bg-[#D4C394] text-black font-semibold py-3 px-8 rounded-full text-lg hover:bg-opacity-90 transition-transform hover:scale-105">
                            New arrivals <ChevronRightIcon className="inline-block" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Consultation */}
            <section className="py-20 relative overflow-hidden" style={{ minHeight: '500px' }}>
                <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('/bg-image-2.png')"}}>
                    <div className="absolute inset-0 bg-[#1D2E25] opacity-85"></div>
                </div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 text-white">
                    <h2 className="text-4xl font-bold max-w-3xl mx-auto leading-tight">Unlock your best skin, style, and scent. Book a 1-on-1 session.</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-200">Stop guessing, start glowing. Your beauty journey is unique, and true refinement requires expert guidance. Our private consultations are designed to go beyond surface-level advice, offering you a tailored roadmap across Skincare, Haircare, Bodycare, Decorative Artistry, and Fragrance.</p>
                     <button className="mt-8 bg-[#D4C394] text-black font-semibold py-3 px-8 rounded-full text-lg hover:bg-opacity-90 transition-transform hover:scale-105">
                        Book my session
                    </button>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center mb-4">Why Choose Trichome?</h2>
                    <div className="w-24 h-1 bg-[#343A40] mx-auto mb-12"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#D4C394] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
                            <p className="text-gray-600">Only the finest ingredients, scientifically proven to deliver results.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#D4C394] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Expert Guidance</h3>
                            <p className="text-gray-600">Personalized consultations to help you find your perfect routine.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#D4C394] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Trusted by Thousands</h3>
                            <p className="text-gray-600">Join our community of satisfied customers who've transformed their skin.</p>
                        </div>
                    </div>
                </div>
            </section>
    </main>
  );
}