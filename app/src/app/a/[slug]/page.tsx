import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ChatTemplate from "@/components/templates/ChatTemplate";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: app } = await supabase
    .from("apps")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!app) return {};

  return {
    title: app.name,
    description: app.description || `An AI application powered by MLstream`,
  };
}

export default async function PublicAppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: app, error } = await supabase
    .from("apps")
    .select("id, name, description, app_type, status, theme_config")
    .eq("slug", slug)
    .single();

  if (error || !app || app.status !== "published") {
    notFound();
  }

  const customStyles = {
    "--bg-primary": app.theme_config?.background_color || "#ffffff",
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex flex-col font-sans" style={customStyles}>
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 w-full max-w-5xl mx-auto">
        {app.app_type === "chat" && (
          <ChatTemplate 
            slug={slug} 
            name={app.name} 
            description={app.description} 
            themeConfig={app.theme_config}
          />
        )}
        {/* We'll add text_gen and image_gen templates later */}
        {app.app_type !== "chat" && (
          <div className="bg-white border border-gray-200 border-dashed rounded-lg p-12 text-center w-full">
            <h2 className="text-xl font-bold text-black mb-2">Template coming soon</h2>
            <p className="text-gray-500">This app type is not yet supported in the public viewer.</p>
          </div>
        )}
      </main>
      <footer className="text-center py-6 px-4 text-sm text-gray-500 border-t border-gray-200 bg-white/50 backdrop-blur">
        Powered by <a href="/" className="text-black font-medium hover:underline transition-all">MLstream</a>
      </footer>
    </div>
  );
}
