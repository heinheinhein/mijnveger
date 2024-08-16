import { GameEndDetails } from "./types";
import helicopterMp3 from "../media/funny/helicopter.mp3";
import helicopterGif from "../media/funny/helicopter.gif";
import clownGif from "../media/funny/clown.gif";
import nukeMp3 from "../media/funny/nuke.mp3";
import explosieGif from "../media/funny/explosie.gif";



/// ik wil de mines pas revealen als de explosies komen:
//   - mijnveger class aanpassen zodat revealmines een functie is nadat het spel klaar is
//   - .mine css class aanpassen zodat deze pas zichtbaar is vanaf een bepaald moment


export async function loseAnimation(event: CustomEvent | Event): Promise<void> {
    console.log("you lose :((((");

    if (!("detail" in event)) return;
    const details = event.detail as GameEndDetails;

    await helicopter(details.mineCells);
}




async function helicopter(mines: HTMLTableCellElement[]): Promise<void> {
    // helicopter audio
    const heliAudio = new Audio(helicopterMp3);
    await heliAudio.play();

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
        const mineMiddleX = minePosition.x + minePosition.width / 2;
        const mineMiddleY = minePosition.y + minePosition.height / 2;

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

    await sleep(1800);
    // verander de achtergrond nadat de bommen zijn ontploft
    document.body.style.backgroundImage = `url("${clownGif}")`;
}


async function sleep(ms: number): Promise<void> {
    await new Promise(r => setTimeout(r, ms));
}


function showMines(): void {
    document.documentElement.style.setProperty('--wrong-color', "#CC0000");
    document.documentElement.style.setProperty("--mine-content", "'💣'");
}


export function hideMines(): void {
    document.documentElement.style.setProperty("--wrong-color", "var(--tile-color)");
    document.documentElement.style.setProperty("--mine-content", "''");
}