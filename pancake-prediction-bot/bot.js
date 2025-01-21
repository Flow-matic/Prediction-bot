const Web3 = require("web3");
const dotenv = require("dotenv");
const axios = require("axios");

// Load environment variables
dotenv.config();

// Set up Web3 connection
const web3 = new Web3(process.env.BSC_RPC_URL);  // Correct way for Web3 v1.0+

// Load your wallet private key
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

// Define PancakeSwap Prediction Market contract details
const PREDICTION_CONTRACT_ADDRESS = "your_contract_address";  // Replace with actual contract address
const PREDICTION_ABI = [
  // ABI of the Prediction Market contract (this is just an example, replace with actual ABI)
  {
    "constant": true,
    "inputs": [],
    "name": "placePrediction",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  }
];

const contract = new web3.eth.Contract(PREDICTION_ABI, PREDICTION_CONTRACT_ADDRESS);

// Function to place a prediction (e.g., "up" or "down")
async function placePrediction(predictionDirection) {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    const data = contract.methods.placePrediction(predictionDirection).encodeABI();
    const tx = {
      from: account.address,
      to: PREDICTION_CONTRACT_ADDRESS,
      data: data,
      gas: 200000, // Gas limit
      gasPrice: gasPrice,
      value: web3.utils.toWei("0.1", "ether") // Example bet of 0.1 BNB
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("Transaction successful:", receipt);
  } catch (error) {
    console.error("Error placing prediction:", error);
  }
}

// Example function to fetch RSI (or other market data)
async function fetchRSI() {
  try {
    const response = await axios.get("https://api.example.com/rsi"); // Replace with actual data source
    return response.data.rsi;
  } catch (error) {
    console.error("Error fetching RSI:", error);
    return null;
  }
}

// Run bot with simple RSI strategy (Buy if RSI < 30, Sell if RSI > 70)
async function runBot() {
  const rsi = await fetchRSI();
  if (rsi < 30) {
    console.log("RSI is low, placing a buy prediction.");
    await placePrediction("up");  // 'up' for buy prediction
  } else if (rsi > 70) {
    console.log("RSI is high, placing a sell prediction.");
    await placePrediction("down");  // 'down' for sell prediction
  } else {
    console.log("RSI is neutral, no prediction placed.");
  }
}

setInterval(runBot, 60000);  // Run every minute
