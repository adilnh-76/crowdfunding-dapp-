import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseEther } from "ethers";
import { getContract } from "../utils/contract";
import { getProvider } from "../utils/web3";
import { Loader2 } from "lucide-react";

const CreateCampaign = ({ account }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageURI: "",
    goal: "",
    duration: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) return alert("Please connect your wallet first!");
    
    setLoading(true);
    try {
      // Force switch to Localhost before sending transaction
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7a69',
              chainName: 'Localhost 8545',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
            }],
          });
        }
      }

      const provider = getProvider();
      const signer = await provider.getSigner();
      const contract = await getContract(signer);

      const tx = await contract.createCampaign(
        form.title,
        form.description,
        form.imageURI,
        parseEther(form.goal.toString()),
        form.duration
      );
      
      await tx.wait();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Transaction failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create a New Campaign</h1>
      
      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-700">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Campaign Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="Enter a catchy title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="What is your campaign about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Image URL</label>
            <input
              type="url"
              name="imageURI"
              value={form.imageURI}
              onChange={handleChange}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Goal (ETH)</label>
              <input
                type="number"
                step="0.001"
                name="goal"
                value={form.goal}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="0.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Duration (Days)</label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                required
                min="1"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="30"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
