import { SolanaSignInInput } from "@solana/wallet-standard-features";
import { Header, Payload, SIWS } from "@web3auth/sign-in-with-solana";

export const checkIfUserConnected = async (set: any) => {
    try {
        const { solana } = window;

        if (solana) {
            if (solana.isPhantom) {
                console.log('Phantom wallet found!');
                const response = await solana.connect({ onlyIfTrusted: true });
                console.log(
                    'Connected with Public Key:',
                    response.publicKey.toString()
                );
                set(response.publicKey.toString())
            }
        } else {
            console.log('Solana object not found! Get a Phantom Wallet 👻');
        }
    } catch (error) {
        console.error(error);
    }
}

export const connectWallet = (): string | undefined => {
    try {
        window.solana.connect().then((resp: any) => {
            // Successful connection
            // Get the publicKey (string)
            const publicKey = resp.publicKey.toString();
            return publicKey
        });
    } catch (error) {
        console.log("User rejected the request." + error);
        return undefined
    }
}

export const createSolanaMessage = (address: string | undefined, statement: string) => {
    const header = new Header();
    header.t = "sip99";
    const payload = new Payload()
    payload.domain = "localhost"
    payload.address = "http://localhost:3000/"
    payload.uri = "http://localhost:3000/"
    payload.statement = statement
    payload.version = "1"
    payload.chainId = 1
    let message = new SIWS({
        header,
        payload,
    })
    // Returning the prepared message
    return message.prepareMessage()
}

export const getSIWS = (address: string | undefined) => {
    const header = new Header();
    header.t = "sip99";
    const payload = new Payload()
    payload.domain = "localhost"
    payload.address = "http://localhost:3000/"
    payload.uri = "http://localhost:3000/"
    payload.statement = "Sign in with Solana to the app."
    payload.version = "1"
    payload.chainId = 1
    let message = new SIWS({
        header,
        payload,
    })
    // Returning the prepared message
    return message
}