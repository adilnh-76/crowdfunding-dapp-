import { useState, useEffect } from "react";
import { getContract } from "../utils/contract";
import { getProvider } from "../utils/web3";
import CampaignCard from "../components/CampaignCard";
import { Loader2 } from "lucide-react";

const Dashboard = ({ account }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCampaigns = async () => {
      if (!account) {
        setLoading(false);
        return;
      }
      try {
        const provider = getProvider();
        const contract = await getContract(provider);
        const allCampaigns = await contract.getCampaigns();
        
        const myCampaigns = allCampaigns.filter(
          c => c.creator.toLowerCase() === account.toLowerCase()
        );
        
        setCampaigns(myCampaigns);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCampaigns();
  }, [account]);

  if (!account) {
    return (
      <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed max-w-2xl mx-auto mt-10">
        <p className="text-slate-300 text-xl font-medium mb-2">Wallet not connected</p>
        <p className="text-slate-500">Please connect your wallet to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-slate-700">My Campaigns</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
        ) : campaigns.length === 0 ? (
          <p className="text-slate-400 bg-slate-800/30 p-6 rounded-lg">You haven't created any campaigns yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, i) => (
              <CampaignCard key={i} id={i} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
