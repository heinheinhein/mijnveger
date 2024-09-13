import flashbangGif from "../../media/funny/flashbang.gif";
import flashbangMp3 from "../../media/funny/flashbang.mp3";
import { sleep, showMines } from "../loseAnimation";

export async function flashbang(_mines: HTMLTableCellElement[]): Promise<void> {

    // flashbang audio
    const flashbangAudio = new Audio(flashbangMp3);
    await flashbangAudio.play();

    // flashbang gif
    const flashbangImage = document.createElement("img");
    flashbangImage.src = flashbangGif;
    flashbangImage.style.position = "fixed";
    flashbangImage.style.inset = "0";
    flashbangImage.style.width = "100vw";
    flashbangImage.style.height = "100vh";
    flashbangImage.style.zIndex = "10";

    document.body.append(flashbangImage);

    setTimeout(() => flashbangImage.remove(), 4300);


    await sleep(4000);

    const white = document.createElement("div");
    white.style.position = "fixed";
    white.style.inset = "0";
    white.style.width = "100vw";
    white.style.height = "100vh";
    white.style.zIndex = "11";
    white.style.backgroundColor = "white";
    white.style.transition = "background 1500ms ease-out";

    document.body.append(white)

    setTimeout(() => white.style.backgroundColor = "rgba(0,0,0,0)", 2000);
    setTimeout(() => white.remove(), 3500);

    showMines();
}