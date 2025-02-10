// lib/services/entryProcessor.ts
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES } from '../constants/categories';
import { PROMPT_TEMPLATES } from '../constants/prompts';
import { Entry, ProcessedEntries } from '../types/entry';

interface SimilarEntry {
  id: string;
  content: string;
  similarity: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class EntryProcessor {
  private static async findSimilarEntries(content: string): Promise<SimilarEntry[]> {
    const { data } = await supabase.rpc('find_similar_entries', {
      p_content: content,
      similarity_threshold: 0.6
    });
    return data || [];
  }

  private static buildPrompt(newInput: string, userLocalDate: string, previousItems: string = ''): string {
    const localDate = userLocalDate.split('T')[0];
    console.log('Date being used in prompt:', localDate);

    const categoriesSection = Object.entries(CATEGORIES)
      .map(([cat, desc]) => `- **${cat}:** ${desc}`)
      .join('\n');

    return PROMPT_TEMPLATES.MAIN
      .replace('{categories}', categoriesSection)
      .replace('{refinementRules}', PROMPT_TEMPLATES.REFINEMENT_RULES)
      .replace('{deduplicationRules}', PROMPT_TEMPLATES.DEDUPLICATION_RULES)
      .replace('{dateTimeRules}', PROMPT_TEMPLATES.DATE_TIME_RULES.replaceAll('{currentDate}', localDate))
      .replace('{newInput}', newInput)
      .replace('{previousItemsBlock}', previousItems ? `PREVIOUS ITEMS:\n${previousItems}` : '');
  }

  private static async updateEntries(userId: string, processedEntries: ProcessedEntries, similarEntries: SimilarEntry[]) {
    return await supabase.rpc('update_organized_entries', {
      p_user_id: userId,
      p_entries: processedEntries,
      p_similar_ids: similarEntries.map((e: SimilarEntry) => e.id)
    });
  }

  public static async process(content: string, userLocalDate: string, userId: string): Promise<ProcessedEntries> {
    try {
      console.log('local date from Dashboard/Page.tsx:', userLocalDate);
      const localDate = userLocalDate.split('T')[0];
      console.log('Processing with date:', localDate);

      const similarEntries = await this.findSimilarEntries(content);
      const prompt = this.buildPrompt(content, localDate, similarEntries.map(e => e.content).join('\n'));

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }]
      });

      const llmResponse = completion.choices[0].message.content || '{}';
      console.log('Raw LLM Response:', llmResponse);

      // Ensure LLM outputs only JSON
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Invalid JSON format detected in LLM response:', llmResponse);
        throw new Error('LLM response is not valid JSON');
      }

      const cleanedResponse = jsonMatch[0].trim();
      console.log('Cleaned LLM Response:', cleanedResponse);

      // Validate and parse JSON
      let processedEntries: ProcessedEntries;
      try {
        processedEntries = JSON.parse(cleanedResponse);
      } catch (error) {
        console.error('Failed to parse JSON:', error, 'Response received:', cleanedResponse);
        throw new Error('LLM response is not valid JSON');
      }

      await this.updateEntries(userId, processedEntries, similarEntries);
      return processedEntries;
    } catch (error) {
      console.error('Entry processing failed:', error);
      throw error;
    }
  }
}
