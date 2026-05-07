/**
 * Zod validation schemas for MLstream inputs.
 */
import { z } from "zod";

/** URL-safe slug: lowercase alphanumeric + hyphens, no leading/trailing hyphens */
export const slugSchema = z
  .string()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/);

/** Schema for creating a new app */
export const createAppSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  slug: slugSchema,
  app_type: z.enum(["chat", "text_gen", "image_gen"]),
});

/** Schema for updating an existing app (all fields optional) */
export const updateAppSchema = createAppSchema.partial();

/** Schema for AI model configuration */
export const aiConfigSchema = z.object({
  provider: z.enum(["openai", "huggingface"]),
  model: z.string().min(1),
  system_prompt: z.string().min(1),
  max_tokens: z.number().int().min(1).max(16384).default(1024),
  temperature: z.number().min(0).max(2).default(0.7),
});

/** Schema for theme configuration */
export const themeConfigSchema = z.object({
  palette: z.string(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  mode: z.enum(["dark", "light"]),
  borderRadius: z.enum(["none", "sm", "md", "lg", "full"]),
  fontFamily: z.enum(["inter", "outfit", "mono", "system"]),
});
