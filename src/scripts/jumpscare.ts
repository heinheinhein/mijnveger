import pipeMp3 from "../media/funny/pipe.mp3";
import discordMp3 from "../media/funny/discord.mp3";
import skypeMp3 from "../media/funny/skype.mp3";
import slackMp3 from "../media/funny/slack.mp3";
import teamsMp3 from "../media/funny/teams.mp3";
import whatsappMp3 from "../media/funny/whatsapp.mp3";
import usbMp3 from "../media/funny/usb.mp3";
import rct2Mp3 from "../media/funny/rct2.mp3";


export async function jumpscare(_event?: Event): Promise<void> {
    const jumpscares = [
        pipeMp3, discordMp3, skypeMp3, slackMp3, teamsMp3,
        whatsappMp3, usbMp3, rct2Mp3
    ];

    const chosenOne = jumpscares[Math.floor(Math.random() * jumpscares.length)];

    console.log(`jumpscare!! ${chosenOne}`);

    const audio = new Audio(chosenOne);
    await audio.play();
}