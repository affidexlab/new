import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const quests = [
  {
    title: "Make your first swap",
    description: "Execute any swap across the six supported chains and automatically collect your first batch of bonus points.",
    reward: "+100 pts",
    cta: "Launch DApp",
    link: "/app"
  },
  {
    title: "Trade on 3 chains",
    description: "Prove you are multi-chain native by executing at least one swap on three different networks.",
    reward: "+300 pts",
    cta: "Open Aggregator",
    link: "/app"
  },
  {
    title: "Try privacy swap",
    description: "Use the CoW Protocol powered experience on DecaFlow to protect your trades from MEV.",
    reward: "+200 pts",
    cta: "Go Private",
    link: "/app/privacy"
  },
  {
    title: "Bridge Week bonus",
    description: "Bridge any asset into Base during the live multiplier window and screenshot the confirmation for +500 bonus points.",
    reward: "+500 pts",
    cta: "Bridge now",
    link: "/app"
  },
  {
    title: "Pioneer 100 push",
    description: "Reach 1,000 points + 5 transactions to lock Pioneer status. Submit proof via leaderboard form.",
    reward: "2x airdrop",
    cta: "View leaderboard",
    link: "/leaderboard"
  },
  {
    title: "Follow us on X",
    description: "Help grow the community—follow @DecaFlow and drop your handle via the quest form for verification.",
    reward: "+100 pts",
    cta: "Follow on X",
    link: "https://x.com/Decaflow"
  },
  {
    title: "Join our Telegram community",
    description: "Jump into the conversation for real-time updates, trading tips, and future campaign alpha.",
    reward: "+100 pts",
    cta: "Join Telegram",
    link: "https://t.me/decaflowprotocol"
  }
];

export default function Quests() {
  return (
    <div className="min-h-screen bg-[#050916] text-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-[#47A1FF] mb-4">Quests</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Pioneer Missions</h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Complete missions to accelerate your Pioneer 100 progress and Privacy Sprint standing. On-chain quests credit automatically.
            Social quests unlock via the submissions section inside the leaderboard dashboard.
          </p>
        </div>

        <div className="grid gap-6">
          {quests.map((quest) => (
            <div key={quest.title} className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{quest.title}</h2>
                  <p className="text-gray-400">{quest.description}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="text-[#47A1FF] text-lg font-semibold text-center">{quest.reward}</span>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] text-white"
                    onClick={() => window.open(quest.link, quest.link.startsWith("http") ? "_blank" : "_self")}
                  >
                    {quest.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl border border-dashed border-[#47A1FF]/40 bg-white/5 text-center">
          <h3 className="text-2xl font-semibold mb-2">How rewards are paid</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Quests award bonus points that stack on top of base rates (2x-7x). Points credit automatically for on-chain actions.
            For social quests, submit proof via the leaderboard interface. Bonuses typically appear within 5 minutes.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-white/10 bg-white/5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#47A1FF]">Stay synced</p>
            <p className="text-gray-300">Announcements land on <a href="https://x.com/Decaflow" className="text-white underline" target="_blank" rel="noreferrer">X</a> first, then the <a href="https://t.me/decaflowprotocol" className="text-white underline" target="_blank" rel="noreferrer">Telegram hub</a>. Join both for multiplier alerts.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF]" onClick={() => window.open('https://x.com/Decaflow', '_blank')}>
              Twitter
            </Button>
            <Button variant="outline" className="border-[#47A1FF] text-white" onClick={() => window.open('https://t.me/decaflowprotocol', '_blank')}>
              Telegram
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
