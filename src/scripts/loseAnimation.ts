import { GameEndDetails } from "./types";
import { toSvg } from "html-to-image";
import Perspective from "perspectivets"
import helicopterMp3 from "../media/funny/helicopter.mp3";
import helicopterGif from "../media/funny/helicopter.gif";
import clownGif from "../media/funny/clown.gif";
import nukeMp3 from "../media/funny/nuke.mp3";
import explosieGif from "../media/funny/explosie.gif";
import bombSvg from "../media/bomb.svg";


export async function loseAnimation(event: CustomEvent | Event): Promise<void> {
    console.log("you lose :((((");

    if (!("detail" in event)) return;
    const details = event.detail as GameEndDetails;

    // maak alvast de achtergrond want dit duurt even
    const background = createBackground(2);

    // helicopter
    await helicopter(details.mineCells);

    // update de achtergrond
    document.body.style.backgroundImage = `url("${await background}")`;
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

    await sleep(1400);
}


async function sleep(ms: number): Promise<void> {
    await new Promise(r => setTimeout(r, ms));
}


function showMines(): void {
    document.documentElement.style.setProperty('--wrong-color', "#CC0000");
    document.documentElement.style.setProperty("--mine-image", `url("${bombSvg}")`);
}


export function hideMines(): void {
    document.documentElement.style.setProperty("--wrong-color", "var(--tile-color)");
    document.documentElement.style.setProperty("--mine-image", "''");
}


async function createBackground(depth: number): Promise<string> {
    // de achtergrond afbeelding, bij de eerste loop bestaat deze nog niet, bij de tweede wordt deze op de achtergrond van de achtergrond gezet
    let backgroundImage: string = "";

    // begin alvast de clown afbeelding te laden
    const clownImage = new Image();
    clownImage.src = clownGif;


    // hoe vaak we de achtergrond genereren
    // als dit 1 keer is, bevat de achtergrond op het computerscherm van de clown geen mijnveger game, maar gewoon zwart; dat kunnen we niet hebben
    for (let i = 0; i < depth; i++) {

        // maak canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("clown ctx is null? waarom");

        // resize het canvas
        await clownImage.decode();
        canvas.width = clownImage.width;
        canvas.height = clownImage.height;

        // als dit de eerste iteratie is gebruiken we de clownImage even als achtergrond
        if (backgroundImage === "") {
            ctx.drawImage(clownImage, 0, 0);
            backgroundImage = canvas.toDataURL();
        }

        // neem een "screenshot" van hoe de pagina er nu uit ziet, met als achtergrond de clown afbeelding, ook al is dat nog niet hoe de pagina er uit ziet
        // toSvg is het snelst trouwens, geen idee waarom maar is maar 600ms tegenover 900ms van toPng en toJpeg etc. 
        const screenshot = await toSvg(document.body, {
            style: {
                // gewoon de url van clownImage hier werkt niet voor een of andere reden 
                backgroundImage: `url("${backgroundImage}")`
            }
        });
        if (!screenshot) throw new Error("screenshot nemen mislukt :(");
        const screenshotImage = new Image();
        screenshotImage.src = screenshot;

        // plaats de screenshot op het canvas en positioneer hem zodat deze achter het scherm staat van de clown
        await screenshotImage.decode();
        const p = new Perspective(ctx, screenshotImage);
        p.draw({
            topLeftX: 13,
            topLeftY: 134,
            topRightX: 124,
            topRightY: 125,
            bottomRightX: 141,
            bottomRightY: 216,
            bottomLeftX: 34,
            bottomLeftY: 239,
        });

        // plaats clown afbeelding (met transparant scherm) op canvas
        ctx.drawImage(clownImage, 0, 0);

        // zet backgroundImage naar de nieuwe achtergrond, zodat er nog een loop kan uitgevoerd worden waardoor we nog een niveau dieper gaan, of dat we deze kunnen returnen
        backgroundImage = canvas.toDataURL();
    }

    return backgroundImage;
}