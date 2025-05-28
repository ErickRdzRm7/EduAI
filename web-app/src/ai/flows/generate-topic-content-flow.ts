'use server';
/**
 * @fileOverview AI flow to generate structured learning points for a given topic and level.
 *
 * - generateTopicContent - A function that generates learning content.
 * - GenerateTopicContentInput - The input type for the generateTopicContent function.
 * - GenerateTopicContentOutput - The return type for the generateTopicContent function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const GenerateTopicContentInputSchema = z.object({
  topicName: z.string().describe('The name of the educational topic (e.g., Java Programming).'),
  description: z.string().optional().describe('A brief description of the topic or specific interests.'),
  baseLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The primary difficulty level for which the topic is requested.'),
});
export type GenerateTopicContentInput = z.infer<typeof GenerateTopicContentInputSchema>;

const GenerateTopicContentOutputSchema = z.object({
  beginner: z.array(z.string()).describe('A list of key learning points or sub-topics for the Beginner level.'),
  intermediate: z.array(z.string()).describe('A list of key learning points or sub-topics for the Intermediate level.'),
  advanced: z.array(z.string()).describe('A list of key learning points or sub-topics for the Advanced level.'),
});
export type GenerateTopicContentOutput = z.infer<typeof GenerateTopicContentOutputSchema>;

export async function generateTopicContent(input: GenerateTopicContentInput): Promise<GenerateTopicContentOutput> {
  // Add basic error handling or default return
  try {
      return await generateTopicContentFlow(input);
  } catch (error) {
      console.error("Error in generateTopicContentFlow:", error);
      // Return a default structure in case of error
      return {
          beginner: [`Introduction to ${input.topicName} (Beginner)`],
          intermediate: [`Intermediate concepts for ${input.topicName}`],
          advanced: [`Advanced topics in ${input.topicName}`]
      };
  }
}


const prompt = ai.definePrompt({
  name: 'generateTopicContentPrompt',
  input: {
    schema: GenerateTopicContentInputSchema,
  },
  output: {
    schema: GenerateTopicContentOutputSchema,
  },
  prompt: `You are an expert curriculum designer. Generate a structured list of key learning points or sub-topics for the educational topic "{{topicName}}".
{{#if description}}The user provided this description: "{{description}}"{{/if}}

The user requested this topic primarily at the "{{baseLevel}}" level, but please provide learning points for all three levels: Beginner, Intermediate, and Advanced.

For each level (Beginner, Intermediate, Advanced), provide a concise list of 5-10 essential learning points or tasks a student should cover. These points should be distinct steps or concepts within the topic.

Structure the output strictly as a JSON object with keys "beginner", "intermediate", and "advanced", each containing an array of strings representing the learning points for that level. Ensure each list contains between 5 and 10 items.`,
});


const generateTopicContentFlow = ai.defineFlow<
  typeof GenerateTopicContentInputSchema,
  typeof GenerateTopicContentOutputSchema
>(
  {
    name: 'generateTopicContentFlow',
    inputSchema: GenerateTopicContentInputSchema,
    outputSchema: GenerateTopicContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !output.beginner || !output.intermediate || !output.advanced) {
        console.warn("AI did not return the expected structure for topic content. Returning defaults.");
        // Provide default structure if AI fails
        return {
            beginner: [`Introduction to ${input.topicName} (Beginner)`],
            intermediate: [`Intermediate concepts for ${input.topicName}`],
            advanced: [`Advanced topics in ${input.topicName}`]
        };
    }
    // Optional: Add validation for the number of items per level if needed
    return output;
  }
);
