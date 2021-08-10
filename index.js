then = Date.now();
// Import modules
const F = require("fnct");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const {clearInterval} = require("timers");

var fails = 0;
var output = [];
var headless = false;
async function main() {
  // Start puppeteer
  console.log("Launching");
  while (true) {
    try {
      browser = await puppeteer.launch({
        headless,
        defaultViewport: null,
        args: [
          '--start-maximized',
          '--proxy-server="direct://"',
          '--proxy-bypass-list=*',
        ],
      });
      [page] = await browser.pages();
      await page.goto("https://www.reddit.com/login");
      break;
    } catch (err) {
      console.error(err);
    }
  }

  // Log into reddit account
  console.log("Authenticating Account");
  if (process.argv[2] && process.argv[3]) {
    user = {username: process.argv[2], password: process.argv[3]};
  } else {
    try {
      user = JSON.parse(fs.readFileSync(path.join(__dirname, "user.json")));
    } catch {
      console.log("No username / password given.");
      process.exit();
    }
  }
  var {username, password} = user;
  if (!user) {
    console.error("No username given.");
    process.exit();
  }
  if (!password) {
    console.error("No password given.");
    process.exit();
  }

  while (true) {
    try {
      // Fill username
      await page.$$eval("#loginUsername", (el, username) => {
        el[0].value = username;
      }, username);

      // Fill password
      await page.$$eval("#loginPassword", (el, password) => {
        el[0].value = password;

        // Click button
        document.querySelector("body > div > main > div.OnboardingStep.Onboarding__step.mode-auth > div > div.Step__content > form > fieldset:nth-child(8) > button").click();
      }, password);
      break;
    } catch (err) {
      console.error(err);
    }
  }

  // Wait for page to finish loading
  await F.sleep(5);

  console.log("Opening tabs...");
  page.goto(`https://reddit.com/user/${username}/saved`);
  await F.sleep(10);
  await page.evaluate(async () => {
    console.log("Starting...");
    for (i = 0; i < 1e7; i++) {
      if (document.querySelector(".FohHGMokxXLkon1aacMoi")) {
        scrollBy(0, 1e7);
        await new Promise(resolve => {
          setTimeout(resolve, 1000);
        });
      } else {
        break;
      }
    }
    alert("Ready? Hold CTRL+1");
    links = document.querySelectorAll("._2MkcR85HDnYngvlVW2gMMa");
    for (j in links) {
      try {
        if (links[j].childNodes[0].href) {
          open(links[j].childNodes[0].href);
        }
      } catch { }
      await new Promise(resolve => {
        setTimeout(resolve, 5);
      });
    }
  });
  page.close();

  // Final things
  time = (Date.now() - then).toTime();
  console.log("\nCompleted in {time} {unit}\n{amount} Images opened".format({
    amount: (await browser.pages()).length,
    time: time[0].round(2),
    unit: time[1],
  }));
};

main();