// "use strict";
import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectBtn = document.getElementById("connectButton");
const fundBtn = document.getElementById("fundMe");
const balanceBtn = document.getElementById("balance");
const withdrawBtn = document.getElementById("withdraw");

// connectBtn.onclick = connect;
connectBtn.addEventListener("click", connect);
fundBtn.addEventListener("click", fund);
balanceBtn.addEventListener("click", getBalance);
withdrawBtn.addEventListener("click", withdraw);

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (err) {
      console.log(err);
    }

    connectBtn.innerHTML = "Connected";
    console.log("connected");
  } else {
    connectBtn.innerHTML = "Please install metamask";
    console.log("no metamask");
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`funding with ${ethAmount}...`);
  try {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = provider.getSigner();
      console.log(signer);

      const contract = new ethers.Contract(contractAddress, abi, signer);

      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });

      await listenForTransactionMine(transactionResponse, provider);

      console.log("done");
    }
  } catch (err) {
    console.log(err);
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const balance = await provider.getBalance(contractAddress);

    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      console.log("sure");
      const transactionResponse = await contract.withdraw();

      await listenForTransactionMine(transactionResponse, provider);

      console.log("done");
    } catch (err) {
      console.log(err);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash} `);

  return new Promise((resolve, _) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}
