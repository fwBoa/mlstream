"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function EditAppPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const { id } = params;

  const [app, setApp] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [appType, setAppType] = useState("chat");
  const [themePrimary, setThemePrimary] = useState("#4f46e5");
  const [themeBackground, setThemeBackground] = useState("#ffffff");
  const [systemPrompt, setSystemPrompt] = useState("");
  
  const [status, setStatus] = useState("draft");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchApp() {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("App not found");
        setLoading(false);
        return;
      }

      setApp(data);
      setName(data.name);
      setDescription(data.description || "");
      setAppType(data.app_type);
      setStatus(data.status);
      
      if (data.theme_config) {
        setThemePrimary(data.theme_config.primary_color || "#4f46e5");
        setThemeBackground(data.theme_config.background_color || "#ffffff");
      }
      
      if (data.ai_config) {
        setSystemPrompt(data.ai_config.system_prompt || "");
      }
      
      setLoading(false);
    }

    fetchApp();
  }, [id, supabase]);

  async function handleSave(e: React.FormEvent, publishState?: string) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const newStatus = publishState || status;

    const { error: updateError } = await supabase
      .from("apps")
      .update({
        name,
        description: description || null,
        app_type: appType,
        theme_config: {
          primary_color: themePrimary,
          background_color: themeBackground,
        },
        ai_config: {
          ...app.ai_config,
          system_prompt: systemPrompt,
        },
        status: newStatus,
        published_at: newStatus === "published" && status !== "published" ? new Date().toISOString() : app.published_at,
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (loading) return <div className="p-8 text-gray-500">Loading app details...</div>;
  if (!app) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">Edit App</h1>
          <p className="text-gray-500 mt-1">Update configuration and styling</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {status === "published" && (
            <a href={`/a/${app.slug}`} target="_blank" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors">
              View Live
            </a>
          )}
        </div>
      </div>

      <form onSubmit={(e) => handleSave(e)} className="max-w-3xl space-y-8 pb-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Basics */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-black mb-6">Basics</h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">App Name</label>
              <input id="name" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-black mb-6">Appearance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="themePrimary" className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input id="themePrimary" type="color" value={themePrimary} onChange={(e) => setThemePrimary(e.target.value)} className="w-10 h-10 p-0 border-0 rounded cursor-pointer" />
                <input type="text" className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" value={themePrimary} onChange={(e) => setThemePrimary(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="themeBg" className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <div className="flex items-center gap-3">
                <input id="themeBg" type="color" value={themeBackground} onChange={(e) => setThemeBackground(e.target.value)} className="w-10 h-10 p-0 border-0 rounded cursor-pointer" />
                <input type="text" className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" value={themeBackground} onChange={(e) => setThemeBackground(e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        {/* AI Behavior */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-black mb-6">AI Behavior</h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
              <textarea id="systemPrompt" rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} required />
              <p className="mt-2 text-xs text-gray-500">Note: API Keys cannot be viewed or edited after creation for security.</p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200">
          <button type="button" className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto" onClick={() => router.back()}>
            Cancel
          </button>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button type="submit" className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto" disabled={saving} onClick={(e) => handleSave(e, "draft")}>
              Save as Draft
            </button>
            <button type="submit" className="px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto" disabled={saving} onClick={(e) => handleSave(e, "published")}>
              {status === "published" ? "Save & Update Live" : "Publish to Web"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
