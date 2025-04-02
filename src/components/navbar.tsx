"use client"
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { connectWallet, createSolanaMessage } from '@/lib/generic';
import { useToast } from "@/components/ui/use-toast"
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { SolanaSignInInput } from '@solana/wallet-standard-features';
import { Adapter } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { PhantomWalletName } from '@solana/wallet-adapter-wallets';

const navigation = [
    { name: 'Create', href: '/create' },
    { name: 'Features', href: '#' },
    { name: 'Marketplace', href: '#' },
    { name: 'FAQ', href: '#' },
];

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [walletAddress, setWalletAddress] = useState("")
    const wallet = useWallet()

    const { toast } = useToast()

    const router = useRouter()

    // useEffect(() => {
    //     if (localStorage.getItem("u-authenticated") === "1") {
    //         loginWithPhantom()
    //     }
    // }, [])

    useEffect(() => {
        wallet.select(PhantomWalletName)
    }, [])

    const loginWithPhantom = async () => {
        //     try {
        //         window.solana.connect().then(async (resp: any) => {
        //             // Successful connection
        //             // Get the publicKey (string)
        //             const publicKey = resp.publicKey.toString();

        //             const signInData = await fetch("/api/auth/createSignInData")
        //             const input: SolanaSignInInput = (await signInData.json()).signInData
        //             const encodedMessage = new TextEncoder().encode(received)
        //             try {
        //                 const signedMessage = await window.solana.request({
        //                     method: "signMessage",
        //                     params: {
        //                         message: encodedMessage,
        //                         display: "utf8",
        //                     },
        //                 })

        //                 console.log(bs58.encode(signedMessage.signature))



        //                 // Verify the sign-in output against the generated input server-side
        //                 let strPayload = JSON.stringify({ input, output: signedMessage });
        //                 const verifyResponse = await fetch("/api/auth/verifySIWS", {
        //                     method: "POST",
        //                     body: strPayload,
        //                 });
        //                 const success = await verifyResponse.json();
        //                 console.log(success)

        //                 setWalletAddress(publicKey.toString())
        //             }
        //             catch (e) {
        //                 console.log(e)
        //                 console.log("User rejected sign in request")
        //                 toast({
        //                     description: "User rejected sign-in reqeust"
        //                 })
        //             }
        //         });
        //     } catch (error) {
        //         console.log("User rejected the request." + error);
        //     }

        // try {
        //     const { solana } = window;

        //     if (solana) {
        //         if (solana.isPhantom) {
        //             console.log('Phantom wallet found!');
        //             const response = await solana.connect();
        //             console.log(
        //                 'Connected with Public Key:',
        //                 response.publicKey.toString()
        //             );

        //             /*
        //              * Set the user's publicKey in state to be used later!
        //              */
        //             setWalletAddress(response.publicKey.toString());
        //             localStorage.setItem("u-authenticated", "1")
        //         }
        //     } else {
        //         alert('Solana object not found! Get a Phantom Wallet 👻');
        //     }
        // } catch (error) {
        //     console.error(error);

        // Fetch the signInInput from the backend
        const signInData = await fetch("/api/auth/createSignInData")
        const input: SolanaSignInInput = (await signInData.json()).signInData

        // Send the signInInput to the wallet and trigger a sign-in request
        const output = await window.solana.signIn(input);

        console.log(output)

        // Verify the sign-in output against the generated input server-side
        let strPayload = JSON.stringify({ input, output });
        const verifyResponse = await fetch("/api/auth/verifySIWS", {
            method: "POST",
            body: strPayload,
        });
        const success = await verifyResponse.json();

        // If verification fails, throw an error
        if (!success.success) {
            toast({
                description: "Sign-in verification failed."
            })
        }
        else {
            toast({
                description: "Sign-in verification succeeded"
            })
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
                    <Button onClick={() => wallet.connected ? router.push("/dashboard") : loginWithPhantom()}>{wallet.connected ? "Dashboard" : "Connect Wallet"} <span aria-hidden='true'>&rarr;</span></Button>
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