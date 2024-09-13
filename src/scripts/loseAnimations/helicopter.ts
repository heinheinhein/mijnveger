import helicopterMp3 from "../../media/funny/helicopter.mp3";
import helicopterGif from "../../media/funny/helicopter.gif";
import nukeMp3 from "../../media/funny/nuke.mp3";
import explosieGif from "../../media/funny/explosie.gif";
import { sleep, showMines } from "../loseAnimation";

export async function helicopter(mines: HTMLTableCellElement[]): Promise<void> {
    // helicopter audio
    mines

    await sleep(2300);

    // helicopter gif
    const HeliImage = document.createElement("img");
    HeliImage.src = helicopterGif;
    HeliImage.style.position = "fixed";
    HeliImage.style.inset = "0";
    HeliImage.style.width = "100vw";
    HeliImage.style.height = "100vh";
    HeliImage.style.zIndex = "10";

    document.body.append(HeliImage);

    setTimeout(() => HeliImage.remove(), 2400);


    // comedic timing
    await sleep(800);

    // explosie geluidje
    const audio = new Audio(nukeMp3);
    await audio.play();

    // ontplof elke mine
    mines.forEach(async (mine) => {
        // maak een image aan met explosie gif
        const explosieImage = document.createElement("img");
        explosieImage.src = explosieGif;
        explosieImage.alt = "explosie";
        explosieImage.style.position = "absolute";
        await explosieImage.decode();

        // bepaal de x en y van de mine
        const minePosition = mine.getBoundingClientRect();
        const mineMiddleX = minePosition.x + minePosition.width / 2 + window.scrollX;
        const mineMiddleY = minePosition.y + minePosition.height / 2 + window.scrollY;;

        // bepaal de x en y voor de gif
        const x = mineMiddleX - explosieImage.width / 2;
        const y = mineMiddleY - explosieImage.height + minePosition.height;

        explosieImage.style.top = `${y}px`;
        explosieImage.style.left = `${x}px`;

        // voeg em toe aan de bodyfunny/
        document.body.append(explosieImage);

        // haal em weg als de animatie afgelopen is
        setTimeout(() => explosieImage.remove(), 1650);
    });

    // onthul alle mines
    showMines();

    await sleep(1400);
}