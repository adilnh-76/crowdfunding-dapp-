import { BrowserProvider } from "ethers";

export const getProvider = () => {
  if (window.ethereum) {
    return new BrowserProvider(window.ethereum);
  }
  console.error("Please install MetaMask!");
  return null;
};
