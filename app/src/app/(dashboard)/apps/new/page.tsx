"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/utils";

export default function NewAppPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [appType, setAppType] = useState("chat");
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [apiKey, setApiKey] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [maxTokens, setMaxTokens] = useState(1024);
  const [temperature, setTemperature] = useState(0.7);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(generateSlug(value));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("description", description);
    formData.set("appType", appType);
    formData.set("provider", provider);
    formData.set("model", model);
    formData.set("apiKey", apiKey);
    formData.set("systemPrompt", systemPrompt);
    formData.set("maxTokens", maxTokens.toString());
    formData.set("temperature", temperature.toString());

    const { createAppAction } = await import("../actions");
    const result = await createAppAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-black tracking-tight">Create New App</h1>
        <p className="text-gray-500 mt-1">Configure your AI-powered application</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8 pb-12">
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
              <input id="name" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="My Recipe Generator" value={name} onChange={(e) => handleNameChange(e.target.value)} required minLength={2} maxLength={100} />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  mlstream.app/a/
                </span>
                <input id="slug" type="text" className="flex-1 block w-full min-w-0 rounded-none rounded-r-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm" placeholder="my-recipe-generator" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="^[a-z0-9][a-z0-9-]*[a-z0-9]$" minLength={2} maxLength={60} />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea id="description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="What does your app do?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label htmlFor="appType" className="block text-sm font-medium text-gray-700 mb-1">App Template</label>
              <select id="appType" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white" value={appType} onChange={(e) => setAppType(e.target.value)}>
                <option value="chat">Chat Interface</option>
                <option value="text_gen">Text Generation</option>
                <option value="image_gen">Image Generation</option>
              </select>
            </div>
          </div>
        </section>

        {/* AI Config */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-black mb-6">AI Configuration</h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select id="provider" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white" value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option value="openai">OpenAI</option>
                  <option value="huggingface">HuggingFace</option>
                </select>
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input id="model" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="gpt-4o-mini" value={model} onChange={(e) => setModel(e.target.value)} required />
              </div>
            </div>
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input id="apiKey" type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="sk-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} required />
              <p className="mt-1 text-xs text-gray-500">Your key is encrypted before storage. It never leaves our servers.</p>
            </div>
            <div>
              <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
              <textarea id="systemPrompt" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="You are a helpful assistant that..." value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                <input id="maxTokens" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" min={1} max={16384} value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} />
              </div>
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                <input id="temperature" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" min={0} max={2} step={0.1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} />
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button type="button" className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors" onClick={() => router.back()}>
            Cancel
          </button>
          <button type="submit" className="px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? "Creating..." : "Create App"}
          </button>
        </div>
      </form>
    </div>
  );
}
