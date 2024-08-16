import { Mijnveger } from "./mijnveger";
import { funkyTown, winAnimation, winAnimationGifs } from "./winAnimation";
import { hideMines, loseAnimation } from "./loseAnimation";
import { jumpscare } from "./jumpscare";
import achtergrondGif from "../media/kn_achtergrond.gif";


export const table = document.getElementById("mijnveger");
if (!(table instanceof HTMLTableElement)) throw new Error("No table element");

init(table);


function init(table: HTMLTableElement): void {
    resetStyling();

    const mijnveger = new Mijnveger({ tableElement: table, width: 30, height: 16, numberOfMines: 2 });

    mijnveger.addEventListener("gamewon", winAnimation);
    mijnveger.addEventListener("gameover", loseAnimation);

    mijnveger.addEventListener("reset", resetStyling);
    mijnveger.addEventListener("resize", resetStyling);

    mijnveger.addEventListener("jumpscare", jumpscare);

    document.getElementById("reset")?.addEventListener("click", (_event) => mijnveger.reset());
}


function resetStyling(_event?: Event): void {
    document.body.style.backgroundImage = `url("${achtergrondGif}")`

    // win dingen
    table?.classList.remove("rainbow");
    winAnimationGifs.forEach((image) => image.remove());
    funkyTown.pause();
    funkyTown.currentTime = 0;

    // verlies dingen
    hideMines();
}
