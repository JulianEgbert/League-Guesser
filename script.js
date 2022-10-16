var version;
var champions;
var championNames;

var currentChampion;
var currentSkin;
var score = 0;

function getChampionList() {
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;
    sendRequest(url, handleChampionList);
}

function handleChampionList(response) {
    champions = response.data;
    championNames = Object.keys(champions);
    newChampion();
}

function sendRequest(url, callback, additionalInformation = null) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            const json = JSON.parse(xmlHttp.responseText);
            if (additionalInformation)
                callback(json, additionalInformation);
            else
                callback(json);
        }
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

function getVersion() {
    sendRequest("https://ddragon.leagueoflegends.com/api/versions.json", handleVersionResponse);
}

function handleVersionResponse(response) {
    version = response[0];
    getChampionList();
}

function newChampion() {
    const championCount = championNames.length;
    const randomIndex = random(championCount);
    const champion = champions[championNames[randomIndex]];
    getChampionDetails(champion.id);
}

function getChampionDetails(championId) {
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${championId}.json`;
    sendRequest(url, handleChampionDetails);
}

function handleChampionDetails(response) {
    const data = response.data;
    const championId = Object.keys(data)[0];
    const champion = data[championId];
    const skins = champion.skins;
    const skinIndex = random(skins.length);
    const randomSkin = skins[skinIndex];
    updateImage(championId, randomSkin.num);
    currentChampion = champion;
    currentSkin = randomSkin;
}

function updateImage(championId, skinId) {
    const url = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_${skinId}.jpg`;
    document.getElementById("championImage").src = url;
}

function random(max) {
    return Math.floor(Math.random() * max);
}

function checkInput(event) {
    event.preventDefault(); // Prevent page from reloading when form is submitted.
    const input = document.getElementById("input").value;
    document.getElementById("input").value = "";
    const correct = evaluateInput(input);
    if (correct) {
        score++;
    } else {
        window.alert(`That was incorrect. The champion was ${currentChampion.name}. Your score: ${score}`);
        score = 0;
    }
    updateScore();
    newChampion();
}

function evaluateInput(input) {
    const inputParsed = input.toLowerCase();
    const championName = currentChampion.name.toLowerCase();
    return (inputParsed == championName);
}

function updateScore() {
    document.getElementById("score").innerHTML = ("00" + score).slice (-3);
}

getVersion();