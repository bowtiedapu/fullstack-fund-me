import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected!"
    } else {
        connectButton.innerHTML = "Please install Metamask"
    }
}

async function fund() {
    const amount = document.getElementById("amountInput").value
    console.log(`Funding with ${amount}`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        // Returns whatever wallet is connected to the provider
        const signer = provider.getSigner()
        console.log(signer)

        // Here, we need to know the ABI and address
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const txnResponse = await contract.fund({
                value: ethers.utils.parseEther(amount),
            })
            // We can either listen for the tx or an event
            await listenForTxnMine(txnResponse, provider)
            console.log("Txn mined")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTxnMine(txnResponse, provider) {
    console.log(`Mining ${txnResponse.hash}`)
    // provider kicks off the listener as its own process
    // this is what's called the event loop. the provider.once is added onto the event loop, and our
    // front end periodically checks back to see if this has finished
    return new Promise((resolve, reject) => {
        provider.once(txnResponse.hash, (txnReceipt) => {
            console.log(
                `Completed with ${txnReceipt.confirmations} confirmation(s)`
            )
            // A promise returns only if a resolve() or reject() is called.
            // Here, we aren't adding on reject(), which means the Promise only resolves.
            resolve()
        })
    })
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const txnResponse = await contract.withdraw()
            await listenForTxnMine(txnResponse, provider)
            console.log("Withdraw complete")
        } catch (error) {
            console.log(error)
        }
    }
}
