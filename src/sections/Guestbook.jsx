import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, MapPin, User, Calendar, Wifi, WifiOff, Sparkles, ShieldAlert } from "lucide-react";
import { supabase } from "../services/supabase";
import { unlockAchievement } from "../components/playground/achievements/achievementHelper";
import { playTap, playSuccess } from "../services/soundEffects";
import Swal from "sweetalert2";

const REACTION_EMOJIS = ["💻", "🚀", "🔥", "☕", "💡", "👾", "🎉", "❤️"];

// List of fun, high-profile mock signatures if database isn't ready
const MOCK_SIGNATURES = [
  {
    id: 1,
    name: "Ada Lovelace",
    message: "Absolutely loving this interactive workspace! The VS Code clone is brilliant. Keep engineering the future! 🚀",
    emoji: "🚀",
    country_code: "GB",
    country_name: "United Kingdom",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: 2,
    name: "Linus Torvalds",
    message: "Talk is cheap. Show me the code. Well... you actually showed the code and it is pretty good! Respect. 💻",
    emoji: "💻",
    country_code: "US",
    country_name: "United States",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: 3,
    name: "Guido van Rossum",
    message: "This dark mode interface is so smooth. Excellent work on the particle simulations! 👾",
    emoji: "👾",
    country_code: "NL",
    country_name: "Netherlands",
    created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hours ago
  }
];

const Guestbook = () => {
  const [signatures, setSignatures] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("💻");
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);
  
  // Location detection state
  const [locationData, setLocationData] = useState({ countryCode: "UN", countryName: "Unknown Location" });

  const scrollRef = useRef(null);

  // 1. Fetch Location on load
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data && data.country_code) {
            setLocationData({
              countryCode: data.country_code,
              countryName: data.country_name || "Worldwide"
            });
          }
        }
      } catch (err) {
        console.warn("Location API failed. Defaulting to Unknown Location.");
      }
    };
    fetchLocation();
  }, []);

  // 2. Load Signatures & Setup Realtime Channel
  useEffect(() => {
    let channel = null;

    const fetchSignatures = async () => {
      try {
        const { data, error } = await supabase
          .from("guestbook")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setSignatures(data || []);
        setIsLocalMode(false);
        setIsLive(true);
      } catch (err) {
        console.warn("Supabase guestbook table not available, running in Local Mock Mode.", err);
        // Load mock signatures + any locally saved ones
        const savedLocal = localStorage.getItem("portfolio_local_signatures");
        const localSignatures = savedLocal ? JSON.parse(savedLocal) : [];
        setSignatures([...localSignatures, ...MOCK_SIGNATURES]);
        setIsLocalMode(true);
        setIsLive(false);
      }
    };

    fetchSignatures();

    // Setup Supabase Real-Time Sync
    try {
      channel = supabase
        .channel("guestbook-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "guestbook" },
          (payload) => {
            if (payload.new) {
              setSignatures((prev) => {
                if (prev.some((s) => s.id === payload.new.id)) return prev;
                return [payload.new, ...prev];
              });
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsLive(true);
          } else {
            setIsLive(false);
          }
        });
    } catch (err) {
      console.warn("Real-time subscription skipped/failed.", err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // 3. Handle Submit signature
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setLoading(true);
    playTap();

    const newEntry = {
      name: name.trim(),
      message: message.trim(),
      emoji: selectedEmoji,
      country_code: locationData.countryCode,
      country_name: locationData.countryName,
    };

    try {
      if (isLocalMode) {
        // Local Mode flow: Save to local state and local storage
        const localEntry = {
          id: Date.now(),
          ...newEntry,
          created_at: new Date().toISOString()
        };
        const savedLocal = localStorage.getItem("portfolio_local_signatures");
        const currentLocal = savedLocal ? JSON.parse(savedLocal) : [];
        const updatedLocal = [localEntry, ...currentLocal];
        
        localStorage.setItem("portfolio_local_signatures", JSON.stringify(updatedLocal));
        setSignatures([localEntry, ...signatures.filter(s => s.id !== localEntry.id)]);
        
        // Trigger achievements
        unlockAchievement("guestbook-signature");
        playSuccess();
        
        Swal.fire({
          title: "Signature Saved!",
          text: "Thank you for signing the guestbook (running locally!).",
          icon: "success",
          background: "#13102d",
          color: "#fff",
          confirmButtonColor: "#6366f1"
        });

        setName("");
        setMessage("");
      } else {
        // Live Supabase flow
        const { data, error } = await supabase
          .from("guestbook")
          .insert([newEntry])
          .select();

        if (error) throw error;

        // If real-time sync is slow to trigger locally, append immediately
        if (data && data.length > 0) {
          const inserted = data[0];
          setSignatures((prev) => {
            if (prev.some(s => s.id === inserted.id)) return prev;
            return [inserted, ...prev];
          });
        }

        // Trigger achievements
        unlockAchievement("guestbook-signature");
        playSuccess();

        Swal.fire({
          title: "Signed Successfully!",
          text: "Your message has been broadcast live to all visitors!",
          icon: "success",
          background: "#13102d",
          color: "#fff",
          confirmButtonColor: "#6366f1"
        });

        setName("");
        setMessage("");
      }
    } catch (err) {
      console.error("Failed to post signature", err);
      Swal.fire({
        title: "Error!",
        text: "Could not save your signature. Please try again.",
        icon: "error",
        background: "#13102d",
        color: "#fff",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to format date
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Just now";
    }
  };

  // Helper to resolve flag emoji
  const getFlagEmoji = (countryCode) => {
    if (!countryCode || countryCode === "UN") return "🌐";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <section className="relative md:px-[10%] px-[5%] w-full py-20 bg-[#030014] overflow-hidden" id="Guestbook">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-[#8b5cf6]/5 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#ec4899]/5 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative text-center pb-12" data-aos="fade-up" data-aos-duration="800">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#a78bfa] text-xs font-semibold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Feed
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#818cf8] via-[#a78bfa] to-[#ec4899]">
          Real-Time Guestbook
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base mt-3 leading-relaxed">
          Leave a message, sign the guestbook, and view other developers worldwide in real time.
        </p>

        {/* Sync Status Badge */}
        <div className="flex justify-center mt-4">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
            isLive 
              ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#4ade80]" 
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-[#22c55e] animate-pulse" : "bg-amber-400"}`} />
            {isLive ? "Live Sync Connected" : "Local Sandbox Mode"}
          </div>
        </div>
      </div>

      {/* Local Mode Banner Notice */}
      {isLocalMode && (
        <div className="max-w-4xl mx-auto mb-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3" data-aos="fade-up">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300">
            <span className="font-bold">Database Setup Required:</span> The guestbook table does not exist in your Supabase database. Visitors can still write signatures, which will be saved in their local browser storage for testing. To sync across all visitors, copy the SQL scripts in <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">supabase_guestbook.sql</code> and execute them in your Supabase SQL editor.
          </div>
        </div>
      )}

      {/* Main Glassmorphic Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto relative z-10">
        
        {/* Left Side: Submit Form */}
        <div 
          className="lg:col-span-5 border border-white/10 bg-white/4 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between"
          data-aos="fade-right"
          data-aos-duration="1000"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/5 to-transparent pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-xs font-mono mb-2 uppercase tracking-wider">Your Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#050117]/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-mono mb-2 uppercase tracking-wider">Message</label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <textarea
                  required
                  maxLength={280}
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave a friendly note or constructive feedback..."
                  className="w-full bg-[#050117]/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Reaction Selector */}
            <div>
              <label className="block text-gray-300 text-xs font-mono mb-2.5 uppercase tracking-wider">Choose Vibe Reaction</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { playTap(); setSelectedEmoji(emoji); }}
                    className={`text-xl p-2 rounded-xl border transition-all hover:scale-110 active:scale-90 flex items-center justify-center cursor-pointer ${
                      selectedEmoji === emoji
                        ? "border-[#a78bfa] bg-[#a78bfa]/10 shadow-[0_0_15px_rgba(167,139,250,0.15)]"
                        : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* IP Auto Location display */}
            <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-gray-400 font-mono">
              <MapPin className="w-4 h-4 text-[#ec4899] animate-bounce" />
              <span>Location:</span>
              <span className="text-gray-200 flex items-center gap-1">
                {getFlagEmoji(locationData.countryCode)} {locationData.countryName}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#4f46e5] hover:to-[#9333ea] disabled:from-indigo-900 disabled:to-purple-900 text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign Guestbook</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Feed display */}
        <div 
          className="lg:col-span-7 border border-white/10 bg-white/4 backdrop-blur-xl rounded-2xl p-6 flex flex-col h-[520px]"
          data-aos="fade-left"
          data-aos-duration="1000"
        >
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <span className="text-gray-300 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#6366f1]" />
              Recent Signatures ({signatures.length})
            </span>
            {signatures.length > 0 && (
              <span className="text-gray-500 text-[10px] font-mono">Scroll to view</span>
            )}
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto pr-1 mt-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
          >
            {signatures.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <MessageSquare className="w-10 h-10 text-gray-600 mb-2 animate-bounce" />
                <p className="text-gray-500 text-sm">No signatures yet. Be the first to write something!</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {signatures.map((sig) => (
                  <motion.div
                    key={sig.id}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="p-4 rounded-xl border border-white/10 bg-[#050117]/60 hover:bg-[#070222]/80 transition-colors relative group"
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                    
                    {/* Header line inside card */}
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div>
                        <h4 className="font-bold text-sm text-gray-100 group-hover:text-white transition-colors">
                          {sig.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#ec4899]" />
                          <span>
                            {getFlagEmoji(sig.country_code)} {sig.country_name || "Worldwide"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg select-none">
                          {sig.emoji || "💻"}
                        </div>
                      </div>
                    </div>

                    {/* Message body */}
                    <p className="text-gray-300 text-xs leading-relaxed break-words pl-1 border-l-2 border-[#6366f1]/40 py-0.5 mt-2 relative z-10">
                      {sig.message}
                    </p>

                    {/* Date stamp footer inside card */}
                    <div className="flex justify-end mt-2 text-[9px] text-gray-600 font-mono items-center gap-1 relative z-10">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(sig.created_at)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Guestbook;
