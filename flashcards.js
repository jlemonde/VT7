// THE CODE OF THE SRS ALGORITHM, AND THE STORAGE
function VocabTrainer(){
	this.workingDeckID = 0;
	this.decks = {};
	this.lastSaved = Date.now();
	setInterval(() => {
		if(localStorage.getItem('username')){
			for(var d of Object.keys(this.decks)){
				if(this.decks[d].lastmodif > this.lastSaved){
					this.storeDeck(this.decks[d].deckID);
				}
			}
			this.lastSaved = Date.now();
		}
	}, 1000);
	// Here we should add the same structure in order to save the decks to the server. It should run once a minute, check all the decks that haven't been uploaded, and save them. The function should also be called whenever changing file or going back home, in which case we should kinda reset the timer so that it runs a minute later, and not earlier. For this purpose, we want to create a setInterval of 1 second.
	// |@# check that everything has been implemented correctly, test thoroughly, then remove the comment above.
   // |@# in fact there is a tiny problem: when I first reload the page (F5), the algorithm would try to re-upload all decks, and the server would tell 'false, the backup is newest'
	this.lastUploadCheck = Date.now();
	setInterval(() => {
		if(localStorage.getItem('username')){
			if(Date.now() > this.lastUploadCheck + 1000*60 /* one minute */){
				//we first download the decklist.
				vt.downloadDeckList().then(function/*resolve*/(list){

					// For all decks existing locally
					for(var d of Object.keys(vt.decks)){
						// If they exist on the server
						if(!!list[d]){
							// We check whether one is newer than the other
							if(parseInt(list[d].lastmodif) < vt.decks[d].lastmodif){
								// We upload the backup to have it updated
								vt.uploadDeck(vt.decks[d].deckID);
							}
							else if(parseInt(list[d].lastmodif) > vt.decks[d].lastmodif){
								// We download the newer backup
								vt.downloadDeck(vt.decks[d].deckID);
							}
						}
						else{
							// We upload the backup because it doesn't yet exist on the server
							vt.uploadDeck(vt.decks[d].deckID);
						}
					}
					// Here we furthermore handle decks present on the server but not locally
					var l = [];
					for(var d of Object.keys(list)){
						if(!vt.decks[d]){
							l.push(list[d]);
							//console.info("A new deck was found on the server: '"+list[d].decktitle+"' ("+list[d].filename+")");
						}
					}
					if(!!document.getElementById('container_for_serverhosted_decklist')){
						document.getElementById('container_for_serverhosted_decklist').delKids();
						if(l.length){
							document.getElementById('container_for_serverhosted_decklist').appendX([
								{
									tag:'div',
									class:'separator',
									style:{
										marginTop:'1em'
									},
									kids:[
										{
											tag:'div',
											class:['xButton', 'small'],
											kids:'Show ' + l.length + ' deck' + (l.length == 1 ? '' : 's') + ' of yours that ' + (l.length == 1 ? 'is' : 'are') + ' not on this device',
											click:function(){
												this.parentNode.appendX("Your decks that are not on this device:");
												this.delElement();
												document.getElementById('container_for_decks_not_on_device').style.display = 'block';
											}
										}
									]
								}, {
									tag:'span',
									id:'container_for_decks_not_on_device',
									style:{
										display:'none'
									}
								}
							]);

							var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
							var filelist = l.sort((a, b) => {
								return collator.compare(a.decktitle, b.decktitle);
							});
							l = filelist;
							document.getElementById('container_for_decks_not_on_device').appendX(
								l.map((elem) => {
									return {
										tag:'div',
										class:['xButton', 'small'],
										kids:elem.decktitle,
										click:function(){
											vt.downloadDeck(elem.filename).then(() => {
												document.getElementById('container_for_local_decklist').delKids();
												document.getElementById('container_for_local_decklist').appendX(new XDeckListButtons());
												this.delElement();
											});
										}
									};
								})
							);
						}
					}
					if(!!document.getElementById('container_for_local_decklist')){
						document.getElementById('container_for_local_decklist').delKids();
						document.getElementById('container_for_local_decklist').appendX(new XDeckListButtons());
					}

				}, function/*reject*/(){
					console.info("Promise rejected... Boooh! Logging the user out.");
					localStorage.removeItem('username');
					fsm.init();
				});

				this.lastUploadCheck = Date.now();
			}
		}

	}, 1000 /*actually it would mostly run once every minute, not every second, but we need to check every second*/);
}
VocabTrainer.prototype.pushDeck = function(deck){
	if(! this.decks.hasOwnProperty(deck.deckID)){
		this.decks[deck.deckID] = deck;
		this.lastDeckPushed = deck.deckID;
		return {
			selectWorkingDeck: () => {
				this.selectWorkingDeck(this.lastDeckPushed);
			}
		};
	}
	else{
		console.error('blah');
		alert("Error: the deck could not be created because its deckID was already existing.");
		return false;
	}
};
VocabTrainer.prototype.removeDeck = function(deckID){
	// IMPORTANT: Removes from both the localStorage and the JS memory. They are always done in pair.
	delete this.decks[deckID];
	localStorage.removeItem("deck/"+deckID);
};
VocabTrainer.prototype.storeDeck = function(deckID){
	// deck_id is optional (due to the way .deck() is handled)
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
	// I think that this method is not used anywhere. Remove it?
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
VocabTrainer.prototype.downloadDeckList = function(){
	return new Promise(function(resolve, reject){
		var params = {
			clienttimestamp:Math.round(Date.now()/1000)
		};
		ajax('comm.php?action=decklist', params, "Downloading the deck list").then(function(resp){
			if(resp.indexOf('true, ') == 0){
				resp = resp.substr('true, '.length);
				resp = JSON.parse(resp);
				//console.info("HERE YOU GO!");
				//console.log(resp);
				var list = {};
				for(var i = 0; i < resp.length; i++){
					list[resp[i].filename] = resp[i];
				}
				resolve(list);

			}
			else if(resp == "false, logged out"){
				alert("Your session timed out, please log in again!");
				localStorage.removeItem('username');
				fsm.init();
			}
			else{
				console.log(resp);
				//alert("|@# An error occurred when downloading the deck list. The error should be handled better by the developer.");
				reject();
			}
		}, ajaxErr);
	});
};
VocabTrainer.prototype.uploadDeck = function(deckID){
	// possible usage: you can simply call vt.uploadDeck() from within a deck!
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
		var resp = r.split(' ');
		//console.log("AQUí TENEMOS resp: ", resp);
		if(resp[0] == 'true,'){
			vt.deck(resp[2]).lastupload = parseInt(resp[6]);
			vt.storeDeck(resp[2]);
		}
		else{
			alert("|@# An error occurred when uploading the backup of the deck. The error should be handled better by the developer.");
		}
	}, ajaxErr);
};
VocabTrainer.prototype.downloadDeck = function(deckID){
	if(deckID == undefined){
		deckID = this.workingDeckID;
	}

	var params = {
		clienttimestamp:Math.round(Date.now()/1000),
		filename:deckID
	};
	return ajax('comm.php?action=downloaddeck', params, "Downloading a deck ("+deckID+")").then(function(resp){
		if(resp.indexOf('true, ') == 0){
			resp = resp.substr('true, '.length);
			resp = JSON.parse(resp);
			Object.setPrototypeOf(resp, Deck.prototype);
			for(var i of Object.keys(resp.entries)){
				Object.setPrototypeOf(resp.entries[i], Card.prototype);
			}
			if(vt.deck() && vt.deck().deckID == resp.deckID){
				fsm.goHome();
			}
			vt.removeDeck(resp.deckID);//we need that because we can't push on an existing deckID
			vt.pushDeck(resp);
			vt.storeDeck(resp.deckID);

			if(document.getElementById('container_for_local_decklist')){
				// |@# Not optimal complexity, but who cares.
				document.getElementById('container_for_local_decklist').delKids().appendX(new XDeckListButtons());
			}
		}
		else{
			console.log(resp);
			alert("|@# An error occurred when downloading the deck. The error should be handled better by the developer.");
		}
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
VocabTrainer.prototype.sortedList = function(){
	var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
	var filelist = Object.keys(this.decks).sort((a, b) => {
		return collator.compare(this.decks[a].name, this.decks[b].name);
	});
	return filelist;
};


function Deck(name, description){
	this.name        = name;
	this.description = description;
	this.deckID      = Math.random().toString(36).substring(2);
	this.since       = Date.now();
	this.lastmodif   = Date.now(); // it is sufficient to reset it to Date.now() again to have the deck stored.
	this.lastupload  = 0;

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
Deck.prototype.editEntry = function(entry_id, faceA, faceB, hint, defs, xmpl, desc){
	this.entries[entry_id].a    = faceA; // word in NL
	this.entries[entry_id].b    = faceB; // word in TL
	this.entries[entry_id].hint = hint;
	this.entries[entry_id].defs = defs;
	this.entries[entry_id].xmpl = xmpl;
	this.entries[entry_id].desc = desc;
	this.lastmodif = Date.now(); // this triggers the automated storage of the deck.
};
Deck.prototype.removeEntry = function(entry_id){
	if(entry_id === undefined){
		entry_id = this.workingEntry;
	}

	this.entries.splice(entry_id, 1);
	this.lastmodif = Date.now(); // this triggers the automated storage of the deck.
};
Deck.prototype.reviseEntry = function(goodness){
	entry_id = this.workingEntry;

	// console.info(
	// 	"Implémentation de I+Y !!! ",
	// 	"Revenu depuis ", millisecondsToEnglish( Date.now()-this.entries[entry_id].comeback ),
	// 	"Vue la dernière fois il y a ", millisecondsToEnglish( Date.now()-this.entries[entry_id].lastseen ),
	// 	"Intervalle initial était ", millisecondsToEnglish( this.entries[entry_id].comeback-this.entries[entry_id].lastseen ),
	// 	!! this.entries[entry_id].lastseen,
	// 	(Date.now()-this.entries[entry_id].lastseen) / (this.entries[entry_id].comeback-this.entries[entry_id].lastseen)
	// );
	// je pense que ça peut-être suffisant de faire une simple règle de trois entre lastseen, comeback et DateNow.
	// let multiplicateur = (Date.now()-lastseen) / (comeback-lastseen);
	// this.entries[entry_id].learnFactor  *= multiplicateur;
	// attention!! lastseen doit exister!!!! Je pourrais vérifier que le multiplicateur est compris entre 1 et 5 afin de ne pas avoir de valeurs aberrantes en cas de gros coup dur.
	// ATTENTION! SI ON MET ÇA LÀ, LES LABELS DES BOUTONS VIOLETS NE SERONT PAS MIS À JOUR À TEMPS... UNE MEILLEURE IDÉE SERAIT DE LANCER L'UPDATE AU MOYEN D'UNE FONCTION SPÉCIALEMENT CONÇUE APPELÉE DEPUIS XCARDMAIN.
	// ATTENTION! IL FAUT VEILLER À CE QUE LA PARTIE 'Y' NE SOIT PRISE EN COMPTE QUE SI ON SE SOUVIENT BIEN VOIRE PARFAITEMENT!

	// core of the algorithm
	this.entries[entry_id].interval      = Math.round(this.entries[entry_id].getIntervals(goodness, true) * (0.9+0.2*Math.random()));
	this.entries[entry_id].comeback      = Date.now() + this.entries[entry_id].interval;
	this.entries[entry_id].learnFactor  *= this.entries[entry_id].getLearnFactorAdjust(goodness);


	// tuning of the algorithm (settings)
	if(goodness == OUPS && 'resetLearnFactorOnOblivion' in this && this.resetLearnFactorOnOblivion){
		this.entries[entry_id].learnFactor= 1;
		// and we overwrite the comeback to 5 minutes
		this.entries[entry_id].comeback   = Date.now() + 5*60*1000;
	}

	// rounding so that the json files take up less space
	this.entries[entry_id].learnFactor   = Math.round(this.entries[entry_id].learnFactor *100)/100;

	// we don't want to reach zero
	if(this.entries[entry_id].learnFactor <= 0.015){
		this.entries[entry_id].learnFactor= 0.02;
	}

	// // store the stats part.
	// if(! Array.isArray(this.entries[entry_id].history)){
	// 	this.entries[entry_id].history = new Array();
	// }
	// if(this.entries[entry_id].lastseen || this.entries[entry_id].since){
	// 	this.entries[entry_id].history.push([
	// 		/*Duration:*/Date.now() - (this.entries[entry_id].lastseen || this.entries[entry_id].since),
	// 		/*Outcome:*/ goodness
	// 	]);
	// }

	this.entries[entry_id].lastseen = Date.now();

	// this triggers the automated storage of the deck.
	this.lastmodif = Date.now();
};
Deck.prototype.entryListCounts = function(){
	var available = 0;
	var delayed   = 0;
	var disabled  = 0;
	var total     = 0;
	var brandnew  = 0;
	var today     = 0;
	// CAUTION: THIS LOOP SHALL LOOK THE SAME AS THE ONE IN .sortedEntryList !!
	for(let i = 0; i < this.entries.length; i++){
		total++;
		if(this.entries[i].isDisabled === true){
			disabled++;
		}
		else{
			if(this.entries[i].comeback > Date.now()){
				delayed++;
			}
			else{
				available++;
			}
		}
		if(!this.entries[i].lastseen){
			brandnew++;
		}
		else if(new Date(this.entries[i].lastseen).toLocaleDateString() == new Date(Date.now()).toLocaleDateString()){
			today++;
		}
	}
	return {
		available:available,
		delayed:delayed,
		disabled:disabled,
		total:total,
		brandnew:brandnew,
		today:today
	};
};
Deck.prototype.sortedEntryList = function(){
	var arrayAvailable = [];
	var arrayDelayed   = [];
	var arrayDisabled  = [];
	// CAUTION: THIS LOOP SHALL LOOK THE SAME AS THE ONE IN .entryListCounts !!
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

	// this is merely a patch for a bug related to some (rare) entries imported from VT5
	if(!!which && this.entries[which].learnFactor == 0){
		console.log("Bug corrected!", this.entries[which]);
		this.entries[which].learnFactor = 1;
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
Deck.prototype.entriesDueWithin24h = function(){
	var comeback24h = [];
	for(let e = 0; e < this.entries.length; e++){
		if(this.entry(e).isDisabled)
			continue;
		if(!this.entry(e).lastseen || this.entry(e).lastseen < Date.now() - 24*3600*1000)
			// the point is that we only want to list entries that were revised today
			//  (and would reappear within 24h because we did not remember them well enough
			//  for them to reach a greater interval)
			continue;
		if(this.entry(e).interval < 24*3600*1000){
			comeback24h.push(e);
		}
	}
	return comeback24h;
};
Deck.prototype.searchByKeyword = function(str, searchInHint, searchInAdditional, searchOnlyInFavs){
	var querystr  = str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
	//var queryarr  = querystr.split(' ').map(e => e.trim());
	var results = [];
	for(let e = 0; e < this.entries.length; e++){
		var relev = 0;
		if(typeof this.entries[e] == 'object'){
			if(searchOnlyInFavs && this.entries[e].isStarred !== true){
				continue;
			}
			//console.log(2, this.entries[e]);
			var a = this.entries[e].a;
			if(typeof a == 'string'){
				a = a.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
				let ind = a.indexOf(querystr);
				if(ind >= 0){
					let wwd = a.search(new RegExp('\\b' + querystr + '\\b')); // here we detect whether it was a whole word
					relev += 4*(1 + (wwd >= 0)) + (ind == 0);
				}
			}
			var b = this.entries[e].b;
			if(typeof b == 'string'){
				b = b.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
				let ind = b.indexOf(querystr);
				if(ind >= 0){
					let wwd = b.search(new RegExp('\\b' + querystr + '\\b')); // here we detect whether it was a whole word
					relev += 5*(1 + (wwd >= 0)) + (ind == 0);
				}
			}
			var hint = this.entries[e].hint;
			if(typeof hint == 'string' && searchInHint){
				hint = hint.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
				let ind = hint.indexOf(querystr);
				if(ind >= 0){
					let wwd = hint.search(new RegExp('\\b' + querystr + '\\b')); // here we detect whether it was a whole word
					relev += 1*(1 + (wwd >= 0)) + (ind == 0);
				}
			}
			var defs = this.entries[e].defs;
			if(typeof defs == 'string' && searchInAdditional){
				defs = defs.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
				let ind = defs.indexOf(querystr);
				if(ind >= 0){
					let wwd = defs.search(new RegExp('\\b' + querystr + '\\b')); // here we detect whether it was a whole word
					relev += 1*(1 + (wwd >= 0)) + (ind == 0);
				}
			}
			var xmpl = this.entries[e].xmpl;
			if(typeof xmpl == 'string' && searchInAdditional){
				xmpl = xmpl.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
				let ind = xmpl.indexOf(querystr);
				if(ind >= 0){
					let wwd = xmpl.search(new RegExp('\\b' + querystr + '\\b')); // here we detect whether it was a whole word
					relev += 1*(1 + (wwd >= 0)) + (ind == 0);
				}
			}
			var desc = this.entries[e].desc;
			if(typeof desc == 'string' && searchInAdditional){
				desc = desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
				let ind = desc.indexOf(querystr);
				if(ind >= 0){
					let wwd = desc.search(new RegExp('\\b' + querystr + '\\b')); // here we detect whether it was a whole word
					relev += 1*(1 + (wwd >= 0)) + (ind == 0);
				}
			}
		}
		if(relev){
			results.push({index:e, relevance:relev});
		}
	}
	return results.sort(function(a, b){
		return b.relevance - a.relevance;
	}).map(el => el.index);
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
	this.isStarred   = undefined;//actually: false, but we only look for explicit trues.
	this.since       = Date.now();// CAUTION! Some cards don't have that!!

	this.hasMedia    = undefined; // either undefined or true; tells whether to use with Internet; |@# currently not in use.

	// This factor (noted "L" in the math part) determines how well you know the card. It is this
	// factor that multiplies the initial learning intervals in order to determine the intervals that
	// should show up when the card is revised.
	this.learnFactor = 1;

	// This contains the timestamp of when the card shall come back.
	this.comeback = Date.now()-1000;

	this.lastseen = undefined; // If undefined, it means the card is NEW!! otherwise contains a timestamp
	this.interval = undefined;

	//this.history = undefined;
}

const PERFECT = 3;
const GOOD    = 2;
const MIDDLE  = 1;
const OUPS    = 0;

const initialIntervals    = [5*60*1000, 4*3600*1000, 2*24*3600*1000, 8*24*3600*1000];
const learnFactorAdjust   = [1/2, 1/Math.pow(2, 1/4), Math.pow(2, 1/4), 2];
const maxintervalincrease = 4;

Card.prototype.getIntervals = function(goodness, /*bool*/applyMaxIntervalIncrease = false){
	var lf = this.learnFactor;

	// we want to use fixed intervals for favs
	if(this.isStarred && (false == 'useFixedIntervalsForFavs' in vt.deck() || vt.deck().useFixedIntervalsForFavs)){
		lf = 2;
	}

	var newinterval = initialIntervals[goodness] * lf;

	// we may limit the increase of the learnFactorAdjust
	if(false == 'limitLearnFactorIncrease' in vt.deck() || vt.deck().limitLearnFactorIncrease){
		if(this.interval && newinterval > this.interval*maxintervalincrease){
			var newinterval2 = this.interval*maxintervalincrease;
			if(applyMaxIntervalIncrease){
				this.learnFactor *= newinterval2 / newinterval;
				console.log("applyMaxIntervalIncrease ", 'applied factor ', newinterval2 / newinterval, ' to entryid ', vt.deck().workingEntry);
			}
			newinterval = newinterval2;
		}
	}

	return newinterval;
};
Card.prototype.getLearnFactorAdjust = function(goodness){
	// THIS IS ODDLY A PROPERTY OF THE CARD, BUT IN FACT, IT IS USUALLY CHOSEN AT DECK-LEVEL.
	//    THE REASON IS THAT A CARD-LEVEL SETTING TO MARK A CARD NASTY OR STRAIGHTFORWARD MIGHT GET IMPLEMENTED SOMEDAY.

	// we want not to change the learnFactor in case of fixed intervals for favs
	var lfa = true;
	if(this.isStarred && (false == 'useFixedIntervalsForFavs' in vt.deck() || vt.deck().useFixedIntervalsForFavs)){
		lfa = false;
	}
	return lfa ? learnFactorAdjust[goodness] : 1;
};





















// Global variables
var vt = new VocabTrainer();
// Initialisation
vt.loadAllDecks();
