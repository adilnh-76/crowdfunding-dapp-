import { Contract } from "ethers";
import CrowdfundingABI from "../Crowdfunding.json";

// Replace with your deployed contract address from the local hardhat node later
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

export const getContract = async (providerOrSigner) => {
  return new Contract(
    CONTRACT_ADDRESS,
    CrowdfundingABI.abi,
    providerOrSigner
  );
};
