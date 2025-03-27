import type { Message } from "@langchain/langgraph-sdk";

export function getContentString(content: Message["content"]): string {
  if (typeof content === "string") return content;
  const texts = content
    .filter((c): c is { type: "text"; text: string } => c.type === "text")
    .map((c) => c.text);
  return texts.join(" ");
}

/**
 * Extracts image URL from message content
 * @param content The message content
 * @returns The image URL if found, null otherwise
 */
export function getImageUrlFromContent(content: Message["content"]): string | null {
  if (typeof content === "string") return null;
  
  // Look for image_url type content
  const imageContent = content.find(
    (c) => c.type === "image_url" && "image_url" in c
  );
  
  if (imageContent && "image_url" in imageContent) {
    const imageUrl = imageContent.image_url as { url: string } | string;
    return typeof imageUrl === "string" ? imageUrl : imageUrl.url;
  }
  
  return null;
}
