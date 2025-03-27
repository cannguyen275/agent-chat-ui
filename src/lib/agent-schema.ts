import { createClient } from "@/providers/client";

export interface AgentSchema {
  input_schema: {
    properties: Record<string, any>;
    required: string[];
    type: string;
  };
  output_schema: {
    properties: Record<string, any>;
    required: string[];
    type: string;
  };
}

/**
 * Fetches the agent's schema from the LangGraph server
 * @param apiUrl The URL of the LangGraph server
 * @param apiKey The API key for the LangGraph server
 * @param assistantId The ID of the assistant/graph
 * @returns The agent's schema or null if it couldn't be fetched
 */
export async function fetchAgentSchema(
  apiUrl: string,
  apiKey: string | undefined,
  assistantId: string
): Promise<AgentSchema | null> {
  try {
    const client = createClient(apiUrl, apiKey);
    const schema = await client.assistants.getSchemas(assistantId);
    return schema as AgentSchema;
  } catch (error) {
    console.error("Failed to fetch agent schema:", error);
    return null;
  }
}

/**
 * Checks if the agent supports image input
 * @param schema The agent's schema
 * @returns True if the agent supports image input, false otherwise
 */
export function supportsImageInput(schema: AgentSchema | null): boolean {
  if (!schema || !schema.input_schema || !schema.input_schema.properties) {
    console.log("Schema is null or missing input_schema.properties");
    return false;
  }

  // Check if any property in the input schema is an image
  const properties = schema.input_schema.properties;
  console.log("Schema properties:", properties);
  
  // Look for properties that might indicate image support
  // This could be a property named 'image', 'images', or a property with format 'image'
  const result = Object.entries(properties).some(([key, value]) => {
    console.log(`Checking property: ${key}`, value);
    
    // Check for common image property names
    if (key === 'image' || key === 'images' || key.includes('image')) {
      console.log(`Found image-related property name: ${key}`);
      return true;
    }
    
    // Check for properties with image format or type
    if (
      value.format === 'image' || 
      value.type === 'image' ||
      (value.type === 'string' && value.format === 'base64') ||
      (value.type === 'string' && value.contentEncoding === 'base64') ||
      (value.type === 'string' && value.contentMediaType && value.contentMediaType.startsWith('image/'))
    ) {
      console.log(`Found image-related property format/type in ${key}:`, value);
      return true;
    }
    
    return false;
  });
  
  console.log("Final image support detection result:", result);
  
  // Check if the schema has an 'image' property in the input schema
  // This is specific to the agriculture agent
  if (properties.image) {
    console.log("Found 'image' property in input schema");
    return true;
  }
  
  return result;
}
