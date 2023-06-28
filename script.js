class Sudoku {
    constructor(symbols = "123456789", size = 9) {
        /* 1234 - ♠♣♦♥ - nswe - 0123456789abcdef - abcdefghijklmnopqrstuvwxyz */
        symbols = new Set(symbols.toString().split("")), size = Number(size);
        symbols = Array.from(symbols);
        if (typeof symbols !== "string") symbols = "123456789";
        if (!Number.isInteger(size) || size < 0) size = 9;

        size = size <= symbols.length ? size : symbols.length;
        this.sqrtSize = Math.floor(Math.sqrt(size));
        this.size = Math.pow(this.sqrtSize, 2);
        this.symbols = symbols.slice(0, this.size).split("");
        this.holes = 0.5;
        this.sudoku = []
        for (let i = 0; i < this.size; i++) this.sudoku[i] = [];
        for (let i = 0, l = this.size * this.size; i < l; i++) this.sudoku[Math.floor(i / this.size)][i % this.size] = null;
        this.makeFull();
        }
    makeFull() {
        for (let i = 0; i < this.sqrtSize; i++) this.generateBox(i);
        this.generateRest(0, this.sqrtSize);
        this.generateHoles();
        }
    generateBox(x) {
        let symbols2Use = this.getShuffledSymbols();
        for (let i = 0; i < this.size; i++)
            this.sudoku[x * this.sqrtSize + Math.floor(i / this.sqrtSize)][x * this.sqrtSize + (i % this.sqrtSize)] = symbols2Use.pop();
        }
    generateRest(x, y) {
        if (x == this.size - 1 && y == this.size) return true;
        if (y == this.size) {
            x++;
            y = 0;
            }
        if (typeof this.sudoku[x][y] === "string") return this.generateRest(x, y + 1);
        for (let symbol of this.getShuffledSymbols()) {
            if (this.safe(x, y, symbol)) {
                this.sudoku[x][y] = symbol;
                if (this.generateRest(x, y + 1)) return true;
                else this.sudoku[x][y] = null;
                }
            }
        return false;
        }
    getShuffledSymbols() {
        return [...this.symbols].sort(() => Math.round(Math.random() * 10) - 5);
        }
    safe(x, y, symbol) {
        let taken = new Set();
        for (let t = 0; t < this.size; t++) {
            taken.add(this.sudoku[x][t]);
            taken.add(this.sudoku[t][y]);
            taken.add(this.sudoku[Math.floor(x / this.sqrtSize) * this.sqrtSize + Math.floor(t / this.sqrtSize)][Math.floor(y / this.sqrtSize) * this.sqrtSize + (t % this.sqrtSize)]);
            }
        return !taken.has(symbol);
        }
    generateHoles() {
        let all = this.size * this.size, count = 0, x = null, y = null;
        while (count / all < this.holes) {
            x = Math.floor(Math.random() * this.size);
            y = Math.floor(Math.random() * this.size);
            if (this.sudoku[x][y] != null) {
                this.sudoku[x][y] = null;
                count++;
                }
            }
        }
    }
exitGame = () => window.location = "sqdexe.github.io";