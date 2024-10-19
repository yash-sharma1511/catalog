const fs = require('fs');

// Step 1: Decode Y values based on base
function decodeY(base, value) {
    return parseInt(value, base);
}

// Step 2: Parse Input JSON
function parseInput(filename) {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    const { n, k } = data.keys; // Get n and k

    let points = [];  // Store points as (x, y) pairs
    for (let key in data) {
        if (key !== 'keys') {
            const x = parseInt(key);
            const base = parseInt(data[key].base);
            const y = decodeY(base, data[key].value);
            points.push([x, y]);
        }
    }
    return { points, k };
}

// Step 3: Gaussian Elimination Helper Functions

// Function to perform row swapping in a matrix
function swapRows(matrix, i, j) {
    const temp = matrix[i];
    matrix[i] = matrix[j];
    matrix[j] = temp;
}

// Function to perform Gaussian Elimination
function gaussianElimination(matrix, result) {
    const n = matrix.length;

    for (let i = 0; i < n; i++) {
        // Search for the maximum in this column
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
                maxRow = k;
            }
        }

        // Swap rows
        swapRows(matrix, i, maxRow);
        [result[i], result[maxRow]] = [result[maxRow], result[i]];

        // Make all rows below this one 0 in the current column
        for (let k = i + 1; k < n; k++) {
            const c = -matrix[k][i] / matrix[i][i];
            for (let j = i; j < n; j++) {
                if (i === j) {
                    matrix[k][j] = 0;
                } else {
                    matrix[k][j] += c * matrix[i][j];
                }
            }
            result[k] += c * result[i];
        }
    }

    // Solve equation Ax=b for an upper triangular matrix
    const coefficients = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        coefficients[i] = result[i] / matrix[i][i];
        for (let k = i - 1; k >= 0; k--) {
            result[k] -= matrix[k][i] * coefficients[i];
        }
    }
    return coefficients;
}

// Step 4: Create the matrix for solving the polynomial coefficients
function createMatrix(points, k) {
    const matrix = [];
    const result = [];

    // Build the matrix and result vector
    for (let i = 0; i < k; i++) {
        const [x, y] = points[i];
        const row = [];
        for (let j = k - 1; j >= 0; j--) {
            row.push(Math.pow(x, j));  // Fill row with x^m, x^(m-1), ..., x, 1
        }
        matrix.push(row);
        result.push(y);
    }

    return { matrix, result };
}

// Step 5: Main Function to Solve for Constant Term (c)
function solvePolynomial(filename) {
    const { points, k } = parseInput(filename);

    // Create matrix and result vector for the system of equations
    const { matrix, result } = createMatrix(points, k);

    // Apply Gaussian Elimination to solve for coefficients
    const coefficients = gaussianElimination(matrix, result);

    // The constant term is the last coefficient
    console.log(`The secret (constant term c) is: ${Math.round(coefficients[k - 1])}`);
}

// Call the function with the JSON file (e.g., 'input.json')
solvePolynomial('input.json');