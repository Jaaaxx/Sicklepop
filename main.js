// Global variables
let totalCookies = 0;
let runCookies = 0;
let lifetimeCookies = 0;
let growthRate = 1.15;
let clickMultiplier = 1;
let cpsClicks = 0.00;
let cpc = 0;
let buildings = {};
let totalBuildings = 0;
let cps = 0;
let multiplier = 1;
let upgrades = [];
let boughtUpgrades = [];
let findCps;
let formatSci;
let plrl;
let images = {};
let upgradeColors = {};
let formatNums = [' million',' billion',' trillion',' quadrillion',' quintillion',' sextillion',' septillion',' octillion',' nonillion'];
let tickSpeed = 10;

function addCookies(num) {
    totalCookies += num;
    runCookies += num;
    lifetimeCookies += num;
}

window.onload = function() {
    // Semi-global variables
    let bigCookieClickable = document.getElementById("clickable-div-bigCookie");
    let newsDiv = document.getElementById("newsDiv");
    let newsTimer = 10000;
    let currTooltip;

    // Number formatting setup (thanks cookie clicker)
    let prefixes=['','un','duo','tre','quattuor','quin','sex','septen','octo','novem'];
    let suffixes=['decillion','vigintillion','trigintillion','quadragintillion','quinquagintillion','sexagintillion','septuagintillion','octogintillion','nonagintillion'];
    for (let i in suffixes)
    {
        for (let ii in prefixes)
        {
            formatNums.push(' '+prefixes[ii]+suffixes[i]);
        }
    }

    // Canvas Setup
    let canvas;
    let ctx;
    let rect;
    let textLabelsSize;
    let anSmallCookies = [{'timeLeft': 0, 'maxTime': 0, 'image': 'smallcookie.png', 'size': [0, 0, 0, 0]}];
    let anBigClick = 0;
    let anBigHover = false;

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
    findCps = function() {
        let r = 0;
        for (let b in buildings) {
            buildings[b].determineCost();
            r += buildings[b].production * buildings[b].amount;
        }
        cps = r * multiplier;
    }
    formatSci = function(num, decDigits = 0) {
        if (num < 1)
            return Number(num.toFixed(1)).toLocaleString();
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
        if (num === 1)
            return string;
        if (string.substr(string.length - 1) === "y")
            return string.substr(0, string.length - 1) + "ies"
        return string + "s";
    }

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
        totalCookies += cps / (tickSpeed * 10);
        runCookies += cps / (tickSpeed * 10);
        lifetimeCookies += cps / (tickSpeed * 10);
        newsTimer += tickSpeed;


        for (let b in buildings) {
            buildings[b].deactivateBuilding();
            if (buildings[b].hidden === true && totalCookies >= buildings[b].baseCost / 2) {
                buildings[b].unhideBuilding();
            }
            if (totalCookies >= buildings[b].currentCost) {
                buildings[b].activateBuilding();
            }
        }
        upgrades.forEach(e => {
            e.deactivateUpgrade();
            if (totalCookies >= e.cost) {
                e.activateUpgrade();
            }
            e.checkAvailable();
        })

        if (newsTimer >= (tickSpeed * 1000)) {
            newsTimer = 0;
            generateNews();
        }
        // Drawing function
        cookieCanvas();
    }, tickSpeed)}

    function onWindowResize() {
        setupCanvas();
        Object.values(buildings).forEach((e) => {
            e.setupInnerCanvas();
            e.drawInnerCanvas();
        });
    }


    function setupCanvas() {
        canvas = document.getElementById("cookieCanvas");
        ctx  = canvas.getContext("2d");
        rect = canvas.getBoundingClientRect();
        // Make it visually fill the positioned parent
        canvas.style.width ='100%';
        canvas.style.height='100%';
        // ...then set the internal size to match
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Text Labels Setup
        ctx.font = "40px 'Kavoon'"
        let totalCookiesString = formatSci(totalCookies) + plrl(totalCookies, " cookie");
        let thmTCS = ctx.measureText(totalCookiesString);

        ctx.font = "26px 'Kavoon'"
        let cpsString = "per second: " + formatSci(cps, 1);
        let thmCPS = ctx.measureText(cpsString);

        // Get height of text for spacing
        textLabelsSize = thmTCS.actualBoundingBoxAscent + thmTCS.actualBoundingBoxDescent +
            thmCPS.actualBoundingBoxAscent + thmCPS.actualBoundingBoxDescent;
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

    // Runs when big cookie is clicked
    function onBigCookieClick(clientX, clientY) {
        cpc = clickMultiplier + (cps * cpsClicks);
        totalCookies += cpc;
        runCookies += cpc;
        lifetimeCookies += cpc;
        let time = 1000;
        let x = clientX;
        let y = clientY;
        x += getRandomInt(-1 * window.innerWidth * 0.005, window.innerWidth * 0.005);
        y += getRandomInt(-1 * window.innerWidth * 0.005, window.innerWidth * 0.005);
        anSmallCookies.push({'timeLeft': time, 'maxTime': time, 'image': 'smallcookie.png', 'size': drawSmallCookie(x, y)})
    }

    function cookieCanvas() {
        let fontpx = window.innerWidth / 3750;

        // Clear Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ttctx.clearRect(0, 0, ttcanvas.width, ttcanvas.height);
        // Cookies Text
        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        ctx.font = fontpx * 60 + "px 'Kavoon'"
        let totalCookiesString;
        totalCookiesString = formatSci(totalCookies) + plrl(totalCookies, " cookie");

        ctx.fillText(totalCookiesString, canvas.width / 2, rect.top + canvas.height * 0.01);

        ctx.font = fontpx * 50 + "px 'Kavoon'"
        let cpsString = (cps < 10 && cps !== 0) ?
            "per second: " + formatSci(cps, 1)
            : "per second: " + formatSci(cps);
        ctx.fillText(cpsString, canvas.width / 2, rect.top + canvas.height * 0.01 + textLabelsSize * 1.25);

        // Big Cookie
        let img = images["cookie.png"];
        let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        scale /= 1.45;

        let yOffset = 0;

        if(anBigHover) {
            scale *= 1.04;
            yOffset -= scale * 30;
        }

        // Click animation
        if (anBigClick <= -1) {
            let scaleMinus;
            if (anBigClick >= -1000)
                scaleMinus = rangeConvert(anBigClick, -1, -1000, 0, scale / 10);
            else
                scaleMinus = rangeConvert(-1000, -1, -1000, 0, scale / 10);
            anBigClick -= 100;
            scale -= scaleMinus;
            yOffset += scaleMinus * 900;
        }
        let width = img.width * scale;
        let height = img.height * scale;

        let bcMargin = (canvas.height * 0.08) + yOffset;

        let x = (canvas.width / 2) - (width / 2);
        let y = textLabelsSize + rect.top + bcMargin;
        ctx.drawImage(img, x, y, width, height);

        let clickableDivBigCookie = document.getElementById("clickable-div-bigCookie");
        clickableDivBigCookie.style.height = height.toString() + "px";
        clickableDivBigCookie.style.width = width.toString() + "px";
        // Centering
        clickableDivBigCookie.style.marginLeft = ((canvas.width - (x + width))).toString() + "px";
        clickableDivBigCookie.style.marginRight = ((canvas.width - (x + width))).toString() + "px";
        clickableDivBigCookie.style.marginTop = (rect.top + textLabelsSize + bcMargin).toString() + "px";
        clickableDivBigCookie.style.marginBottom = (canvas.height - (height + rect.top + textLabelsSize + bcMargin)).toString() + "px";

        // Small cookies
        let c = anSmallCookies.length - 1;

        while(anSmallCookies[c] && c > 0) {
            let el = anSmallCookies[Math.abs(c - anSmallCookies.length)];
            let timeLeft = el['timeLeft'];

            el['timeLeft'] = timeLeft - tickSpeed;
            let image = images[el['image']];
            let x = el['size'][0];
            let y = el['size'][1];
            let w = el['size'][2];
            let h = el['size'][3];

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
                anSmallCookies.splice(Math.abs(c - anSmallCookies.length), 1);
            c--;
        }
        // Tooltip
        if (currTooltip) {
            let u = currTooltip['upgrade']
            let ttStrings;

            if (u instanceof Upgrade) {
                ttStrings = [
                    [false, fontpx * 50 + "px 'Open Sans'", u.name, 'white'],
                    [true, fontpx * 50 + "px 'Open Sans'", "$" + formatSci(u.cost), 'gold'],
                    [false, fontpx * 40 + "px 'Open Sans'", "[Upgrade]", 'lightgray'],
                    [false,fontpx * 36 + "px 'Open Sans'", u.info, 'navajowhite'],
                    [false, fontpx * 36 + "px 'Open Sans'", '“' + u.description + '”', 'gray']
                ];
            } else if (u instanceof Building) {
                ttStrings = [
                    [false, fontpx * 50 + "px 'Open Sans'", u.name, 'white'],
                    [true, fontpx * 50 + "px 'Open Sans'", "$" + formatSci(u.currentCost), 'gold'],
                    [false, fontpx * 40 + "px 'Open Sans'", "[Owned: " + formatSci(u.amount) + "]", 'lightgray'],
                    [false, fontpx * 40 + "px 'Open Sans'", u.description, 'navajowhite'],
                    [false, fontpx * 36 + "px 'Open Sans'", "Each " + u.name.toLowerCase() + " produces<#f1f1f1 " + formatSci(u.production) + plrl(u.production, " cookie") + "</> per second.", '#a5a49f'],
                    [false, fontpx * 36 + "px 'Open Sans'", "<#f1f1f1" + u.amount + " " + plrl(u.amount, u.name.toLowerCase()) + "</> producing<#f1f1f1 " + formatSci(u.production * u.amount) + plrl(u.production * u.amount, " cookie") + "</> per second.", '#a5a49f'],
                    [true, fontpx * 36 + "px 'Open Sans'", "[" + (cps !== 0 ? (((u.production*u.amount)/cps)*100).toFixed(0) : cps) + "% of cps]", '#f1f1f1']
                ];
            } else if (u === "prestige") {
                ttStrings = [
                    [false, fontpx * 36 + "px 'Open Sans'", "Ascending now would grant you<#f1f1f1" + (checkPrestige()[0] < 1 ? " no prestige</>." : formatSci(checkPrestige()[0]) + " prestige levels</> (+" + formatSci(checkPrestige()[0]) + "% cps)."), '#a5a49f'],
                    [false, fontpx * 36 + "px 'Open Sans'", "You need<#f1f1f1 " + formatSci(checkPrestige()[1]) + "</> more cookies for the next level.", '#a5a49f'],
                ];

            }

            let marg = 15;
            let boxHeight = marg;
            let boxWidth = 0;


            for (let i = 0; i < ttStrings.length; i++) {
                tooltipMeasure(ttStrings[i]);
                if (ttStrings[i][0] === false) {
                    boxHeight += ttStrings[i][4] + marg;
                    if (ttStrings[i][5] > boxWidth)
                        boxWidth = ttStrings[i][5];
                } else {
                    if (ttStrings[i][5] + ttStrings[i-1][5] > boxWidth)
                        boxWidth = ttStrings[i][5] + ttStrings[i-1][5] + marg;
                }
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
            } else if (u instanceof Building) {
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

            ttctx.fillStyle = 'saddlebrown';
            ttctx.fillRect(x, y, w, boxHeight)


            for (let i = 0; i < ttStrings.length; i++) {
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
                    if (ttStrings[i][0] === true)
                        ttctx.fillText(ttStrings[i][2], x + w - ttStrings[i][5] - marg, totalHeight);
                    else
                        ttctx.fillText(ttStrings[i][2], x + marg, totalHeight);
                else {
                    // console.log(textPieces);
                    let offset = 0;
                    if (ttStrings[i][0] === true) {
                        for (let j = 0; j < textPieces.length; j++) {
                            ttctx.fillStyle = textPieces[j][1];
                            ttctx.fillText(textPieces[j][0], x + w - ttStrings[i][5] - marg + offset, totalHeight);
                            offset += quickMeasureWidth(textPieces[j][0]);
                        }
                    } else {
                        for (let j = 0; j < textPieces.length; j++) {
                            ttctx.fillStyle = textPieces[j][1];
                            ttctx.fillText(textPieces[j][0], x + marg + offset, totalHeight);
                            offset += quickMeasureWidth(textPieces[j][0]);
                        }
                    }
                }
            }
        }
    }

    // Draw border around tooltips
    function drawBorder(xPos, yPos, width, height, thickness = 1) {
        ttctx.fillStyle = 'white';
        ttctx.fillRect(xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2));
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

    function quickMeasureWidth(text) {
        let sizeMeasure = ttctx.measureText(text);
        return sizeMeasure.actualBoundingBoxRight;
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

    function drawSmallCookie(x, y) {
        let img = images["smallcookie.png"];

        let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        scale /= 15;
        let width = img.width * scale;
        let height = img.height * scale;

        return([x - rect.left - (width / 2), y - rect.top - (height / 2), width, height]);
    }

    function onDocumentClick(event) {
        if (event.target === bigCookieClickable) {
            onBigCookieClick(event.clientX, event.clientY);
        }
    }

    function onDocumentHover(event) {
        let target = event.target;
        anBigHover = target === bigCookieClickable;
        if (!target.classList.contains("buyBuilding") && !target.classList.contains("upgradeButton")) {
            for (let depth = 0; depth < 2; depth++) {
                if (!target.parentElement)
                    break;
                target = target.parentElement;
                if (target.classList.contains("buyBuilding") || target.classList.contains("upgradeButton")) {
                    break;
                }
            }
        }
        if (target.classList.contains("buyBuilding")) {
            let b = buildings[target.id.substr(3).toLowerCase()];
            if (b === currTooltip)
                return;
            currTooltip = {"x": event.clientX, "y": event.clientY, "upgrade": b};
        } else if (target.classList.contains("upgradeButton")) {
            let b = upgrades[parseInt(target.id.substr(7))];
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
        }
    }

    function onDocumentMouseDown(event) {
        if (event.target === bigCookieClickable) {
            anBigClick = -1;
        }
    }
    function onDocumentMouseUp(event) {
        if (event.target === bigCookieClickable) {
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
        let prestigePoints = checkPrestige();
        console.log(prestigePoints);
    }

    function checkPrestige() {
        let chips = Math.cbrt(lifetimeCookies / (10 ** 12));
        // How many cookies chips are worth
        let chipsWorth = Math.ceil((chips ** 3) * (10 ** 12));
        let nextChipWorth = (Math.floor(chips + 1) ** 3) * (10 ** 12);

        return [chips, nextChipWorth - lifetimeCookies];
    }


    window.onresize = onWindowResize;
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('mouseup', onDocumentMouseUp);
    document.addEventListener('mouseover', onDocumentHover);
    document.addEventListener('mouseout', onDocumentMouseLeave);
    document.addEventListener('mousemove', onDocumentHover);
    loadImages(gameLoop);
    sortedUpgrades.forEach((e) => e.makeHtml());
    document.getElementById("cover").classList.remove('hidden');
    setupCanvas();
    cookieCanvas();
    setupCanvas();
    Object.values(buildings).forEach((e) => e.setupInnerCanvas());
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
        document.getElementById("buyRows").appendChild(this.buyButton);

        this.namePriceRows = document.createElement("div");
        this.namePriceRows.classList.add("namePriceRows");
        this.buyButton.appendChild(this.namePriceRows);

        this.labelButton = document.createElement("span");
        this.labelButton.classList.add("buyBuildingLabel");
        this.labelButton.innerText = this.name;
        this.namePriceRows.appendChild(this.labelButton);
        this.namePriceRows.appendChild(document.createElement("br"));

        this.priceButton = document.createElement("span");
        this.priceButton.classList.add("buyBuildingCost");
        this.priceButton.id = "price" + this.name;
        this.namePriceRows.appendChild(this.priceButton);

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
        if (totalCookies >= currentCost) {
            totalCookies -= currentCost;
            amount++;
            totalBuildings++;
        }
        this.amount = amount;
        this.determineCost();
        upgrades.forEach(e => {
            e.checkAvailable();
        })
        findCps();
        if (Object.keys(images).length > 0 && this.canvas) {
            this.drawInnerCanvas();
        }
    }

    determineCost() {
        this.currentCost = Number((this.baseCost * (growthRate ** this.amount)).toFixed()); // Formula for determining cost
        if (this.name === "Cursor") {
            this.production = (clickMultiplier + (cps * cpsClicks)) / 10;
        } else {
            // Formula for determining production
            this.production = (this.baseProduction) * this.multiplier;
        }
        this.priceButton.innerText = "$ " + formatSci(this.currentCost);
        this.ownedButton.innerText = formatSci(this.amount);
    }

    setupInnerCanvas() {
        if (this.name === "Cursor")
            return;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    drawInnerCanvas() {
        if (!this.ctx)
            return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let img = images[this.name.toLowerCase() + ".png"];

        let scale = Math.min(this.canvas.width / img.width, this.canvas.height / img.height);
        scale /= 1;

        let width = img.width * scale;
        let height = img.height * scale;

        let x = 0;
        let y = 0;

        for (let i = 0; i < this.amount; i++) {
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

        if(this.tier === 1)
            this.requiredBuildings = 1;
        else if(this.tier === 2)
            this.requiredBuildings = 10;
        else if(this.tier === 3)
            this.requiredBuildings = 25;
        else
            this.requiredBuildings = 50 * (this.tier - 3);

        switch (this.type){
            case 'cursor': {
                this.cost = buildings['cursor'].baseCost * 10 *
                    (growthRate ** this.requiredBuildings) / growthRate;
                this.info = "The mouse and cursors are twice as efficient."
                break;
            }
            case 'mouse': {
                this.cost = 5000 *
                    (growthRate ** this.requiredBuildings) / growthRate;
                this.info = "Clicking gains +1% of your cps."
                break;
            }
            case 'fingers': {
                break;
            }
            case 'specialGrandmas': {
                break;
            }
            case 'cookie': {
                this.cost = 100 * (growthRate ** this.tier) / growthRate;
                this.info = "Cookie Production Multiplier +1%."
                break;
            }
            default: {
                this.cost = buildings[this.type].baseCost * 10 *
                    (growthRate ** this.requiredBuildings) / growthRate;
                this.info = this.type.charAt(0).toUpperCase() + this.type.slice(1) + "s are twice as efficient."
            }
        }
    }

    makeHtml() {
        let upgrade = images['smallcookie.png'].cloneNode(false);
        let upgradeRows = document.getElementById("upgradeRows");
        upgrade.classList.add("upgradeButton");
        upgrade.id = "upgrade" + this.uid;
        if (!upgradeColors[this.type]) {
            upgradeColors[this.type] = Math.floor(Math.random() * 16777215).toString(16);
        }

        upgrade.style.backgroundColor = "#" + upgradeColors[this.type];
        upgrade.onclick = () => this.buyUpgrade();
        this.htmlTag = upgrade;
        upgradeRows.append(upgrade);
        this.deactivateUpgrade();
        this.hideUpgrade();
    }

    buyUpgrade() {
        if (this.bought || totalCookies < this.cost)
            return;
        totalCookies -= this.cost;
        switch (this.type) {
            case "cursor": {
                clickMultiplier *= 2;
                break;
            }
            case "mouse": {
                cpsClicks += 0.01;
                break;
            }
            case "fingers": {
                break;
            }
            case "specialGrandmas": {
                break;
            }
            case "cookie": {
                break;
            }
            default: {
                buildings[this.type].multiplier *= 2;
                break;
            }
        }
        this.bought = true;
        boughtUpgrades.push(this);
        this.hideUpgrade();
        findCps();
    }

    checkAvailable() {
        if (this.bought)
            return;
        let prevBought = this.tier === 1;
        boughtUpgrades.forEach(e => {
            if (e.type === this.type && e.tier === this.tier - 1) {
                prevBought = true;}});

        switch (this.type) {
            case "mouse": {
                if (prevBought)
                    this.unhideUpgrade();
                break;
            }
            case "fingers": {
                if (prevBought)
                    this.unhideUpgrade();
                break;
            }
            case "specialGrandmas": {
                break;
            }
            case "cookie": {
                if (this.tier === 1 || totalCookies >= this.cost / 5)
                    this.unhideUpgrade();
                break;
            }
            default: {
                if (buildings[this.type].amount >= this.requiredBuildings)
                    this.unhideUpgrade();
            }
        }
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
