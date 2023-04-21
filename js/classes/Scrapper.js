const puppeteer = require("puppeteer");
const FREQUENCY = 15; // seconds

function sleep(sec) {
    return new Promise(res => {
        setTimeout(res, 1000 * sec);
    });
}

class Scrapper {

    async init() {
        this.browser = await puppeteer.launch({headless: true});
        this.page = await this.browser.newPage();
    }

    async start(projectName, cb) {
        this.callback = cb;
        await this.init();

        await this.page.goto("https://profile.intra.42.fr/users/auth/keycloak_student");
        await this.page.type("#username", process.env.USERNAME);
        await this.page.type("#password", process.env.PASSWORD);
        await this.page.keyboard.press("Enter");

        this.page.on("request", ev => {
            if (ev.url().slice(0, `https://projects.intra.42.fr/projects/${projectName}/slots.json`.length) === `https://projects.intra.42.fr/projects/${projectName}/slots.json`) {
                this.targetUrl = ev.url();
            }
        });

        await sleep(2);

        await this.page.goto(`https://projects.intra.42.fr/projects/${projectName}/slots`);
        await sleep(2);

        if (!this.targetUrl) {
            console.error("Could not fetch slots.json url");
            process.exit(1);
        }

        const tmp = setInterval(async () => {
            if (this.stop === true) {
                clearInterval(tmp);
                return ;
            }

            const r = await this.page.goto(this.targetUrl);
            const obj = await r.json();
            console.log("obj : ", obj);

            let newObjs = [];
            if (this.slots) {
                for (let it of obj) {
                    if (!this.slots.find(v => v.id === it.id)) {
                        newObjs.push(it);
                    }
                }
            } else 
                newObjs = obj;

            if (newObjs.length > 0) {
                if (this.callback)
                    this.callback(newObjs);
                else {
                    console.error("No callback");
                    process.exit(2);
                }
            } 
            this.slots = obj;
        }, 1000 * FREQUENCY);
    }
};

module.exports = Scrapper;