"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import {
    ConnectionProvider,
    useWallet,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { Adapter, WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { SolanaSignInInput } from "@solana/wallet-standard-features";
import { PhantomWalletAdapter, PhantomWalletName } from '@solana/wallet-adapter-wallets';

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

export default function AppWalletProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter()
        ],
        [network],
    )

    const autoSignIn = useCallback(async (adapter: Adapter) => {
        // If the signIn feature is not available, return true
        if (!("signIn" in adapter)) return true;

        // Fetch the signInInput from the backend
        const signInData = await fetch("/api/auth/createSignInData")
        const input: SolanaSignInInput = (await signInData.json()).signInData

        // Send the signInInput to the wallet and trigger a sign-in request
        const output = await adapter.signIn(input);

        // Verify the sign-in output against the generated input server-side
        let strPayload = JSON.stringify({ input, output });
        const verifyResponse = await fetch("/api/auth/verifySIWS", {
            method: "POST",
            body: strPayload,
        });
        const success = await verifyResponse.json();

        // If verification fails, throw an error
        if (!success) throw new Error("Sign In verification failed!");

        return false;
    }, []);

    const autoConnect = useCallback(async (adapter: Adapter) => {
        adapter.autoConnect().catch((e) => {
            return autoSignIn(adapter);
        });
        return false;
    }, [autoSignIn]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect={autoConnect}>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}