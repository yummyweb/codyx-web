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