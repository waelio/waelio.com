import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";
import { useForm } from 'src/store/form.pinia'
import { useTransactions } from 'src/store/transactions.pinia'
import { note } from "./useNote";
// import { ref } from 'vue'
const transactions = useTransactions();
const eathForm = useForm();


export interface TransactionInterface {
  addressFrom: string;
  addressTo: string;
  amount: number;
  message: string;
  keyword: string;
  timestamp: string;
  url?: string;
  gifUrl?: string;
  receiver: string;
  sender: string;
}
export type Transaction = TransactionInterface & {
  id?: string | number;
};
export type Transactions = Transaction[];


const { ethereum } = window;
const { currentAccount, setCurrentAccount, setTransactionCount } = transactions;

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

  return transactionsContract;
};
export const getAllTransactions = async () => {
  try {
    if (ethereum) {
      const transactionsContract = createEthereumContract();

      const availableTransactions = await transactionsContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map((trn: {
        addressTo: string;
        addressFrom: string;
        timestamp: string;
        message: string;
        keyword: string;
        amount: number,
        sender: string,
        receiver: string,
      }) => ({
        addressTo: trn.receiver,
        addressFrom: trn.sender,
        timestamp: new Date(parseInt(trn.timestamp) * 1000).toLocaleString(),
        message: trn.message,
        keyword: trn.keyword,
        amount: parseInt(trn.amount._hex) / (10 ** 18)
      }));

      console.log(structuredTransactions);

      setTransactionCount(structuredTransactions);
    } else {
      console.log("Ethereum is not present");
    }
  } catch (error) {
    console.log(error);
  }
};

export const checkIfWalletIsConnect = async () => {
  try {
    if (!ethereum) return note.error("Please install MetaMask.");

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length) {
      setCurrentAccount(accounts[0]);

      getAllTransactions();
    } else {
      console.log("No accounts found");
    }
  } catch (error: any) {
    note.error(error.message);
    console.log(error);
  }
};

export const checkIfTransactionsExists = async () => {
  try {
    if (ethereum) {
      const transactionsContract = createEthereumContract();
      const currentTransactionCount = await transactionsContract.getTransactionCount();

      window.localStorage.setItem("transactionCount", currentTransactionCount);
    }
  } catch (error) {
    console.log(error);

    throw new Error("No ethereum object");
  }
};

export const connectWallet = async () => {
  try {
    if (!ethereum) return note.warning("Please install MetaMask.");

    const accounts = await ethereum.request({ method: "eth_requestAccounts", });
    console.log(accounts[0]);

    const nc = accounts[0]
    setCurrentAccount(nc);
  } catch (error: { code: number, message: string, stack: string } | any) {
    note.error(error.message);
    console.log(error);

    throw new Error("No ethereum object");
  }
};

export const sendTransaction = async () => {
  try {
    if (ethereum) {
      const { addressTo, amount, message, keyword, setIsLoading } = eathForm
      const transactionsContract = createEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount.toString());

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: currentAccount,
          to: addressTo,
          gas: "0x5208",
          value: parsedAmount._hex,
        }],
      });

      const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      console.log(`Success - ${transactionHash.hash}`);
      setIsLoading(false);

      const transactionsCount = await transactionsContract.getTransactionCount();

      setTransactionCount(transactionsCount.toNumber());
    } else {
      console.log("No ethereum object");
    }
  } catch (error) {
    console.log(error);

    throw new Error("No ethereum object");
  }
};
