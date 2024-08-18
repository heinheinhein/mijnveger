import { Mijnveger } from "./mijnveger";
import { funkyTown, winAnimation, winAnimationGifs } from "./winAnimation";
import { hideMines, loseAnimation } from "./loseAnimation";
import { jumpscare } from "./jumpscare";
import achtergrondGif from "../media/kn_achtergrond.gif";


export const table = document.getElementById("mijnveger");

window.onload = init;


function init(): void {
    if (!(table instanceof HTMLTableElement)) throw new Error("No table element");

    resetStyling();

    // als iets is opgeslagen in localStorage gebruiken we dat, anders doen we standaard moeilijk
    const savedSettings = getSettingsFromLocalStorage();

    (document.getElementById("breedte") as HTMLInputElement).value = savedSettings.width.toString();
    (document.getElementById("hoogte") as HTMLInputElement).value = savedSettings.height.toString();
    (document.getElementById("mijnen") as HTMLInputElement).value = savedSettings.numberOfMines.toString();


    const mijnveger = new Mijnveger({
        tableElement: table,
        width: savedSettings.width,
        height: savedSettings.height,
        numberOfMines: savedSettings.numberOfMines
    });

    
    mijnveger.addEventListener("gamewon", winAnimation);
    mijnveger.addEventListener("gameover", loseAnimation);
    mijnveger.addEventListener("jumpscare", jumpscare);
    mijnveger.addEventListener("reset", resetStyling);
    mijnveger.addEventListener("resize", resetStyling);

    document.getElementById("opnieuw")?.addEventListener("click", (_event) => mijnveger.reset());

    // difficulty aanpassen
    const difficulties = {
        makkelijk: { width: 8, height: 8, numberOfMines: 10 },
        gemiddeld: { width: 16, height: 16, numberOfMines: 40 },
        moeilijk: { width: 30, height: 16, numberOfMines: 99 }
    };
    document.getElementById("makkelijk")?.addEventListener("click", (_event) => resize(mijnveger, difficulties["makkelijk"]));
    document.getElementById("gemiddeld")?.addEventListener("click", (_event) => resize(mijnveger, difficulties["gemiddeld"]));
    document.getElementById("moeilijk")?.addEventListener("click", (_event) => resize(mijnveger, difficulties["moeilijk"]));

    // handmatig de difficulty aanpassen
    document.getElementById("breedte")?.addEventListener("change", (event) => {
        const settings = getSettingsFromLocalStorage();
        const width = parseInt((event.target as HTMLInputElement).value);
        resize(mijnveger, { width: width, height: settings.height, numberOfMines: settings.numberOfMines });
    });

    document.getElementById("hoogte")?.addEventListener("change", (event) => {
        const settings = getSettingsFromLocalStorage();
        const height = parseInt((event.target as HTMLInputElement).value);
        resize(mijnveger, { width: settings.width, height: height, numberOfMines: settings.numberOfMines });
    });

    document.getElementById("mijnen")?.addEventListener("change", (event) => {
        const settings = getSettingsFromLocalStorage();
        const numberOfMines = parseInt((event.target as HTMLInputElement).value);
        resize(mijnveger, { width: settings.width, height: settings.height, numberOfMines: numberOfMines });
    });
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

function resize(mijnveger: Mijnveger, params: { width: number, height: number, numberOfMines: number }): void {
    localStorage.setItem("width", params.width.toString());
    localStorage.setItem("height", params.height.toString());
    localStorage.setItem("mines", params.numberOfMines.toString());

    (document.getElementById("breedte") as HTMLInputElement).value = params.width.toString();
    (document.getElementById("hoogte") as HTMLInputElement).value = params.height.toString();
    (document.getElementById("mijnen") as HTMLInputElement).value = params.numberOfMines.toString();

    mijnveger.resize(params);
}

function getSettingsFromLocalStorage(): { width: number, height: number, numberOfMines: number } {
    const width = parseInt(localStorage.getItem("width") || "30");
    const height = parseInt(localStorage.getItem("height") || "16");
    const numberOfMines = parseInt(localStorage.getItem("mines") || "99");

    return { width, height, numberOfMines };
}