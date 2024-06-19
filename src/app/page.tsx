import Navbar from "@/components/navbar";
import { Button } from '../components/ui/button'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <div className='relative px-6 lg:px-8'>
          <div className='mx-auto max-w-7xl py-8'>
            <div className="grid px-4 mx-auto lg:gap-8 xl:gap-0 lg:py-12 lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:col-span-7">
                <h1 className="max-w-2xl mb-4 text-4xl font-semibold md:text-5xl xl:text-7xl dark:text-white">
                  No-code smart contract builder for web3 is here
                </h1>
              </div>
              <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
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

            {/* <div className="grid px-4 mx-auto lg:gap-8 xl:gap-0 lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:col-span-3">
                <div className="flex flex-col">
                  <p className="text-xl color-white">%90</p>
                  <p className="text-lg color-white">x2.15</p>
                </div>
              </div>
              <div className="hidden lg:mt-0 lg:col-span-9 lg:flex justify-end">
                <Image src="/hero-graphic2.png" width={800} height={1000}
                  alt="No-code illustration" />
              </div>
            </div> */}
          </div>
        </div>
      </main>
    </>
  );
}
