import PromptBase from './PromptBase.js';

const PromptLenient = `${PromptBase}

# Rules

## Rule Interpretation
- Answers will be scored leniently, accepting creative and flexible interpretations
- Each answer will be evaluated based on these guidelines:
  1. Check if any main word in the answer starts with the key letter
  2. Verify the answer reasonably fits the prompt category
  3. Accept answers that could be justified with creative reasoning
- Scoring should err on the side of accepting answers when there's ambiguity

## Lenient Rules
- A, An, and The can be used for key letters (e.g. "The Lion King" is valid for 'T')
- If your answer is a person's name, the first or last name can begin with the key letter
- Abbreviations and acronyms are allowed (e.g. "FBI" for 'F')
- Compound words are acceptable if either part starts with the key letter (e.g. "Fire-truck" or "Super-fast" for 'F')
- Brand names and trademarks are valid answers
- Slang terms and colloquialisms are acceptable
- Foreign words are allowed if they are commonly used in English
- Creative or metaphorical answers are acceptable if they can be reasonably justified
- Proper nouns and place names are always valid if they start with the key letter
- Multiple word answers are allowed as long as any main word starts with the key letter
`;

export default PromptLenient;
