// src/test/testPrompt.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import OpenAI from 'openai';
import { PROMPT_TEMPLATES } from '../lib/constants/prompts';
import { CATEGORIES } from '../lib/constants/categories';
import { testInputs } from './inputs';

async function testPrompt() {
  const currentDate = new Date().toISOString().split('T')[0];
  const testCase = testInputs[0];

  console.log('\n=== INPUTS ===');
  console.log('Current Date:', currentDate);
  console.log('New Input:', testCase.newInput.join('\n'));
  if (testCase.previousItems.length) {
    console.log('Previous Items:', testCase.previousItems.join('\n'));
  }

  const categoriesSection = Object.entries(CATEGORIES)
    .map(([cat, desc]) => `- **${cat}:** ${desc}`)
    .join('\n');

  const prompt = PROMPT_TEMPLATES.MAIN
    .replace('{categories}', categoriesSection)
    .replace('{refinementRules}', PROMPT_TEMPLATES.REFINEMENT_RULES)
    .replace('{deduplicationRules}', PROMPT_TEMPLATES.DEDUPLICATION_RULES)
    .replace('{dateTimeRules}', PROMPT_TEMPLATES.DATE_TIME_RULES.replaceAll('{currentDate}', currentDate))
    .replace('{newInput}', testCase.newInput.join('\n'))
    .replace('{previousItemsBlock}', testCase.previousItems.length ? `PREVIOUS ITEMS:\n${testCase.previousItems.join('\n')}` : '');

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  });

  console.log('\n=== OUTPUT ===');
  console.log(completion.choices[0].message.content);
}

testPrompt();
