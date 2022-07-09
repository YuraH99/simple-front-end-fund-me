// in nodejs (backend), we use require
// in front end js, we use import
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

// this is because in our html file we have type="module"
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
withdrawButton.onclick = withdraw
balanceButton.onclick = getBalance
connectButton.onclick = connect
fundButton.onclick = fund

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "Connected"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        connectButton.innerHTML = "Please install metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

// fund function
// to send transactions we need:
// 1. provider / connection to blockchain
// 2. signer / wallet / someone with some gas
// 3. contract (thus abi and address)

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        console.log(signer)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        console.log(contract)
        try {
            const txResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMined(txResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMined(txResponse, provider) {
    console.log(`Mining ${txResponse.hash}...`)
    return new Promise((resolve, reject) => {
        // once tx.hash is found, call the listener function
        // promise only returns once resolve or reject is called.
        provider.once(txResponse.hash, (txReceipt) => {
            console.log(
                `Completed with ${txReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

// withdraw function

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing..")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const txResponse = await contract.withdraw()
            listenForTransactionMined(txResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
