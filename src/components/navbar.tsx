"use client"
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const navigation = [
    { name: 'Create', href: '/create' },
    { name: 'Features', href: '#' },
    { name: 'Marketplace', href: '#' },
    { name: 'FAQ', href: '#' },
];

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [walletAddress, setWalletAddress] = useState("")

    const router = useRouter()

    useEffect(() => {
        if (localStorage.getItem("u-authenticated") === "1") {
            loginWithPhantom()
        }
    }, [])

    const loginWithPhantom = async () => {
        try {
            const { solana } = window;

            if (solana) {
                if (solana.isPhantom) {
                    console.log('Phantom wallet found!');
                    const response = await solana.connect();
                    console.log(
                        'Connected with Public Key:',
                        response.publicKey.toString()
                    );

                    /*
                     * Set the user's publicKey in state to be used later!
                     */
                    setWalletAddress(response.publicKey.toString());
                    localStorage.setItem("u-authenticated", "1")
                }
            } else {
                alert('Solana object not found! Get a Phantom Wallet 👻');
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="px-6 pt-6 lg:px-8">
            <nav className='flex items-center justify-between pb-6 border-b'>
                <div className='flex lg:flex-1'>
                    <a href='/' className='-m-1.5 p-1.5'>
                        <h1 className='text-xl font-semibold'>Codyx</h1>
                    </a>
                </div>
                <div className='flex lg:hidden'>
                    <button
                        type='button'
                        className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5'
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className='sr-only'>Open main menu</span>
                        <Bars3Icon className='h-6 w-6' aria-hidden='true' />
                    </button>
                </div>
                <div className='hidden lg:flex lg:gap-x-12'>
                    {navigation.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className='text-[16px] leading-6 text-gray-400'
                        >
                            {item.name}
                        </a>
                    ))}
                </div>
                <div className='hidden lg:flex lg:flex-1 lg:justify-end'>
                    <Button onClick={() => walletAddress ? router.push("/dashboard") : loginWithPhantom()}>{walletAddress ? "Dashboard" : "Connect Wallet"} <span aria-hidden='true'>&rarr;</span></Button>
                </div>
            </nav>
            <Dialog as='div' open={mobileMenuOpen} onClose={setMobileMenuOpen}>
                <Dialog.Panel className='fixed inset-0 z-10 overflow-y-auto bg-background px-6 py-6 lg:hidden'>
                    <div className='flex items-center justify-between'>
                        <a href='#' className='-m-1.5 p-1.5'>
                            <h1 className='text-xl font-semibold'>Your Company</h1>
                        </a>
                        <button
                            type='button'
                            className='-m-2.5 rounded-md p-2.5'
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className='sr-only'>Close menu</span>
                            <XMarkIcon className='h-6 w-6' aria-hidden='true' />
                        </button>
                    </div>
                    <div className='mt-6 flow-root'>
                        <div className='-my-6 divide-y divide-gray-500'>
                            <div className='space-y-2 py-6'>
                                {navigation.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className='-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7'
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                            <div className='py-6'>
                                <a
                                    href='#'
                                    className='-mx-3 block rounded-lg py-2.5 px-3 text-base font-semibold leading-6'
                                >
                                    {walletAddress ? "Dashboard" : "Connect Wallet"}
                                </a>
                            </div>
                        </div>
                    </div>
                </Dialog.Panel>
            </Dialog>
        </div>
    )
}