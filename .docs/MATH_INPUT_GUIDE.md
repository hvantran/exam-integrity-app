# Math Question Input System - Student Guide

This document explains how the exam interface renders different types of mathematical questions to make answering easier for students.

## Overview

The exam system automatically detects the type of math formula and renders an optimized input interface:

- **Simple Formulas** (single operation) → Vertical calculation workspace
- **Complex Formulas** (multiple operations) → Step-by-step workspace

## Formula Types & Examples

### 1. Simple Addition

**Example:** `4 722 + 5 369`

**What You See:**

```
    4 722
  +  5 369
  ________
  [Input]
```

**Features:**

- Large numbers for easy reading
- Vertical layout mimics traditional paper arithmetic
- Single input line for your answer
- Green-themed color accent

**Student Experience:**

- Enter your answer: `10 091`

---

### 2. Simple Subtraction

**Example:** `14 751 – 10 162`

**What You See:**

```
   14 751
  - 10 162
  ________
  [Input]
```

**Features:**

- Vertical layout for traditional subtraction
- Blue-themed color accent
- Clear operator symbol (−)

**Student Experience:**

- Enter your answer: `4 589`

---

### 3. Simple Multiplication

**Example:** `5 037 x 4`

**What You See:**

```
    5 037
  ×    4
  ________
  [Input]
```

**Features:**

- Vertical layout for multiplication
- Orange-themed color accent
- Multiplication symbol (×)

**Student Experience:**

- Enter your answer: `20 148`

---

### 4. Simple Division

**Example:** `12 740 : 9`

**What You See:**

```
   12 740
  ÷    9
  ________
  [Input]
```

**Features:**

- Vertical layout for division
- Purple-themed color accent
- Division symbol (÷)

**Student Experience:**

- Enter your answer: `1415.56` or `1416` (depends on instructions)

---

### 5. Complex Formula (Multiple Operations)

**Example:** `93 645 : 9 x 5`

**What You See:**

```
┌─ Formula ────────────────────┐
│ 93 645 : 9 x 5               │
└──────────────────────────────┘

⚠️ Remember order of operations:
   Multiply/Divide first (left to right),
   then Add/Subtract (left to right)

Your Work:
[Textarea for showing steps]

Final Answer = [Input field]
```

**Features:**

- Full formula display at top
- Educational reminder about order of operations
- Space to show working/steps (for partial credit)
- Separate final answer field
- Purple-themed color accent

**Student Experience:**

```
Your Work:
Step 1: 93 645 : 9 = 10 405
Step 2: 10 405 x 5 = 52 025

Final Answer = 52 025
```

---

### 6. Complex Formula (Nested Operations)

**Example:** `12 740 + 5 037 x 4`

**What You See:**

```
┌─ Formula ────────────────────┐
│ 12 740 + 5 037 x 4           │
└──────────────────────────────┘

⚠️ Remember order of operations:
   Multiply/Divide first (left to right),
   then Add/Subtract (left to right)

Your Work:
[Textarea for showing steps]

Final Answer = [Input field]
```

**Student Experience:**

```
Your Work:
Step 1: 5 037 x 4 = 20 148  (multiply first)
Step 2: 12 740 + 20 148 = 32 888

Final Answer = 32 888
```

---

## How to Use Each Input Type

### Simple Formulas (Addition, Subtraction, Multiplication, Division)

1. **Look at the vertical layout** - It shows the formula just like you'd write it on paper
2. **Do your calculation** mentally or on paper
3. **Enter just the number** in the answer field
4. **Don't include operators** - just the number (e.g., `10 091` not `+10 091`)

**Tips:**

- You can include decimal points if needed: `10.5`, `3.14`
- Spaces in large numbers are optional: `10091` and `10 091` both work
- Negative answers: use minus sign if needed: `-5`

### Complex Formulas

1. **Read the formula** at the top of the input area
2. **Check the order of operations reminder** - it helps you remember PEMDAS/BODMAS
3. **Show your work** in the textarea (optional but recommended for partial credit)
   - Write each step on a new line
   - Show intermediate calculations
4. **Enter your final answer** in the "Final Answer" field

**Tips:**

- Breaking the formula into steps helps catch mistakes
- Your work is considered for grading even if final answer is wrong
- Use the notation that's clear: `x`, `*`, or `×` for multiplication; `:` or `/` or `÷` for division

---

## Visual Color Coding

Each formula type has a unique color theme to help you quickly identify the type:

- **🟢 Green** = Addition
- **🔵 Blue** = Subtraction
- **🟠 Orange** = Multiplication
- **🟣 Purple** = Division or Complex Formula

---

## Technical Details (For Developers)

### Supported Formula Patterns

The system recognizes these patterns:

**Simple Operations:**

- Addition: `5 + 3`, `5 + 3 = 8`, `add 5 and 3`
- Subtraction: `10 - 3`, `10 – 3`, `10 minus 3`
- Multiplication: `5 * 3`, `5 x 3`, `5 × 3`, `5 times 3`
- Division: `10 / 2`, `10 : 2`, `10 ÷ 2`, `10 divided by 2`

**Complex Formulas:**

- Multiple operators: `5 + 3 * 2`
- Mixed operations: `20 - 10 / 2 + 3`
- Multiple of same operator: `5 + 3 + 2` (treated as complex)

### Component Structure

```
StudentManQuestionPanel
  └─ Detects math formula
     ├─ Simple → SimpleArithmeticInput
     │           (vertical calculation layout)
     │
     ├─ Complex → ComplexFormulaInput
     │            (step-by-step workspace)
     │
     └─ Other → Standard textarea
```

### Files

- **Analyzer:** `/src/utils/mathFormulaAnalyzer.ts`
  - Detects formula type
  - Extracts operands and operators
  - Validates answer format

- **Components:** `/src/components/molecules/MathInput/`
  - `SimpleArithmeticInput.tsx` - Single operation rendering
  - `ComplexFormulaInput.tsx` - Multiple operations rendering
  - `MathQuestionInput.tsx` - Auto-detection and orchestration

- **Integration:** `/src/components/organisms/StudentManQuestionPanel.tsx`
  - Uses `analyzeFormula()` to detect math questions
  - Conditionally renders math inputs

### Adding New Formula Types

To add support for new formula patterns:

1. Update `MathFormulaType` enum in `mathFormulaAnalyzer.ts`
2. Add pattern recognition logic in `analyzeFormula()`
3. Create new component (e.g., `SpecialFormulaInput.tsx`)
4. Add case in `MathQuestionInput.tsx` to render new component

---

## Accessibility Features

- ✅ Large, readable numbers
- ✅ Color coding with labels (not just color)
- ✅ Clear instructions and hints
- ✅ Keyboard navigation support
- ✅ ARIA labels for screen readers
- ✅ High contrast text

---

## Browser Support

Works on all modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Troubleshooting

**Q: My formula isn't being detected as a math question**
A: Make sure you're using standard mathematical operators:

- Use `+`, `-`, `x`/`*`/`×`, `:`/`/`/`÷`
- Include spaces around operators: `5 + 3` not `5+3`

**Q: Can I enter decimal answers?**
A: Yes! Use a period: `3.14` or `10.5`

**Q: What if I need to show my work?**
A: Complex formulas have a "Your Work" section. Show each step on a new line.

---

## Future Enhancements

Planned features:

- [ ] Step-by-step calculator with hints
- [ ] Inline formula validation
- [ ] Support for fractions and exponents
- [ ] Equation solving (not just arithmetic)
- [ ] Graphing questions
