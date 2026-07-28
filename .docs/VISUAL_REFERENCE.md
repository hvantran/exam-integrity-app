# Math Input System - Visual Reference

## Component Rendering Examples

### 1. SIMPLE ADDITION (Green Theme)

```
┌──────────────────────────────────────────┐
│                                          │
│  Question 1                              │
│  Mathematics · Grade 5                   │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  Example: 4 722 + 5 369                  │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  4 722                             │ │
│  │ +  5 369                           │ │
│  │ ________                           │ │
│  │  [       ]                         │ │
│  │                                    │ │
│  │  Enter your answer above           │ │
│  └────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘

Color Theme: 🟢 GREEN (border-green-200, bg-green-50)
Input: Number only (e.g., "10091")
```

---

### 2. SIMPLE SUBTRACTION (Blue Theme)

```
┌──────────────────────────────────────────┐
│                                          │
│  Question 2                              │
│  Mathematics · Grade 5                   │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  Example: 14 751 – 10 162                │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  14 751                            │ │
│  │ -  10 162                          │ │
│  │ ________                           │ │
│  │  [       ]                         │ │
│  │                                    │ │
│  │  Enter your answer above           │ │
│  └────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘

Color Theme: 🔵 BLUE (border-blue-200, bg-blue-50)
Input: Number only (e.g., "4589")
```

---

### 3. SIMPLE MULTIPLICATION (Orange Theme)

```
┌──────────────────────────────────────────┐
│                                          │
│  Question 3                              │
│  Mathematics · Grade 5                   │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  Example: 5 037 x 4                      │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    5 037                           │ │
│  │  ×    4                            │ │
│  │ ________                           │ │
│  │  [       ]                         │ │
│  │                                    │ │
│  │  Enter your answer above           │ │
│  └────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘

Color Theme: 🟠 ORANGE (border-orange-200, bg-orange-50)
Input: Number only (e.g., "20148")
```

---

### 4. SIMPLE DIVISION (Purple Theme)

```
┌──────────────────────────────────────────┐
│                                          │
│  Question 4                              │
│  Mathematics · Grade 6                   │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  Example: 12 740 : 9                     │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    12 740                          │ │
│  │  ÷    9                            │ │
│  │ ________                           │ │
│  │  [       ]                         │ │
│  │                                    │ │
│  │  Enter your answer above           │ │
│  └────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘

Color Theme: 🟣 PURPLE (border-purple-200, bg-purple-50)
Input: Number or decimal (e.g., "1415.56")
```

---

### 5. COMPLEX FORMULA (Purple Theme)

```
┌──────────────────────────────────────────┐
│                                          │
│  Question 5                              │
│  Mathematics · Grade 6                   │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  Example: 93 645 : 9 x 5                 │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │         Formula                    │ │
│  │  93 645 : 9 x 5                   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ ⚠️  Remember order of operations:  │ │
│  │     Multiply/Divide first (left    │ │
│  │     to right), then Add/Subtract   │ │
│  │     (left to right)                │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Your Work                               │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  │  [Large textarea for steps...]     │ │
│  │                                    │ │
│  │                                    │ │
│  │                                    │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Final Answer                            │
│  = [       ]                             │
│                                          │
│  Show your work for partial credit      │
│                                          │
└──────────────────────────────────────────┘

Color Theme: 🟣 PURPLE (border-purple-200, bg-purple-50)
Components: Formula box + Order of ops hint + Work area + Answer field
Input: Free text + final answer
```

---

### 6. COMPLEX FORMULA WITH NESTED OPERATIONS (Purple Theme)

```
┌──────────────────────────────────────────┐
│                                          │
│  Question 6                              │
│  Mathematics · Grade 6                   │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  Example: 12 740 + 5 037 x 4             │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │         Formula                    │ │
│  │  12 740 + 5 037 x 4                │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ ⚠️  Remember order of operations:  │ │
│  │     Multiply/Divide first (left    │ │
│  │     to right), then Add/Subtract   │ │
│  │     (left to right)                │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Your Work                               │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  │ Step 1: 5 037 x 4 = 20 148         │ │
│  │ Step 2: 12 740 + 20 148 = 32 888   │ │
│  │                                    │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Final Answer                            │
│  = [ 32 888 ]                            │
│                                          │
│  Show your work for partial credit      │
│                                          │
└──────────────────────────────────────────┘

Color Theme: 🟣 PURPLE (with gradient background)
Focus: Order of operations is critical
```

---

## Responsive Design Breakpoints

### Desktop (md: 768px and above)

```
- Text size: text-2xl to text-3xl
- Padding: p-6
- Full width layout
- Side-by-side elements possible
```

### Mobile (below 768px)

```
- Text size: smaller scaling
- Padding: p-4
- Stack vertically
- Touch-friendly input areas
```

---

## Color Theme Mapping

| Operation      | Background                       | Border            | Operator Color  |
| -------------- | -------------------------------- | ----------------- | --------------- |
| Addition       | bg-green-50                      | border-green-200  | text-green-600  |
| Subtraction    | bg-blue-50                       | border-blue-200   | text-blue-600   |
| Multiplication | bg-orange-50                     | border-orange-200 | text-orange-600 |
| Division       | bg-purple-50                     | border-purple-200 | text-purple-600 |
| Complex        | gradient (purple-50 → indigo-50) | border-purple-200 | text-purple-600 |

---

## Text Styling Guide

### Numbers Display

- Font: `font-mono` (monospace for alignment)
- Size: `text-2xl md:text-3xl` (large, readable)
- Weight: `font-bold` (clear emphasis)
- Color: `text-slate-900` (high contrast)

### Operators

- Font: `font-bold`
- Size: `text-2xl md:text-3xl` (matches numbers)
- Color: operation-specific (green/blue/orange/purple)
- Symbol: ✓ (Unicode: −, ×, ÷)

### Labels & Help Text

- Size: `text-xs` (small, secondary)
- Weight: `font-semibold` or `font-medium`
- Color: `text-slate-600` or `text-slate-700`

---

## Input Field Styling

### All Math Input Fields

```
border border-{color}-300
rounded-xl (border-radius: 0.75rem)
px-4 py-2 (consistent padding)
text-slate-900 (dark text)
placeholder-slate-400 (gray placeholder)
focus:border-{color}-400
focus:ring-1 focus:ring-{color}-200
```

### Text Area (Work section in Complex)

```
font-mono text-sm
leading-6 (line-height for readability)
resize-vertical (user can adjust height)
rows={6} (starting height)
```

---

## Interactive States

### Hover (non-disabled)

- Input fields: cursor changes to text
- Overall: button hover effects on Flag button

### Focus

- Border color brightens: `focus:border-{color}-400`
- Ring appears: `focus:ring-1 focus:ring-{color}-200`

### Disabled/Readonly

- Opacity: `opacity-60`
- Cursor: `cursor-not-allowed`
- No hover effects
- Input becomes read-only

### Error/Validation (Future)

- Border color: `border-red-300`
- Ring: `ring-red-200`
- Error message below input

---

## Animation & Transitions

### Current

- `transition-all` on MCQ options (smooth hover)
- No animations on math inputs (clean, immediate)

### Future Enhancement

- Fade-in on component mount
- Smooth border color transitions
- Highlight animation on answer validation

---

## Accessibility Specifications

### Color Contrast

- ✅ WCAG AA (4.5:1 for text)
- ✅ No color-only coding
- ✅ Labels always present

### Focus Management

- ✅ Visible focus rings
- ✅ Logical tab order
- ✅ Skip links possible

### Keyboard Navigation

- ✅ Tab through inputs
- ✅ Space/Enter to submit
- ✅ Arrow keys in textareas

### Screen Reader Support

- ✅ Semantic HTML
- ✅ ARIA labels on inputs
- ✅ Clear section headers

---

## Developer Quick Reference

### Import Paths

```tsx
// Main component
import { MathQuestionInput } from './components/molecules/MathInput';

// Formula analyzer
import { analyzeFormula, type ParsedFormula } from './utils/mathFormulaAnalyzer';

// Individual components (if needed)
import SimpleArithmeticInput from './components/molecules/MathInput/SimpleArithmeticInput';
import ComplexFormulaInput from './components/molecules/MathInput/ComplexFormulaInput';
```

### Type Definitions

```tsx
type MathFormulaType =
  | 'SIMPLE_ADDITION'
  | 'SIMPLE_SUBTRACTION'
  | 'SIMPLE_MULTIPLICATION'
  | 'SIMPLE_DIVISION'
  | 'COMPLEX_FORMULA'
  | 'UNKNOWN';

interface ParsedFormula {
  type: MathFormulaType;
  formula: string;
  operands?: number[];
  operator?: string;
  operatorCount: number;
  hasDecimal: boolean;
  displayFormula: string;
}
```

### Usage in StudentManQuestionPanel

```tsx
// Already integrated - just works!
<StudentManQuestionPanel
  questionText="4 722 + 5 369" // Math detected automatically
  questionType="ESSAY_SHORT"
  selectedAnswer={answer}
  onAnswerChange={handleChange}
  {...otherProps}
/>
```
