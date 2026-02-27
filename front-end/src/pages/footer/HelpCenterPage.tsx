import React, { useState, useMemo } from "react";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import {
  ChevronRight,
  ChevronDown,
  Search,
  Shield,
  User,
  Heart,
  Settings,
  AlertCircle,
  X,
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────

const FAQ_DATA = [
  {
    category: "Account Settings",
    icon: Settings,
    items: [
      {
        q: "How do I change my location?",
        a: "Go to your Profile → Edit Profile → Location. You can update your city or allow the app to detect your current location automatically.",
      },
      {
        q: "How do I change my email address?",
        a: "Navigate to Settings → Account → Email. You'll receive a verification OTP on your new email before the change takes effect.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Privacy → Delete Account. Type DELETE to confirm. This action is permanent and removes all your data, matches, and messages.",
      },
      {
        q: "Can I recover a deleted account?",
        a: "No — account deletion is permanent and irreversible. All data is removed immediately. We recommend deactivating your account instead if you want a break.",
      },
      {
        q: "How do I reset my password?",
        a: "On the login screen, tap 'Forgot Password'. Enter your email and we'll send a 6-digit OTP. Use that to set a new password.",
      },
    ],
  },
  {
    category: "Matching & Chatting",
    icon: Heart,
    items: [
      {
        q: "Is The Dating App free to use?",
        a: "Yes! The core experience — browsing, liking, and chatting with matches — is completely free. Premium plans unlock extra features like seeing who liked you, unlimited likes, and profile boosts.",
      },
      {
        q: "How does matching work?",
        a: "When you like someone and they like you back, it's a match! You'll both receive a notification and a chat is opened automatically.",
      },
      {
        q: "Why am I not getting any matches?",
        a: "Try completing your profile with photos and a bio, expanding your distance or age range preferences, and being active daily. The algorithm surfaces active users more often.",
      },
      {
        q: "Can I unsend a like?",
        a: "Likes cannot be unsent once sent. However, you can block a user if you want to prevent a potential match from occurring.",
      },
      {
        q: "How do I unmatch someone?",
        a: "Open the chat with that person, tap the ⋯ menu in the top-right corner, and select 'Unmatch'. This removes the match and the chat history.",
      },
    ],
  },
  {
    category: "Safety & Privacy",
    icon: Shield,
    items: [
      {
        q: "How do I report a fake profile?",
        a: "Open the chat with the user, tap the ⋯ menu, and select 'Report'. Choose a reason and submit. Our trust & safety team reviews all reports within 24 hours.",
      },
      {
        q: "How do I block someone?",
        a: "Open their profile or your chat, tap the ⋯ menu, and select 'Block'. Blocked users cannot see your profile or contact you.",
      },
      {
        q: "Can I hide my online status?",
        a: "Yes. Go to Settings → Privacy → Show Online Status and toggle it off. Others will not see when you were last active.",
      },
      {
        q: "How is my data used?",
        a: "Your data is used only to power the matching experience. We never sell personal data to third parties. See our full Privacy Policy for details.",
      },
      {
        q: "How do I download my data?",
        a: "Go to Settings → Privacy → Export My Data. A JSON file containing your profile, matches, and message history will be available to download immediately.",
      },
    ],
  },
  {
    category: "Premium Features",
    icon: User,
    items: [
      {
        q: "What do I get with Premium?",
        a: "Premium includes: unlimited likes, see who liked you, profile boosts to appear at the top of discovery, read receipts, and priority support.",
      },
      {
        q: "How do I upgrade to Premium?",
        a: "Go to Settings → Premium → View Plans. Choose a monthly or annual plan and complete payment via Razorpay.",
      },
      {
        q: "Can I cancel my subscription?",
        a: "Yes. Cancel anytime from Settings → Premium → Manage Subscription. You'll retain Premium access until the end of your billing period.",
      },
      {
        q: "Is my payment information secure?",
        a: "All payments are processed by Razorpay, a PCI-DSS compliant payment gateway. We never store your card details on our servers.",
      },
    ],
  },
  {
    category: "Troubleshooting",
    icon: AlertCircle,
    items: [
      {
        q: "I'm not receiving OTP emails.",
        a: "Check your spam / junk folder first. If it's not there, ensure the email address is correct and try resending. OTPs expire in 5 minutes.",
      },
      {
        q: "The app is crashing or freezing.",
        a: "Try force-closing and reopening the app. If the issue persists, clear the app cache or reinstall. You can also contact support with your device model and OS version.",
      },
      {
        q: "Messages are not delivering.",
        a: "Check your internet connection. If the issue continues, the recipient may have blocked you or deleted their account.",
      },
      {
        q: "My profile photos are not uploading.",
        a: "Photos must be under 10 MB and in JPG, PNG, or WebP format. Make sure you've granted camera/photos permission to the app in your device settings.",
      },
    ],
  },
];

// ─── Components ────────────────────────────────────────────────────────────

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white transition-shadow hover:shadow-md">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full p-5 flex justify-between items-center text-left gap-4"
      >
        <span className="font-semibold text-gray-800 text-sm md:text-base">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-teal-500" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <div className="h-px bg-gray-100 mb-4" />
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────

const HelpCenterPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Flatten all Q&As for search
  const allItems = useMemo(
    () =>
      FAQ_DATA.flatMap((cat) =>
        cat.items.map((item) => ({ ...item, category: cat.category }))
      ),
    []
  );

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  const visibleCategories = useMemo(() => {
    if (activeCategory) {
      return FAQ_DATA.filter((c) => c.category === activeCategory);
    }
    return FAQ_DATA;
  }, [activeCategory]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-white pt-20 flex flex-col">
      <TopBar />

      {/* Search Header */}
      <div className="bg-gray-900 text-white py-16 md:py-24 px-4 text-center rounded-b-[40px] mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">How can we help you?</h1>
        <p className="text-gray-400 mb-8 text-sm md:text-base">
          Search our knowledge base or browse by category below.
        </p>
        <div className="max-w-lg mx-auto relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-14 pr-12 py-4 rounded-2xl text-gray-900 outline-none shadow-xl focus:ring-4 focus:ring-teal-500/50 transition-all placeholder:text-gray-400"
            placeholder="Search for articles, topics..."
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto px-4 w-full pb-20">

        {/* ── Search Results ── */}
        {isSearching ? (
          <div>
            <p className="text-sm text-gray-500 mb-5">
              {searchResults.length === 0
                ? "No results found."
                : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${query}"`}
            </p>
            <div className="space-y-3">
              {searchResults.map((item, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1 px-1">
                    {item.category}
                  </p>
                  <FAQItem q={item.q} a={item.a} />
                </div>
              ))}
              {searchResults.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-400 mb-4">We couldn't find anything for that.</p>
                  <a
                    href="/contact"
                    className="inline-block px-6 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors"
                  >
                    Contact Support
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* ── Category Chips ── */}
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeCategory === null
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                All Topics
              </button>
              {FAQ_DATA.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === cat.category ? null : cat.category
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 ${
                    activeCategory === cat.category
                      ? "bg-teal-500 text-white border-teal-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.category}
                </button>
              ))}
            </div>

            {/* ── Category Sections ── */}
            <div className="space-y-12">
              {visibleCategories.map((cat) => (
                <section key={cat.category}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-gray-50 text-teal-600 rounded-xl border border-gray-100">
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{cat.category}</h3>
                  </div>
                  <div className="space-y-3">
                    {cat.items.map((item, i) => (
                      <FAQItem key={i} q={item.q} a={item.a} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* ── Still need help? ── */}
            <div className="mt-16 bg-gray-50 rounded-3xl p-8 md:p-10 text-center border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
              <p className="text-gray-500 mb-6">
                Our support team is here for you. We typically respond within 24 hours.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20"
              >
                Contact Support <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;