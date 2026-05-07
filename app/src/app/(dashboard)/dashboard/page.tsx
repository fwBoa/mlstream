import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: apps } = await supabase
    .from("apps")
    .select("*")
    .eq("creator_id", user!.id)
    .order("created_at", { ascending: false });

  const typeLabels: Record<string, string> = {
    chat: "Chat",
    text_gen: "Text Gen",
    image_gen: "Image Gen",
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">My Apps</h1>
          <p className="text-gray-500 mt-1">Manage your AI-powered applications</p>
        </div>
        <Link href="/apps/new" className="mt-4 sm:mt-0 inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New App
        </Link>
      </div>

      {!apps || apps.length === 0 ? (
        <div className="bg-white border border-gray-200 border-dashed rounded-lg p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-black mb-2">No apps yet</h2>
          <p className="text-gray-500 mb-6">
            Create your first AI app and share it with the world.
          </p>
          <Link href="/apps/new" className="inline-flex px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors">
            Create your first app
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div key={app.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="p-5 border-b border-gray-100 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-black truncate pr-2">{app.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                    app.status === "published" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {app.status}
                  </span>
                </div>
                {app.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{app.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500 font-medium">
                  <span className="bg-gray-100 px-2 py-1 rounded">{typeLabels[app.app_type] || app.app_type}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">/{app.slug}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between gap-3">
                <Link href={`/apps/${app.id}/edit`} className="flex-1 text-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors text-sm">
                  Edit
                </Link>
                {app.status === "published" && (
                  <Link href={`/a/${app.slug}`} target="_blank" className="flex-1 text-center px-4 py-2 bg-black border border-transparent text-white font-medium rounded-md hover:bg-gray-800 transition-colors text-sm">
                    View Live
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
