class Sudoku {
    #size;
    #sqrtSize;
    #symbols;
    #holes;
    #board;

    constructor(symbols = "123456789", size = 9, holesFraction = 0.5) {
        /* 1234 - ♠♣♦♥ - nswe - 0123456789abcdef - abcdefghijklmnopqrstuvwxyz */
        /* Normalizes inputted values */
        symbols = Array.from(new Set(symbols.toString().split(''))), size = Number(size);
        if (typeof symbols !== "string")
            symbols = "123456789";
        if (!Number.isInteger(size) || size < 0)
            size = 9;
        size = size <= symbols.length ? size : symbols.length;

        /* Assigns to poles */
        this.#sqrtSize = Math.floor(Math.sqrt(size));
        this.#size = Math.pow(this.#sqrtSize, 2);
        this.#symbols = symbols.slice(0, this.#size).split('');
        this.#holes = holesFraction;

        /* Generates empty board */
        this.#board = []
        for (let i = 0; i < this.#size; i++)
            this.#board[i] = [];
        for (let i = 0, l = this.#size ** 2; i < l; i++)
            this.#board[Math.floor(i / this.#size)][i % this.#size] = null;

        /* Populates the board */
        for (let i = 0; i < this.#sqrtSize; i++)
            this.#generateBox(i);
        this.#generateRest(0, this.#sqrtSize);
        this.#generateHoles();
        }
    getSize() { return this.#size; }
    getSqrtSize() { return this.#sqrtSize; }
    getBoard(x, y) { return this.#board[x][y]; }
    getControlSum() { return this.#symbols.reduce((sum, elem) => sum + elem.codePointAt(0), 0); }
    #generateBox(x) {
        /* Generates diagonal box - no need for checking rows, and columns */
        let symbols2Use = this.#shuffledSymbols();
        for (let i = 0; i < this.#size; i++)
            this.#board[x * this.#sqrtSize + Math.floor(i / this.#sqrtSize)][x * this.#sqrtSize + (i % this.#sqrtSize)] = symbols2Use.pop();
        }
    #generateRest(x, y) {
        /* Rules for traversing board */
        if (x == this.#size - 1 && y == this.#size)
            return true;
        if (y == this.#size) {
            x++;
            y = 0;
            }
        if (typeof this.#board[x][y] === "string")
            return this.#generateRest(x, y + 1);

        /* Tries every symbol until good, return if not */
        for (let symbol of this.#shuffledSymbols()) {
            if (this.#safe(x, y, symbol)) {
                this.#board[x][y] = symbol;
                if (this.#generateRest(x, y + 1))
                    return true;
                else
                    this.#board[x][y] = null;
                }
            }
        return false;
        }
    #shuffledSymbols() {
        /* Shuffles and returns symbols */
        return this.#shuffle([...this.#symbols]);
        }
    #safe(x, y, symbol) {
        /* Checks if position is safe */
        let taken = new Set();
        for (let t = 0; t < this.#size; t++) {
            taken.add(this.#board[x][t]);
            taken.add(this.#board[t][y]);
            taken.add(this.#board[Math.floor(x / this.#sqrtSize) * this.#sqrtSize + Math.floor(t / this.#sqrtSize)][Math.floor(y / this.#sqrtSize) * this.#sqrtSize + (t % this.#sqrtSize)]);
            }
        return !taken.has(symbol);
        }
    #generateHoles() {
        /* Generates randomly ordered cells */
        let all = this.#size ** 2, count = 0, cells = new Array(this.#size ** 2), cell = null;
        for (let i = 0; i < all; i++) cells[i] = i;
        this.#shuffle(this.#shuffle(cells));

        /* Punches holes until one of conditions */
        while (count / all < this.#holes || cells.length == 0) {
            cell = cells.pop();
            this.#board[Math.floor(cell / this.#size)][cell % this.#size] = null;
            count++;
            }
        }
    #shuffle(array) {
        /* Quick algorithm for shuffling, spaced more evenly than Math.random */
        for (let i = array.length - 1, j = null; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
            }
        return array;
        }
    }
/* Useful variables */
const variables = Object.seal({
    sudoku: null,
    time: null,
    controlSum: null,
    sudokuArea: $("#sudoku-area"),
    overlay: $("#overlay"),
    infoBox: $("#info-box"),
    check: $(".check"),
    timer: $("#time"),
    transitionTime: Number.parseFloat($(":root").css("--transition-time")) * 1000,
    shakeTime: Number.parseFloat($(":root").css("--shake-time")) * 1000
    });
const exit = () => window.location = "https://sqdexe.github.io";
const colorText = () => {
    /* Colors the text */
    let mess = $("#message"), txt = mess.text();
    mess.empty();

    for (let letter of txt)
        mess.append($("<span></span>").text(letter));
    }
const generatePuzzle = () => {
    /* Clears the board, makes sudoku, prepares variables, and starts the timer */
    variables.sudokuArea.empty();
    variables.sudoku = new Sudoku();
    variables.time = Date.now() + variables.transitionTime;
    variables.controlSum = variables.sudoku.getControlSum();
    let sqrtSize = variables.sudoku.getSqrtSize();

    /* Populates the table, assigns big row */
    let table = $("<table></table>"), bigRow = bigCell = row = cell = input = null;
    for (let x = 0, y = i = j = rowNum = colNum = boxNum = null; x < sqrtSize; x++) {
        bigRow = $("<tr></tr>");
        
        /* Assigns big cell with table, calculates box number */
        for (y = 0; y < sqrtSize; y++) {
            boxNum = x * sqrtSize + y % sqrtSize;
            bigCell = $("<td></td>");
            bigCell.append($("<table></table>"));

            /* Assigns row */
            for (i = 0; i < sqrtSize; i++) {
                row = $("<tr></tr>");
                /* Creates input, calculates row, and column number */
                for (j = 0; j < sqrtSize; j++) {
                    rowNum = x * sqrtSize + i;
                    colNum = y * sqrtSize + j;

                    row.append($("<td></td>").append(constructInput(rowNum, colNum, boxNum)));
                    }
                bigCell.children().append(row);
                }
            bigRow.append(bigCell);
            }
        table.append(bigRow);
        }
    variables.sudokuArea.append(table);
    }
const constructInput = (r, c, b) => {
    /* Constructs input, and assigns attributes */
    input = $("<input>").addClass("field").attr({
        "type": "text",
        "maxlength": "1",
        "value": '',
        "data-row": r,
        "data-column": c,
        "data-box": b
        });

    /* Checks for empty cells */
    if (variables.sudoku.getBoard(r, c) != null)
        input.attr({
            "value": variables.sudoku.getBoard(r, c),
            "readonly": ''
            });

    return input;
    }
const checkFields = () => {
    /* Checks for empty cells */
    if ($(".field").filter((i, elem) => $(elem).val() == '').length == 0)
        variables.check.removeAttr("disabled").removeClass("disabled");
    else 
        variables.check.attr("disabled", '').addClass("disabled");
    }
const checkBoard = () => {
    /* Checks if values are correct */
    let sums = new Set([variables.controlSum]);
    for (let i = 0, symbol = null; i < variables.sudoku.getSize(); i++)
        for (data of ["row", "column", "box"])
            sums.add($(`.field[data-${data}="${i}"]`).toArray()
                .map(elem => $(elem).val().codePointAt(0))
                .reduce((sum, elem) => sum + elem, 0));
    if (sums.size != 1) 
        animateCheck();

    else {
        /* Ends the game */
        let time = Date.now() - variables.time, text = time < 99999999 ? (time / 1000).toFixed(2) : "+9999.99";
        variables.timer.text(text + " s");
        animateOverlay(true);
        animateInfoBox(true);
        }
    }
const animateCheck = () => {
    /* Animates check button */
    variables.check.attr("disabled", '');
    variables.check.addClass("animation-button-color");
    variables.check.parent().addClass("animation-button-shake");
    setTimeout(() => {
        variables.check.removeClass("animation-button-color");
        variables.check.parent().removeClass("animation-button-shake");
        variables.check.removeAttr("disabled");
        }, variables.shakeTime);
    }
const animateInfoBox = bool => {
    /* Animates info box */
    if (bool) {
        variables.infoBox.removeClass("animation-infobox-out");
        variables.infoBox.removeClass("hidden");
        variables.infoBox.addClass("animation-infobox-in");
        }
    else {
        variables.infoBox.removeClass("animation-infobox-in");
        variables.infoBox.addClass("animation-infobox-out");
        setTimeout (() => variables.infoBox.addClass("hidden"), variables.transitionTime);
        }
    }
const animateOverlay = bool => {
    /* Animates overlay */
    if (bool) {
        variables.overlay.removeClass("animation-overlay-out");
        variables.overlay.removeClass("hidden");
        variables.overlay.addClass("animation-overlay-in");
        }
    else {
        variables.overlay.removeClass("animation-overlay-in");
        variables.overlay.addClass("animation-overlay-out");
        setTimeout (() => variables.overlay.addClass("hidden"), variables.transitionTime);
        }
    }
const move = e => {
    switch (e.key) {
        case "ArrowLeft" : focus(e.target, 0, -1); break;
        case "ArrowDown" : focus(e.target, 1, 0); break;
        case "ArrowRight" : focus(e.target, 0, 1); break;
        case "ArrowUp" : focus(e.target, -1, 0); break;
        default : return;
        }
    }
const focus = (obj, x, y) => {
    let [row, col] = [Number(obj.dataset.row) + x, Number(obj.dataset.column) + y].map(num => clamp(num, 0, variables.sudoku.getSize() - 1));
    $(".field").filter(`[data-row="${row}"][data-column="${col}"]`).trigger("focus");
    }
const clamp = (num, min, max) => Math.min(Math.max(min, Number(num)), max);
const load = () => {
    animateOverlay(false);
    generatePuzzle();
    colorText();
    $(".play").click(() => {
        animateOverlay(false);
        animateInfoBox(false);
        generatePuzzle();
        });
    $(".field").on("input", checkFields);
    $(".field").on("keydown", Event => move(Event));
    $(".check").click(checkBoard);
    $(".end").click(exit);
    }
$(document).ready(load);