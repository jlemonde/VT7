// EVERYTHING THAT IS ABOUT THE INTERFACE COMES HERE, INCLUDING THE PAGES' FINITE STATE MACHINE

// FINITE STATE MACHINE
function FiniteStateMachine(){
	this.init = function(){
		document.getElementById('bannerbuttonboxleft').delKids();
		document.getElementById('bannerbuttonboxright').delKids();
		document.getElementById('bannerbuttonboxright').appendX([{
			tag:'div',
			class:['button'],
			kids:'Log in',
			click:function(){
				fsm.logIn();
			}
		},{
			tag:'div',
			class:['button'],
			kids:'Sign up',
			click:function(){
				fsm.newUserCreation();
			}
		}]);
		document.getElementById('main').delKids();
		document.getElementById('main').appendX({
			tag:'section',
			class:'xApp',
			kids:[
				{
					tag:'header',
					kids:'Introduction to VocabPocket!',
					click:function(){
						xAppOpenClose(this.parentNode);
					}
				},
				{
					tag:'article',
					class:'show',
					kids:'Welcome!'
				}
			]
		});
	};
	this.logIn = function(){
		document.getElementById('bannerbuttonboxleft').delKids();
		document.getElementById('bannerbuttonboxright').delKids();
		document.getElementById('bannerbuttonboxright').appendX([{
			tag:'div',
			class:['button'],
			kids:'Cancel',
			click:function(){
				fsm.init();
			}
		}]);
		setUpLogInPage();
	};
	this.newUserCreation = function(){
			document.getElementById('bannerbuttonboxleft').delKids();
			document.getElementById('bannerbuttonboxright').delKids();
			document.getElementById('bannerbuttonboxright').appendX([{
				tag:'div',
				class:['button'],
				kids:'Cancel',
				click:function(){
					fsm.init();
				}
			}]);
	};
	this.goHome = function(){
		document.getElementById('bannerbuttonboxleft').delKids();
		document.getElementById('bannerbuttonboxright').delKids();
		document.getElementById('bannerbuttonboxright').appendX({
			tag:'div',
			class:['button'],
			kids:'Log out',
			click:function(){
				ajax('comm.php?action=logout', '', "Logging the user out.").then(function(){
					fsm.init();
					localStorage.removeItem('username');
				}, ajaxErr);
			}
		});
		setUpHomePage();
	};
	this.goTo = function(deck_id){
		if(vt.decks.hasOwnProperty(deck_id)){
			vt.selectWorkingDeck(deck_id);
			document.getElementById('bannerbuttonboxleft').delKids();
			document.getElementById('bannerbuttonboxright').delKids();
			document.getElementById('bannerbuttonboxleft').appendX({
				tag:'div',
				class:['button'],
				kids:'Return',
				click:function(){
					fsm.goHome();
				}
			});
			setUpDeckPage();
		}
		else{alert("You cannot open this deck: it was not found!");}
	};
	if(localStorage.getItem('username')){
		ajax(
			'comm.php?action=isloggedinas',
			{username:localStorage.getItem('username')},
			"Checking whether the user is still connected server-side."
		).then(function(r){
			if(r == 'true'){
				fsm.goHome();
			}
			else{
				fsm.init();
			}
		}, ajaxErr);
	}
	else{
		this.init();
	}
}
var fsm = new FiniteStateMachine();


// UI:
function xAppOpenClose(section, callbackOpen, callbackClose){
	section.getElementsByTagName('article')[0].classList.toggle('show');
	if(typeof(callbackOpen) == 'function' && section.getElementsByTagName('article')[0].classList.contains('show')){
		callbackOpen();
	}
	if(typeof(callbackClose) == 'function' && !section.getElementsByTagName('article')[0].classList.contains('show')){
		callbackClose();
	}
}


// Pages:
function setUpLogInPage(){
	document.getElementById('main').delKids();
	document.getElementById('main').appendX({
		tag:'section',
		class:'xApp',
		kids:[
			{
				tag:'header',
				kids:'Login credentials',
				click:function(){
					xAppOpenClose(this.parentNode);
					document.getElementById('login_input_username').focus();
				}
			}, {
				tag:'article',
				class:'show',
				kids:[
					{
						tag:'input',
						type:'text',
						class:['textfield', 'fullwidth'],
						placeholder:'Username',
						id:'login_input_username'
					}, {
						tag:'input',
						type:'password',
						class:['textfield', 'fullwidth'],
						placeholder:'Password',
						id:'login_input_password'
					}, {
						tag:'div',
						class:['xButton', 'fullwidth'],
						kids:'Log in',
						click:function(){
							let params = {
								username: document.getElementById('login_input_username').value,
								password: document.getElementById('login_input_password').value
							};
							ajax('comm.php?action=login', params, "Logging the user in.").then(function(r){
								console.log(r);
								if(r.indexOf('ok: ') == 0){
									localStorage.setItem('username', r.substr(4));
									fsm.goHome();
								}
							}, ajaxErr);
						}
					}
				]
			}
		]
	});
	document.getElementById('login_input_username').focus();
}


function setUpHomePage(){
	document.getElementById('main').delKids();
	document.getElementById('main').appendX({
		tag:'section',
		class:'xApp',
		kids:[
			{
				tag:'header',
				kids:'Your decks on this device',
				click:function(){
					xAppOpenClose(this.parentNode);
				}
			}, {
				tag:'article',
				class:'show',
				kids:new XDeckListButtons()
			}
		]
	});
}
function XDeckListButtons(){
	this.tag  = 'div';
	this.kids = [];
	for(var i of Object.keys(vt.decks)){
		this.kids.push({
			tag:'div',
			class:['xButton', 'small'],
			i:i,
			kids:vt.deck(i).name,
			click:function(){
				fsm.goTo(this.getAttribute('i'));
			}
		});
	}
}

function setUpDeckPage(){
	document.getElementById('main').delKids();
	document.getElementById('main').appendX({
		tag:'section',
		class:'xApp',
		kids:[
			{
				tag:'header',
				kids:'Deck: '+vt.deck().name,
				click:function(){
					xAppOpenClose(this.parentNode);
				}
			}, {
				tag:'article',
				kids:undefined
			}
		]
	});
	document.getElementById('main').appendX({
		tag:'section',
		class:'xApp',
		kids:[
			{
				tag:'header',
				kids:"Add an entry to this deck",
				click:function(){
					xAppOpenClose(this.parentNode, function(){
						document.getElementById('addentry_faceB').focus();
					});
				}
			}, {
				tag:'article',
				kids:[
					{
						tag:'textarea',
						id:'addentry_faceB',
						class:['fullwidth', 'textfield'],
						placeholder:'Word or expression in your target language',
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						value:'',
						keyup:function(e){
							if(e.keyCode == 13 && e.ctrlKey){
								document.getElementById('addentry_sendbutton').triggerE('click');
							}
						},
						input:function(){
							resizeTextarea(this);
						}
					}, {
						tag:'textarea',
						id:'addentry_faceA',
						class:['fullwidth', 'textfield'],
						placeholder:'Translation in your language',
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						value:'',
						keyup:function(e){
							if(e.keyCode == 13 && e.ctrlKey){
								document.getElementById('addentry_sendbutton').triggerE('click');
							}
						},
						input:function(){
							resizeTextarea(this);
						}
					}, {
						tag:'input',
						type:'text',
						id:'addentry_hint',
						class:['fullwidth', 'textfield'],
						style:'opacity:.5',
						placeholder:'Hint',
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						value:'',
						keyup:function(e){
							this.style.opacity = this.value ? '' : '.5';
							if(e.keyCode == 13 && e.ctrlKey){
								document.getElementById('addentry_sendbutton').triggerE('click');
							}
						}
					}, {
						tag:'textarea',
						id:'addentry_defs',
						class:['fullwidth', 'textfield'],
						style:'opacity:.5',
						placeholder:'Definitions',
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						value:'',
						keyup:function(e){
							this.style.opacity = this.value ? '' : '.5';
							if(e.keyCode == 13 && e.ctrlKey){
								document.getElementById('addentry_sendbutton').triggerE('click');
							}
						},
						input:function(){
							resizeTextarea(this);
						}
					}, {
						tag:'textarea',
						id:'addentry_xmpl',
						class:['fullwidth', 'textfield'],
						style:'opacity:.5',
						placeholder:'Examples',
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						value:'',
						keyup:function(e){
							this.style.opacity = this.value ? '' : '.5';
							if(e.keyCode == 13 && e.ctrlKey){
								document.getElementById('addentry_sendbutton').triggerE('click');
							}
						},
						input:function(){
							resizeTextarea(this);
						}
					}, {
						tag:'textarea',
						id:'addentry_desc',
						class:['fullwidth', 'textfield'],
						style:'opacity:.5',
						placeholder:'Additional notes',
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						value:'',
						keyup:function(e){
							this.style.opacity = this.value ? '' : '.5';
							if(e.keyCode == 13 && e.ctrlKey){
								document.getElementById('addentry_sendbutton').triggerE('click');
							}
						},
						input:function(){
							resizeTextarea(this);
						}
					}, {
						tag:'div',
						class:['xButton', 'fullwidth'],
						kids:'Add entry',
						id:'addentry_sendbutton',
						click:function(){
							vt.deck().addEntry(
								document.getElementById('addentry_faceA').value,
								document.getElementById('addentry_faceB').value,
								document.getElementById('addentry_hint').value,
								document.getElementById('addentry_defs').value,
								document.getElementById('addentry_xmpl').value,
								document.getElementById('addentry_desc').value,
							);

							document.getElementById('addentry_faceA').value = '';
							document.getElementById('addentry_faceB').value = '';
							document.getElementById('addentry_hint').value  = '';
							document.getElementById('addentry_defs').value  = '';
							document.getElementById('addentry_xmpl').value  = '';
							document.getElementById('addentry_desc').value  = '';

							document.getElementById('addentry_hint').triggerE('keyup');
							document.getElementById('addentry_defs').triggerE('keyup');
							document.getElementById('addentry_xmpl').triggerE('keyup');
							document.getElementById('addentry_desc').triggerE('keyup');

							document.getElementById('addentry_faceB').focus();

							document.getElementById('cardmain').delKids().appendX(new XCardMain());
						}
					}
				]
			}
		]
	});
	document.getElementById('main').appendX({
		tag:'section',
		class:'xApp',
		kids:[
			{
				tag:'header',
				kids:"Review this deck's entries",
				click:function(){
					xAppOpenClose(this.parentNode);
				}
			}, {
				tag:'article',
				class:'show',
				id:'cardmain',
				kids:new XCardMain()
			}
		]
	});
	document.getElementById('main').appendX({
		tag:'section',
		class:'xApp',
		kids:[
			{
				tag:'header',
				kids:'List of entries',
				click:function(){
					xAppOpenClose(this.parentNode, function(){
						document.getElementById('listbox').delKids().appendX(new XEntryList());
					});
				}
			}, {
				tag:'article',
				//class:'show',
				kids:[
					{
						tag:'nav',
						kids:'Here come the options, including a searchbar, some display options (show or hide hint/defs/...), and a refresh button'
					}, {
						tag:'div',
						id:'listbox',
						kids: new XEntryList()
					}
				]
			}
		]
	});
}

function XEntryList(){
	this.tag = 'div';
	this.kids= [];
	var indices = vt.deck().sortedEntryList();
	for(let i = 0; i < indices.length; i++){
		this.kids.push({
			tag:'div',
			kids:[
				{
					tag:'span',
					style:'width:50%; display:inline-block;',
					kids:vt.deck().entry(indices[i]).b
				}, {
					tag:'span',
					style:'width:50%; display:inline-block;',
					kids:vt.deck().entry(indices[i]).a
				}
			]
		});
	}
}

function XCardMain(){
	this.tag    = 'div';
	this.append = function(){
		document.getElementById('cardmain').classList.remove('showB');
		document.getElementById('cardmain').classList.add('showA');
	};

	vt.deck().nextEntry();
	var card = vt.deck().entry();

	if(card === undefined){
		this.kids = "You are done!";
	}
	else{
		this.kids = [
			{
				tag:'nav',
				id:'cardhead',
				kids:[
					{
						tag:'div',
						class:['xButton', 'small'],
						kids:'Edit',
						click:function(){
							console.log("Not yet implemented: " + this.innerText);
						}
					}, {
						tag:'div',
						class:['xButton', 'small'],
						kids:'Transfer',
						click:function(){
							console.log("Not yet implemented: " + this.innerText);
						}
					}, {
						tag:'div',
						class:['xButton', 'small'],
						kids:'Delete',
						click:function(){
							if(confirm("Do you really want to remove this entry?")){
								vt.deck().removeEntry();
								document.getElementById('cardmain').delKids().appendX(new XCardMain());
							}
						}
					}, {
						tag:'div',
						class:['xButton', 'small'],
						kids:'Stats',
						click:function(){
							console.log("Not yet implemented: " + this.innerText);
						}
					}, {
						tag:'div',
						class:['xButton', 'small'],
						kids:'Speak',
						click:function(){
							console.log("Not yet implemented: " + this.innerText);
						}
					}, {
						tag:'div',
						class:['xButton', 'small'],
						kids:'Star',
						click:function(){
							console.log("Not yet implemented: " + this.innerText);
						}
					}
				]
			}, {
				tag:'nav',
				id:'cardbody',
				click:function(){
					document.getElementById('cardmain').classList.toggle('showA');
					document.getElementById('cardmain').classList.toggle('showB');
				},
				kids:[
					{
						tag:'div',
						class:['cardside', 'faceA'],
						kids:card.a
					}, {
						tag:'div',
						class:['cardside', 'faceB'],
						kids:card.b
					}
				]
			}, {
				tag:'input',
				type:'text',
				id:'cardhint',
				value:card.hint || '',
				keyup:function(){
					this.style.color='rgb(0,0,0,.7)';
				},
				change:function(){
					vt.deck().editEntryHint(this.value);
					this.style.color='';
					document.activeElement.blur();
				}
			}, {
				tag:'nav',
				id:'cardfoot',
				kids:[
					{
						tag:'div',
						class:['xButton', 'cardbutton'],
						style:'flex-grow:0;',
						kids:[
							{
								tag:'div',
								class:'label',
								kids:'⊘'
							}, {
								tag:'div',
								class:'duration',
								kids:'Disable'
							}
						],
						click:function(){
							card.isDisabled     = true;
							vt.deck().lastmodif = Date.now();
							document.getElementById('cardmain').delKids().appendX(new XCardMain());
						}
					}, {
						tag:'div',
						class:['xButton', 'cardbutton', 'perfect'],
						kids:[
							{
								tag:'div',
								class:'label',
								kids:'Perfect!'
							}, {
								tag:'div',
								class:'duration',
								kids:millisecondsToEnglish(card.getIntervals(PERFECT))
							}
						],
						click:function(){
							vt.deck().reviseEntry(PERFECT);
							document.getElementById('cardmain').delKids().appendX(new XCardMain());
						}
					},
					{
						tag:'div',
						class:['xButton', 'cardbutton', 'good'],
						kids:[
							{
								tag:'div',
								class:'label',
								kids:'Good job'
							}, {
								tag:'div',
								class:'duration',
								kids:millisecondsToEnglish(card.getIntervals(GOOD))
							}
						],
						click:function(){
							vt.deck().reviseEntry(GOOD);
							document.getElementById('cardmain').delKids().appendX(new XCardMain());
						}
					},
					{
						tag:'div',
						class:['xButton', 'cardbutton', 'middle'],
						kids:[
							{
								tag:'div',
								class:'label',
								kids:'Acceptable'
							}, {
								tag:'div',
								class:'duration',
								kids:millisecondsToEnglish(card.getIntervals(MIDDLE))
							}
						],
						click:function(){
							vt.deck().reviseEntry(MIDDLE);
							document.getElementById('cardmain').delKids().appendX(new XCardMain());
						}
					},
					{
						tag:'div',
						class:['xButton', 'cardbutton', 'oups'],
						kids:[
							{
								tag:'div',
								class:'label',
								kids:'I forgot'
							}, {
								tag:'div',
								class:'duration',
								kids:millisecondsToEnglish(card.getIntervals(OUPS))
							}
						],
						click:function(){
							vt.deck().reviseEntry(OUPS);
							document.getElementById('cardmain').delKids().appendX(new XCardMain());
						}
					}
				]
			}, {
				tag:'aside',
				id:'cardextras',
				style:{
					display: (!!card.defs || !!card.xmpl || !!card.desc) ? '' : 'none'
				},
				kids:[
					!!card.defs ? [{
						tag:'b',
						kids:'Definition: '
					}, {
						tag:'div',
						kids:card.defs
					}, '\n'] : undefined,
					!!card.xmpl ? [{
						tag:'b',
						kids:'Examples: '
					}, {
						tag:'div',
						kids:card.xmpl
					}, '\n'] : undefined,
					!!card.desc ? [{
						tag:'b',
						kids:'Additional notes: '
					}, {
						tag:'div',
						kids:card.desc
					}, '\n'] : undefined
				]
			}
		];
	}

}
// debug:
