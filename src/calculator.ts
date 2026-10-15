/**
 * Simple Calculator — application logic.
 *
 * The display shows the in-progress expression (e.g. "2 + 3") rather than
 * just the number being typed, so the operand never disappears when you
 * press an operator.
 *
 * Everything is wrapped in an IIFE so no identifiers leak into the global
 * scope, while still allowing the compiled output to load as a plain
 * `<script>` (so `index.html` works when opened directly from disk).
 */
(() => {
  type Operator = "+" | "-" | "*" | "/";

  interface CalculatorState {
    /** The number currently being typed, or the last result. */
    entry: string;
    firstOperand: number | null;
    waitingForSecondOperand: boolean;
    operator: Operator | null;
    /** The completed equation shown on the small secondary line. */
    lastEquation: string | null;
    /** True right after "=", so the next digit starts a new calculation. */
    justEvaluated: boolean;
  }

  const SYMBOLS: Record<Operator, string> = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
  };

  const state: CalculatorState = {
    entry: "0",
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
    lastEquation: null,
    justEvaluated: false,
  };

  const displayEl = document.querySelector("#display") as HTMLElement;
  const equationEl = document.querySelector("#equation") as HTMLElement;
  const keypadEl = document.querySelector("#keypad") as HTMLElement;

  /** Build the expression shown on the main display. */
  function displayText(): string {
    if (state.operator !== null && state.firstOperand !== null) {
      const symbol = SYMBOLS[state.operator];
      const left = formatOperand(state.firstOperand);
      return state.waitingForSecondOperand
        ? `${left} ${symbol}`
        : `${left} ${symbol} ${state.entry}`;
    }
    return state.entry;
  }

  function render(): void {
    const text = displayText();
    displayEl.textContent = text;
    // Shrink the font in stages so long expressions are never clipped.
    const length = text.length;
    displayEl.classList.toggle("compact", length > 12 && length <= 20);
    displayEl.classList.toggle("compact-xs", length > 20);
    equationEl.textContent = state.lastEquation ?? "";
  }

  /** Render a stored operand compactly so long results stay legible. */
  function formatOperand(value: number): string {
    if (!isFinite(value)) return "Error";
    const str = String(value);
    if (str.replace(/[-.]/g, "").length <= 12) return str;
    return String(Number(value.toPrecision(8)));
  }

  /** Avoid floating-point noise (e.g. 0.1 + 0.2 -> 0.3) and cap the length. */
  function formatResult(value: number): string {
    if (!isFinite(value)) return "Error";

    const rounded = Math.round(value * 1e12) / 1e12;
    if (!isFinite(rounded)) return value.toExponential(5);

    const str = String(rounded);

    // Fall back to exponential notation when the value will not fit.
    if (str.replace(/[-.]/g, "").length > 14) return rounded.toExponential(5);
    return str;
  }

  function inputDigit(digit: string): void {
    if (state.justEvaluated) {
      // Start a fresh calculation after "=".
      state.entry = digit;
      state.justEvaluated = false;
      return;
    }

    if (state.waitingForSecondOperand) {
      state.entry = digit;
      state.waitingForSecondOperand = false;
      return;
    }

    if (state.entry.replace(/[-.]/g, "").length >= 14) return;
    state.entry = state.entry === "0" ? digit : state.entry + digit;
  }

  function inputDecimal(): void {
    if (state.justEvaluated) {
      state.entry = "0.";
      state.justEvaluated = false;
      return;
    }
    if (state.waitingForSecondOperand) {
      state.entry = "0.";
      state.waitingForSecondOperand = false;
      return;
    }
    if (!state.entry.includes(".")) state.entry += ".";
  }

  function calculate(first: number, second: number, op: Operator): number {
    switch (op) {
      case "+":
        return first + second;
      case "-":
        return first - second;
      case "*":
        return first * second;
      case "/":
        return second === 0 ? NaN : first / second;
    }
  }

  function handleOperator(nextOperator: Operator): void {
    const current = parseFloat(state.entry);

    if (state.operator !== null && !state.waitingForSecondOperand) {
      // Chain: apply the pending operation before switching operator.
      const result = calculate(state.firstOperand ?? 0, current, state.operator);
      state.entry = formatResult(result);
    }

    state.firstOperand = parseFloat(state.entry);
    state.operator = nextOperator;
    state.waitingForSecondOperand = true;
    state.justEvaluated = false;
  }

  function handleEquals(): void {
    if (state.operator === null || state.firstOperand === null) return;

    const right = parseFloat(state.entry);
    const result = calculate(state.firstOperand, right, state.operator);
    const formatted = formatResult(result);

    state.lastEquation =
      `${formatOperand(state.firstOperand)} ${SYMBOLS[state.operator]} ` +
      `${formatOperand(right)} = ${formatted}`;
    state.entry = formatted;
    state.firstOperand = null;
    state.operator = null;
    state.waitingForSecondOperand = false;
    state.justEvaluated = true;
  }

  function clearAll(): void {
    state.entry = "0";
    state.firstOperand = null;
    state.waitingForSecondOperand = false;
    state.operator = null;
    state.lastEquation = null;
    state.justEvaluated = false;
  }

  function backspace(): void {
    if (state.waitingForSecondOperand || state.justEvaluated) return;
    state.entry = state.entry.length > 1 ? state.entry.slice(0, -1) : "0";
  }

  function toggleSign(): void {
    if (state.entry === "0" || state.entry === "Error") return;
    state.entry = state.entry.startsWith("-")
      ? state.entry.slice(1)
      : "-" + state.entry;
  }

  function percentage(): void {
    state.entry = formatResult(parseFloat(state.entry) / 100);
    state.waitingForSecondOperand = false;
    state.justEvaluated = false;
  }

  function isOperator(value: string): value is Operator {
    return value === "+" || value === "-" || value === "*" || value === "/";
  }

  function handleAction(action: string): void {
    switch (action) {
      case "clear":
        clearAll();
        break;
      case "backspace":
        backspace();
        break;
      case "sign":
        toggleSign();
        break;
      case "percent":
        percentage();
        break;
      case "equals":
        handleEquals();
        break;
      default:
        if (isOperator(action)) handleOperator(action);
    }
  }

  // --- Event wiring ---

  keypadEl.addEventListener("click", (event: Event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!button) return;

    const { digit, action, op } = button.dataset;

    if (digit !== undefined) {
      inputDigit(digit);
    } else if (action !== undefined) {
      handleAction(action);
    } else if (op !== undefined) {
      handleOperator(op as Operator);
    } else {
      return;
    }

    render();
  });

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
      inputDigit(key);
    } else if (key === "." || key === ",") {
      inputDecimal();
    } else if (key === "+" || key === "-" || key === "*" || key === "/") {
      handleOperator(key as Operator);
    } else if (key === "Enter" || key === "=") {
      handleEquals();
    } else if (key === "Escape") {
      clearAll();
    } else if (key === "Backspace") {
      backspace();
    } else if (key === "%") {
      percentage();
    } else {
      return;
    }

    event.preventDefault();
    render();
  });

  render();
})();
