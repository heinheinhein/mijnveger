import { GameEndDetails } from "./types";
import { toSvg } from "html-to-image";
import Perspective from "perspectivets"
import clownGif from "../media/funny/clown.gif";
import bombSvg from "../media/bomb.svg";
import { helicopter } from "./loseAnimations/helicopter";
import { carCrash } from "./loseAnimations/carCrash";


export async function loseAnimation(event: CustomEvent | Event): Promise<void> {
    console.log("you lose :((((");

    if (!("detail" in event)) return;
    const details = event.detail as GameEndDetails;

    // maak alvast de achtergrond want dit duurt even
    const background = createBackground(2);

    const effects = [helicopter, carCrash];
    await randomItem(effects)(details.mineCells);

    // update de achtergrond
    document.body.style.backgroundImage = `url("${await background}")`;
}

function randomItem(array: any[]): any {
    return array[Math.floor(Math.random() * array.length)];
}

export async function sleep(ms: number): Promise<void> {
    await new Promise(r => setTimeout(r, ms));
}


export function showMines(): void {
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