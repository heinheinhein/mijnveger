import { table } from "./index";
import { GameEndDetails } from "./types";
import confettiGif from "../media/funny/confetti.gif";
import vuurwerkBlauwGif from "../media/funny/vuurwerk-blauw.gif";
import vuurwerkGeelGif from "../media/funny/vuurwerk-geel.gif";
import vuurwerkGroenGif from "../media/funny/vuurwerk-groen.gif";
import vuurwerkMp3 from "../media/funny/vuurwerk.mp3";
import roltongMp3 from "../media/funny/roltong.mp3";
import blahajGif from "../media/funny/blahaj.gif";
import broodGif from "../media/funny/brood.gif";
import caprisunGif from "../media/funny/caprisun.gif";
import cheeseburgerGif from "../media/funny/cheeseburger.gif";
import chipGif from "../media/funny/chip.gif";
import dvdGif from "../media/funny/dvd.gif";
import eendGif from "../media/funny/eend.gif";
import kaasGif from "../media/funny/kaas.gif";
import kakkerlakGif from "../media/funny/kakkerlak.gif";
import katGif from "../media/funny/kat.gif";
import koeGif from "../media/funny/koe.gif";
import pyramideGif from "../media/funny/pyramide.gif";
import ratGif from "../media/funny/rat.gif";
import schedelGif from "../media/funny/schedel.gif";
import visGif from "../media/funny/vis.gif";
import watermeloenGif from "../media/funny/watermeloen.gif";
import funkyTownMp3 from "../media/funny/funky-town.mp3";
import vallenMp3 from "../media/funny/vallen.mp3";


export const funkyTown = new Audio(funkyTownMp3);
export const winAnimationGifs: HTMLImageElement[] = [];


export async function winAnimation(event: Event | CustomEvent): Promise<void> {
    console.log("you win!!");

    if (!("detail" in event)) return;
    const details = event.detail as GameEndDetails;

    // roltong
    const roltong = new Audio(roltongMp3);
    await roltong.play();

    // vuurwerk
    vuurwerk(details.mineCells);

    await sleep(1700);

    // confetti
    document.body.style.backgroundImage = `url("${confettiGif}")`;

    // funky town
    funkyTown.loop = true;
    funkyTown.play();

    // regenboog
    table?.classList.add("rainbow");

    // gifjes
    const gifs = [
        blahajGif, broodGif, caprisunGif, cheeseburgerGif, chipGif, dvdGif, eendGif, kaasGif,
        kakkerlakGif, katGif, koeGif, pyramideGif, ratGif, schedelGif, visGif, watermeloenGif
    ];
    gifs.forEach(placeImageRandomlyOnScreen);
}

async function sleep(ms: number): Promise<void> {
    await new Promise(r => setTimeout(r, ms));
}

async function placeImageRandomlyOnScreen(imageSrc: string): Promise<void> {
    const image = document.createElement("img");
    image.src = imageSrc;
    image.style.position = "fixed";
    image.style.inset = "0";
    image.style.zIndex = (Math.round(Math.random() * 20) + 10).toString();

    // willekeurige positie en grootte (grote? groote?)
    const width = Math.random() * 400 + 200;
    await image.decode();
    const height = width * image.height / image.width; // aspect ratio behouden

    image.width = width;
    image.height = height;

    image.style.left = Math.random() * (innerWidth - width) + "px";
    image.style.top = Math.random() * (innerHeight - height) + "px";

    winAnimationGifs.push(image);

    // afbeelding valt naar benee als je er op klikt
    image.addEventListener("click", async () => {

        // verwijder afbeelding uit de lijst van gifjes
        winAnimationGifs.splice(winAnimationGifs.indexOf(image), 1);

        await new Audio(vallenMp3).play();
        image.style.position = "fixed";
        image.classList.add("fall");

        // haal em weg als de animatie afgelopen is
        setTimeout(() => image.remove(), 1000);
    });

    document.body.appendChild(image);
}

async function vuurwerk(mines: HTMLTableCellElement[]): Promise<void> {
    const vuurwerkAudio = new Audio(vuurwerkMp3);
    vuurwerkAudio.play();

    const vuurwerkjes = [vuurwerkBlauwGif, vuurwerkGeelGif, vuurwerkGroenGif];

    mines.forEach(async (mine) => {
        // maak een image aan met vuurwerk gif
        const vuurwerkImage = document.createElement("img");
        vuurwerkImage.src = vuurwerkjes[Math.floor(Math.random() * vuurwerkjes.length)];
        vuurwerkImage.alt = "vuurwerk";
        vuurwerkImage.style.position = "absolute";
        await vuurwerkImage.decode();

        // bepaal de x en y van de mine
        const minePosition = mine.getBoundingClientRect();
        const mineMiddleX = minePosition.x + minePosition.width / 2 + window.scrollX;
        const mineMiddleY = minePosition.y + minePosition.height / 2 + window.scrollY;

        // bepaal de x en y voor de gif
        const x = mineMiddleX - vuurwerkImage.width / 2;
        const y = mineMiddleY - vuurwerkImage.height / 2;

        vuurwerkImage.style.top = `${y}px`;
        vuurwerkImage.style.left = `${x}px`;

        // voeg em toe aan de body
        document.body.append(vuurwerkImage);

        // haal em weg als de animatie afgelopen is
        setTimeout(() => vuurwerkImage.remove(), 2600);
    });
}