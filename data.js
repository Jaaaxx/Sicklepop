const imageData = [
    "pop-1.png",
    "smallPop-1.png",
    "droplet.png",
    "bucket1-empty.png",
    "bucket1-full.png",
    "bucket1-hover.png",
    "bucket1-empty-hover.png",
    "upgrade.png",
    "dad.png",
    "popsicle stand.png",
    "ice cream van.png",
    "icon-dad.png"
]

const upgradeData = [
    {
        "name": "Mediocre Licks",
        "type": "cursor",
        "tier": 1,
        "description": "Kind of lame."
    },
    {
        "name": "Powerful Licks",
        "type": "cursor",
        "tier": 2,
        "description": "...This is ok."
    },
    {
        "name": "Warmer Licks",
        "type": "cursor",
        "tier": 3,
        "description": "Melts in your mouth!"
    },
    {
        "name": "Samsung® Smart Fridge",
        "type": "dad",
        "tier": 1,
        "description": "Looks like papa got a new fridge!"
    },
    {
        "name": "Samsung® Smart Apron",
        "type": "dad",
        "tier": 2,
        "description": "Kiss the cook!"
    },
    {
        "name": "Samsung® Smart Beer",
        "type": "dad",
        "tier": 3,
        "description": "I could quit whenever I want!"
    },
    {
        "name": "Tip Jar",
        "type": "popsicle stand",
        "tier": 1,
        "description": "It's a tip jar... for tips."
    },
    {
        "name": "Hand-drawn Sign",
        "type": "popsicle stand",
        "tier": 2,
        "description": "Made with crayons... and love"
    },
    {
        "name": "Refined Cooler",
        "type": "popsicle stand",
        "tier": 3,
        "description": "So cool..."
    },
    {
        "name": "Wheels",
        "type": "ice cream van",
        "tier": 1,
        "description": "Why didn't we have those before, exactly?"
    },
    {
        "name": "New Paint Job",
        "type": "ice cream van",
        "tier": 2,
        "description": "Sure to scare fewer parents away!"
    },
    {
        "name": "Printed Name",
        "type": "ice cream van",
        "tier": 3,
        "description": "PopsiCool!"
    },
    {
        "name": "Cardboard Sticks",
        "type": "stick",
        "tier": 1,
        "description": "Cardboard popsicle sticks allow for easier manufacturing."
    },
    {
        "name": "Wooden Sticks",
        "type": "stick",
        "tier": 2,
        "description": "Sturdy and reliable."
    },
    {
        "name": "Plastic Sticks",
        "type": "stick",
        "tier": 3,
        "description": "Plastic popsicle sticks (Warning: not liable for environmental damage)"
    },
    {
        "name": "Big Bucket",
        "type": "bucket",
        "tier": 1,
        "description": "More space in the bucket, more droplets to be held!"
    },
    {
        "name": "Bigger Bucket",
        "type": "bucket",
        "tier": 2,
        "description": "Even more space in the bucket, even more droplets to be held!"
    },
    {
        "name": "Biggest Bucket",
        "type": "bucket",
        "tier": 3,
        "description": "The most space in the bucket, the most droplets to be held!"
    },
    {
        "name": "Droplet Collectors",
        "type": "collector",
        "tier": 1,
        "description": "Little ants pick up bonus popsicles for you!"
    },
    {
        "name": "Fire Ants",
        "type": "collector",
        "tier": 2,
        "description": "Probably shouldn't eat those."
    },
    {
        "name": "Wasps",
        "type": "collector",
        "tier": 3,
        "description": "Okay. Do NOT eat the wasp popsicles."
    }
]

const newsData = [
    "Who wants a popsicle?",
    "You feel like making popsicles. But nobody wants to lick your popsicles.",
    "You feel like licking popsicles.",
    "Daddy loves you!",
    "Lick it all up!",
    "It's sticky!",
    "It's getting all over my clothes.",
    "So creamy!",
    "The juice is getting everywhere.",
    "Hey kids, who wants to lick my popsicle?",
    "Come touch my popsicles!",
    "Lick every last drop!",
    "Juicy!",
    "\"It's so big!\" (The Popsicle)",
    "Suck out all the juices!"
]

const buildingsData = [
    {
        "name": "Cursor",
        "baseCost": 5,
        "baseProduction": 1,
        "description": "Autolicks once every second."
    },
    {
        "name": "Dad",
        "baseCost": 25,
        "baseProduction": 5,
        "description": "Who wants a popsicle, kids?"
    },
    {
        "name": "Popsicle Stand",
        "baseCost": 125,
        "baseProduction": 25,
        "description": "When life gives you droplets... sell popsicles."
    },
    {
        "name": "Ice Cream Van",
        "baseCost": 625,
        "baseProduction": 125,
        "description": "It is okay to accept candy from this one."
    }
]
