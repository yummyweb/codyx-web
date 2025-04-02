import { createSolanaMessage, getSIWS } from '@/lib/generic'
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import { type NextRequest } from 'next/server'
import type {
    SolanaSignInInput,
    SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";

import { PrismaClient } from '../../../../../prisma/app/generated/prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic' // defaults to auto
export async function POST(request: NextRequest) {
    const res = await request.json()

    const serialisedOutput: SolanaSignInOutput = {
        account: {
            publicKey: new Uint8Array(Object.keys(res.publicKey).map(function (key) { return res.publicKey[key]; })),
            ...res.output.account
        },
        signature: new Uint8Array(res.output.signature.data),
        signedMessage: new Uint8Array(res.output.signedMessage.data),
    };

    const decodedPK = bs58.encode(Object.keys(res.publicKey).map(function (key) { return res.publicKey[key]; }))

    // Check if user exists, else save in database
    const existingUser = await prisma.user.findUnique({
        where: {
            address: decodedPK,
        },
    })

    if (!existingUser) {
        const newUser = await prisma.user.create({
            data: {
                address: decodedPK,
                signature: bs58.encode(new Uint8Array(res.output.signature.data)),
                chainId: "devnet"
            },
        })
    }

    return Response.json({
        success: verifySignIn(res.input, serialisedOutput)
    })
}