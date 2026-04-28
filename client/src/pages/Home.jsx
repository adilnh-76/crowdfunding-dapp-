import { useState, useEffect } from "react";
import { getContract } from "../utils/contract";
import { getProvider } from "../utils/web3";
import CampaignCard from "../components/CampaignCard";
import { Loader2 } from "lucide-react";

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const provider = getProvider();
        if (!provider) return;
        
        const contract = await getContract(provider);
        const data = await contract.getCampaigns();
        
        setCampaigns(data);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 text-center py-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
          Fund the next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">big thing</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          KickChain is a decentralized crowdfunding platform. Create campaigns, fund projects you love, and track progress transparently on the blockchain.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Active Campaigns</h2>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
          <p className="text-slate-400 text-lg mb-4">No campaigns found.</p>
          <p className="text-slate-500 text-sm">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, i) => (
            <CampaignCard key={i} id={i} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
