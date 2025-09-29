// --- Configuración de Supabase ---
// ¡IMPORTANTE! Debes reemplazar estos valores con tus propias credenciales de Supabase.
// Te explicaré cómo obtenerlas al final.
const SUPABASE_URL = 'TU_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_KEY';

let supabaseClient = null;
// Solo inicializa si las credenciales han sido reemplazadas
if (SUPABASE_URL !== 'TU_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'TU_SUPABASE_KEY') {
    // 'supabase' es el objeto global que nos da el script CDN
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Cliente de Supabase inicializado.');
} else {
    console.warn('Las credenciales de Supabase no están configuradas. El historial de cálculos estará desactivado.');
}
// --- Fin de la configuración de Supabase ---

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

    // Capturamos los valores para el historial antes de que se modifiquen
    const firstOp = firstOperand;
    const op = operator;
    const secondOp = secondOperand;

    switch (op) {
        case '+':
            result = firstOp + secondOp;
            break;
        case '-':
            result = firstOp - secondOp;
            break;
        case '*':
            result = firstOp * secondOp;
            break;
        case '/':
            if (secondOp === 0) {
                alert("Error: No se puede dividir por cero.");
                clearDisplay();
                return;
            }
            result = firstOp / secondOp;
            break;
        default:
            return;
    }

    // Formatear el cálculo para el historial
    const calculationText = `${firstOp} ${op} ${secondOp} = ${result}`;

    // Guardar en Supabase (si está configurado)
    saveCalculation(calculationText);

    currentInput = result.toString();
    operator = null;
    firstOperand = null;
    shouldResetDisplay = true;
    updateDisplay();
}

// Guarda un cálculo en la tabla 'calculations' de Supabase
async function saveCalculation(calculationText) {
    if (!supabaseClient) {
        return; // No hacer nada si el cliente no está inicializado
    }

    try {
        const { error } = await supabaseClient
            .from('calculations')
            .insert([{ calculation: calculationText }]);

        if (error) {
            console.error('Error al guardar el cálculo:', error.message);
        } else {
            console.log('Cálculo guardado exitosamente.');
            await loadHistory(); // Recargar el historial para mostrar el nuevo cálculo
        }
    } catch (err) {
        console.error('Error inesperado al intentar guardar el cálculo:', err.message);
    }
}

// Carga el historial de cálculos desde Supabase y lo muestra en la página
async function loadHistory() {
    if (!supabaseClient) {
        return; // No hacer nada si el cliente no está inicializado
    }

    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<li>Cargando...</li>'; // Mostrar mensaje de carga

    try {
        const { data, error } = await supabaseClient
            .from('calculations')
            .select('calculation, created_at')
            .order('created_at', { ascending: false })
            .limit(15);

        if (error) {
            console.error('Error al cargar el historial:', error.message);
            historyList.innerHTML = '<li>Error al cargar el historial.</li>';
            return;
        }

        historyList.innerHTML = ''; // Limpiar la lista
        if (data.length === 0) {
            historyList.innerHTML = '<li>No hay historial todavía.</li>';
        } else {
            data.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item.calculation;
                historyList.appendChild(listItem);
            });
        }
    } catch (err) {
        console.error('Error inesperado al cargar el historial:', err.message);
        historyList.innerHTML = '<li>Error inesperado.</li>';
    }
}

// Inicializar la aplicación
function init() {
    updateDisplay();
    loadHistory();
}

init();