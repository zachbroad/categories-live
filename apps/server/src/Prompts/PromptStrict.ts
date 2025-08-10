import PromptBase from './PromptBase.js';

const PromptStrict = `${PromptBase}

# Rules

## Rule Interpretation
- Answers will be scored strictly, requiring exact adherence to rules
- Each answer will be evaluated based on these guidelines:
  1. Check if the first word of the answer starts with the key letter
  2. Verify the answer precisely fits the prompt category
  3. Reject answers that require creative interpretation
- Scoring should err on the side of rejecting answers when there's ambiguity

## Strict Rules
- A, An, and The cannot be used for key letters (e.g. "The Lion King" is invalid for 'T')
- If your answer is a person's name, only the first name can begin with the key letter
- Abbreviations and acronyms are not allowed (e.g. "FBI" is invalid for 'F')
- Only the first part of compound words counts for the key letter (e.g. "Fire-truck" is valid but "Super-fast" is invalid for 'F')
- Brand names and trademarks must be commonly recognized and dictionary-defined
- Slang terms and colloquialisms are not acceptable
- Foreign words are not allowed unless they appear in English dictionaries
- Metaphorical or creative interpretations will be rejected
- Proper nouns and place names must be widely recognized
- Only the first word of multiple word answers must start with the key letter
`;

export default PromptStrict;
