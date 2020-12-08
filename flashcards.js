// THE CODE OF THE SRS ALGORITHM, AND THE STORAGE
function VocabTrainer(){
	this.workingDeckID = 0;
	this.decks = {};
	this.lastSaved = Date.now();
	setInterval(() => {
		for(var d of Object.keys(this.decks)){
			if(this.decks[d].lastmodif > this.lastSaved){
				this.storeDeck(this.decks[d].deckID);
			}
		}
		this.lastSaved = Date.now();
	}, 1000);
}
VocabTrainer.prototype.pushDeck = function(deck){
	if(! this.decks.hasOwnProperty(deck.deckID)){
		this.decks[deck.deckID] = deck;
		this.lastDeckPushed = deck.deckID;
		return {
			selectWorkingDeck:() => {
				this.selectWorkingDeck(this.lastDeckPushed);
			}
		};
	}
	else{
		alert("Error: the deck could not be created because its deckID was already existing.");
		return false;
	}
};
VocabTrainer.prototype.removeDeck = function(deckID){
	// IMPORTANT: Removes from both the localStorage and the JS memory. They are always done in pair.
	delete this.decks[deckID];
	localStorage.removeItem("deck/"+deckID);
};
VocabTrainer.prototype.storeDeck = function(deckID){ // deck_id is optional (due to the way .deck() is handled)
	try{
		localStorage.setItem("deck/"+deckID, JSON.stringify(this.deck(deckID)));
		console.info("Deck '" + this.deck(deckID).name + "' ("+deckID+") stored into localStorage.");
	}
	catch(e){
		alert("Error: there was an error and the deck could not be saved to the localStorage.");
	}
};
VocabTrainer.prototype.loadDeck = function(deckID){
	// CAUTION: In the current logic, all decks have to be loaded so that it can work properly.
	if(this.decks.hasOwnProperty(deckID)){
		alert("Error: the deck could not be properly loaded from the localStorage because it already was.");
	}
	else{
		var d = JSON.parse(localStorage.getItem("deck/"+deckID));

		if(!!d){
			// Reassign prototypes ^^'
			Object.setPrototypeOf(d, Deck.prototype);
			for(var i of Object.keys(d.entries)){
				Object.setPrototypeOf(d.entries[i], Card.prototype);

				// |@# this paragraph can be removed
				if(d.entries[i].hasOwnProperty('faceA')){
					d.entries[i].a = d.entries[i].faceA;
					delete d.entries[i].faceA;
				}
				if(d.entries[i].hasOwnProperty('faceB')){
					d.entries[i].b = d.entries[i].faceB;
					delete d.entries[i].faceB;
				}
			}

			this.pushDeck(d);
		}
		else{
			alert("Error: the deck could not be found in the localStorage or failed to be parsed.");
		}
	}
};
VocabTrainer.prototype.storeAllDecks = function(){
	for(var i of Object.keys(this.decks)){
		this.storeDeck(i);
	}
};
VocabTrainer.prototype.loadAllDecks = function(){
	for(var i of Object.keys(localStorage)){
		if(i.indexOf("deck/") == 0){
			this.loadDeck(i.substring("deck/".length));
		}
	}
};
VocabTrainer.prototype.uploadDeck = function(deckID){ // possible usage: you can simply call vt.uploadDeck() from within a deck!
	if(deckID == undefined){
		deckID = this.workingDeckID;
	}

	var params = {
		clienttimestamp:Math.round(Date.now()/1000),
		filename:deckID,
		lastmodif:this.deck(deckID).lastmodif,
		decktitle:this.deck(deckID).name,
		file:JSON.stringify(this.deck(deckID))
	};
	ajax('comm.php?action=uploaddeck', params, "Uploading deck '"+this.deck(deckID).name+"' ("+deckID+")").then(function(r){
		console.log(r);
	}, ajaxErr);
};
VocabTrainer.prototype.deck = function(workingDeckID){
	// This method is used to return a deck. The advantage of writing vt.deck() over vt.decks[i] is that i defaults to the current working deck.
	var id = workingDeckID !== undefined ? workingDeckID : this.workingDeckID;
	if(! this.decks.hasOwnProperty(workingDeckID)){
		workingDeckID = this.workingDeckID;
	}
	return this.decks[workingDeckID];
};
VocabTrainer.prototype.selectWorkingDeck = function(newWorkingDeckID){
	if(this.decks.hasOwnProperty(newWorkingDeckID)){
		this.workingDeckID = newWorkingDeckID;
		return this;
	}
	else{
		alert("Could not change deck; it does not exist.");
		return false;
	}
};


function Deck(name, description){
	this.name        = name;
	this.description = description;
	this.deckID      = Math.random().toString(36).substring(2);
	this.since       = Date.now();
	this.lastmodif   = Date.now(); // it is sufficient to reset it to Date.now() again to have the deck stored.

	this.entries     = new Array();
	this.workingEntry= undefined;
}
Deck.prototype.addEntry = function(faceA, faceB, hint, defs, xmpl, desc){
	this.entries.push(new Card(faceA, faceB, hint, defs, xmpl, desc));
	this.lastmodif = Date.now(); // this triggers the automated storage of the deck.
};
Deck.prototype.editEntryHint = function(newhint, entry_id){
	if(entry_id === undefined){
		entry_id = this.workingEntry;
	}
	this.entries[entry_id].hint = newhint;
	this.lastmodif = Date.now(); // this triggers the automated storage of the deck.
};
Deck.prototype.editEntry = function(entry_id, faceA, faceB){ // |@# plutôt écrire une méthode Entry.prototype.edit() directement....
	this.entries[entry_id].a = faceA;
	this.entries[entry_id].b = faceB;
	this.lastmodif = Date.now(); // this triggers the automated storage of the deck.
};
Deck.prototype.removeEntry = function(entry_id){
	if(entry_id === undefined){
		entry_id = this.workingEntry;
	}

	this.entries.splice(entry_id, 1);
	this.lastmodif = Date.now(); // this triggers the automated storage of the deck.
};

function Card(faceA, faceB, hint, defs, xmpl, desc){
	// |@# it would be nice to have a dynamical amount of sides instead of just A and B
	// |@# it would be nice to have specifications about which side is what. E.g. details, description, examples, url, ...
	this.a           = faceA;
	this.b           = faceB;
	this.hint        = hint || undefined;//hint
	this.defs        = defs || undefined;//definition
	this.xmpl        = xmpl || undefined;//example
	this.desc        = desc || undefined;//additional notes and descriptions

	this.isDisabled  = undefined;//actually: false, but we only look for explicit trues.
	this.isStarred   = false;
	this.since       = Date.now();

	this.hasMedia    = undefined; // either undefined or true; tells whether to use with Internet

	// This factor (noted "L" in the math part) determines how well you know the card. It is this
	// factor that multiplies the initial learning intervals in order to determine the intervals that
	// should show up when the card is revised.
	this.learnFactor = 1;

	// This contains the timestamp of when the card shall come back.
	this.comeback = Date.now()-1000;

	//this.history = [];   // This is not used for now, but will (someday)
}

const PERFECT = 3;
const GOOD    = 2;
const MIDDLE  = 1;
const OUPS    = 0;
Card.prototype.getIntervals = function(goodness){
	var initialIntervals  = [5*60*1000, 4*3600*1000, 2*24*3600*1000, 8*24*3600*1000];
	return initialIntervals[goodness] * this.learnFactor;
};
Card.prototype.getLearnFactorAdjust = function(goodness){
	// ACTUALLY THIS FUNCTION HAS NOTHING TO DO WITH THE CARDS, THE OUTPUT IS ALWAYS THE SAME.
	var learnFactorAdjust = [1/2, 1/Math.pow(2, 1/2), Math.pow(2, 1/4), 2];
	return learnFactorAdjust[goodness];
};
Deck.prototype.reviseEntry = function(goodness){
	entry_id = this.workingEntry;

	// core of the algorithm
	this.entries[entry_id].comeback      = Date.now() + Math.round(this.entries[entry_id].getIntervals(goodness) * (0.9+0.2*Math.random()));
	this.entries[entry_id].learnFactor  *= this.entries[entry_id].getLearnFactorAdjust(goodness);

	// rounding so that the json files take up less space
	this.entries[entry_id].learnFactor   = Math.round(this.entries[entry_id].learnFactor *100)/100;

	// we don't want to reach zero
	if(this.entries[entry_id].learnFactor <= 0.015){
		this.entries[entry_id].learnFactor= 0.02;
	}

	// this triggers the automated storage of the deck.
	this.lastmodif = Date.now();
};
Deck.prototype.sortedEntryList = function(){
	var arrayAvailable = [];
	var arrayDelayed   = [];
	var arrayDisabled  = [];
	for(let i = 0; i < this.entries.length; i++){
		if(this.entries[i].isDisabled === true){
			arrayDisabled.push(i);
		}
		else{
			if(this.entries[i].comeback > Date.now()){
				arrayDelayed.push(i);
			}
			else{
				arrayAvailable.push(i);
			}
		}
	}
	console.warn("|@# CHECK THAT THE ORDER IS CORRECT!");
	arrayAvailable.sort((a, b) => {
		return this.entries[a].comeback < this.entries[b].comeback;
	});
	arrayDelayed.sort((a, b) => {
		return this.entries[a].comeback > this.entries[b].comeback;
	});
	// arrayDisabled.sort((a, b) => {
	//    return this.entries[a].comeback > this.entries[b].comeback;
	// }); We don't care about the order of the disabled elements.
	return [...arrayAvailable, ...arrayDelayed, ...arrayDisabled];
};
Deck.prototype.nextEntry = function(){
	// this function determines which card to revise. When called, it changes to the new working entry. It may set the workingEntry to undefined!
	var which = undefined;
	var itscomeback = 0;
	for(let i = 0; i < this.entries.length; i++){
		if(this.entries[i].isDisabled === true){
			// we discard all the cards that have been disabled
			continue;
		}
		else if(this.entries[i].comeback > Date.now()){
			// we discard all the cards that have not yet come back
			continue;
		}
		else{
			// amongst those who have come back, we would like to select the one that came back the most recently (caution: this is counter-intuitive)
			if(this.entries[i].comeback > itscomeback){
				itscomeback = this.entries[i].comeback;
				which = i;
			}
		}
	}
	this.workingEntry = which;
};
Deck.prototype.entry = function(i){
	if(! this.entries.hasOwnProperty(i)){
		i = this.workingEntry;
	}
	return this.entries[i];
	// may return undefined if workingEntry is undefined
};






















// Global variables
var vt = new VocabTrainer();
// Initialisation
vt.loadAllDecks();



// testing:

// vt.pushDeck(new Deck("titre0", "description")).selectWorkingDeck();
// vt.deck().addEntry("a1","b1");
// vt.deck().addEntry("a2","b2");
// vt.deck().addEntry("a3","b3");
// vt.pushDeck(new Deck("titre1", "description")).selectWorkingDeck();
// vt.deck().addEntry("a1","b1");
// vt.deck().addEntry("a2","b2");
// vt.deck().addEntry("a3","b3");
// vt.pushDeck(new Deck("titre2", "description")).selectWorkingDeck();
// vt.deck().addEntry("a1","b1");
// vt.deck().addEntry("a2","b2");
// vt.deck().addEntry("a3","b3");
//
// console.info("Mettre une variable globale de sorte à pouvoir écrire vt.deck().addEntry(faceA,faceB), ainsi la méthode .deck() retourne le deck actuel. Possiblement faire la même chose pour les cartes, ainsi on aurait .entry().edit(faceA,faceB) au lieu de .editEntry(card_id, faceA, faceB). Le but ultime est de ne pas avoir à se soucier des card_id et des deck_id dans le code.");
