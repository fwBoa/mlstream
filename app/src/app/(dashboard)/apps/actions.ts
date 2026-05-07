"use server";

import { createClient } from "@/lib/supabase/server";
import { encryptApiKey } from "@/lib/crypto";
import { revalidatePath } from "next/cache";

export async function createAppAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create an app." };
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const appType = formData.get("appType") as string;
  const provider = formData.get("provider") as string;
  const model = formData.get("model") as string;
  const apiKey = formData.get("apiKey") as string;
  const systemPrompt = formData.get("systemPrompt") as string;
  const maxTokens = Number(formData.get("maxTokens"));
  const temperature = Number(formData.get("temperature"));

  const encryptionSecret = process.env.ENCRYPTION_SECRET;
  if (!encryptionSecret) {
    console.error("Missing ENCRYPTION_SECRET");
    return { error: "Server configuration error. Cannot encrypt key." };
  }

  let encryptedKey: string;
  try {
    encryptedKey = encryptApiKey(apiKey, encryptionSecret);
  } catch (err) {
    console.error("Encryption failed:", err);
    return { error: "Failed to securely encrypt API key." };
  }

  const { error: insertError } = await supabase.from("apps").insert({
    creator_id: user.id,
    name,
    slug,
    description: description || null,
    app_type: appType,
    ai_config: {
      provider,
      model,
      system_prompt: systemPrompt,
      max_tokens: maxTokens,
      temperature,
    },
    api_key_encrypted: encryptedKey,
    max_tokens_limit: maxTokens,
    status: "draft",
  });

  if (insertError) {
    console.error("Supabase insert error:", insertError);
    return { error: insertError.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
