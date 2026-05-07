import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-accent/20 selection:text-accent-dark overflow-hidden">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* Gradient orb for subtle illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-md border-b border-zinc-200/50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-[15px] tracking-tight">
            <div className="w-6 h-6 bg-zinc-900 text-white flex items-center justify-center rounded-[4px] font-bold text-xs">M</div>
            MLstream
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-zinc-500">
            <a href="#features" className="hover:text-zinc-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">How it works</a>
            <a href="https://github.com/fwBoa/mlstream" target="_blank" className="hover:text-zinc-900 transition-colors">GitHub</a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="text-[13px] font-medium bg-zinc-900 text-white px-4 py-1.5 rounded-full hover:bg-zinc-800 transition-all shadow-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors hidden md:block">
                  Log in
                </Link>
                <Link href="/signup" className="text-[13px] font-medium bg-zinc-900 text-white px-4 py-1.5 rounded-full hover:bg-zinc-800 transition-all shadow-sm">
                  Start Building
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-24 flex flex-col items-center">
        {/* Hero Section */}
        <section className="px-6 text-center max-w-4xl mx-auto w-full mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 text-[13px] font-medium text-zinc-600 mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            MLstream 1.0 is now live
          </div>
          
          <h1 className="text-5xl md:text-[80px] font-bold tracking-tighter leading-[1.1] mb-8 text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-500">
            Deploy AI Models <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">In Seconds.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Turn your prompts and API keys into elegant, shareable web interfaces instantly. No infrastructure or complex boilerplate required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={user ? "/dashboard" : "/signup"} className="w-full sm:w-auto px-8 py-3 bg-zinc-900 text-white font-medium rounded-full hover:bg-zinc-800 transition-all shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)] text-[15px] flex items-center justify-center gap-2 group">
              Start Deploying
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#demo" className="w-full sm:w-auto px-8 py-3 bg-white text-zinc-700 font-medium rounded-full hover:bg-zinc-50 transition-colors border border-zinc-200 text-[15px] shadow-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              View Live Demo
            </a>
          </div>
        </section>

        {/* Browser Mockup / Preview */}
        <section className="w-full max-w-5xl px-6 mb-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent blur-3xl -z-10"></div>
          <div className="rounded-2xl border border-zinc-200/80 bg-white/50 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-zinc-900/5">
            <div className="h-12 border-b border-zinc-200/80 flex items-center px-4 gap-2 bg-white/80">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="mx-auto bg-zinc-100 rounded-md px-32 py-1 text-xs text-zinc-400 font-mono border border-zinc-200/50">mlstream.app/a/startup-advisor</div>
            </div>
            <div className="p-8 md:p-12 aspect-video flex flex-col items-center justify-center bg-zinc-50/50">
              {/* Abstract App Representation */}
              <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-zinc-200 p-6 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex-shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-zinc-100 rounded w-3/4"></div>
                    <div className="h-4 bg-zinc-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex items-start gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0"></div>
                  <div className="space-y-2 flex-1 items-end flex flex-col">
                    <div className="h-4 bg-accent/10 rounded w-2/3"></div>
                    <div className="h-4 bg-accent/10 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="w-full max-w-5xl px-6 py-20 border-t border-zinc-200/50">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-4">Everything you need. <br/> Nothing you don't.</h2>
            <p className="text-zinc-500 text-lg">A highly opinionated platform designed to get your AI out of the terminal and into the world.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: "BYOK Security", desc: "Bring your own API keys. We secure them with AES-256-GCM encryption at rest." },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>, title: "Premium Interfaces", desc: "Beautifully designed chat and generation interfaces out of the box." },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, title: "Built-in Protection", desc: "Sliding-window IP rate limiting ensures your API credits are never drained." },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-700 mb-6 group-hover:text-accent group-hover:bg-accent/5 transition-colors">
                  <div className="w-5 h-5">{feature.icon}</div>
                </div>
                <h3 className="text-[17px] font-semibold mb-2 text-zinc-900">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="w-full max-w-4xl px-6 py-24 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6 text-zinc-900">Stop building boilerplates.</h2>
          <p className="text-lg text-zinc-500 mb-8 max-w-xl mx-auto">Join the creators who are deploying their AI ideas in minutes instead of days.</p>
          <Link href={user ? "/dashboard" : "/signup"} className="inline-flex items-center justify-center px-8 py-3.5 bg-zinc-900 text-white font-medium rounded-full hover:bg-zinc-800 transition-all shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)] text-[15px]">
            Create Your Account
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/60 bg-[#FAFAFA] py-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-semibold text-zinc-900 text-[14px]">
            <div className="w-5 h-5 bg-zinc-900 text-white flex items-center justify-center rounded-[4px] text-[10px]">M</div>
            MLstream
          </div>
          <p className="text-zinc-400 text-[13px] font-medium">
            © {new Date().getFullYear()} MLstream.
          </p>
        </div>
      </footer>
    </div>
  );
}
