// Global variables
let totalPops = 0;
let runPops = 0;
let lifetimePops = 0;
let growthRate = 1.15;
let lifetimeTruePops = 0;
let droplets = 0;
let reqDroplets = 1;
let lifetimeDroplets = 0;
let dMult = 1;
let dps = 0;
let multiplier = 1;
let tickSpeed = 10;
// Click variables
let clickMultiplier = 1;
let dpsClicks = 1;
let cpc = 0;
// Building variables
let buildings = {};
let totalBuildings = 0;
let mysteryBuilding = null;
// Upgrade variables
let upgrades = [];
let boughtUpgrades = [];
let upgradeColors = {};
let bonusDroplets = 0;
let bonusDropletsInterval = -1;
let bdBackgroundInterval = 1;
let popsPerClick = 0;
// Boosts
let autoBucketClick = 0;
// Function declarations
let findDps;
let formatSci;
let plrl;
let playSound;
let popAbsoluteDivSetup = false;

// Other
let images = {};
let formatNums = [' million',' billion',' trillion',' quadrillion',' quintillion',' sextillion',' septillion',' octillion',' nonillion'];
let bucketHover = false;
let sounds = {};
let interacted = false;
let boosts = [];
let boostTypes = ['autoBucketClick', 'clickMultiplier'];

// JS Console functions
function addPops(num) {
    totalPops += num;
    runPops += num;
    lifetimePops += num;
}

// Run on window load
window.onload = function() {
    // Elements
    let bigPopsicleClickable = document.getElementById("clickable-div-bigPopsicle");
    let bigPopsicleClickableAbs = document.getElementById("clickable-div-bigPopsicle-abs");
    let bucketClickable = document.getElementById("clickable-div-bucket");
    let newsDiv = document.getElementById("newsDiv");
    // Semi-global variables
    let newsTimer = 10000;
    let cursorClickTimer = 0;
    let cursorClickMax = 0;
    let currTooltip;
    // Number formatting setup (thanks pop clicker)
    let prefixes=['','un','duo','tre','quattuor','quin','sex','septen','octo','novem'];
    let suffixes=['decillion','vigintillion','trigintillion','quadragintillion','quinquagintillion','sexagintillion','septuagintillion','octogintillion','nonagintillion'];
    for (let i in suffixes)
    {
        for (let ii in prefixes)
        {
            formatNums.push(' '+prefixes[ii]+suffixes[i]);
        }
    }

    for (let i = 0; i < soundData.length; i++)
        sounds[soundData[i]] = new Audio('audio/' + soundData[i]);

    // Canvas Setup
    let canvas;
    let ctx;
    let rect;
    let anDroplets = [{'timeLeft': 0, 'maxTime': 0, 'image': 'droplet.png', 'size': [0, 0, 0, 0]}];
    let anBigClick = 0;
    let anBigHover = false;
    let forceReset = false;

    // Tooltip canvas setup
    let ttcanvas;
    let ttctx;
    let ttrect;

    // Element-specific event setup
    newsDiv.onclick = function() { generateNews(); }
    document.getElementById("prestigeButton").onclick = function() { prestige(); }
    document.getElementById("prestigeButton").addEventListener("mouseover", function(e) { currTooltip = {"x": e.clientX, "y": e.clientY, "upgrade": "prestige"}; })
    document.getElementById("prestigeButton").addEventListener("mouseout", function() { currTooltip = null; })

    // Global function setup
    findDps = function() {
        let r = 0;
        for (let b in buildings) {
            if (buildings[b].name === "Cursor") {
                cursorClickMax = 1000 / buildings[b].amount;
                cursorClickTimer = 0;
                droplets = Math.floor(droplets);
            }
            buildings[b].determineCost();
            r += buildings[b].production * buildings[b].amount * buildings[b].multiplier;
        }
        dps = r * multiplier;
    }
    formatSci = function(num, decDigits = 0) {
        if (decDigits === 0)
            num = Math.floor(num);
        if (num < 1)
            return Number(num.toFixed(decDigits)).toLocaleString();
        if (num < 1000000)
            return Number(num.toFixed(decDigits)).toLocaleString();
        num = Number(num);
        let sciNum = num.toExponential(6);
        let exp = parseInt(sciNum.substring(9));
        let sciExp = Math.floor((exp-6) / 3);
        let res;
        if ((exp-6) % 3 === 0) {
            res = sciNum.substring(0,1) + "." + sciNum.substring(2, 5);
        } else if ((exp-6) % 3 === 1) {
            res = sciNum.substring(0,1) + sciNum.substring(2, 3) + "." + sciNum.substring(3, 6);
        } else if ((exp-6) % 3 === 2) {
            res = sciNum.substring(0,1) + sciNum.substring(2, 4) + "." + sciNum.substring(4, 7);
        }
        if (res.substring(res.length - 3) === "000")
            res = res.substring(0, res.length - 4);
        return res + formatNums[sciExp];
    }
    plrl = function(num, string) {
        if (Math.floor(num) === 1)
            return string;
        if (string.substr(string.length - 1) === "y")
            return string.substr(0, string.length - 1) + "ies"
        return string + "s";
    }

    playSound = function(name) {
        if (interacted)
            sounds[name].cloneNode(false).play();
    }

    // Load images
    loadImages(() => {});

    // Buildings Setup
    buildingsData.forEach(function(el) {
        buildings[el['name'].toLowerCase()] = new Building(el['baseCost'], el['baseProduction'], el['name'], el['description']);
    })

    // Upgrades
    upgradeData.forEach(function(value) {
        upgrades.push(new Upgrade(value.name, value.type, value.tier, value.description))
    })

    let sortedUpgrades = [...upgrades].sort((a, b) => {return a.cost - b.cost});

    // Runs once every 10 milliseconds
    function gameLoop() {setInterval(function() {
        let spawnChance = Math.floor(Math.random() * 18_000); // 0.5 % chance per second

        if (spawnChance === 0) {
            spawnGoldenPop();
        }

        if (autoBucketClick > 0 && droplets >= reqDroplets) {
            onBucketClick(autoBucketClick);
        }
        droplets += dps / (tickSpeed * 10);
        lifetimeDroplets += dps / (tickSpeed * 10);

        if (droplets > reqDroplets * dMult) {
            droplets = reqDroplets * dMult;
            lifetimeDroplets -= dps / (tickSpeed * 10);
        }

        newsTimer += tickSpeed;
        cursorClickTimer += tickSpeed;


        if (dps > 125 ** bdBackgroundInterval) {
            bdBackgroundInterval++;
            document.getElementById("leftArea").style.backgroundColor = bdBackgroundInterval % 2 === 0 ? "#5a4a57" : "#453943";
        }

        if (lifetimeDroplets !== 0 && bonusDroplets > 0 && Math.floor(lifetimeDroplets) % bonusDropletsInterval === 0 && droplets <= reqDroplets) {
            if (Math.floor(lifetimeDroplets) % (bonusDropletsInterval * bdBackgroundInterval * bdBackgroundInterval === 1 ? 1: 2) === 0)
                flashBackground((bdBackgroundInterval % 2 === 0 ? "#453943" : "#5a4a57"), 100);
            totalPops += bonusDroplets;
            lifetimePops += bonusDroplets;
            droplets += bonusDroplets;
            lifetimeDroplets += bonusDroplets;
        }


        for (let b in buildings) {
            buildings[b].deactivateBuilding();
            if (buildings[b].hidden === true && totalPops >= buildings[b].baseCost / 5) {
                showMystery();
                buildings[b].mysteryUnlock();
            }
            if (buildings[b].hidden === true && totalPops >= buildings[b].baseCost / 2) {
                buildings[b].unhideBuilding();
                hideMystery();
            }
            if (totalPops >= buildings[b].currentCost) {
                buildings[b].activateBuilding();
            }
        }
        upgrades.forEach(e => {
            e.deactivateUpgrade();
            if (totalPops >= e.cost) {
                e.activateUpgrade();
            }
            e.checkAvailable();
        })

        if (newsTimer >= (tickSpeed * 1000)) {
            newsTimer = 0;
            generateNews();
        }

        if (cursorClickMax > 0 && cursorClickTimer >= cursorClickMax) {
            cursorClickTimer = 0;
            onBigPopsicleClick(0, 0, true);
        }
        // Drawing function
        popCanvas();
    }, tickSpeed)}

    function onWindowResize() {
        forceReset = true;
        setupCanvas();
        Object.values(buildings).forEach((e) => {
            e.setupInnerCanvas();
            e.drawInnerCanvas();
        });
    }


    function setupCanvas() {
        popAbsoluteDivSetup = false;

        canvas = document.getElementById("popCanvas");
        ctx  = canvas.getContext("2d");
        rect = canvas.getBoundingClientRect();
        // Make it visually fill the positioned parent
        canvas.style.width ='100%';
        canvas.style.height='100%';
        // ...then set the internal size to match
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Tooltip canvas
        ttcanvas = document.getElementById("tooltipCanvas");
        ttctx = ttcanvas.getContext("2d");
        ttrect = ttcanvas.getBoundingClientRect();
        ttcanvas.style.width ='100%';
        ttcanvas.style.height= '100%';
        ttcanvas.width = ttcanvas.offsetWidth;
        ttcanvas.height = ttcanvas.offsetHeight;
        // Remove text blur
        let scale = window.devicePixelRatio;
        ttcanvas.width = Math.floor(ttcanvas.width * scale);
        ttcanvas.height = Math.floor(ttcanvas.height * scale);
        ttctx.scale(scale, scale);
    }

    // Runs when big popsicle is clicked
    function onBigPopsicleClick(clientX, clientY, fake=false) {
        interacted = true;
        cpc = clickMultiplier * dpsClicks;
        let x;
        let y;
        if (!fake) {
            x = clientX;
            y = clientY;
            x += getRandomInt(-1 * window.innerWidth * 0.01, window.innerWidth * 0.01);
            y += getRandomInt(-1 * window.innerWidth * 0.01, window.innerWidth * 0.01);
        }
        let time = 1000;
        if (droplets < reqDroplets * dMult)
            anDroplets.push({'timeLeft': time, 'maxTime': time, 'image': 'droplet.png', 'size': drawDroplet(x, y)})
        if (!fake && droplets < reqDroplets * dMult) {
            droplets += cpc;
            lifetimeDroplets += cpc;
            playSound('drop.mp3');
        }
    }

    // Runs when bucket is clicked
    function onBucketClick(num = 1) {
        if (droplets >= reqDroplets) {
            droplets -= reqDroplets;
            totalPops += (1 + (popsPerClick * reqDroplets * dMult)) * num;
            runPops += (1 + (popsPerClick * reqDroplets * dMult)) * num;
            lifetimePops += (1 + (popsPerClick * reqDroplets * dMult)) * num;
            reqDroplets++;

            // Play animation on bucket click
            let animOverlay = document.getElementsByClassName("leftAreaAbs")[0];
            if (!animOverlay.classList.contains("whiteFlash"))
                animOverlay.classList.add("whiteFlash");
            else
                reset_animation(animOverlay)
            // setTimeout(() => onBucketOut(), 100);

            playSound('click2.mp3');
            return true;
        }
        return false;
    }

    function popCanvas() {
        let fontpx = window.innerWidth / 3750;

        // Clear Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ttctx.clearRect(0, 0, ttcanvas.width, ttcanvas.height);
        // Popsicles Text
        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        let totalTextHeight = 0;
        let tMarg = canvas.height * 0.05;

        ctx.font = fontpx * 60 + "px 'Kavoon'"
        ctx.fillStyle = "#ff457d";
        let totalPopsString;
        totalPopsString = formatSci(totalPops) + plrl(totalPops, " popsicle");
        totalTextHeight += quickMeasureHeight(totalPopsString, ctx) + tMarg;
        ctx.fillText(totalPopsString, canvas.width / 2, totalTextHeight);

        ctx.fillStyle = "#87cefa";
        ctx.font = fontpx * 60 + "px 'Kavoon'"
        let totalDropsString;
        totalDropsString = formatSci(droplets) + plrl(droplets, " droplet");
        totalTextHeight += quickMeasureHeight(totalDropsString, ctx) + tMarg;

        ctx.fillText(totalDropsString, canvas.width / 2, totalTextHeight);

        ctx.fillStyle = "white";
        ctx.font = fontpx * 50 + "px 'Kavoon'"
        let dpsString = (dps < 10 && dps !== 0) ?
            "per second: " + formatSci(dps, 2)
            : "per second: " + formatSci(dps);
        totalTextHeight += quickMeasureHeight(dpsString, ctx) + tMarg;
        ctx.fillText(dpsString, canvas.width / 2, totalTextHeight);

        // Boosts
        let replDivs = false;
        if (forceReset) {
            replDivs = true;
            forceReset = false;
        }
        for (let i = boosts.length - 1; i >= 0; i--) {
            if (boosts[i].timeLeft - 10 <= 0) {
                boosts[i].cancelBoost();
                boosts.splice(i, 1);
                replDivs = true;

                // Remove gold border once boosts are done
                if (boosts.length === 0) {
                    let animOverlay = document.getElementsByClassName("leftAreaAbs")[1];
                    animOverlay.classList.remove("pulsatingBorderGold");
                }
            }
        }
        for (let i = 0; i < boosts.length; i++) {
            if (boosts[i].isRunning === false)
                findDps();
            boosts[i].timeLeft -= 10;
            boosts[i].runBoost();

            let img = images['icon-cursor.png'].cloneNode(false);
            let scale = Math.min(canvas.width * 0.125 / img.width, canvas.height * 0.125 / img.height);
            let width = img.width * scale;
            let height = img.height * scale;

            let x = (canvas.width) - (width) - 20;
            let y = (i * (height + 5)) + 20;

            ctx.drawImage(img, x, y, width, height);

            if (boosts[i].div == null || replDivs)
                boosts[i].createDiv(x, y, width, height, replDivs, i);
        }

        // Big Popsicle
        let img = images["pop-1.png"].cloneNode(false);
        let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        scale /= 2;

        let yOffset = 0;

        if(anBigHover) {
            scale *= droplets < reqDroplets ? 1.1 : 1.05;
            // Centers on click (disabled)
            // yOffset -= scale * 30;
        }

        // Click animation
        if (anBigClick <= -1 && droplets < reqDroplets * dMult) {
            let scaleMinus;
            if (anBigClick >= -1000)
                scaleMinus = rangeConvert(anBigClick, -1, -1000, 0, scale / 10);
            else
                scaleMinus = rangeConvert(-1000, -1, -1000, 0, scale / 10);
            anBigClick -= 100;
            scale -= scaleMinus;
            // Centers on click (disabled)
            yOffset += scaleMinus * 900;
        }
        let width = img.width * scale;
        let height = img.height * scale;

        let bcMargin = yOffset;

        let x = (canvas.width / 2) - (width / 2);
        let y = totalTextHeight + tMarg / 2 + bcMargin;
        ctx.drawImage(img, x, y, width, height);

        // Clickable div
        bigPopsicleClickable.style.height = height.toString() + "px";
        bigPopsicleClickable.style.width = width.toString() + "px";
        bigPopsicleClickable.style.marginLeft = ((canvas.width - (x + width))).toString() + "px";
        bigPopsicleClickable.style.marginRight = ((canvas.width - (x + width))).toString() + "px";
        bigPopsicleClickable.style.marginTop = (totalTextHeight + bcMargin).toString() + "px";


        // Clickable div abs
        if (!popAbsoluteDivSetup) {
            bigPopsicleClickableAbs.style.height = height.toString() + "px";
            bigPopsicleClickableAbs.style.width = width.toString() + "px";
            bigPopsicleClickableAbs.style.marginLeft = ((canvas.width - (x + width))).toString() + "px";
            bigPopsicleClickableAbs.style.marginRight = ((canvas.width - (x + width))).toString() + "px";
            bigPopsicleClickableAbs.style.marginTop = (totalTextHeight + bcMargin).toString() + "px";
            popAbsoluteDivSetup = true;
        }

        // Bucket
        let gimg = droplets >= reqDroplets ? images["bucket1-full.png"].cloneNode(false) : images["bucket1-empty.png"].cloneNode(false);
        if (bucketHover)
            gimg = droplets >= reqDroplets ? images["bucket1-hover.png"].cloneNode(false) : images["bucket1-empty-hover.png"].cloneNode(false);
        let gscale = Math.min(canvas.width / gimg.width, canvas.height / gimg.height);
        gscale /= 1.25;
        let gwidth = gimg.width * gscale;
        let gheight = gimg.height * gscale;
        let gx = (canvas.width / 2) - (gwidth / 2);
        let gy = canvas.height - gheight / 2;
        ctx.drawImage(gimg, gx, gy, gwidth, gheight);

        ctx.fillStyle = "black";
        ctx.font = fontpx * 50 + "px 'Kavoon'"
        let droText = formatSci(droplets) + "/" + formatSci(reqDroplets);
        ctx.fillText(droText, (canvas.width / 2) - (quickMeasureWidth(droText, ctx) / 2), canvas.height - quickMeasureHeight(droText, ctx) - tMarg*0.5);

        // Clickable div
        bucketClickable.style.height = gheight.toString() + "px";
        bucketClickable.style.width = gwidth.toString() + "px";
        bucketClickable.style.marginLeft = gx.toString() + "px";
        bucketClickable.style.marginRight = gx.toString() + "px";
        bucketClickable.style.marginTop = gy.toString() + "px";

        // Droplets
        let c = anDroplets.length - 1;

        while(anDroplets[c] && c > 0) {
            let el = anDroplets[Math.abs(c - anDroplets.length)];
            let timeLeft = el['timeLeft'];

            el['timeLeft'] = timeLeft - tickSpeed;
            let image = images[el['image']].cloneNode(false);
            let x = el['size'][0];
            let y = el['size'][1];
            let w = el['size'][2];
            let h = el['size'][3];
            el['size'][1] += 2;

            ctx.globalAlpha = rangeConvert(timeLeft, el['maxTime'], 0, 1, 0);
            ctx.drawImage(image, x, y, w, h);
            // Click bonus
            ctx.fillStyle = "white";

            ctx.font = fontpx * 40 + "px 'Kavoon'"
            let numEarned = cpc < 10 ? "+" + formatSci(cpc, 2)
                : "+" + formatSci(cpc)
            ctx.fillText(numEarned, x + w + window.innerWidth * 0.005, y + h / 2);


            ctx.globalAlpha = 1;

            if (timeLeft <= 0)
                anDroplets.splice(Math.abs(c - anDroplets.length), 1);
            c--;
        }


        // Tooltip
        if (currTooltip) {
            let u = currTooltip['upgrade']
            let ttStrings;

            if (u instanceof Upgrade) {
                u.updateState();
                ttStrings = [
                    [false, fontpx * 50 + "px 'Open Sans'", u.name, 'white'],
                    [true, fontpx * 60 + "px 'Open Sans'", "$" + formatSci(u.cost), '#c2cc52'],
                    [false, fontpx * 40 + "px 'Open Sans'", "[Upgrade]", '`lightgray`'],
                    ["<hr>"],
                    [false,fontpx * 36 + "px 'Open Sans'", u.info, 'navajowhite'],
                    [false, fontpx * 36 + "px 'Open Sans'", '“' + u.description + '”', '#a5a49f']
                ];
                if (u.type === "collector") {
                    let desc = "Will not activate unless you have less than " + reqDroplets + plrl(reqDroplets, " droplet") + "!";
                    ttStrings.push([false, fontpx * 36 + "px 'Open Sans'", desc, '#d2809b'])
                }
            } if (u instanceof Boost) {
                ttStrings = [
                    [false, fontpx * 40 + "px 'Open Sans'", boostsData[u.name].name, 'white'],
                    [false, fontpx * 35 + "px 'Open Sans'", boostsData[u.name].description, 'lightgray'],
                    [false, fontpx * 35 + "px 'Open Sans'", Math.round(u.timeLeft / 1000) + plrl(Math.round(u.timeLeft / 1000), " second") + " remaining", 'navajowhite']
                ];
            } else if (u instanceof Building) {
                ttStrings = [
                    [false, fontpx * 50 + "px 'Open Sans'", u.name, 'white'],
                    [true, fontpx * 60 + "px 'Open Sans'", "$" + formatSci(u.currentCost), '#C2CC52'],
                    [false, fontpx * 40 + "px 'Open Sans'", "[Owned: " + formatSci(u.amount) + "]", 'lightgray'],
                    ["<hr>"],
                    [false, fontpx * 40 + "px 'Open Sans'", u.description, 'navajowhite'],
                    ["<hr>"],
                    [false, fontpx * 36 + "px 'Open Sans'", "Each " + u.name.toLowerCase() + " produces<#f1f1f1 " + (u.amount === 0 ? formatSci(u.baseProduction * u.multiplier) : formatSci(u.production * u.multiplier)) + plrl(u.production * u.multiplier, " droplet") + "</> per second.", '#a5a49f'],
                    [false, fontpx * 36 + "px 'Open Sans'", "<#f1f1f1" + u.amount + " " + plrl(u.amount, u.name.toLowerCase()) + "</> producing<#f1f1f1 " + formatSci(u.production * u.amount * u.multiplier) + plrl(u.production * u.amount * u.multiplier, " droplet") + "</> per second.", '#a5a49f'],
                    [true, fontpx * 36 + "px 'Open Sans'", "[<#fff1f1" + (dps !== 0 ? (((u.production*u.amount*u.multiplier)/dps)*100).toFixed(0) : dps) + "%</> of DpS]", '#f1f1f1']
                ];
            } else if (u === "prestige") {
                ttStrings = [
                    [false, fontpx * 36 + "px 'Open Sans'", "Ascending now would grant you<#f1f1f1 " + (checkPrestige()[0] < 1 ? "no prestige</>." : formatSci(checkPrestige()[0]) + " prestige " + plrl(checkPrestige()[0], "level") + "</> (+" + formatSci(checkPrestige()[0]) + "% dps)."), '#a5a49f'],
                    [false, fontpx * 36 + "px 'Open Sans'", "You need<#f1f1f1 " + formatSci(checkPrestige()[1]) + "</> more popsicles for the next level.", '#a5a49f'],
                    [false, fontpx * 36 + "px 'Open Sans'", "Multiplier:<#f1f1f1 " + multiplier + "%</>", '#a5a49f'],
                ];
            } else if (u === "mysteryBuilding") {
                ttStrings = [
                    [false, fontpx * 50 + "px 'Open Sans'", "???", 'white'],
                    [true, fontpx * 60 + "px 'Open Sans'", "$" + formatSci(mysteryBuilding.baseCost), '#C2CC52'],
                    [false, fontpx * 40 + "px 'Open Sans'", "???", 'lightgray'],
                    ["<hr>"],
                    [false, fontpx * 40 + "px 'Open Sans'", "???", 'navajowhite'],
                    ["<hr>"],
                ];
            }

            let marg = 15;
            let boxHeight = marg;
            let boxWidth = 0;


            let tempStyle = ttctx.fillStyle;
            ttctx.fillStyle = ttStrings[0][1];
            let flaSize = quickMeasureHeight(ttStrings[0][1], ttctx) * 4.5;
            ttctx.fillStyle = tempStyle;

            for (let i = 0; i < ttStrings.length; i++) {
                if (ttStrings[i].length === 1) {
                    boxHeight += marg;
                    continue;
                }

                let xOff = 0;

                tooltipMeasure(ttStrings[i]);

                if (i <= 2 && (u instanceof Upgrade || u instanceof Building))
                    xOff += flaSize;
                if (ttStrings[i][0] === true)
                    xOff += ttStrings[i-1][5];
                if (ttStrings[i][2].includes("$"))
                    xOff += window.innerHeight * 0.04 + marg * 2;
                if (ttStrings[i][0] === false)
                    boxHeight += ttStrings[i][4] + marg;

                if (ttStrings[i][5] + xOff > boxWidth)
                    boxWidth = ttStrings[i][5] + xOff;
            }

            let distance = document.getElementById("upgradeRows").getBoundingClientRect().top;
            let uCH = Math.max(window.innerHeight * 0.1, 75);

            let w = boxWidth + marg * 2;
            let x = ttcanvas.width - w - 1;
            let y = 0;

            if (u instanceof Upgrade) {
                if (distance >= 0)
                    y = Math.min(distance, uCH);
                else
                    y = uCH;
            } if (u instanceof Boost) {
                x = 1;
                distance = u.div.getBoundingClientRect().top;
                y = distance;
            } else if (u instanceof Building || u === "mysteryBuilding") {
                if ((currTooltip['y'] + ttrect.top - marg) + boxHeight > window.innerHeight)
                    y = window.innerHeight - boxHeight - 1;
                else
                    y = currTooltip['y'] + ttrect.top - marg;
            } else if (u === "prestige") {
                y = uCH;
            }

            let totalHeight = y;

            // Tooltip box
            drawBorder(x, y, w, boxHeight, 1)

            ttctx.fillStyle = '#43887A';
            ttctx.fillRect(x, y, w, boxHeight)

            if (u instanceof Upgrade || u instanceof Building) {
                let flaImg = images["upgrade.png"].cloneNode(false);
                if (u instanceof Building && u.name === "Dad" || u instanceof Upgrade && u.type === "dad")
                    flaImg = images["icon-dad.png"].cloneNode(false);
                else if (u instanceof Building && u.name === "Cursor" || u instanceof Upgrade && u.type === "cursor")
                    flaImg = images["icon-cursor.png"].cloneNode(false);
                else if (u instanceof Upgrade && u.type === "bucket")
                    flaImg = images["icon-bucket.png"];
                else if (u instanceof Upgrade && u.type === "stick")
                    flaImg = images["icon-stick.png"];
                else if (u instanceof Upgrade && u.type === "collector")
                    flaImg = images["icon-collector.png"];
                ttctx.drawImage(flaImg, x + marg, y + marg, flaSize, flaSize);
            }
            for (let i = 0; i < ttStrings.length; i++) {
                let offset = 0;
                if ((i === 0 || i === 2) && (u instanceof Upgrade || u instanceof Building))
                    offset = flaSize + marg;
                if (ttStrings[i].length === 1) {
                    if (ttStrings[i][0] === "<hr>") {
                        let gr = ttctx.createLinearGradient(x + marg, totalHeight + marg, x + w - marg, totalHeight + marg);

                        gr.addColorStop(0, '#43887A');
                        gr.addColorStop(.2, 'cyan');
                        gr.addColorStop(.8, 'cyan');
                        gr.addColorStop(1, '#43887A');

                        ttctx.strokeStyle = gr;
                        ttctx.beginPath();
                        ttctx.moveTo(x + marg, totalHeight + marg);
                        ttctx.lineTo(x + w - marg, totalHeight + marg);
                        ttctx.stroke();
                    }
                    totalHeight += marg;
                    continue;
                    } else if (ttStrings[i][2].includes("$")) {
                    ttStrings[i][2] = ttStrings[i][2].replace("$", "");

                    let tImg = images["smallPop-1.png"].cloneNode(false);

                    let tSize = window.innerHeight * 0.04;

                    let tempStyle = ttctx.fillStyle;
                    ttctx.fillStyle = ttStrings[i][1];
                    ttctx.drawImage(tImg, x + w - tSize - ttStrings[i][5] - marg - 5, y + marg - ttStrings[i][4] / 4, tSize, tSize);
                    ttctx.fillStyle = tempStyle;
                }
                if (ttStrings[i][0] === false)
                    totalHeight += ttStrings[i][4] + marg;
                ttctx.fillStyle = ttStrings[i][3];
                ttctx.font = ttStrings[i][1];
                let textPieces = [];
                // If some text is highlighted
                if (ttStrings[i][2].includes("</>")) {
                    let ind = getIndicesOf("<#", ttStrings[i][2], false);
                    let ind2 = getIndicesOf("</>", ttStrings[i][2], false);

                    for (let j = 0; j < ind.length; j++) {
                        let id = ind[j];
                        let id2 = ind2[j];
                        let color = ttStrings[i][2].substr(id + 1, 7);
                        let t1;
                        if (j === 0)
                            t1 = ttStrings[i][2].substring(0, id);
                        else
                            t1 = ttStrings[i][2].substring(ind2[j - 1] + 3, id);
                        let t2 = ttStrings[i][2].substring(id + 8, id2);
                        textPieces.push([t1, ttStrings[i][3]]);
                        textPieces.push([t2, color]);
                    }
                    textPieces.push([ttStrings[i][2].substr(ind2[ind2.length - 1] + 3), ttStrings[i][3]]);
                }
                if (textPieces.length === 0)
                    if (ttStrings[i][0] === true) {
                        ttctx.strokeStyle = "#585f27"
                        ttctx.fillText(ttStrings[i][2], x + w - ttStrings[i][5] - marg + offset, totalHeight);
                        ttctx.strokeText(ttStrings[i][2], x + w - ttStrings[i][5] - marg + offset, totalHeight);
                    }
                    else
                        ttctx.fillText(ttStrings[i][2], x + marg + offset, totalHeight);
                else {
                    if (ttStrings[i][0] === true) {
                        for (let j = 0; j < textPieces.length; j++) {
                            ttctx.fillStyle = textPieces[j][1];
                            ttctx.fillText(textPieces[j][0], x + w - ttStrings[i][5] - marg + offset, totalHeight);
                            offset += quickMeasureWidth(textPieces[j][0], ttctx);
                        }
                    } else {
                        for (let j = 0; j < textPieces.length; j++) {
                            ttctx.fillStyle = textPieces[j][1];
                            ttctx.fillText(textPieces[j][0], x + marg + offset, totalHeight);
                            offset += quickMeasureWidth(textPieces[j][0], ttctx);
                        }
                    }
                }
            }
        }
    }

    // Draw border around tooltips
    function drawBorder(xPos, yPos, width, height, thickness = 1 , context = ttctx, color = 'white') {
        context.fillStyle = color;
        context.fillRect(xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2));
    }

    function tooltipMeasure(i) {
        let font = i[1];
        let text = i[2];

        if (text.includes("</>")) {
            text = text.substring(0, text.indexOf("<#")) + text.substr(text.indexOf("<#") + 7);
            text = text.replace("</>", "");
        }

        ttctx.font = font;
        let sizeMeasure = ttctx.measureText(text);
        let height = sizeMeasure.actualBoundingBoxAscent;
        let width = sizeMeasure.actualBoundingBoxRight;

        i.push(height, width);
    }

    function quickMeasureWidth(text, context) {
        let sizeMeasure = context.measureText(text);
        return sizeMeasure.actualBoundingBoxRight;
    }
    function quickMeasureHeight(text, context) {
        let sizeMeasure = context.measureText(text);
        return sizeMeasure.actualBoundingBoxAscent;
    }

    function getIndicesOf(searchStr, str, caseSensitive) {
        let searchStrLen = searchStr.length;
        if (searchStrLen === 0) {
            return [];
        }
        let startIndex = 0, index, indices = [];
        if (!caseSensitive) {
            str = str.toLowerCase();
            searchStr = searchStr.toLowerCase();
        }
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }
        return indices;
    }

    // Convert between number ranges
    function rangeConvert(oldValue, oldMax, oldMin, newMax, newMin) {
        let oldRange = (oldMax - oldMin)
        let newRange = (newMax - newMin)
        return ((((oldValue - oldMin) * newRange) / oldRange) + newMin)
    }

    // Runs CSS animations on element again
    function reset_animation(element) {
      element.style.animation = 'none';
      element.offsetHeight; /* trigger reflow */
      element.style.animation = null;
    }

    function drawDroplet(x, y) {
        if (!x || !y) {
            let bpcRect = bigPopsicleClickable.getBoundingClientRect();
            x = getRandomInt(bpcRect.left, bpcRect.left + bigPopsicleClickable.offsetWidth);
            y = getRandomInt(bpcRect.top, bpcRect.top + bigPopsicleClickable.offsetHeight);
        }
        let img = images["droplet.png"].cloneNode(false);

        let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        scale /= 15;
        let width = img.width * scale;
        let height = img.height * scale;

        return([x - rect.left - (width / 2), y - rect.top - (height / 2), width, height]);
    }

    function onDocumentClick(event) {
        if (event.target === bigPopsicleClickable || event.target === bigPopsicleClickableAbs) {
            onBigPopsicleClick(event.clientX, event.clientY);
        }
        else if (event.target === bucketClickable) {
            onBucketClick();
        }
    }

    function onDocumentRightClick(event) {
        if (event.target === bigPopsicleClickable || event.target === bigPopsicleClickableAbs || event.target === bucketClickable) {
            event.preventDefault();
            shortcutBucketClick();
            return false;
        }
        return true;
    }

    function onDocumentKeyUp(event) {
        switch (event.code) {
            case 'Space':
                onSpacebarPressed(event);
                break;
        }
    }

    function onSpacebarPressed(event) {
        shortcutBucketClick();
    }

    function shortcutBucketClick(event) {
        if (onBucketClick()) {
            onBucketHover();
            setTimeout(() => onBucketOut(), 100);
        }
    }

    function onDocumentHover(event) {
        let target = event.target;
        anBigHover = target === bigPopsicleClickable || target === bigPopsicleClickableAbs;
        if (!target.classList.contains("buyBuilding") && !target.classList.contains("upgradeButton") && !target.classList.contains("clickable-div-boost")) {
            for (let depth = 0; depth < 3; depth++) {
                if (!target.parentElement)
                    break;
                target = target.parentElement;
                if (target.classList.contains("buyBuilding") || target.classList.contains("upgradeButton") || target.classList.contains("clickable-div-boost")) {
                    break;
                }
            }
        }
        if (target.classList.contains("buyBuilding")) {
            let b = buildings[target.id.substr(3).toLowerCase()];
            if (mysteryBuilding != null && target.id === "mysteryBuilding")
                b = "mysteryBuilding";
            if (b === currTooltip)
                return;
            currTooltip = {"x": event.clientX, "y": event.clientY, "upgrade": b};
        } else if (target.classList.contains("upgradeButton")) {
            let b = upgrades[parseInt(target.id.substr(7))];
            if (b === currTooltip)
                return;
            currTooltip = {"x": event.clientX, "y": event.clientY, "upgrade": b};
        }  else if (target.classList.contains("clickable-div-boost")) {
            let b = boosts[target.id.substr(6)];
            if (b === currTooltip)
                return;
            currTooltip = {"x": event.clientX, "y": event.clientY, "upgrade": b};
        } else {
            if (currTooltip && currTooltip['upgrade'] !== "prestige")
                currTooltip = null;
        }
    }

    function onDocumentMouseLeave(event) {
        let target = event.target;
        if (target.classList.contains("buyBuilding") || target.classList.contains("upgradeButton")) {
            currTooltip = null;
        } else if (target === bigPopsicleClickable || target === bigPopsicleClickableAbs) {
            if (anBigClick !== 0) {
                anBigClick = 0;
            }
        }
    }

    function onDocumentMouseDown(event) {
        if (event.target === bigPopsicleClickable || event.target === bigPopsicleClickableAbs) {
            anBigClick = -1;
        }
    }
    function onDocumentMouseUp(event) {
        if (event.target === bigPopsicleClickable || event.target === bigPopsicleClickableAbs) {
            anBigClick = 1;
        }
    }
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateNews() {
        const newsLabel = document.getElementById("newsText");
        let news = newsData[Math.floor(Math.random() * newsData.length)];
        while (news === newsLabel.innerText)
            news = newsData[Math.floor(Math.random() * newsData.length)];
        newsLabel.innerText = news;
        playSound('page-flip.mp3');
    }

    function flashBackground(color, time) {
        let leftArea = document.getElementById("leftArea");
        let bg = leftArea.style.backgroundColor;
        leftArea.style.backgroundColor = color;
        setTimeout(() => leftArea.style.backgroundColor = bg, time);
    }

    function loadImages(callback) {
        let loadedImageCount = 0;

        for (let i = 0; i < imageData.length; i++){
            let img = new Image();
            img.onload = imageLoaded;
            img.src = "images/" + imageData[i];
            images[imageData[i]] = img;
        }

        function imageLoaded() {
            loadedImageCount++;
            if (loadedImageCount >= imageData.length) {
                callback();
            }
        }
    }

    function prestige() {
        let prestigePoints = checkPrestige()[0];
        if (prestigePoints < 1)
            return;
        Object.values(buildings).forEach((b) => {
            b.presReset();
        });
        upgrades.forEach((u) => {
            u.presReset();
        })
        resetVariables();

        lifetimeTruePops += prestigePoints;
        multiplier += lifetimeTruePops * 0.01;
    }

    function checkPrestige() {
        let truePops = Math.cbrt(lifetimePops / (10 ** 12));
        // How many pops [true popsicles] are worth
        let truePopsWorth = Math.ceil((truePops ** 3) * (10 ** 12));
        let nextTruePopWorth = (Math.floor(truePops + 1) ** 3) * (10 ** 12);
        return [truePops, nextTruePopWorth - lifetimePops];
    }

    function spawnGoldenPop() {
        let img = images['goldenPop-1.png'].cloneNode(false);
        let imgDiv = document.createElement("div");
        img.classList.add("goldenPopsicle");
        img.style.height = 15 + "vh";
        img.style.width = "auto";
        img.setAttribute('draggable', false);
        imgDiv.style.top = Math.floor(Math.random() * 90) + "%";
        imgDiv.style.left = Math.floor(Math.random() * 90) + "%";
        imgDiv.classList.add("goldenPopsicleDiv");
        document.body.appendChild(imgDiv);
        imgDiv.appendChild(img);
        imgDiv.addEventListener("click", () => clickGoldenPop(imgDiv, false));
        setTimeout(() => clickGoldenPop(imgDiv, true), 15000);
        setTimeout(() => imgDiv.classList.add("opacityTrans"), 10);
    }

    function clickGoldenPop(el, fake) {
        el.classList.remove("opacityTrans");
        if (el.children[0].classList.contains("goldenPopsicleText"))
            return;
        if (fake) {
            el.remove();
            return;
        }
        let b = new Boost(boostTypes[Math.floor(Math.random() * boostTypes.length)]);
        boosts.push(b);
        el.removeChild(el.children[0]);
        let txt = document.createElement('h1');
        txt.textContent = boostsData[b.name].name + "!";
        txt.classList.add("goldenPopsicleText");
        el.appendChild(txt);
        el.classList.add("goldenPopsicleDivDis", "goldenPopsicleDivBehind");
        el.style.left = (parseInt(el.style.left.substr(0, el.style.left.length-1))-2) + "%";

        // Golden popsicle border
        let animOverlay = document.getElementsByClassName("leftAreaAbs")[1];
        if (!animOverlay.classList.contains("pulsatingBorderGold"))
            animOverlay.classList.add("pulsatingBorderGold");
        else
            reset_animation(animOverlay)

        playSound('click2.mp3');
        setTimeout(() => txt.classList.add("opacityTrans"), 10);
        setTimeout(() => el.remove(), 3000);
    }

    function hideMystery() {
        document.getElementById("mysteryBuilding").classList.add("hidden");
        mysteryBuilding = null;
    }

    function showMystery() {
        document.getElementById("mysteryBuilding").classList.remove("hidden");
    }

    function resetVariables() {
        totalPops = 0;
        runPops = 0;
        growthRate = 1.15;
        clickMultiplier = 1;
        dpsClicks = 0.00;
        cpc = 0;
        totalBuildings = 0;
        dps = 0;
        multiplier = 1;
        boughtUpgrades = [];
    }

    function onBucketHover() {
        bucketHover = true;
    }

    function onBucketOut() {
        bucketHover = false;
    }

    window.onresize = onWindowResize;
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('mouseup', onDocumentMouseUp);
    document.addEventListener('mouseover', onDocumentHover);
    document.addEventListener('mouseout', onDocumentMouseLeave);
    document.addEventListener('mousemove', onDocumentHover);
    document.addEventListener('contextmenu', onDocumentRightClick);
    document.addEventListener('keyup', onDocumentKeyUp);
    bucketClickable.addEventListener('mousedown', onBucketHover)
    bucketClickable.addEventListener('mouseup', onBucketOut)
    sortedUpgrades.forEach((e) => e.makeHtml());
    document.getElementById("cover").classList.remove('hidden');
    setupCanvas();
    popCanvas();
    setupCanvas();
    Object.values(buildings).forEach((e) => e.setupInnerCanvas());
    hideMystery();
    gameLoop();
}

class Building {
    name;
    description;
    baseCost;
    baseProduction;
    currentCost;
    buyButton;
    namePriceRows;
    labelButton;
    priceButton;
    ownedButton;
    canvasDiv;
    canvas;
    ctx;
    amount;
    production;
    multiplier = 1;
    hidden = true;
    cImgs = [];
    imgs = [];

    constructor(baseCost, baseProduction, name, description) {
        this.baseCost = baseCost;
        this.currentCost = baseCost;
        this.name = name;
        this.description = description;
        this.amount = 0;
        this.baseProduction = baseProduction;

        if (this.name !== "Cursor") {
            this.canvasDiv = document.createElement("div");
            this.canvasDiv.classList.add("innerCanvasDiv");
            document.getElementById("lowerCenter").appendChild(this.canvasDiv);
            this.canvas = document.createElement("canvas");
            this.canvas.classList.add("innerCanvas");
            this.canvas.id = this.name.toLowerCase() + "Canvas";
            this.canvas.style.width ='100%';
            this.canvas.style.height='100%';
            this.canvasDiv.appendChild(this.canvas);

            this.ctx = this.canvas.getContext("2d");
        } else {
            this.hidden = false;
        }

        this.buyButton = document.createElement("div");
        this.buyButton.classList.add("buyBuilding");
        this.buyButton.id = "buy" + name;
        let buyRows = document.getElementById("buyRows");
        buyRows.insertBefore(this.buyButton, buyRows.children[buyRows.children.length - 1]);

        this.namePriceRows = document.createElement("div");
        this.namePriceRows.classList.add("namePriceRows");
        this.buyButton.appendChild(this.namePriceRows);

        let icon = images['upgrade.png'].cloneNode(false);
        if (this.name === "Dad")
            icon = images['icon-dad.png'].cloneNode(false);
        else if (this.name === "Cursor")
            icon = images['icon-cursor.png'].cloneNode(false);
        icon.classList.add("buildingIcon");
        icon.ondragstart = () => {return false};
        this.buyButton.appendChild(icon);

        this.labelButton = document.createElement("span");
        this.labelButton.classList.add("buyBuildingLabel");
        this.labelButton.innerText = this.name;
        this.namePriceRows.appendChild(this.labelButton);
        this.namePriceRows.appendChild(document.createElement("br"));

        this.priceButton = document.createElement("span");
        this.priceButton.classList.add("buyBuildingCost");
        this.priceButton.id = "price" + this.name;
        this.priceButton.ondragstart = () => {return false};
        this.namePriceRows.appendChild(this.priceButton);

        let img = images['smallPop-1.png'].cloneNode(false);
        img.style.height = "25px";
        img.style.width = "auto";
        this.priceButton.appendChild(img);

        this.ownedButton = document.createElement("span");
        this.ownedButton.classList.add("ownedBuilding");
        this.ownedButton.id = "owned" + this.name;
        this.buyButton.appendChild(this.ownedButton);


        this.buyButton.onclick = () => this.buyBuilding();
        if (this.name !== 'Cursor')
            this.hideBuilding();
        this.deactivateBuilding();
        this.buyBuilding();
    }

    buyBuilding() {
        let currentCost = this.currentCost;
        let amount = this.amount;
        if (totalPops >= currentCost) {
            totalPops -= currentCost;
            amount++;
            totalBuildings++;
            playSound('click.mp3');
        }
        this.amount = amount;
        this.determineCost();
        upgrades.forEach(e => {
            e.checkAvailable();
        })
        findDps();
        if (Object.keys(images).length > 0 && this.canvas) {
            this.drawInnerCanvas();
        }
    }

    determineCost() {
        this.currentCost = Number((this.baseCost * (growthRate ** this.amount)).toFixed()); // Formula for determining cost
        this.determineProd()

        this.priceButton.innerHTML = this.priceButton.innerHTML.substr(0, this.priceButton.innerHTML.indexOf("\">") + 2) + formatSci(this.currentCost);
        this.ownedButton.innerText = formatSci(this.amount);
    }

    determineProd() {
        if (this.name === "Cursor") {
            this.production = clickMultiplier * dpsClicks;
        } else {
            // Formula for determining production
            this.production = this.baseProduction;
        }
    }

    presReset() {
        this.amount = 0;
        this.multiplier = 1;
        if (!(this.name === "Cursor")) {
            this.hidden = true;
            this.hideBuilding();
            this.deactivateBuilding();
        }
        this.drawInnerCanvas();
        this.determineCost();
    }

    mysteryUnlock() {
        let mys = document.getElementById("mysteryCost");
        let imgString = "<img src=\"images/smallPop-1.png\" style=\"height: 25px; width: auto;\">";
        mys.innerHTML = imgString + this.baseCost;
        mysteryBuilding = this;
    }

    setupInnerCanvas() {
        if (this.name === "Cursor")
            return;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    newUpgrade(u) {
        if (u.type === this.name.toLowerCase()) {
            if (u.name === "Samsung® Smart Apron") {
                this.imgs.push(images['dad-apron.png'].cloneNode(false));
            }
            if (u.name === "Samsung® Smart Beer") {
                this.imgs.push(images['dad-beer.png'].cloneNode(false));
                this.imgs.push(images['dad-beer2.png'].cloneNode(false));
            }
        }
        for (let i = 0; i < this.cImgs.length; i++) {
            if (this.cImgs[i] === 0)
                this.cImgs[i] = Math.floor(Math.random() * this.imgs.length);
        }
    }

    drawInnerCanvas() {
        if (!this.ctx)
            return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.imgs.length === 0)
            this.imgs.push(images[this.name.toLowerCase() + ".png"].cloneNode(false));

        let x = 0;
        let y = 0;


        for (let i = 0; i < this.amount; i++) {

            if (i >= this.cImgs.length) {
                let rNum = Math.floor(Math.random() * this.imgs.length);
                this.cImgs.push(rNum);
            }

            let img = this.imgs[this.cImgs[i]];
            let scale = Math.min(this.canvas.width / img.width, this.canvas.height / img.height);
            scale /= 1;

            let width = img.width * scale;
            let height = img.height * scale;

            if (x > this.canvas.width)
                break;
            this.ctx.drawImage(img, x, y, width, height);
            x += width;
        }
    }

    unhideBuilding() {
        if (this.name === "Cursor")
            return;
        this.buyButton.classList.remove('hidden');
        this.canvasDiv.classList.remove('hidden');
        this.hidden = false;
        this.setupInnerCanvas();
    }

    hideBuilding() {
        if (this.name === "Cursor")
            return;
        this.buyButton.classList.add('hidden');
        this.canvasDiv.classList.add('hidden');
    }

    activateBuilding() {
        this.buyButton.classList.remove("disabled");
    }

    deactivateBuilding() {
        this.buyButton.classList.add("disabled");
    }
}

class Upgrade {
    cost;
    name;
    type;
    tier;
    requiredBuildings;
    htmlTag;
    description;
    uid;
    info;
    bought = false;

    constructor(name, type, tier, description) {
        this.name = name;
        this.type = type;
        this.tier = tier;
        this.description = description;
        this.uid = upgrades.length;

        this.updateState();
    }

    updateState() {
        if(this.tier === 1)
            this.requiredBuildings = 1;
        else if(this.tier === 2)
            this.requiredBuildings = 5;
        else if(this.tier === 3)
            this.requiredBuildings = 10;
        else if(this.tier === 4)
            this.requiredBuildings = 25;
        else
            this.requiredBuildings = 50 * (this.tier - 3);

        switch (this.type){
            case "cursor": {
                this.cost = buildings[this.type].baseCost * 5 *
                    (growthRate ** this.requiredBuildings) / growthRate;
                this.info = "The mouse and cursors are<#f1f1f1 twice</> as efficient."
                break;
            }
            case "stick": {
                this.cost = 10 * (growthRate ** (this.tier * 10)) / growthRate;
                this.info = "Bucket clicks produce <#f1f1f1 " + parseFloat(((popsPerClick + 0.01) * reqDroplets * dMult).toFixed(2)) + "</> more popsicles per click.";
                break;
            }
            case "bucket": {
                this.cost = 5 * (growthRate ** (this.tier * 10)) / growthRate;
                this.info = "Maximum droplets<#f1f1f1 doubled</>.";
                break;
            }
            case "collector": {
                this.cost = 10 * (growthRate ** (this.tier * 10)) / growthRate;
                this.info = "Generates<#f1f1f1 " + Math.pow(2, this.tier - 1) + "</>  free " + plrl(Math.pow(2, this.tier - 1), "popsicle") + " every <#f1f1f1 " + Math.max(1, 100 - Math.floor((this.tier - 1) / 2)) + "</> droplets.";
                break;
            }
            default: {
                this.cost = buildings[this.type].baseCost * 5 *
                    (growthRate ** this.requiredBuildings) / growthRate;
                this.info = this.type.charAt(0).toUpperCase() + this.type.slice(1) + "s are<#f1f1f1 twice</> as efficient."
            }
        }
        this.cost = Math.floor(this.cost);
    }

    makeHtml() {
        let upgrade = images['upgrade.png'].cloneNode(false);
        switch (this.type) {
            case ("cursor"): {
                upgrade = images['icon-cursor.png'].cloneNode(false);
                break;
            }
            case ("dad"): {
                upgrade = images['icon-dad.png'].cloneNode(false);
                break;
            }
            case ("bucket"): {
                upgrade = images['icon-bucket.png'].cloneNode(false);
                break;
            }
            case ("stick"): {
                upgrade = images['icon-stick.png'].cloneNode(false);
                break;
            }
            case ("collector"): {
                upgrade = images['icon-collector.png'].cloneNode(false);
                break;
            }
        }

        let upgradeRows = document.getElementById("upgradeRows");
        upgrade.classList.add("upgradeButton");
        upgrade.id = "upgrade" + this.uid;
        if (!upgradeColors[this.tier]) {
            upgradeColors[this.tier] = Math.floor(Math.random() * 16777215).toString(16);
        }

        upgrade.style.backgroundColor = "#" + upgradeColors[this.tier];

        upgrade.onclick = () => this.buyUpgrade();
        this.htmlTag = upgrade;
        upgradeRows.append(upgrade);
        upgrade.ondragstart = () => {return false};

        this.deactivateUpgrade();
        this.hideUpgrade();
    }

    buyUpgrade() {
        if (this.bought || totalPops < this.cost)
            return;
        totalPops -= this.cost;
        playSound('click.mp3');

        switch (this.type) {
            case "cursor": {
                clickMultiplier *= 2;
                break;
            }
            case "stick": {
                popsPerClick += 0.01;
                break;
            }
            case "bucket": {
                dMult *= 2;
                break;
            }
            case "collector": {
                bonusDroplets = Math.pow(2, this.tier - 1);
                bonusDropletsInterval = Math.max(1, 100 - Math.floor((this.tier - 1) / 2));
                break;
            }
            default: {
                buildings[this.type].multiplier *= 2;
                break;
            }
        }
        this.bought = true;
        boughtUpgrades.push(this);

        Object.values(buildings).forEach((e) => {
            e.newUpgrade(this);
            e.drawInnerCanvas();
        });
        this.hideUpgrade();
        findDps();
    }

    checkAvailable(pres = false) {
        if (this.bought)
            return;
        let prevBought = this.tier === 1;
        boughtUpgrades.forEach(e => {
            if (e.type === this.type && e.tier === this.tier - 1) {
                prevBought = true;}});

        switch (this.type) {
            case "bucket":
            case "collector":
            case "stick": {
                if (prevBought)
                    this.unhideUpgrade();
                break;
            }
            default: {
                if (buildings[this.type].amount >= this.requiredBuildings)
                    this.unhideUpgrade();
            }
        }
    }

    presReset() {
        this.bought = false;
        this.checkAvailable(true);
    }

    activateUpgrade() {
        this.htmlTag.classList.remove("disabled");
    }

    deactivateUpgrade() {
        this.htmlTag.classList.add("disabled");
    }

    unhideUpgrade() {
        this.htmlTag.classList.remove("hidden");
    }

    hideUpgrade() {
        this.htmlTag.classList.add("hidden");
    }
}

class Boost {
    name;
    duration;
    timeLeft;
    div = null;
    isRunning = false;

    constructor(name) {
        this.name = name;
        if (name === 'autoBucketClick') {
            this.duration = 60 * 1000;
            this.timeLeft = 60 * 1000;
        }
        if (name === 'clickMultiplier') {
            this.duration = 15 * 1000;
            this.timeLeft = 15 * 1000;
        }
    }

    runBoost() {
        if (this.name === 'autoBucketClick' && !this.isRunning) {
            autoBucketClick += 1;
        }
        if (this.name === 'clickMultiplier' && !this.isRunning) {
            dpsClicks *= 5;
        }

        this.isRunning = true;
    }

    cancelBoost() {
        if (this.name === 'autoBucketClick') {
            autoBucketClick -= 1;
        }
        if (this.name === 'clickMultiplier') {
            dpsClicks /= 5;
        }
        this.div.remove();
    }

    createDiv(x, y, width, height, replace, index) {
        if (replace) {
            this.div.remove();
            this.div = null;
        }
        if (this.div)
            return;

        let clickableDiv = document.createElement('div');


        clickableDiv.style.width = width + "px";
        clickableDiv.style.height = height + "px";
        clickableDiv.style.left = x + "px";
        clickableDiv.style.top = y + "px";


        clickableDiv.classList.add('clickable-div-boost');
        clickableDiv.id = "boost-" + index;

        document.body.appendChild(clickableDiv);
        this.div = clickableDiv;
    }
}
