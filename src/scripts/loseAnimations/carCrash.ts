import policeMp3 from "../../media/funny/seacrest.mp3";
import carCrashGif from "../../media/funny/t-bone.gif";
import crashMp3 from "../../media/funny/t-bone.mp3";
import nukeMp3 from "../../media/funny/nuke.mp3";
import explosieGif from "../../media/funny/explosie.gif";
import { showMines, sleep } from "../loseAnimation";

export async function carCrash(mines: HTMLTableCellElement[]): Promise<void> {

    // police geluidje
    const policeAudio = new Audio(policeMp3);
    await policeAudio.play();


    await sleep(3200);


    // car crash audio
    const crashAudio = new Audio(crashMp3);
    crashAudio.play();

    // car crash gif
    const carCrashImage = document.createElement("img");
    carCrashImage.src = carCrashGif;
    carCrashImage.style.position = "fixed";
    carCrashImage.style.inset = "0";
    carCrashImage.style.width = "100vw";
    carCrashImage.style.height = "100vh";
    carCrashImage.style.zIndex = "10";

    document.body.append(carCrashImage);

    setTimeout(() => carCrashImage.remove(), 7500);

    
    await sleep(4350)


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

}