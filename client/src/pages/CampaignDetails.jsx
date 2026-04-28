import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { formatEther, parseEther } from "ethers";
import { getContract } from "../utils/contract";
import { getProvider } from "../utils/web3";
import { Loader2, TrendingUp, Clock, Target, CheckCircle2 } from "lucide-react";

const CampaignDetails = ({ account }) => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState("");
  const [donating, setDonating] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const provider = getProvider();
      if (!provider) return;
      const contract = await getContract(provider);
      const data = await contract.campaigns(id);
      setCampaign(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!account) return alert("Please connect wallet");
    
    setDonating(true);
    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const contract = await getContract(signer);
      
      const tx = await contract.donate(id, { value: parseEther(donationAmount) });
      await tx.wait();
      
      setDonationAmount("");
      fetchCampaign();
    } catch (err) {
      console.error(err);
      alert("Donation failed");
    } finally {
      setDonating(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const contract = await getContract(signer);
      
      const tx = await contract.withdraw(id);
      await tx.wait();
      fetchCampaign();
    } catch (err) {
      console.error(err);
      alert("Withdraw failed. Ensure goal is met and deadline passed.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-indigo-500" /></div>;
  }

  if (!campaign) return <div>Campaign not found</div>;

  const goal = formatEther(campaign.goal);
  const raised = formatEther(campaign.amountRaised);
  const progress = Math.min((Number(raised) / Number(goal)) * 100, 100);
  const isEnded = Number(campaign.deadline) * 1000 < Date.now();
  const isCreator = account?.toLowerCase() === campaign.creator.toLowerCase();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
            <img 
              src={campaign.imageURI || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=800&auto=format&fit=crop"} 
              alt={campaign.title} 
              className="w-full h-96 object-cover"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=800&auto=format&fit=crop" }}
            />
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-slate-700 px-3 py-1 rounded-full text-xs text-slate-300 border border-slate-600">
                  Creator: {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">About this campaign</h3>
              <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl sticky top-24">
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  {raised} <span className="text-xl text-slate-300">ETH</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-4">raised of {goal} ETH goal</p>
              
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden mb-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-3 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-right text-xs text-slate-400 font-medium">{progress.toFixed(2)}% funded</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <Target className="h-5 w-5 text-indigo-400 mb-2" />
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</div>
                <div className="font-semibold">{isEnded ? "Ended" : "Active"}</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <Clock className="h-5 w-5 text-cyan-400 mb-2" />
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Deadline</div>
                <div className="font-semibold text-sm">{new Date(Number(campaign.deadline) * 1000).toLocaleDateString()}</div>
              </div>
            </div>

            {!isEnded ? (
              <form onSubmit={handleDonate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Amount to Fund (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="0.1"
                  />
                </div>
                <button
                  type="submit"
                  disabled={donating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
                >
                  {donating ? <Loader2 className="h-5 w-5 animate-spin" /> : <><TrendingUp className="h-5 w-5" /> Fund Campaign</>}
                </button>
              </form>
            ) : isCreator && !campaign.withdrawn ? (
               <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                {withdrawing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> Withdraw Funds</>}
              </button>
            ) : campaign.withdrawn ? (
               <div className="w-full bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-lg text-center">
                 Funds Withdrawn
               </div>
            ) : (
               <div className="w-full bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-lg text-center">
                 Campaign Ended
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
