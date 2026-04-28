import { Link } from "react-router-dom";
import { Coins, LayoutDashboard, PlusCircle, LogIn } from "lucide-react";

const Navbar = ({ account, connectWallet }) => {
  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Coins className="h-8 w-8 text-indigo-500" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                KickChain
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Explore
              </Link>
              <Link to="/create" className="hover:bg-slate-700 flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <PlusCircle className="h-4 w-4" /> Create
              </Link>
              <Link to="/dashboard" className="hover:bg-slate-700 flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            </div>
          </div>
          <div>
            {account ? (
              <div className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-full text-sm font-medium text-slate-300 shadow-inner">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
