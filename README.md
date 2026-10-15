# Simple Calculator

[![CI](https://github.com/rifqilubis/simple-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/rifqilubis/simple-calculator/actions/workflows/ci.yml)

A simple, dependency-free calculator website written in TypeScript.

**▶ [Live demo](https://rifqilubis.github.io/simple-calculator/)**

## Features

- Basic arithmetic: `+  - × ÷`
- **The full expression stays visible** — pressing `+` after `2` shows `2 +`,
  not a blank screen, so you always see what you are calculating
- A secondary line shows the completed equation after `=`, e.g. `2 + 3 = 5`
- Decimal arithmetic with floating-point cleanup (`0.1 + 0.2 = 0.3`)
- Percentage, sign toggle (`±`), backspace (`DEL`), and clear (`AC`)
- Divide-by-zero handled as `Error`
- 14-digit input limit; oversized results fall back to scientific notation
- The display font auto-shrinks in stages so long expressions never clip
- Full **keyboard support**: digits, `.`, `+ - * /`, `Enter`/`=` to evaluate,
  `Backspace` to delete, `Escape` to clear, `%` for percentage
- Accessible: visible focus ring and `aria-live` display region
- Responsive, dark-themed UI that works on mobile

## Project structure

```
index.html              Markup + keypad
style.css               Styling
src/calculator.ts       Application logic (TypeScript source)
dist/calculator.js      Compiled output (generated)
tsconfig.json           TypeScript configuration (strict mode)
serve.js                Optional zero-dependency local dev server
.github/workflows/ci.yml  CI: type-check + dist/ freshness check
```

## Getting started

The compiled `dist/calculator.js` is checked in, so **you can just open
`index.html` in a browser** — no build step required.

### Editing the TypeScript

Requires [Node.js](https://nodejs.org) on your `PATH`:

```bash
npm install        # installs TypeScript
npm run build      # compiles src/ -> dist/
npm run watch      # recompile on save
```

### Running a local server (optional)

```bash
node serve.js      # then open http://localhost:3000
```

> **Note on this machine:** `npm`/`node` are not installed on the `PATH`.
> The build was performed using the Node and TypeScript copies bundled with
> other local tooling. On a normal machine with Node installed, the `npm`
> commands above work as-is.

## How it works

`src/calculator.ts` keeps a single `CalculatorState` object:

```ts
interface CalculatorState {
  entry: string;                     // the number being typed, or the last result
  firstOperand: number | null;
  waitingForSecondOperand: boolean;
  operator: Operator | null;
  lastEquation: string | null;       // the completed equation shown on the second line
  justEvaluated: boolean;            // so the next digit starts a new calculation
}
```

Every input (button click or keypress) mutates the state through a small pure
function (`inputDigit`, `handleOperator`, `calculate`, …) and then calls
`render()`. Operators apply immediately to the pending result so
`2 + 3 × 4 =` evaluates left-to-right, matching a basic handheld calculator.

The visible text is derived rather than stored — `displayText()` builds
`"2 + 3"` from the pending operator and operand, so the earlier number is never
lost. `render()` also picks a font-size tier from the resulting string length
so long expressions shrink instead of overflowing.

## Toolchain

Built with **TypeScript 7.0.2**, pinned to an exact version in `package.json`
so local and CI builds emit byte-identical output. The CI workflow rebuilds
`dist/` and diffs it against the committed copy, which fails the build if the
generated code ever drifts out of sync with the source.
