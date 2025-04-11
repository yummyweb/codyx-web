'use client';

import Navbar from "@/components/navbar";
import { Button } from '../components/ui/button'
import Image from 'next/image'
import { Input } from '../components/ui/input'
import { X } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [showNewsletter, setShowNewsletter] = useState(true);

  if (!showNewsletter) return (
    <>
      <Navbar />
      <main>
        <div className='relative px-6 lg:px-8'>
          <div className='mx-auto max-w-7xl py-4'>
            <div className="flex px-4 mx-auto lg:gap-8 xl:gap-0 lg:py-8 lg:grid-cols-12">
              <div className="mr-auto lg:col-span-7">
                <h1 className="max-w-2xl mb-4 text-4xl font-semibold md:text-5xl xl:text-7xl dark:text-white">
                  No-code smart contract builder for web3 is here
                </h1>
                <div className="mt-6 lg:col-span-5 lg:flex">
                  <div className="flex flex-col">
                    <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg/4 lg:text-xl/10 dark:text-gray-400">
                      Build, deploy and manage smart contracts visually
                      with the click of a button on multiple blockchains
                      at once. Now on Hedera, Internet Computer and Solana.
                    </p>
                    <div className="flex w-2/3 justify-start gap-2">
                      <Button variant="secondary">Get Started</Button>
                      <Button variant="secondary">Explore Templates</Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:mt-0 lg:col-span-9 lg:flex justify-end">
                <Image src="/hero-graphic3.png" width={500} height={500}
                  alt="No-code illustration" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );

  return (
    <>
      <Navbar />
      <main>
        <div className='relative px-6 lg:px-8'>
          <div className='mx-auto max-w-7xl py-4'>
            <div className="flex px-4 mx-auto lg:gap-8 xl:gap-0 lg:py-8 lg:grid-cols-12">
              <div className="mr-auto lg:col-span-7">
                <h1 className="max-w-2xl mb-4 text-4xl font-semibold md:text-5xl xl:text-7xl dark:text-white">
                  No-code smart contract builder for web3 is here
                </h1>
                <div className="mt-6 lg:col-span-5 lg:flex">
                  <div className="flex flex-col">
                    <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg/4 lg:text-xl/10 dark:text-gray-400">
                      Build, deploy and manage smart contracts visually
                      with the click of a button on multiple blockchains
                      at once. Now on Hedera, Internet Computer and Solana.
                    </p>
                    <div className="flex w-2/3 justify-start gap-2">
                      <Button variant="secondary">Get Started</Button>
                      <Button variant="secondary">Explore Templates</Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:mt-0 lg:col-span-9 lg:flex justify-end">
                <Image src="/hero-graphic3.png" width={500} height={500}
                  alt="No-code illustration" />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full bg-black py-2 -mt-4 border-t border-gray-800 relative">
          <button 
            onClick={() => setShowNewsletter(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-3 mt-1">
            <h3 className="text-white text-lg font-bold pb-1">Join Our Newsletter</h3>
            <div className="flex items-center gap-4">
              <Input type="email" placeholder="Enter your email" className="w-96" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
