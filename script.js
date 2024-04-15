"use strict";
class Sudoku {
    #size;
    #sqrtSize;
    #symbols;
    #seed;
    #holes;
    #board;
    #fullBoard;
    #truthBoard;

    constructor(options = {}) {
        /* 1234 - ♠♣♦♥ - nswe - 0123456789abcdef - abcdefghijklmnopqrstuvwxyz */
        let symbols = "123456789".split(''), size = 9, holes = 0.5, seed = options.seed ?? null;

        /* Normalizes inputted values */
        let tmp = null;
        try {
            tmp = Array.from(new Set(options.symbols.split('')));
            symbols = 4 <= tmp.length ?
                tmp :
                symbols;
            } catch (e) { console.log(e); }

        try {
            tmp = Math.floor(Number(options.size));
            size = 4 <= tmp ?
                tmp :
                size;
            } catch (e) { console.log(e); }
        size = Math.min(size, symbols.length);

        try {
            tmp = Number(options.holes);
            holes = (0 <= tmp && tmp <= 1) ?
                tmp :
                holes;
            } catch (e) { console.log(e); }

        /* Seed random values */
        try {
            if (seed == null) 
                seed = Math.random();
            Math.seedrandom(seed);
            }
        catch (e) {
            console.log(e);
            seed = null;
            }

        /* Assigns to poles */
        this.#sqrtSize = Math.floor(Math.sqrt(size));
        this.#size = Math.pow(this.#sqrtSize, 2);
        this.#holes = holes;
        this.#symbols = symbols.slice(0, this.#size);
        this.#seed = seed;

        do {
            /* Generates empty boards */
            this.#fullBoard = Array.from({length: this.#size}).map(() => Array.from({length: this.#size}).map(() => null));
            this.#truthBoard = this.#fullBoard.map(elem => elem.map(() => false));

            /* Populates the board, repeats if necessary */
            for (let i = 0; i < this.#sqrtSize; i++)
                this.#generateBox(i);
            } while (!this.#generateRest(0, this.#sqrtSize));
        
        /* Prepares it for use, and beforehand punches holes */ 
        this.#generateHoles();
        this.#board = this.#truthBoard.map((elem, i) => elem.map((e, j) => e ?
            null :
            this.#fullBoard[i][j]));
        }
    getSize() { return this.#size; }
    getSqrtSize() { return this.#sqrtSize; }
    getSeed() { return this.#seed; }
    get(x, y) { return this.#board[x][y]; }
    set(x, y, val) {
        /* Sets cell if coditions are met */
        if ((typeof val === "string" && val.length == 1 || val == null) && this.#truthBoard[x][y])
            this.#board[x][y] = val;
        }
    checkFields() {
        /* Checks if all fields are filled */
        return this.#board.every(elem => elem.every(e => e != null));
        }    
    checkBoard() {
        /* Checks if all requirements are met */
        let sums = Array.from({length: this.#size}).map(() => 0);
        for (let i = 0, j = null; i < this.#size; i++) 
            for (j = 0; j < this.#size; j++) {
                sums[i] += this.#board[i][j].codePointAt(0);
                sums[i] += this.#board[j][i].codePointAt(0);
                sums[i] += this.#board[(Math.floor(i / this.#sqrtSize) * this.#sqrtSize + Math.floor(j/ this.#sqrtSize))][((i % this.#sqrtSize) * this.#sqrtSize + j % this.#sqrtSize)].codePointAt(0);
                }
        return sums.every(e => e == this.#controlSum() * 3);
        }
    checkWhereverIndentical() { return this.#board.every((elem, i) => elem.every((e, j) => e == this.#fullBoard[i][j])); }
    #controlSum() {
        /* Calculates control sum */
        return this.#symbols.reduce((sum, elem) => sum + elem.codePointAt(0), 0);
        }
    #generateBox(x) {
        /* Generates diagonal box - no need for checking rows, and columns */
        let symbols2Use = this.#shuffledSymbols();
        for (let i = 0; i < this.#size; i++)
            this.#fullBoard[x * this.#sqrtSize + Math.floor(i / this.#sqrtSize)][x * this.#sqrtSize + (i % this.#sqrtSize)] = symbols2Use.pop();
        }
    #generateRest(x, y) {
        /* Rules for traversing board */
        if (x == this.#size - 1 && y == this.#size)
            return true;
        if (y == this.#size) {
            x++;
            y = 0;
            }
        if (typeof this.#fullBoard[x][y] === "string")
            return this.#generateRest(x, y + 1);

        /* Tries every symbol until good, return if not */
        for (let symbol of this.#shuffledSymbols()) {
            if (this.#safe(x, y, symbol)) {
                this.#fullBoard[x][y] = symbol;
                if (this.#generateRest(x, y + 1))
                    return true;
                else
                    this.#fullBoard[x][y] = null;
                }
            }
        return false;
        }
    #shuffledSymbols() {
        /* Shuffles and returns symbols */
        return this.#shuffle(this.#symbols, 3);
        }
    #safe(x, y, symbol) {
        /* Checks if position is safe */
        let taken = new Set();
        for (let t = 0; t < this.#size; t++) {
            taken.add(this.#fullBoard[x][t]);
            taken.add(this.#fullBoard[t][y]);
            taken.add(this.#fullBoard[Math.floor(x / this.#sqrtSize) * this.#sqrtSize + Math.floor(t / this.#sqrtSize)][Math.floor(y / this.#sqrtSize) * this.#sqrtSize + (t % this.#sqrtSize)]);
            }
        return !taken.has(symbol);
        }
    #generateHoles() {
        /* Generates randomly ordered cells */
        let all = this.#size ** 2, cells = this.#shuffle(Array.from({length: all}).map((_, i) => i), 3);

        /* Punches holes until one of conditions */
        let [count, cell] = [0, null];
        while (count / all < this.#holes && cells.length != 0) {
            cell = cells.pop();
            this.#truthBoard[Math.floor(cell / this.#size)][cell % this.#size] = true;
            count++;
            }
        }
    #shuffle(array, times = 1) {
        /* Quick algorithm for shuffling, spaced more evenly than Math.random */
        array = [...array];
        for (let [t, i, j] = [0, null, null]; t < times; t++) 
            for (i = array.length - 1; i > 0; i--) {
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
        mess.append($("<span>")
            .text(letter));
    }
const generatePuzzle = () => {
    /* Clears the board, makes sudoku, prepares variables, and starts the timer */
    variables.sudokuArea.empty();
    variables.sudoku = new Sudoku();
    variables.time = Date.now() + variables.transitionTime;
    let sqrtSize = variables.sudoku.getSqrtSize();

    /* Populates the table, assigns big row */
    let [table, bigRow, bigCell, row, cell, input] = [$("<table>"), null, null, null, null, null];
    for (let [x, y, i, j, rowNum, colNum, boxNum] = [0, null, null, null, null, null, null]; x < sqrtSize; x++) {
        bigRow = $("<tr>");
        
        /* Assigns big cell with table, calculates box number */
        for (y = 0; y < sqrtSize; y++) {
            boxNum = x * sqrtSize + y % sqrtSize;
            bigCell = $("<td>");
            bigCell.append($("<table>"));

            /* Assigns row */
            for (i = 0; i < sqrtSize; i++) {
                row = $("<tr>");
                /* Creates input, calculates row, and column number */
                for (j = 0; j < sqrtSize; j++) {
                    rowNum = x * sqrtSize + i;
                    colNum = y * sqrtSize + j;

                    row.append($("<td>")
                        .append(constructInput(rowNum, colNum, boxNum))
                        );
                    }
                bigCell.children().append(row);
                }
            bigRow.append(bigCell);
            }
        table.append(bigRow);
        }
    variables.sudokuArea.append(table);
    bindFields();
    }
const constructInput = (r, c, b) => {
    /* Constructs input, and assigns attributes */
    let input = $("<input>")
        .addClass("field")
        .attr({
            "type": "text",
            "maxlength": "1",
            "value": '',
            "data-row": r,
            "data-column": c,
            "data-box": b
            });

    /* Checks for empty cells */
    if (variables.sudoku.get(r, c) != null)
        input.attr("value", variables.sudoku.get(r, c)).prop("readonly", true);

    return input;
    }
const checkInputs = () => {
    /* Checks for empty cells */
    if (variables.sudoku.checkFields())
        variables.check.prop("disabled", false).removeClass("disabled");
    else 
        variables.check.prop("disabled", true).addClass("disabled");
    }
const check = () => {
    /* Checks if values are correct */
    if (!variables.sudoku.checkBoard()) 
        animateCheck();
    else {
        /* Ends the game */
        let time = Date.now() - variables.time,
            text = time < 99999999 ?
                (time / 1000).toFixed(2) :
                "+9999.99";
        variables.timer.text(text + " s");
        console.log(variables.sudoku.checkWhereverIndentical());
        animateOverlay(true);
        animateInfoBox(true);
        }
    }
const sendData = e => {
    /* Keeps DOM, and virtual boards synchronised */
    let val = $(e.target).val();
    variables.sudoku.set(e.target.dataset.row, e.target.dataset.column, val != "" ?
        val :
        null);
    }
const move = e => {
    /* Moves focus with arrow keys */
    switch (e.key) {
        case "ArrowLeft" : focus(e.target, 0, -1); break;
        case "ArrowDown" : focus(e.target, 1, 0); break;
        case "ArrowRight" : focus(e.target, 0, 1); break;
        case "ArrowUp" : focus(e.target, -1, 0); break;
        default : return;
        }
    }
const focus = (obj, x, y) => {
    /* Takes x, and y coordinates to change focus */
    let [row, col] = [Number(obj.dataset.row) + x, Number(obj.dataset.column) + y].map(num => clamp(num, 0, variables.sudoku.getSize() - 1));
    $(".field").filter(`[data-row="${row}"][data-column="${col}"]`).trigger("focus");
    }
const clamp = (num, min, max) => Math.min(Math.max(min, Number(num)), max);
const animateCheck = () => {
    /* Animates check button */
    variables.check.prop("disabled", true);
    variables.check.addClass("animation-button-color");
    variables.check.parent().addClass("animation-button-shake");
    setTimeout(() => {
        variables.check.removeClass("animation-button-color");
        variables.check.parent().removeClass("animation-button-shake");
        variables.check.prop("disabled", false);
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
const bindFields = () => {
    /* Binds for input fields */
    $(".field").on("keydown", Event => move(Event));
    $(".field:not([readonly])").on("input", Event => {
        sendData(Event);
        checkInputs();
        });
    }
const load = () => {
    /* Starts game */
    animateOverlay(false);
    generatePuzzle();
    colorText();

    /* Binds events  */
    $(".play").click(() => {
        animateOverlay(false);
        animateInfoBox(false);
        generatePuzzle();
        });
    $(".check").click(check);
    $(".end").click(exit);
    }
$(document).ready(load);