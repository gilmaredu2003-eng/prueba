const display = document.getElementById('display');
let currentInput = '0';
let operator = null;
let firstOperand = null;
let shouldResetDisplay = false;

function updateDisplay() {
    display.textContent = currentInput;
}

function clearDisplay() {
    currentInput = '0';
    operator = null;
    firstOperand = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function appendNumber(number) {
    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
    }
    if (currentInput === '0' && number !== '.') {
        currentInput = number;
    } else if (number === '.' && currentInput.includes('.')) {
        return; // No permitir más de un punto decimal
    } else {
        currentInput += number;
    }
    updateDisplay();
}

function appendOperator(op) {
    if (operator !== null && !shouldResetDisplay) {
        calculateResult();
    }
    firstOperand = parseFloat(currentInput);
    operator = op;
    shouldResetDisplay = true;
}

function calculateResult() {
    if (operator === null || shouldResetDisplay) {
        return;
    }
    const secondOperand = parseFloat(currentInput);
    let result = 0;

    switch (operator) {
        case '+':
            result = firstOperand + secondOperand;
            break;
        case '-':
            result = firstOperand - secondOperand;
            break;
        case '*':
            result = firstOperand * secondOperand;
            break;
        case '/':
            if (secondOperand === 0) {
                alert("Error: No se puede dividir por cero.");
                clearDisplay();
                return;
            }
            result = firstOperand / secondOperand;
            break;
        default:
            return;
    }

    currentInput = result.toString();
    operator = null;
    firstOperand = null;
    shouldResetDisplay = true;
    updateDisplay();
}

// Inicializar la pantalla al cargar
updateDisplay();