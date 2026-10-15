# Simple Calculator

[![CI](https://github.com/rifqilubis/simple-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/rifqilubis/simple-calculator/actions/workflows/ci.yml)

A simple, dependency-free calculator website written in TypeScript.

**▶ [Live demo](https://rifqilubis.github.io/simple-calculator/)**

## Features

- Basic arithmetic: `+  - × ÷`
- Decimal arithmetic with floating-point cleanup (`0.1 + 0.2 = 0.3`)
- Percentage, sign toggle (`±`), backspace (`DEL`), and clear (`AC`)
- Divide-by-zero handled as `Error`
- 14-digit display limit
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
  display: string;
  firstOperand: number | null;
  waitingForSecondOperand: boolean;
  operator: Operator | null;
}
```

Every input (button click or keypress) mutates the state through a small pure
function (`inputDigit`, `handleOperator`, `calculate`, …) and then calls
`render()` to write `state.display` to the DOM. Operators apply immediately to
the pending result so `2 + 3 × 4 =` evaluates left-to-right, matching the
behaviour of a basic handheld calculator.
