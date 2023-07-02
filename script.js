class Sudoku {
    constructor(symbols = "123456789", size = 9, holesFraction = 0.5) {
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
        this.holes = holesFraction;
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
        return this.shuffle([...this.symbols]);
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
        let all = this.size * this.size, count = 0, cells = new Array(this.size * this.size), cell = null;
        for (let i = 0; i < all; i++) cells[i] = i;
        this.shuffle(this.shuffle(cells));
        while (count / all < this.holes) {
            cell = cells.pop();
            this.sudoku[Math.floor(cell / this.size)][cell % this.size] = null;
            count++;
            if (cells.length == 0) break;
            }
        }
    shuffle(array) {
        for (let i = array.length - 1, j = null; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
            }
        return array;
        }
    }
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
    let mess = $("#message"), txt = mess.text();
    mess.empty();
    for (let letter of txt)
        mess.append($("<span></span>").text(letter));
    }
const generatePuzzle = () => {
    variables.sudokuArea.empty();
    variables.sudoku = new Sudoku();
    variables.time = Date.now() + variables.transitionTime;
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

    variables.controlSum = variables.sudoku.symbols.reduce((sum, elem) => sum + elem.codePointAt(0), 0);
    }
const check = () => {
    if ($('input').filter((i, elem) => $(elem).val() == "").length != 0) 
        animateCheck();
    else {
        let sums = new Set([variables.controlSum]);
        for (let i = 0, symbol = null; i < variables.sudoku.size; i++)
            for (symbol of [".r", ".c", ".b"])
                sums.add($(symbol + i).toArray().map(elem => $(elem).val().codePointAt(0)).reduce((sum, elem) => sum + elem, 0));
        if (sums.size != 1) 
            animateCheck();
        else {
            let time = Date.now() - variables.time, text = time < 999999999 ? (time / 1000).toFixed(2) : "+99999.99";
            variables.timer.text(text + " s");
            animateOverlay(true);
            animateInfoBox(true);
            }
        }
    }
const animateCheck = () => {
    variables.check.attr("disabled", "");
    variables.check.addClass("animation-button-color");
    variables.check.parent().addClass("animation-button-shake");
    setTimeout(() => {
        variables.check.removeClass("animation-button-color");
        variables.check.parent().removeClass("animation-button-shake");
        variables.check.removeAttr("disabled");
        }, variables.shakeTime);
    }
const animateInfoBox = bool => {
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
const load = () => {
    animateOverlay(false);
    generatePuzzle();
    colorText();
    $(".play").click(() => {
        animateOverlay(false);
        animateInfoBox(false);
        generatePuzzle();
        });
    $(".check").click(check);
    $(".end").click(exit);
    }
$(document).ready(load);