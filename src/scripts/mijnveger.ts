import { GameEndDetails } from "./types";

export class Mijnveger extends EventTarget {
    private tableElement: HTMLTableElement;
    private width: number;
    private height: number;
    private numberOfMines: number;

    private numberOfCells: number;
    private mines: boolean[];
    private flags: boolean[];
    private discovered: boolean[];
    private discoveredNumbers: number[];
    private cellElements: HTMLTableCellElement[];

    private timerElement: HTMLTableCellElement;
    private boardSizeElement: HTMLTableCellElement;
    private numberOfFlagsElement: HTMLTableCellElement;

    private startTime: number | undefined;
    private stopTime: number | undefined;
    private timerInterval: number | undefined;
    private isPlayable: boolean = false;


    /**
     * Initializes a new instance of the Mijnveger class.
     * @param params The parameters for initializing the game.
     * @param params.tableElement The table element where the game will be displayed.
     * @param params.width The width of the game board.
     * @param params.height The height of the game board.
     * @param params.numberOfMines The number of mines on the board.
     */
    constructor({ tableElement, width, height, numberOfMines }: { tableElement: HTMLTableElement; width: number; height: number; numberOfMines: number; }) {
        super();

        this.tableElement = tableElement;
        // Prevent right-click from doing anything on the minesweeper board
        this.tableElement.addEventListener("contextmenu", (event: MouseEvent) => event.preventDefault());

        this.height = height;
        this.width = width;
        this.numberOfMines = numberOfMines;

        this.numberOfCells = width * height;

        if (this.numberOfMines > this.numberOfCells - 9) throw new Error("numberOfMines is higher than the maximum possible spaces on the board. Please increase the width/height or reduce the number of mines.");

        this.mines = Array(this.numberOfCells).fill(false);
        this.flags = Array(this.numberOfCells).fill(false);
        this.discovered = Array(this.numberOfCells).fill(false);
        this.discoveredNumbers = Array(this.numberOfCells).fill(-1);
        this.cellElements = [];

        this.timerElement = document.createElement("th");
        this.boardSizeElement = document.createElement("th");
        this.numberOfFlagsElement = document.createElement("th");
        this.populateTableHeader();

        this.createTableBody();

        this.isPlayable = true;
    }


    /**
     * Populates the table header with time, board size, and flag count elements.
     */
    private populateTableHeader = (): void => {
        this.timerElement.innerText = "00:00";
        this.boardSizeElement.innerText = `${this.width}x${this.height}`;
        this.updateNumberOfFlagsElement();

        // The width of the elements in the table header is one-third; boardSizeElement is wider if it is not exactly divisible by three
        const thWidth = Math.floor(this.width / 3);
        this.timerElement.colSpan = thWidth;
        this.boardSizeElement.colSpan = this.width - thWidth * 2;
        this.numberOfFlagsElement.colSpan = thWidth;

        const tableHead = document.createElement("thead");
        const tableRow = document.createElement("tr");

        tableRow.appendChild(this.timerElement);
        tableRow.appendChild(this.boardSizeElement);
        tableRow.appendChild(this.numberOfFlagsElement);

        tableHead.appendChild(tableRow);
        this.tableElement.appendChild(tableHead);
    }


    /**
     * Creates the table body (the game board) with clickable cells.
     */
    private createTableBody = (): void => {
        const tableBody = document.createElement("tbody");

        let index = 0;

        for (let i = 0; i < this.height; i++) {
            const tr = document.createElement("tr");

            for (let j = 0; j < this.width; j++) {
                const td = document.createElement("td");

                td.dataset.index = index.toString();
                td.addEventListener("click", this.onLeftClick);
                td.addEventListener("contextmenu", this.onRightClick);
                this.cellElements.push(td);
                tr.appendChild(td);

                index++;
            }
            tableBody.appendChild(tr);
        }
        this.tableElement.appendChild(tableBody);
    }


    /**
     * Handles the left-click event on a cell from an event listener, extracts the index from the clicked element and calls leftClick.
     * @param event The click event.
     */
    private onLeftClick = (event: MouseEvent): void => {
        if (!this.isPlayable) return;

        if (Math.random() < .002) this.jumpscare();

        if (!(event.target instanceof HTMLTableCellElement)) return;
        if (!event.target.dataset.index) return;
        const clickedIndex = parseInt(event.target.dataset.index);

        this.leftClick(clickedIndex);
    }


    /**
     * Handles the left-click event on a cell, revealing the cell or the surrounding cells.
     * @param index The index that is clicked on.
     */
    public leftClick = (index: number): void => {
        // If you click on a flag, nothing happens
        if (this.flags[index]) return;

        // If it is the first click, determine where the mines are located depending on where the click was made
        if (this.discovered.every((value) => value === false)) this.generateMines(index);

        // If the cell is already discovered, check if it is saturated with the number of flags around it to reveal more cells
        if (this.discovered[index]) return this.revealAdditionalCells(index);

        // Otherwise, reveal this cell
        return this.revealCell(index);
    }


    /**
     * Handles the right-click event on a cell from an event listener, extracts the index from the clicked element and calls rightClick.
     * @param event The right-click event.
     */
    private onRightClick = (event: MouseEvent): void => {
        // Prevent context menu
        event.preventDefault();

        if (!this.isPlayable) return;

        if (Math.random() < .002) this.jumpscare();

        if (!(event.target instanceof HTMLTableCellElement)) return;
        if (!event.target.dataset.index) return;

        const clickedIndex = parseInt(event.target.dataset.index);

        this.rightClick(clickedIndex);
    }


    /**
     * Handles the right-click event on a cell, toggling a flag on or off.
     * @param index The index that is clicked on.
     */
    public rightClick = (index: number): void => {
        // If it is a discovered cell, do nothing
        if (this.discovered[index]) return;

        // Toggle the flag class on the clicked cell and add/remove it to/from the flags list
        this.flags[index] = !this.flags[index];
        this.cellElements[index].classList.toggle("flag");

        // Update the flag counter
        this.updateNumberOfFlagsElement();
    }

    /**
     * Generates the mines on the board, ensuring that the first clicked cell and its surrounding cells are not mines.
     * @param clickedIndex The index of the first clicked cell.
     */
    private generateMines = (clickedIndex: number): void => {
        // Determine how many cells can have mines, depending on whether the click is on the edge of the board
        let numberOfCellsToGenerate = this.numberOfCells - 9;
        if (clickedIndex < this.width || clickedIndex > this.numberOfCells - this.width) numberOfCellsToGenerate += 3;
        if ((clickedIndex + 1) % this.width === 0 || clickedIndex % this.width === 0) numberOfCellsToGenerate += 3;
        if (numberOfCellsToGenerate === this.numberOfCells - 3) numberOfCellsToGenerate -= 1;

        // Generate a random number for each cell that needs to be generated
        const randomNumbers = Array.from(Array(numberOfCellsToGenerate), () => Math.random());
        // Determine the cutoff number: the number such that the same number of random values fall below it as the number of mines needed
        const cutoffNumber = Array.from(randomNumbers).sort()[this.numberOfMines - 1];

        // Determine which indices should not contain mines (those surrounding the clicked index)
        const neighboringIndices = this.determineNeighboringIndices(clickedIndex);

        // Add a 1 to the array with random numbers for the indexes around the clicked index so that this value will not be lower than the cutoffNumber and therefore will not become a mine
        neighboringIndices.forEach((neighborIndex) => randomNumbers.splice(neighborIndex, 0, 1));

        // Fill the mines array with the boolean indicating whether the random number at the same position is higher than or equal to the cutoffNumber
        this.mines = this.mines.map((_value, index) => randomNumbers[index] <= cutoffNumber);

        // Start the timer
        this.startTimer();
    }


    /**
     * Reveals the clicked cell. If it is a mine, the game ends.
     * If the cell is not a mine and has no neighboring mines, adjacent cells are also revealed.
     * @param clickedIndex The index of the clicked cell.
     */
    private revealCell = (clickedIndex: number): void => {
        const clickedElement = this.cellElements[clickedIndex];

        // If the cell is a mine, it's game over
        if (this.mines[clickedIndex]) return this.gameOver(clickedElement);

        // If the cell is already discovered, nothing happens
        if (this.discovered[clickedIndex]) return;

        // Remove the flag if it was placed on this cell
        if (this.flags[clickedIndex]) {
            clickedElement.classList.remove("flag");
            this.flags[clickedIndex] = false;
            this.updateNumberOfFlagsElement();
        }

        // Count how many mines are in the cells next to this cell
        const neighboringIndices = this.determineNeighboringIndices(clickedIndex);
        const numberOfNeighboringMines = neighboringIndices.filter((index) => this.mines[index]).length;

        // Mark this cell as discovered
        this.discovered[clickedIndex] = true;
        this.discoveredNumbers[clickedIndex] = numberOfNeighboringMines;

        // Style the element as a discovered cell
        clickedElement.classList.add("discovered");

        if (numberOfNeighboringMines > 0) {
            // If there are mines next to this cell, give this cell the appropriate class
            const numberOfMinesClasses = ["one", "two", "three", "four", "five", "six", "seven", "eight"];
            clickedElement.classList.add(numberOfMinesClasses[numberOfNeighboringMines - 1]);
        }

        // If all cells without a mine are discovered, the game is over
        if (this.discovered.every((value, index) => this.mines[index] !== value)) return this.gameWon();

        // If there are no mines next to this cell, reveal the adjacent cells
        if (numberOfNeighboringMines === 0) {
            neighboringIndices.forEach((index) => {
                if (!this.discovered[index]) this.revealCell(index);
            });
        }
    }


    /**
     * Reveals additional cells if the number of neighboring flags equals the number of neighboring mines.
     * @param clickedIndex The index of the clicked cell.
     */
    private revealAdditionalCells = (clickedIndex: number): void => {
        // Count how many mines are in the cells adjacent to this cell
        const neighboringIndices = this.determineNeighboringIndices(clickedIndex);
        const neighboringMines = neighboringIndices.filter((index) => this.mines[index]);

        // If this cell has no neighboring mines, there's not much to reveal
        if (neighboringMines.length === 0) return;

        // Check which flags are in the cells adjacent to this cell
        const neighboringFlags = neighboringIndices.filter((index) => this.flags[index]);

        // If the number of neighboring flags equals the number of neighboring mines, reveal the cells without a flag
        if (neighboringMines.length === neighboringFlags.length) {
            neighboringIndices.forEach((index) => {
                if (!this.flags[index]) this.revealCell(index);
            });
        }
    }


    /**
     * Determines the indices of the celss adjacent to a given index.
     * Ensures that the indices are within the board and not outside of it.
     * @param index The index of the cell.
     * @returns An array of indices corresponding to the neighboring cells, including the index of the given cell.
     */
    private determineNeighboringIndices = (index: number): number[] => {
        const neighboringIndices: number[] = [];

        // checks if the neighboring indices are within the board and not outside of it
        if (index > this.width - 1 && index % this.width !== 0) neighboringIndices.push(index - this.width - 1); // top left
        if (index > this.width - 1) neighboringIndices.push(index - this.width); // top middle
        if (index > this.width - 1 && (index + 1) % this.width !== 0) neighboringIndices.push(index - this.width + 1); // top right

        if (index % this.width !== 0) neighboringIndices.push(index - 1); // middle left
        neighboringIndices.push(index); // middle middle
        if ((index + 1) % this.width !== 0) neighboringIndices.push(index + 1); // middle right

        if (index < this.numberOfCells - this.width && index % this.width !== 0) neighboringIndices.push(index + this.width - 1); // bottom left
        if (index < this.numberOfCells - this.width) neighboringIndices.push(index + this.width); // bottom middle
        if (index < this.numberOfCells - this.width && (index + 1) % this.width !== 0) neighboringIndices.push(index + this.width + 1); // bottom right

        return neighboringIndices;
    }


    /**
     * Starts the game timer.
     */
    private startTimer = (): void => {
        this.startTime = Date.now();
        this.timerInterval = setInterval(this.updateTimerElement, 1e3);
    }


    /**
     * Stops the game timer.
     */
    private stopTimer = (): void => {
        this.stopTime = Date.now();
        if (!this.startTime) return;

        clearInterval(this.timerInterval);

        const elapsedTime = this.stopTime - this.startTime;

        const milliseconds = elapsedTime % 1000;
        const seconds = ((elapsedTime - milliseconds) / 1000) % 60;
        const minutes = (((elapsedTime - milliseconds) / 1000) - seconds) / 60;

        let millisecondsString = milliseconds < 100 ? "0" + milliseconds : milliseconds;
        millisecondsString = milliseconds < 10 ? "0" + millisecondsString : millisecondsString;

        const readableTime = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}.${millisecondsString}`;

        this.timerElement.innerText = readableTime;
    }


    /**
     * Updates the element displaying the timer.
     */
    private updateTimerElement = (): void => {
        if (!this.startTime) {
            this.timerElement.innerText = "00:00";
            return;
        }
        const elapsedTimeInSeconds = Math.floor((Date.now() - this.startTime) / 1000);

        const seconds = elapsedTimeInSeconds % 60;
        const minutes = Math.floor(elapsedTimeInSeconds / 60);
        const readableTime = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

        this.timerElement.innerText = readableTime;
    }


    /**
     * Updates the element displaying the number of flags currently placed.
     */
    private updateNumberOfFlagsElement = (): void => {
        this.numberOfFlagsElement.innerText = `${this.flags.filter((value) => value).length}/${this.numberOfMines}`;
    }


    /**
     * Emits a gameover event and prevents further playing.
     * @param clickedElement The element which was clicked last.
     */
    private gameOver = (clickedElement: HTMLTableCellElement): void => {
        this.isPlayable = false;
        this.stopTimer();
        this.tableElement.classList.add("unplayable");

        clickedElement.classList.add("wrong");
        this.flags.forEach((value, index) => {
            if (value && !this.mines[index]) this.cellElements[index].classList.add("wrong")
        });

        // Add a mine to every mine not covered by a flag
        this.mines.forEach((value, index) => {
            if (value && !this.flags[index]) this.cellElements[index].classList.add("mine");
        });

        const eventDetails: GameEndDetails = {
            elapsedTime: this.stopTime && this.startTime ? this.stopTime - this.startTime : -1,
            mineCells: this.cellElements.filter((_value, index) => this.mines[index]),
            discoveredCells: this.cellElements.filter((_value, index) => this.discovered[index]),
            flagCells: this.cellElements.filter((_value, index) => this.flags[index])
        };
        const event = new CustomEvent("gameover", { detail: eventDetails });
        this.dispatchEvent(event);
    }


    /**
     * Emtis a gamewon event and prevents further playing.
     */
    private gameWon = (): void => {
        this.isPlayable = false;
        this.stopTimer();
        this.tableElement.classList.add("unplayable");

        // Add a flag to every mine
        this.mines.forEach((value, index) => {
            if (value) this.cellElements[index].classList.add("flag")
        });

        const eventDetails: GameEndDetails = {
            elapsedTime: this.stopTime && this.startTime ? this.stopTime - this.startTime : -1,
            mineCells: this.cellElements.filter((_value, index) => this.mines[index]),
            discoveredCells: this.cellElements.filter((_value, index) => this.discovered[index]),
            flagCells: this.cellElements.filter((_value, index) => this.flags[index])
        };
        const event = new CustomEvent("gamewon", { detail: eventDetails });
        this.dispatchEvent(event);
    }


    /**
     * Emits a jumpscare event to allow the option to increase tension.
     */
    private jumpscare = (): void => {
        this.dispatchEvent(new Event("jumpscare"));
    }


    /**
     * Resize the game board to a new width, height and number of mines.
     * @param params The parameters for initializing the game.
     * @param params.width The width of the game board.
     * @param params.height The height of the game board.
     * @param params.numberOfMines The number of mines on the board.
     */
    public resize = ({ width, height, numberOfMines }: { width: number; height: number; numberOfMines: number; }): void => {

        // remove table content
        this.tableElement.tHead?.remove();
        for (let i = 0; i < this.tableElement.tBodies.length; i++) {
            this.tableElement.tBodies[i].remove();
        }

        clearInterval(this.timerInterval);

        this.width = width;
        this.height = height;
        this.numberOfMines = numberOfMines;

        this.numberOfCells = width * height;

        if (this.numberOfMines > this.numberOfCells - 9) throw new Error("numberOfMines is higher than the maximum possible spaces on the board. Please increase the width/height or reduce the number of mines.");

        this.mines = Array(this.numberOfCells).fill(false);
        this.flags = Array(this.numberOfCells).fill(false);
        this.discovered = Array(this.numberOfCells).fill(false);
        this.discoveredNumbers = Array(this.numberOfCells).fill(-1);
        this.cellElements = [];

        this.timerElement = document.createElement("th");
        this.boardSizeElement = document.createElement("th");
        this.numberOfFlagsElement = document.createElement("th");
        this.populateTableHeader();

        this.createTableBody();

        this.isPlayable = true;
        this.tableElement.classList.remove("unplayable");

        this.dispatchEvent(new Event("resize"));
    }



    /**
     * Resets the game board allowing the game to be restarted.
     */
    public reset = (): void => {
        // remove styling from cells
        this.cellElements.forEach((element) => element.classList.value = "");

        this.mines = Array(this.numberOfCells).fill(false);
        this.flags = Array(this.numberOfCells).fill(false);
        this.discovered = Array(this.numberOfCells).fill(false);
        this.discoveredNumbers = Array(this.numberOfCells).fill(-1);

        this.startTime = undefined;
        this.stopTime = undefined;
        clearInterval(this.timerInterval);
        this.timerInterval = undefined;

        this.updateTimerElement();
        this.updateNumberOfFlagsElement();

        this.isPlayable = true;
        this.tableElement.classList.remove("unplayable");

        this.dispatchEvent(new Event("reset"));
    }


    /**
     * Retrieves the current state of the game, showing which cells are discovered and which aren't.
     * @returns A 1-dimensional array containing the discovered cells and their values. Undiscoverd cells return -1.
     */
    public getBoard = (): number[] => {
        return this.discoveredNumbers;
    }
}