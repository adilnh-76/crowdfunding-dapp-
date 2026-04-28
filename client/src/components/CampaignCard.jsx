import { Link } from "react-router-dom";
import { formatEther } from "ethers";

const CampaignCard = ({ id, campaign }) => {
  const goal = formatEther(campaign.goal);
  const raised = formatEther(campaign.amountRaised);
  const progress = Math.min((Number(raised) / Number(goal)) * 100, 100);
  const isEnded = Number(campaign.deadline) * 1000 < Date.now();
  const deadlineDate = new Date(Number(campaign.deadline) * 1000).toLocaleDateString();

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-700 hover:border-indigo-500 transition-all hover:shadow-indigo-500/20 group flex flex-col h-full">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={campaign.imageURI || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=800&auto=format&fit=crop"} 
          alt={campaign.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=800&auto=format&fit=crop" }}
        />
        {isEnded && (
          <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
            Ended
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">{campaign.title}</h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">{campaign.description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300 font-medium">{raised} ETH raised</span>
            <span className="text-slate-500">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm mb-5 text-slate-400">
          <div>Goal: <span className="text-slate-200 font-medium">{goal} ETH</span></div>
          <div>Ends: <span className="text-slate-200 font-medium">{deadlineDate}</span></div>
        </div>
        
        <Link 
          to={`/campaign/${id}`}
          className="block w-full py-2.5 text-center bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors border border-slate-600 hover:border-slate-500"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CampaignCard;
