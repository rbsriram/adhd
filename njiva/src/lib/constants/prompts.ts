export const EXPECTED_OUTPUT = {
  "Do": [{"item": "", "recurrence": null, "date": null, "time": null, "completed": false}],
  "Plan": [{"item": "", "recurrence": null, "date": null, "time": null, "completed": false}],
  "Think": [{"item": "", "recurrence": null, "date": null, "time": null, "completed": false}],
  "Shopping": [{"item": "", "recurrence": null, "date": null, "time": null, "completed": false}],
  "Important Dates": [{"item": "", "recurrence": null, "date": null, "time": null, "completed": false}]
};

export const PROMPT_TEMPLATES = {
  MAIN: `Process the following input and categorize it accordingly. Use {currentDate} as the reference for all date and time calculations.

{categories}
{refinementRules}
{deduplicationRules}
{dateTimeRules}



### **STRICT INSTRUCTIONS**:
- **ONLY** return the JSON output. Do **not** include any explanations, summaries, or extra text.
- The response **must** begin and end with a valid JSON object.
- **Do not** wrap JSON inside quotes.
- Ensure correct formatting and escape sequences for special characters.

Output Format:
Return JSON exactly matching this structure:
\`\`\`json
${JSON.stringify(EXPECTED_OUTPUT, null, 2)}
\`\`\`

INPUT DATA:
\`\`\`
{newInput}
{previousItemsBlock}
\`\`\`

`,

  REFINEMENT_RULES: `
- Always preserve context, including dates, times, and important details.
- Do not split tasks unless explicitly stated in the input.
- Avoid creating new or unrelated tasks.
- Only categorize and clarify the given input without altering its meaning.
- Deduplicate entries logically; avoid including multiple versions of the same task.
- Do NOT treat examples within this prompt as part of the user input.



### Categorization Examples:
Do:
- "Team meeting next Tuesday 2pm"
- "Submit report by Friday"
- "Doctor appointment tomorrow 3pm"
- "Call mom tonight"
- "Dinner reservation Saturday"
- "Pick up kids at 5pm"

Plan:
- "Research summer vacation options"
- "Plan quarterly budget"
- "Learn Spanish"
- "Explore new job opportunities"
- "Prepare presentation"
- "Compare insurance plans"

Think:
- "Blog post ideas"
- "Team productivity improvements"
- "Living room design concepts"
- "Story plot ideas"
- "Business opportunities"
- "Social media themes"

Shopping:
- "Buy milk, eggs and bread"
- "Get new laptop"
- "Purchase office supplies"
- "Groceries: vegetables, fruits"
- "Order birthday gift"
- "Get cleaning supplies"

Important Dates:
- "Mom's birthday March 15"
- "Wedding anniversary June 21"
- "Tax filing deadline April 15"
- "School year starts September 1"
- "Christmas day December 25"
- "Company fiscal year end"

### Key Classification Rules:
1. If it's actionable with a specific date/time → Do
2. If it's a significant life event or annual occasion → Important Dates
3. If it involves buying/purchasing → Shopping
4. If it needs research/preparation → Plan
5. If it's an idea, concept, or something to ponder but not yet actionable`,

  DEDUPLICATION_RULES: `
Deduplication Rules:
- Compare the new input with previous items.
- Remove exact duplicates.
- Merge similar entries, retaining the most detailed and specific version.
- Ensure entries remain logically unique.
`,

  DATE_TIME_RULES: `
DateTime Rules:
1. **Current Reference Date:** {currentDate}
   - Use this as the explicit reference for all date and time calculations.

2. **Date Calculation Guidelines:**
   - All resolved dates must be explicitly calculated relative to {currentDate}.
   - Use "YYYY-MM-DD" format for dates (e.g., "2025-01-10").
   - Ensure all dates are AFTER or equal to {currentDate}.
   - Never include placeholder values like "YYYY-MM-DD" or "null" unless explicitly required.

3. **Resolving Relative Terms:**
   - "today" → Use {currentDate}.
   - "tomorrow" → {currentDate} + 1 day.
   - "day after tomorrow" → {currentDate} + 2 days.

4. Weekday Terms:
   - "this [weekday]" or "coming [weekday]":
     * If today is **before** the mentioned weekday, resolve to **this week's occurrence**.
     * If today is **after** that weekday, resolve to **the next week's occurrence**.
   
   - "next [weekday]" or "following [weekday]":
     * Always refers to **the weekday in the following week** (not two weeks ahead).
   
   - Example (assuming currentDate: **Saturday, 2025-02-01**):
     - "this Thursday" = **2025-02-06** (this week).
     - "next Thursday" = **2025-02-13** (following week).
     - "this Friday" = **2025-02-07** (this week).
     - "next Friday" = **2025-02-14** (following week).
     - "this Monday" = **2025-02-03** (upcoming Monday).
     - "next Monday" = **2025-02-10** (following Monday).

5. **Month/Week Terms:**
   - "next month 15th" → Use the 15th of the following month.
   - "next week" → Add 7 days to {currentDate} and use Monday of that week by default.
   - **"In [month]" → Always resolve to the 1st day of that month**.
     Example: "Plan a weekend trip in March" → "2025-03-01".

6. **Time Parsing Rules:**
   - Convert words to 24-hour format ("HH:mm").
   - If no time is provided, set as null.
   - Convert general time terms:
     * "morning" → "09:00"
     * "afternoon" → "12:30"
     * "evening" → "18:00"
     * "night" → "21:00"
     * "late night" → "23:00"
     * "early morning" → "06:00"

7. **Recurrence Rules:**
   - Specify recurrence types like daily, weekly, monthly, yearly, or null for one-time tasks.
  `
};
