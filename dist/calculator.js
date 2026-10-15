"use strict";
/**
 * Simple Calculator — application logic.
 *
 * Everything is wrapped in an IIFE so no identifiers leak into the global
 * scope, while still allowing the compiled output to load as a plain
 * `<script>` (so `index.html` works when opened directly from disk).
 */
(() => {
    const state = {
        display: "0",
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null,
    };
    const displayEl = document.querySelector("#display");
    const keypadEl = document.querySelector("#keypad");
    function render() {
        displayEl.textContent = state.display;
    }
    /** Avoid floating-point noise (e.g. 0.1 + 0.2 -> 0.3) and cap the length. */
    function formatResult(value) {
        if (!isFinite(value))
            return "Error";
        const rounded = Math.round(value * 1e12) / 1e12;
        if (!isFinite(rounded))
            return value.toExponential(5);
        const str = String(rounded);
        // Fall back to exponential notation when the value will not fit.
        if (str.replace(/[-.]/g, "").length > 14)
            return rounded.toExponential(5);
        return str;
    }
    function inputDigit(digit) {
        if (state.waitingForSecondOperand) {
            state.display = digit;
            state.waitingForSecondOperand = false;
            return;
        }
        if (state.display.replace(/[-.]/g, "").length >= 14)
            return;
        state.display = state.display === "0" ? digit : state.display + digit;
    }
    function inputDecimal() {
        if (state.waitingForSecondOperand) {
            state.display = "0.";
            state.waitingForSecondOperand = false;
            return;
        }
        if (!state.display.includes("."))
            state.display += ".";
    }
    function calculate(first, second, op) {
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
    function handleOperator(nextOperator) {
        const inputValue = parseFloat(state.display);
        if (state.operator !== null && !state.waitingForSecondOperand) {
            const result = calculate(state.firstOperand ?? 0, inputValue, state.operator);
            state.display = formatResult(result);
        }
        state.firstOperand = parseFloat(state.display);
        state.operator = nextOperator;
        state.waitingForSecondOperand = true;
    }
    function handleEquals() {
        if (state.operator === null || state.firstOperand === null)
            return;
        const result = calculate(state.firstOperand, parseFloat(state.display), state.operator);
        state.display = formatResult(result);
        state.firstOperand = null;
        state.operator = null;
        state.waitingForSecondOperand = false;
    }
    function clearAll() {
        state.display = "0";
        state.firstOperand = null;
        state.waitingForSecondOperand = false;
        state.operator = null;
    }
    function backspace() {
        if (state.waitingForSecondOperand)
            return;
        state.display = state.display.length > 1 ? state.display.slice(0, -1) : "0";
    }
    function toggleSign() {
        if (state.display === "0" || state.display === "Error")
            return;
        state.display = state.display.startsWith("-")
            ? state.display.slice(1)
            : "-" + state.display;
    }
    function percentage() {
        state.display = formatResult(parseFloat(state.display) / 100);
        state.waitingForSecondOperand = false;
    }
    function isOperator(value) {
        return value === "+" || value === "-" || value === "*" || value === "/";
    }
    function handleAction(action) {
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
                if (isOperator(action))
                    handleOperator(action);
        }
    }
    // --- Event wiring ---
    keypadEl.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button)
            return;
        const { digit, action, op } = button.dataset;
        if (digit !== undefined) {
            inputDigit(digit);
        }
        else if (action !== undefined) {
            handleAction(action);
        }
        else if (op !== undefined) {
            handleOperator(op);
        }
        else {
            return;
        }
        render();
    });
    document.addEventListener("keydown", (event) => {
        const key = event.key;
        if (/^[0-9]$/.test(key)) {
            inputDigit(key);
        }
        else if (key === "." || key === ",") {
            inputDecimal();
        }
        else if (key === "+" || key === "-" || key === "*" || key === "/") {
            handleOperator(key);
        }
        else if (key === "Enter" || key === "=") {
            handleEquals();
        }
        else if (key === "Escape") {
            clearAll();
        }
        else if (key === "Backspace") {
            backspace();
        }
        else if (key === "%") {
            percentage();
        }
        else {
            return;
        }
        event.preventDefault();
        render();
    });
    render();
})();
//# sourceMappingURL=calculator.js.map