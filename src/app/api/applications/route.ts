import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import {
    AnchorProvider,
    Idl,
    Program, web3, Wallet
} from '@coral-xyz/anchor'
import idl from '../../../../idl.json'
import kp from '../../../../keypair.json'

import { PrismaClient } from '../../../../prisma/app/generated/prisma/client'
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet'

const prisma = new PrismaClient()

const { SystemProgram, Keypair } = web3;
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)
const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');
const opts: { preflightCommitment: web3.ConfirmOptions } = {
    preflightCommitment: "processed"
}

const getProvider = () => {
    let wallet = new NodeWallet(new Keypair()) as Wallet;
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
        connection, wallet, opts.preflightCommitment,
    );
    return provider;
}

export const dynamic = 'force-dynamic' // defaults to auto
export async function POST(request: NextRequest) {
    const req = await request.json()

    const provider = getProvider()
    const program = new Program((idl as Idl), programID, provider)
    const account = await program.account.application.fetch(baseAccount.publicKey)

    const user = await prisma.user.findUnique({
        where: {
            signature: req.sessionId,
        },
    })

    if (!user) {
        return Response.json({
            success: false,
            applications: []
        })
    }

    let retArr: Array<any> = []
    for (let i = 0; i < (account.applicationList as Array<any>).length; i++) {
        if ((account.applicationList as Array<any>)[i].creator.toString() === user.address) {
            retArr.push((account.applicationList as Array<any>)[i])
        }
    }

    return Response.json({
        success: true,
        applications: retArr
    })
}