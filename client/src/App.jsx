import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./pages/CampaignDetails";
import Dashboard from "./pages/Dashboard";
import { getProvider } from "./utils/web3";

function App() {
  const [account, setAccount] = useState("");

  const connectWallet = async () => {
    const provider = getProvider();
    if (provider) {
      try {
        // Try to switch to the Localhost network automatically
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }], // 31337 in hexadecimal
        });
      } catch (switchError) {
        // If the network is not added yet, add it automatically
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x7a69',
                  chainName: 'Localhost 8545',
                  rpcUrls: ['http://127.0.0.1:8545'],
                  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
      }

      // Now request the accounts
      try {
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    const checkWallet = async () => {
      const provider = getProvider();
      if (provider) {
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    };
    checkWallet();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <Navbar account={account} connectWallet={connectWallet} />
        <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateCampaign account={account} />} />
            <Route path="/campaign/:id" element={<CampaignDetails account={account} />} />
            <Route path="/dashboard" element={<Dashboard account={account} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
