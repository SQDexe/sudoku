class Sudoku {
    constructor(symbols = "123456789", size = 9) {
        /* 1234 - ♠♣♦♥ - nswe - 0123456789abcdef - abcdefghijklmnopqrstuvwxyz */
        symbols = Array.from(new Set(symbols.toString().split(""))), size = Number(size);
        if (typeof symbols !== "string")
            symbols = "123456789";
        if (!Number.isInteger(size) || size < 0)
            size = 9;

        size = size <= symbols.length ? size : symbols.length;
        this.sqrtSize = Math.floor(Math.sqrt(size));
        this.size = Math.pow(this.sqrtSize, 2);
        this.symbols = symbols.slice(0, this.size).split("");
        this.holes = 0.5;
        this.sudoku = []
        for (let i = 0; i < this.size; i++)
            this.sudoku[i] = [];
        for (let i = 0, l = this.size * this.size; i < l; i++)
            this.sudoku[Math.floor(i / this.size)][i % this.size] = null;
        this.makeFull();
        }
    makeFull() {
        for (let i = 0; i < this.sqrtSize; i++)
            this.generateBox(i);
        this.generateRest(0, this.sqrtSize);
        this.generateHoles();
        }
    generateBox(x) {
        let symbols2Use = this.getShuffledSymbols();
        for (let i = 0; i < this.size; i++)
            this.sudoku[x * this.sqrtSize + Math.floor(i / this.sqrtSize)][x * this.sqrtSize + (i % this.sqrtSize)] = symbols2Use.pop();
        }
    generateRest(x, y) {
        if (x == this.size - 1 && y == this.size)
            return true;
        if (y == this.size) {
            x++;
            y = 0;
            }
        if (typeof this.sudoku[x][y] === "string")
            return this.generateRest(x, y + 1);
        for (let symbol of this.getShuffledSymbols()) {
            if (this.safe(x, y, symbol)) {
                this.sudoku[x][y] = symbol;
                if (this.generateRest(x, y + 1))
                    return true;
                else
                    this.sudoku[x][y] = null;
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
const variables = Object.seal({
    sudoku: null,
    sudokuArea: $("#sudoku-area"),
    overlay: $("#overlay"),
    infoBox: $("#info-box")
    });
exit = () => window.location = "https://sqdexe.github.io";
colorText = () => {
    let mess = $("#message"), txt = mess.text();
    mess.empty();
    for (let letter of txt)
        mess.append($("<span></span>").text(letter));
    }
generatePuzzle = () => {
    variables.sudokuArea.empty();
    variables.sudoku = new Sudoku();
    let table = $("<table></table>"), bigRow = bigCell = row = cell = input = null;
    for (let x = 0, y = i = j = rowNum = colNum = boxNum = null; x < variables.sudoku.sqrtSize; x++) {
        bigRow = $("<tr></tr>");
        for (y = 0; y < variables.sudoku.sqrtSize; y++) {
            boxNum = x * variables.sudoku.sqrtSize + y % variables.sudoku.sqrtSize;
            bigCell = $("<td></td>");
            bigCell.append($("<table></table>").attr("id", "b" + boxNum));
            for (i = 0; i < variables.sudoku.sqrtSize; i++) {
                row = $("<tr></tr>");
                for (j = 0; j < variables.sudoku.sqrtSize; j++) {
                    rowNum = x * variables.sudoku.sqrtSize + i;
                    colNum = y * variables.sudoku.sqrtSize + j;
                    input = $("<input>").attr({
                        "type": "text",
                        "maxlength": "1",
                        "value": ""
                        });
                    input.addClass("field").addClass("r" + rowNum).addClass("c" + colNum).addClass("b" + boxNum);
                    if (variables.sudoku.sudoku[rowNum][colNum] != null)
                        input.attr({
                            "value": variables.sudoku.sudoku[rowNum][colNum],
                            "readonly": ""
                            });
                    row.append($("<td></td>").append(input));
                    }
                bigCell.children().append(row);
                }
            bigRow.append(bigCell);
            }
        table.append(bigRow);
        }
    variables.sudokuArea.append(table);
    }
check = () => {
    let full = $(".field").filter(function(i) {$(this).val() == ""}).length == 0;
    if (full) {console.log($(".field").filter(function(i) {$(this).val() == ""}).length)}

    }
load = () => {
    variables.overlay.addClass("hidden");
    variables.infoBox.addClass("hidden");
    colorText();
    generatePuzzle();
    $(".play").click(generatePuzzle);
    $(".check").click(check);
    $(".end").click(exit);
    }
$(document).ready(load);