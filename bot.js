const Web3 = require("web3");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.BSC_RPC_URL));
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

const PREDICTION_CONTRACT_ADDRESS = "your_contract_address"; // Replace with the correct contract address
const PREDICTION_ABI = [
  // Add ABI methods here (e.g., placePrediction(), etc.)
];

const contract = new web3.eth.Contract(PREDICTION_ABI, PREDICTION_CONTRACT_ADDRESS);

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
      value: web3.utils.toWei("0.1", "ether"), // Example bet of 0.1 ETH
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("Transaction successful:", receipt);
  } catch (error) {
    console.error("Error placing prediction:", error);
  }
}

async function fetchRSI() {
  try {
    const response = await axios.get("https://api.example.com/rsi"); // Replace with real RSI data source
    return response.data.rsi;
  } catch (error) {
    console.error("Error fetching RSI:", error);
    return null;
  }
}

async function runBot() {
  const rsi = await fetchRSI();
  if (rsi < 30) {
    console.log("RSI is low, placing a buy prediction.");
    await placePrediction("up"); // 'up' for buy
  } else if (rsi > 70) {
    console.log("RSI is high, placing a sell prediction.");
    await placePrediction("down"); // 'down' for sell
  } else {
    console.log("RSI is neutral, no prediction placed.");
  }
}

setInterval(runBot, 60000);  // Run every minute
