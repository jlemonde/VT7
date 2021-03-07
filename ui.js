// EVERYTHING THAT IS ABOUT THE INTERFACE COMES HERE, INCLUDING THE PAGES' FINITE STATE MACHINE

// FINITE STATE MACHINE
function FiniteStateMachine(){
	this.init = function(pushState){
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
					kids:[
						{
							tag:'p',
							style:'text-align:justify;',
							kids:"Welcome!"
						},
						{
							tag:'p',
							style:'text-align:justify;',
							kids:[{tag:'i', kids:'VocabPocket'}, " is a spaced repetition system (SRS) in the form of a flashcarding app, aimed at vocabulary acquisition. You can learn more about ", {tag:'a', href:'https://en.wikipedia.org/wiki/Spaced_repetition', kids:'spaced repetition', target:'_blank'}, ' and ', {tag:'a', href:'https://en.wikipedia.org/wiki/Forgetting_curve', kids:'forgetting curves', target:'_blank'}, ' on Wikipedia.']
						},
						{
							tag:'p',
							style:'text-align:justify;',
							kids:"You can use this application from the computer and from the mobile phone conjointly. On mobile, if you are using Google Chrome on Android or Safari on iOS, you can add the website to your home page and the app will behave like a native app."
						},
						{
							tag:'p',
							style:'text-align:justify;',
							kids:"IMPORTANT: This application is currently in the beta phase. One important notice to avoid data loss is to bear in mind that if you sync a deck at the very same time from several devices in parallel (e.g. your phone and your laptop), there might be one version that is going to be kept. Other than that, the core features of the app are fully implemented and work safely, and the gadgets are going to be developed bit by bit."
						}
					]
				}
			]
		});
		if(pushState !== false) history.pushState({f:'init'}, '', undefined);
	};
	this.logIn = function(pushState){
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
		if(pushState !== false) history.pushState({f:'logIn'}, '', undefined);
	};
	this.newUserCreation = function(pushState){
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
			setUpAccountCreationPage();
			if(pushState !== false) history.pushState({f:'newUserCreation'}, '', undefined);
	};
	this.goHome = function(pushState){
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
					vt = new VocabTrainer();
				}, ajaxErr);
			}
		});
		setUpHomePage();
		vt.lastUploadCheck = Date.now()-1000*60-1; // we set it to the past so that it would upload again.
		if(pushState !== false) history.pushState({f:'goHome'}, '', undefined);
	};
	this.goTo = function(deck_id, pushState){
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
			vt.lastUploadCheck = Date.now()-1000*60-1; // we set it to the past so that it would upload again.
			if(pushState !== false) history.pushState({f:'goTo', d:deck_id}, '', undefined);
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
				localStorage.removeItem('username');
				fsm.init();
			}
		}, ajaxErr);
	}
	else{
		this.init();
	}
}
var fsm = new FiniteStateMachine();


window.onpopstate = function(e){
   if(typeof(e) == 'object' && e.state && typeof(e.state.f) == 'string'){
      console.log('HISTORY : ', e.state.f, e.state.d);
      if(e.state.f == 'init'){
			fsm.init(false);
		} else if(e.state.f == 'logIn'){
			fsm.logIn(false);
		} else if(e.state.f == 'newUserCreation'){
			fsm.newUserCreation(false);
		} else if(e.state.f == 'goHome'){
			fsm.goHome(false);
		} else if(e.state.f == 'goTo' && e.state.d !== undefined){
			fsm.goTo(e.state.d, false);
		}
   }
};

// WE ONLY ALLOW ONE TAB OPEN AT ONCE!
localStorage['windowID'] = Math.random();
window.addEventListener('storage', function(e){
	if(e.key == 'windowID'){
		document.body.delKids().appendX("You opened this web-app again in another tab...");
	}
});


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
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						id:'login_input_username',
						value:'lastuser' in localStorage ? localStorage['lastuser'] : '',
						change:function(){
							vt = new VocabTrainer();
							localStorage.clear();
							localStorage['lastuser'] = this.value;
						}
					}, {
						tag:'input',
						type:'password',
						class:['textfield', 'fullwidth'],
						placeholder:'Password',
						id:'login_input_password',
						keyup:function(e){
							if(e.keyCode == 13){
								document.getElementById('log_in_button').click();
							}
						}
					}, {
						tag:'div',
						class:['xButton', 'fullwidth'],
						id:'log_in_button',
						kids:'Log in',
						click:function(){
							localStorage.removeItem('username');

							let params = {
								username: document.getElementById('login_input_username').value,
								password: document.getElementById('login_input_password').value
							};
							ajax('comm.php?action=login', params, "Logging the user in.").then(function(r){
								console.log(r);
								if(r.indexOf('ok: ') == 0){
									localStorage.setItem('username', r.substr(4));
									vt = new VocabTrainer();
									vt.loadAllDecks();
									fsm.goHome();
								}
							}, ajaxErr);
						}
					}
				]
			}
		]
	});
	if(document.getElementById('login_input_username').value){
		document.getElementById('login_input_password').focus();
	}
	else{
		document.getElementById('login_input_username').focus();
	}

}

function setUpAccountCreationPage(){
	document.getElementById('main').delKids();
	document.getElementById('main').appendX({
		tag:'section',
		class:'xApp',
		kids:[
			{
				tag:'header',
				kids:'Create an account',
				click:function(){
					xAppOpenClose(this.parentNode);
					document.getElementById('accountcreation_input_username').focus();
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
						id:'accountcreation_input_username',
						input:function(){
							document.getElementById('accountcreation_input_displayname').value = this.value;
						}
					}, {
						tag:'input',
						type:'password',
						class:['textfield', 'fullwidth'],
						placeholder:'Password',
						id:'accountcreation_input_password'
					}, {
						tag:'input',
						type:'text',
						style:'display:none;',
						class:['textfield', 'fullwidth'],
						placeholder:'Display name (optional)',
						id:'accountcreation_input_displayname'
					}, {
						tag:'input',
						type:'text',
						class:['textfield', 'fullwidth'],
						placeholder:'E-mail address (optional, for password recovery)',
						id:'accountcreation_input_email'
					}, {
						tag:'div',
						class:['xButton', 'fullwidth'],
						kids:'Create account',
						click:function(){
							let params = {
								username:    document.getElementById('accountcreation_input_username').value,
								displayname: document.getElementById('accountcreation_input_displayname').value,
								password:    document.getElementById('accountcreation_input_password').value,
								email:       document.getElementById('accountcreation_input_email').value
							};
							ajax('comm.php?action=accountcreation', params, "Creating an account for the user.").then(function(r){
								console.log(r);
								if(r.indexOf('true') == 0){
									alert("Your account has been created, you can now log in!");
									fsm.logIn();
								}
							}, ajaxErr);
						}
					}
				]
			}
		]
	});
	document.getElementById('accountcreation_input_username').focus();
}


function setUpHomePage(){
	document.getElementById('main').delKids();
	document.getElementById('main').appendX({
		tag:'section',
		class:'xApp',
		kids:[
			{
				tag:'header',
				kids:'Your decks',
				id:'decks_on_this_device',
				click:function(){
					xAppOpenClose(this.parentNode);
				}
			}, {
				tag:'article',
				class:'show',
				id:'device_deck_list_buttons',
				kids:[
					{
						tag:'div',
						id:'container_for_local_decklist',
						kids:new XDeckListButtons()
					},
					{
						tag:'div',
						id:'container_for_serverhosted_decklist'
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
				kids:'Create a new deck',
				click:function(){
					xAppOpenClose(this.parentNode);
				}
			}, {
				tag:'article',
				kids:[
					{
						tag:'input',
						type:'text',
						class:['fullwidth', 'textfield'],
						placeholder:'Deck\'s title',
						id:'create_deck_title'
					}, {
						tag:'textarea',
						class:['fullwidth', 'textfield'],
						placeholder:'Optionally, a description',
						id:'create_deck_description',
						style:'opacity:.5;',
						input:function(){
							resizeTextarea(this);
							this.style.opacity = this.value.length ? '' : '.5';
						}

					}, {
						tag:'div',
						class:['xButton', 'fullwidth'],
						kids:'Create deck',
						click:function(){
							var d = new Deck(
								document.getElementById('create_deck_title').value,
								document.getElementById('create_deck_description').value
							);
							vt.pushDeck(d);
							fsm.goTo(d.deckID);
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
				kids:'User credentials',
				click:function(){
					xAppOpenClose(this.parentNode, function(){
						// here we retrieve the current e-mail address of the user
						ajax('comm.php?action=reademailaddress', undefined, "Get the user's e-mail address").then(function(r){
							if(r.indexOf('true, ') == 0 && document.getElementById('useremailchange_email')){
								document.getElementById('useremailchange_email').value = r.substr('true, '.length);
							}
							else{
								console.error("Could not retrieve the user's e-mail address:", r);
							}
						});
					});
				}
			}, {
				tag:'article',
				kids:[
					{
						tag:'div',
						class:'separator',
						kids:'Change password:'
					}, {
						tag:'input',
						type:'password',
						id:'userpasswordchange_old',
						class:['textfield', 'fullwidth'],
						placeholder:'Current password'
					}, {
						tag:'input',
						type:'password',
						id:'userpasswordchange_new1',
						class:['textfield', 'fullwidth'],
						placeholder:'New password'
					}, {
						tag:'input',
						type:'password',
						id:'userpasswordchange_new2',
						class:['textfield', 'fullwidth'],
						placeholder:'New password, again'
					}, {
						tag:'div',
						class:['xButton', 'fullwidth'],
						kids:'Change password',
						click:function(){
							var params = {
								oldpass0: document.getElementById('userpasswordchange_old').value,
								newpass1: document.getElementById('userpasswordchange_new1').value,
								newpass2: document.getElementById('userpasswordchange_new2').value
							};
							ajax('comm.php?action=changepassword', params, "Changing password").then(function(r){
								if(r == 'true'){
									if(document.getElementById('userpasswordchange_old')){
										document.getElementById('userpasswordchange_old').value = '';
										document.getElementById('userpasswordchange_new1').value = '';
										document.getElementById('userpasswordchange_new2').value = '';
									}
									alert("Password changed successfully!");
								}
								else{
									alert("There was an error. Perhaps the old password is incorrect, or the new passwords do not coincide.");
									console.log(r);
								}
							});
						}
					}, {
						tag:'div',
						class:'separator',
						kids:"Change e-mail address:"
					}, {
						tag:'input',
						type:'password',
						id:'useremailchange_password',
						class:['textfield', 'fullwidth'],
						placeholder:'This action requires your password'
					}, {
						tag:'input',
						type:'text',
						id:'useremailchange_email',
						class:['textfield', 'fullwidth'],
						placeholder:'New e-mail address'
					}, {
						tag:'div',
						class:['xButton', 'fullwidth'],
						kids:'Change e-mail address',
						click:function(){
							var params = {
								passwd:document.getElementById('useremailchange_password').value,
								email: document.getElementById('useremailchange_email').value,
							};
							ajax('comm.php?action=changeemail', params, "Changing e-mail address").then(function(r){
								if(r.indexOf('true, ') == 0){
									if(document.getElementById('useremailchange_password')){
										document.getElementById('useremailchange_password').value = '';
										document.getElementById('useremailchange_email').value = r.substr('true, '.length);
									}
									alert("E-mail address changed successfully!");
								}
								else{
									alert("There was an error. Perhaps the password is incorrect.");
									console.log(r);
								}
							});
						}
					}/*, {tag:'br'}, {tag:'br'}, {
						tag:'div',
						kids:"I could add here as well a way to delete the user's account (legally important), and a button for the user to download all his data (including images, audio and video) to be GDPR-compliant."
					}*/
				]
			}
		]
	});
}
function XDeckListButtons(){
	this.tag  = 'div';
	this.kids = [];
	var counts = 0;
	for(var i of vt.sortedList()){
		counts++;
		var metrics = vt.deck(i).entryListCounts();
		var cfact   = Math.round(Math.min(metrics.available, 50) / Math.max(Math.min(metrics.total, 50), 3)*100)/100;
		this.kids.push({
			tag:'div',
			class:['xButton', 'decklist_item'],
			i:i,
			available:metrics.available == 0 ? undefined : metrics.available,
			style:{
				backgroundImage:'-webkit-gradient(linear, 0% 0%, 0% 100%, from(transparent), '+
									 'to(hsla('+(160*(1-cfact))+', 57%, '+
									 (30*cfact+47)+'%, '+Math.sqrt(cfact)+')))'
			},
			kids:[
				{
					tag:'div',
					class:'decklist_item_name',
					kids:vt.deck(i).name
				}, {
					tag:'div',
					class:'decklist_item_description',
					kids:previewString(vt.deck(i).description, 42)
				},
			],
			click:function(){
				fsm.goTo(this.getAttribute('i'));
			}
		});
	}
	if(!counts){
		this.kids.push("You haven't got any decks on this device for now!");
	}
}

function dragdropfileupload(ev, self){
	var files = [];
	if (ev.dataTransfer.items) {
		// Use DataTransferItemList interface to access the file(s)
		for (var i = 0; i < ev.dataTransfer.items.length; i++) {
			// If dropped items aren't files, reject them
			if (ev.dataTransfer.items[i].kind === 'file') {
				var file = ev.dataTransfer.items[i].getAsFile();
				files.push(file);
				console.log('... file[' + i + '].name = ' + file.name);
			}
		}
	} else {
		// Use DataTransfer interface to access the file(s)
		for (var i = 0; i < ev.dataTransfer.files.length; i++) {
			var file = ev.dataTransfer.files[i];
			files.push(file);
			console.log('... file[' + i + '].name = ' + file.name);
		}
	}

	var data = new FormData();
	for(let f of files){
		if(/^(image|video|audio)/.test(f.type)){
			if(f.size <= 2*1024*1024){
				console.log(f);
				data.append('file[]', f);
			}
			else{
				console.info("The file " + f.name + " was discarded because it was more than 2MB.");
			}
		}
		else{
			console.info("The file " + f.name + " was discarded because we only allow image, audio and video files.");
		}
	}
	ajax('comm.php?action=uploadmedium', data, "Uploading a medium (image|audio|video)").then(function(r){
		var resp = r.split("\n");
		for(let i = 0; i < resp.length; i++){
			if(resp[i].indexOf('true, ') == 0){
				self.value += resp[i].substr('true, '.length);
				resizeTextarea(self);
			}
		}
	});
}
// addOrEdit is either 'add' (default) or 'edit'.
// the parameter entry_id is only used if addOrEdit == 'edit'
function XAppAddOrEdit(addOrEdit = 'add', entry_id){
	return {
		tag:'section',
		id:addOrEdit != 'edit' ? undefined : 'edit_entry_app',
		class:'xApp',
		kids:[
			{
				tag:'header',
				kids:addOrEdit != 'edit' ? "Add an entry to this deck" : "Edit an entry",
				click:function(){
					xAppOpenClose(this.parentNode, function(){
						document.getElementById('addentry_faceB').focus();
					}, function(){
						if(!!document.getElementById('edit_entry_app')){
							document.getElementById('edit_entry_app').delElement();
						}
					});
				}
			}, {
				tag:'article',
				class:addOrEdit != 'edit' ? undefined : 'show',
				kids:[
					{
						tag:'textarea',
						id:(addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_faceB',
						class:['fullwidth', 'textfield'],
						placeholder:'A: Word or expression in your target language',
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						value:addOrEdit != 'edit' ? '' : vt.deck().entry().b || '',
						keyup:function(e){
							if(e.keyCode == 13 && e.ctrlKey){
								document.getElementById((addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_sendbutton').triggerE('click');
							}
						},
						input:function(){
							resizeTextarea(this);
						},
						dragover:function(){
							this.style.backgroundColor = 'orange';
						},
						dragleave:function(){
							this.style.backgroundColor = '';
						},
						drop:function(ev){
							this.style.backgroundColor = '';
							ev.preventDefault();
							dragdropfileupload(ev, this);
						}
					}, {
						tag:'textarea',
						id:(addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_faceA',
						class:['fullwidth', 'textfield'],
						placeholder:'Q: Word in your language',
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						value:addOrEdit != 'edit' ? '' : vt.deck().entry().a || '',
						keyup:function(e){
							if(e.keyCode == 13 && e.ctrlKey){
								document.getElementById((addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_sendbutton').triggerE('click');
							}
						},
						input:function(){
							resizeTextarea(this);
						},
						dragover:function(){
							this.style.backgroundColor = 'orange';
						},
						dragleave:function(){
							this.style.backgroundColor = '';
						},
						drop:function(ev){
							this.style.backgroundColor = '';
							ev.preventDefault();
							dragdropfileupload(ev, this);
						}
					}, {
						tag:'input',
						type:'text',
						id:(addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_hint',
						class:['fullwidth', 'textfield'],
						style:'opacity:.5',
						placeholder:'Hint',
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						value:addOrEdit != 'edit' ? '' : vt.deck().entry().hint || '',
						keyup:function(e){
							this.style.opacity = this.value ? '' : '.5';
							if(e.keyCode == 13 && e.ctrlKey){
								document.getElementById((addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_sendbutton').triggerE('click');
							}
						}
					}, {
						tag:'textarea',
						id:(addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_defs',
						class:['fullwidth', 'textfield'],
						style:'opacity:.5',
						placeholder:'Definitions',
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						value:addOrEdit != 'edit' ? '' : vt.deck().entry().defs || '',
						keyup:function(e){
							this.style.opacity = this.value ? '' : '.5';
							if(e.keyCode == 13 && e.ctrlKey){
								document.getElementById((addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_sendbutton').triggerE('click');
							}
						},
						input:function(){
							resizeTextarea(this);
						}
					}, {
						tag:'textarea',
						id:(addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_xmpl',
						class:['fullwidth', 'textfield'],
						style:'opacity:.5',
						placeholder:'Examples',
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						value:addOrEdit != 'edit' ? '' : vt.deck().entry().xmpl || '',
						keyup:function(e){
							this.style.opacity = this.value ? '' : '.5';
							if(e.keyCode == 13 && e.ctrlKey){
								document.getElementById((addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_sendbutton').triggerE('click');
							}
						},
						input:function(){
							resizeTextarea(this);
						}
					}, {
						tag:'textarea',
						id:(addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_desc',
						class:['fullwidth', 'textfield'],
						style:'opacity:.5',
						placeholder:'Additional notes',
						autocapitalize:'off',
						autocorrect:'off',
						autocomplete:'off',
						spellcheck:'false',
						value:addOrEdit != 'edit' ? '' : vt.deck().entry().desc || '',
						keyup:function(e){
							this.style.opacity = this.value ? '' : '.5';
							if(e.keyCode == 13 && e.ctrlKey){
								document.getElementById((addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_sendbutton').triggerE('click');
							}
						},
						input:function(){
							resizeTextarea(this);
						}
					}, {
						tag:'div',
						class:['xButton', 'fullwidth'],
						kids:addOrEdit != 'edit' ? 'Add entry' : 'Edit entry',
						id:(addOrEdit != 'edit' ? 'add' : 'edit') + 'entry_sendbutton',
						action:addOrEdit,
						entry_id:entry_id,
						click:function(){
							if(this.getAttribute('action') != 'edit'){
								vt.deck().addEntry(
									document.getElementById('addentry_faceA').value,
									document.getElementById('addentry_faceB').value,
									document.getElementById('addentry_hint').value,
									document.getElementById('addentry_defs').value,
									document.getElementById('addentry_xmpl').value,
									document.getElementById('addentry_desc').value
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

								resizeTextarea(document.getElementById('addentry_faceA'));
								resizeTextarea(document.getElementById('addentry_faceB'));
								resizeTextarea(document.getElementById('addentry_defs'));
								resizeTextarea(document.getElementById('addentry_xmpl'));
								resizeTextarea(document.getElementById('addentry_desc'));

								document.getElementById('addentry_faceB').focus();

								document.getElementById('cardmain').delKids().appendX(new XCardMain());
							}
							else{
								entry_id = parseInt(this.getAttribute('entry_id'));
								vt.deck().editEntry(
									entry_id,
									document.getElementById('editentry_faceA').value,
									document.getElementById('editentry_faceB').value,
									document.getElementById('editentry_hint').value,
									document.getElementById('editentry_defs').value,
									document.getElementById('editentry_xmpl').value,
									document.getElementById('editentry_desc').value
								);
								document.getElementById('edit_entry_app').delElement();

								document.getElementById('cardmain').delKids().appendX(new XCardMain(entry_id));
							}

						}
					}
				]
			}
		]
	};
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
					xAppOpenClose(this.parentNode, function /*open*/(){
						resizeTextarea(document.getElementById('textarea_description_of_the_deck'));
					});
				}
			}, {
				tag:'article',
				kids:[
					{
						tag:'div',
						class:'separator',
						kids:"Description of the deck:"
					},
					{
						tag:'textarea',
						class:['fullwidth', 'textfield'],
						placeholder:"Description of the deck",
						value:vt.deck().description || '',
						id:'textarea_description_of_the_deck',
						input:function(){
							resizeTextarea(this);
							this.style.opacity = this.value.length ? '' : '.5';
						},
						change:function(){
							vt.deck().description = this.value;
							vt.deck().lastmodif = Date.now();
						}
					},
					{
						tag:'div',
						class:'separator',
						kids:"Deck-related tools:"
					},
					{
						tag:'div',
						class:['xButton', 'small'],
						kids:"Rename the deck",
						click:function(){
							var newname = prompt("New deck name:", vt.deck().name || '');
							if(newname){
								vt.deck().name = newname;
								vt.deck().lastmodif = Date.now();
								fsm.goTo(vt.deck().deckID);
							}

						}
					},
					{
						tag:'div',
						class:['xButton', 'small'],
						kids:"Import entries from a spreadsheet",
						click:function(){
							document.getElementById('container_for_deck_tools').delKids().appendX({
								tag:'section',
								class:'xApp',
								id:'decktool_import_from_spreadsheet_app',
								kids:[
									{
										tag:'header',
										kids:"Import entries from a spreadsheet",
										click:function(){
											xAppOpenClose(this.parentNode, undefined, function(){
												document.getElementById('decktool_import_from_spreadsheet_app').delElement();
											});
										}
									}, {
										tag:'article',
										class:'show',
										kids:[
											{
												tag:'div',
												kids:"Prepare a spreadsheet (e.g. MS Excel) with each row corresponding to an entry. The first column is the word in your target language, the second is the translation, the third is the hint (optional), etc. Then select and copy the relevant fields in your spreadsheet and paste them into the field below:"
											},
											{
												tag:'textarea',
												class:['fullwidth', 'textfield'],
												id:'decktool_import_from_spreadsheet_textarea',
												style:{
													height:     '120px',
													textAlign:  'left',
													lineHeight: '1.25em !important'
												}
											},
											{
												tag:'div',
												class:['xButton', 'fullwidth'],
												kids:"Import",
												click:function(){
													var sp = document.getElementById('decktool_import_from_spreadsheet_textarea').value;
													var entries = sp.split('\n');
													var added = 0;
													for(var i = 0; i < entries.length; i++){
														var entry = entries[i].split('\t');
														if(entry[0] != '' || entry[1] != ''){
															vt.deck().addEntry(entry[1], entry[0], entry[2], entry[3], entry[4], entry[5]);
															added++;
														}
													}
													// |@# There might be a bug here: it might import an additional useless empty card
													alert(added + " entries have been imported to this deck.");
													document.getElementById('decktool_import_from_spreadsheet_app').delElement();
													document.getElementById('cardmain').delKids().appendX(new XCardMain());
												}
											}
										]
									}
								]
							});
						}
					},
					{
						tag:'div',
						class:['xButton', 'small'],
						kids:"Export this deck as JSON",
						click:function(){
							saveAsFile(vt.deck().name+'.vt7.json', JSON.stringify(vt.deck(), null, 3));
						}
					},
					{
						tag:'div',
						class:['xButton', 'small'],
						style:'background-color:#F9AC9A;',
						kids:"Remove this deck",
						click:function(){
							document.getElementById('container_for_deck_tools').delKids().appendX({
								tag:'section',
								class:'xApp',
								id:'decktool_removedeck_app',
								kids:[
									{
										tag:'header',
										kids:"Remove this deck",
										click:function(){
											xAppOpenClose(this.parentNode, undefined, function(){
												document.getElementById('decktool_removedeck_app').delElement();
											});
										}
									}, {
										tag:'article',
										class:'show',
										kids:[
											{
												tag:'div',
												class:['xButton', 'small', 'fullwidth'],
												kids:"Remove from this device only",
												click:function(){
													if(confirm("Do you want to remove this deck from this device? The backup on the server will remain.")){
														vt.removeDeck(vt.deck().deckID);
														fsm.goHome();
													}
												}
											}, {
												tag:'div',
												class:['xButton', 'small', 'fullwidth'],
												style:'background-color:#F9AC9A;',
												kids:"Completely remove this deck",
												click:function(){
													if(confirm("Do you really want to permanently remove this deck from both this device and the server? This cannot be cancelled.")){
														ajax("comm.php?action=removedeck", {filename:vt.deck().deckID}, "Removing a deck from the server (" + vt.deck().deckID + ")...").then(function(r){
															console.log(r);
															vt.removeDeck(vt.deck().deckID);
															fsm.goHome();
														});
													}
												}
											}
										]
									}
								]
							});
						}
					},
					{
						tag:'div',
						class:'separator',
						kids:"Deck-related options:"
					},
					'speechSynthesis' in window ? [
						"Language for speech synthesis: ",
						{
							tag:'span',
							kids:'Loading...',
							append:function(){
								window.speechSynthesis.getVoices();
								setTimeout(() => {
									this.delKids().appendX({
										tag:'select',
										style:'max-width:50%;',
										kids:window.speechSynthesis.getVoices().map((el, ind) => {
											return {
												tag:'option',
												value:ind,
												kids:el.name + ' (' + el.lang + ')',
												selected:'speechSynthesisVoiceID' in vt.deck() && vt.deck().speechSynthesisVoiceID == ind ? true : undefined
											};
										}),
										change:function(){
											vt.deck().speechSynthesisVoiceID = this.value;
											vt.deck().lastmodif = Date.now();
										}
									});
								}, 1000);
							}
						}, "\n", {
							tag:'label',
							'for':'speechSynthesisAutoSpeak',
							kids:"Read the flashcards automatically as you flip them"
						}, {
							tag:'input',
							type:'checkbox',
							id:'speechSynthesisAutoSpeak',
							checked:'speechSynthesisAutoSpeak' in vt.deck() && vt.deck().speechSynthesisAutoSpeak ? true : false,
							change:function(){
								vt.deck().speechSynthesisAutoSpeak = this.checked;
								vt.deck().lastmodif = Date.now();
							}
						}

					] : undefined
				]
			}
		]
	});
	document.getElementById('main').appendX({
		tag:'span',
		id:'container_for_deck_tools'
	});
	document.getElementById('main').appendX(XAppAddOrEdit('add'));
	document.getElementById('main').appendX({
		tag:'span',
		id:'container_for_editions'
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
				kids:'Loading...'
			}
		]
	});
	document.getElementById('main').appendX({
		tag:'span',
		id:'container_for_guesswithkeyboard'
	});
	document.getElementById('main').appendX({
		tag:'section',
		class:'xApp',
		kids:[
			{
				tag:'header',
				id:'header_listofentries',
				kids:'List of entries',
				click:function(){
					xAppOpenClose(this.parentNode, function(){
						var showHints       = document.getElementById('listOptionShowHint').checked;
						var showOtherFields = document.getElementById('listOptionShowOtherFields').checked;
						var querystr        = document.getElementById('listSearchbar').value;
						document.getElementById('listbox').delKids().appendX(new XEntryList(showHints, showOtherFields, querystr));
						document.getElementById('listSearchbar').focus();
					});
				}
			}, {
				tag:'article',
				id:'article_listofentries',
				//class:'show',
				kids:[
					{
						tag:'nav',
						style:{
							marginBottom:'8px'
						},
						kids:[
							{
								tag:'input',
								type:'text',
								class:['textfield', 'fullwidth'],
								placeholder:"Searchbar",
								id:'listSearchbar',
								input:function(){
									var showHints       = document.getElementById('listOptionShowHint').checked;
									var showOtherFields = document.getElementById('listOptionShowOtherFields').checked;
									var querystr        = document.getElementById('listSearchbar').value;
									document.getElementById('listbox').delKids().appendX(new XEntryList(showHints, showOtherFields, querystr));
								}
							},
							{
								tag:'input',
								type:'checkbox',
								id:'listOptionShowHint',
								name:'listOptionShowHint',
								change:function(){
									var showHints       = document.getElementById('listOptionShowHint').checked;
									var showOtherFields = document.getElementById('listOptionShowOtherFields').checked;
									var querystr        = document.getElementById('listSearchbar').value;
									document.getElementById('listbox').delKids().appendX(new XEntryList(showHints, showOtherFields, querystr));
								}
							}, {
								tag:'label',
								for:'listOptionShowHint',
								kids:"Show the hints"
							}, "\n", {
								tag:'input',
								type:'checkbox',
								id:'listOptionShowOtherFields',
								name:'listOptionShowOtherFields',
								change:function(){
									var showHints       = document.getElementById('listOptionShowHint').checked;
									var showOtherFields = document.getElementById('listOptionShowOtherFields').checked;
									var querystr        = document.getElementById('listSearchbar').value;
									document.getElementById('listbox').delKids().appendX(new XEntryList(showHints, showOtherFields, querystr));
								}
							}, {
								tag:'label',
								for:'listOptionShowOtherFields',
								kids:"Show the additional fields"
							}
						]
					}, {
						tag:'div',
						id:'listbox',
						kids: "Loading..."
					}
				]
			}
		]
	});
	document.getElementById('cardmain').delKids().appendX(new XCardMain());
}

function XEntryList(showHints = false, showOtherFields = false, querystr = undefined){
	this.tag = 'div';
	this.kids= [];
	var indices;
	if(querystr){
		indices = vt.deck().searchByKeyword(querystr, showHints, showOtherFields);
	}
	else{
		indices = vt.deck().sortedEntryList();
	}
	for(let i = 0; i < indices.length; i++){
		this.kids.push({
			tag:'div',
			style:'cursor:pointer;',
			class:[
				i % 2 == 0 ? 'even' : 'odd',
				'entrylist_item',
				vt.deck().entry(indices[i]).isStarred ? 'starred' : '',
				vt.deck().entry(indices[i]).isDisabled ? 'disabled' : '',
				vt.deck().entry(indices[i]).comeback > Date.now() ? 'delayed' : 'cameback'
			],
			entryid:indices[i],
			click:function(){
				var entryid = parseInt(this.getAttribute('entryid'));

				vt.deck().entry(entryid).comeback = Math.min(Date.now()-1000, vt.deck().entry(entryid).comeback);
				vt.deck().entry(entryid).isDisabled = undefined; // in case it was true, we unset this property
				vt.deck().lastmodif = Date.now();

				this.classList.add('cameback');
				this.classList.remove('delayed');
				this.classList.remove('disabled');

				document.getElementById('cardmain').delKids().appendX(new XCardMain(entryid));
				location.href = "#cardmain";
			},
			kids:[
				{
					tag:'span',
					class:'labelfav',
					style:{
						width:showHints ? '34%' : '50%',
						fontWeight:'bold'
					},
					kids:processCardFace(vt.deck().entry(indices[i]).a || '', undefined)
				}, {
					tag:'span',
					style:{
						width:showHints ? '34%' : '50%',
					},
					kids:processCardFace(vt.deck().entry(indices[i]).b || '', undefined)
				}, showHints ? {
					tag:'span',
					class:'hintitem',
					style:{
						width:showHints ? '32%' : '50%',
					},
					kids:vt.deck().entry(indices[i]).hint
				} : '',
				showOtherFields ? [
					{
						tag:'span',
						style:{
							width:'34%',
							fontSize:'.67em',
							opacity:vt.deck().entry(indices[i]).defs ? undefined : 0
						},
						kids:[
							{
								tag:'b',
								kids:'Definition:'
							}, {
								tag:'div',
								kids:vt.deck().entry(indices[i]).defs
							}
						]
					},
					{
						tag:'span',
						style:{
							width:'34%',
							fontSize:'.67em',
							opacity:vt.deck().entry(indices[i]).xmpl ? undefined : 0
						},
						kids:[
							{
								tag:'b',
								kids:'Examples:'
							}, {
								tag:'div',
								kids:vt.deck().entry(indices[i]).xmpl
							}
						]
					},
					{
						tag:'span',
						style:{
							width:'32%',
							fontSize:'.67em',
							opacity:vt.deck().entry(indices[i]).desc ? undefined : 0
						},
						kids:[
							{
								tag:'b',
								kids:'Additional notes:'
							}, {
								tag:'div',
								kids:vt.deck().entry(indices[i]).desc
							}
						]
					}
				] : ''
			]
		});
	}
	if(querystr){
		var otherDecks = [];
		for(let d of Object.keys(vt.decks)){
			if(d == vt.workingDeckID)
				continue;

			let amount = vt.deck(d).searchByKeyword(querystr, showHints, showOtherFields).length;
			if(amount){
				otherDecks.push({deckid:d, amount:amount});
			}
		}
		if(otherDecks.length){
			this.kids.push("\n"+"Results were also found in the following deck"+(otherDecks.length==1?'':'s')+": \n");
			for(let b of otherDecks){
				this.kids.push({
					tag:'div',
					class:['xButton', 'small'],
					kids:vt.deck(b.deckid).name + ' (' + b.amount + ')',
					i:b.deckid,
					click:function(){
						var q = document.getElementById('listSearchbar').value;
						fsm.goTo(this.getAttribute('i'));
						document.getElementById('header_listofentries').triggerE('click');
						document.getElementById('listSearchbar').value = q;
						document.getElementById('listSearchbar').triggerE('input');
					}
				});
			}
		}
	}
	else{
		var entryListCounts = vt.deck().entryListCounts();
		this.kids.push("\n" + "This deck contains " + entryListCounts.total + " entr" + (entryListCounts == 1 ? 'y' : 'ies') + '.');
	}
}

function processCardFace(face, autoplay){
	var regex = /(\{\{[a-z]{5}\:[a-z0-9]{40}\.[a-z0-9]{1,4}\}\})/g;
	var media = face.split(regex).map(el => {
		if(regex.test(el)){
			if(el.indexOf('image') == 2){
				return {
					tag:'img',
					src:'uploads/' + el.slice('{{image:'.length, -2),
					class:['cardmedium', 'image'],
					contextmenu:function(ev){
						this.classList.toggle('maxsizepopout');
						ev.preventDefault();
						ev.stopPropagation();
					}
				};
			}
			else if(el.indexOf('audio') == 2){
				return {
					tag:'audio',
					class:['cardmedium', 'audio'],
					controls:true,
					kids:{
						tag:'source',
						src:'uploads/' + el.slice('{{audio:'.length, -2)
					},
					volumechange:function(){
						localStorage['mediavolume'] = this.volume;
					},
					loadeddata:function(){
						if('mediavolume' in localStorage){
							this.volume = Number(localStorage['mediavolume']);
						}
					},
					canplaythrough:function(){
						if(autoplay){
							this.play();
						}
					}

				};
			}
			else if(el.indexOf('video') == 2){
				return {
					tag:'video',
					class:['cardmedium', 'video'],
					controls:true,
					kids:{
						tag:'source',
						src:'uploads/' + el.slice('{{video:'.length, -2)
					},
					volumechange:function(){
						localStorage['mediavolume'] = this.volume;
					},
					loadeddata:function(){
						if('mediavolume' in localStorage){
							this.volume = Number(localStorage['mediavolume']);
						}
					},
					canplaythrough:function(){
						if(autoplay){
							this.play();
						}
					}

				};
			}
		}
		else{
			// IF IT IS MERELY SOME TEXT (GENERAL CASE):
			var text = el.split(/(\;|\/|\+)/gi).map((e => e.trim())).map(e => {
				if(e == ';' || e == '/'){
					 return {tag:'span', class:'semicolon', kids:' ' + e + ' '};
				}
				else if(e == '+'){
					 return {tag:'span', class:'plussign', kids:' ' + e + ' '};
				}
				else{
					return e;
				}
			});
			return {
				tag:'span',
				class:'cardtext',
				kids:text
			};
		}
	});
	return media;
}
function XGuessWithKeyboard(){
	this.tag   = 'section';
	this.class = 'xApp';
	this.style = 'display:none;'
	this.kids  = [{
		tag:'header',
		kids:"Type in the answer",
		click:function(){
			xAppOpenClose(this.parentNode);
		}
	}, {
		tag:'article',
		class:'show',
		kids:[
			{
				tag:'input',
				type:'text',
				class:['textfield', 'fullwidth'],
				placeholder:'Type in the answer',
				autocapitalize:'off',
				autocorrect:'off',
				autocomplete:'off',
				spellcheck:'false',
				keyup:function(){
					// not yet implemented
				}

			}
		]
	}];
}
function XCardMain(entry_id){ // if entry_id is left undefined, the algorithm would choose an entry
	var card;
	if(entry_id !== undefined){
		vt.deck().workingEntry = entry_id;
		card = vt.deck().entry(entry_id);
	}
	else{
		vt.deck().nextEntry();
		card = vt.deck().entry();
	}

	this.tag    = 'div';
	this.append = function(){
		if(!! card){
			if(!card.a && card.b){
				document.getElementById('cardmain').classList.remove('showA');
				document.getElementById('cardmain').classList.add('showB');
			}
			else{
				document.getElementById('cardmain').classList.remove('showB');
				document.getElementById('cardmain').classList.add('showA');
			}

			if(card.isStarred == true){
				document.getElementById('cardmain').classList.add('starred');
			}
			else{
				document.getElementById('cardmain').classList.remove('starred');
			}
		}
	};

	if(!!document.getElementById('container_for_editions')){
		document.getElementById('container_for_editions').delKids();
	}
	if(!!document.getElementById('container_for_guesswithkeyboard')){
		document.getElementById('container_for_guesswithkeyboard').delKids();
		// this element is filled with appendX later
	}

	if(card === undefined){
		// check whether there are entries in this deck that would come back whithin the next 24 hours
		var comeback24h = vt.deck().entriesDueWithin24h();
		// check whether other decks still have available entries (for determine whether to display the "next deck"-button)
		var sum = 0;
		for(let d of Object.keys(vt.decks)){
			sum += vt.deck(d).entryListCounts().available;
		}

		this.kids = [
			"You are done!",
			"\n",
			{
				tag:'div',
				class:['xButton'],
				kids:sum ? "Next deck" : "Back home",
				click:sum ? function(){
					var thisDeck = vt.deck().deckID;
					var a = [];
					var b = [];
					var t = false;
					for(let did of vt.sortedList()){
						if(did == thisDeck)
							t = true;
						else{
							if(!t) a[a.length] = did;
							else   b[b.length] = did;
						}
					}
					var d = [...b, ...a];
					for(let i = 0; i < d.length; i++){
						if(vt.deck(d[i]).entryListCounts().available){
							fsm.goTo(d[i]);
							return;
						}
					}
					fsm.goHome();
				} : function(){
					fsm.goHome();
				}
			}, "\n",
			comeback24h.length ? {
				tag:'div',
				class:['xButton', 'small'],
				kids:"Call back " + comeback24h.length + " entr" + (comeback24h.length == 1 ? 'y' : 'ies') + " that " + (comeback24h.length == 1 ? 'is' : 'are') + " due within 24h",
				click:function(){
					var comeback24h = vt.deck().entriesDueWithin24h();
					for(let e = 0; e < comeback24h.length; e++){
						vt.deck().entry(comeback24h[e]).comeback = Date.now() - 1000;
					}
					vt.deck().lastmodif = Date.now();
					document.getElementById('cardmain').delKids().appendX(new XCardMain());
				}
			} : undefined
		];
	}
	else{
		var countA = typeof card.a == 'string' ? (card.a.countOccurrences(';')+card.a.countOccurrences('/')+1) : 0;
		var countB = typeof card.b == 'string' ? (card.b.countOccurrences(';')+card.b.countOccurrences('/')+1) : 0;
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
							document.getElementById('container_for_editions').delKids();
							document.getElementById('container_for_editions').appendX(XAppAddOrEdit('edit', vt.deck().workingEntry));
						}
					}, {
						tag:'div',
						class:['xButton', 'small'],
						kids:'Transfer',
						click:function(){
							console.log("Not yet implemented: " + this.innerText);
							alert("This feature has not yet been implemented...");
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
							alert("This feature has not yet been implemented...");
						}
					}, 'speechSynthesis' in window ? {
						tag:'div',
						class:['xButton', 'small'],
						kids:'Speak',
						id:'speechSynthesisSpeakButton',
						click:function(){
							if('speechSynthesisVoiceID' in vt.deck()){
								var GSMssg   = new SpeechSynthesisUtterance();
								var GSVoices = window.speechSynthesis.getVoices();

								GSMssg.text  = vt.deck().entry().b || "There's nothing to say!";
								GSMssg.voice = GSVoices[vt.deck().speechSynthesisVoiceID || 0];
								GSMssg.lang  = GSVoices[vt.deck().speechSynthesisVoiceID || 0].lang;

								speechSynthesis.speak(GSMssg);
							}
							else{
								alert("You haven't yet set a voice for this deck; please visit the 'deck'-tab above to pick one.");
							}
						},
						append:function(){
							// seems required?
							window.speechSynthesis.getVoices();
						}
					} : undefined, {
						tag:'div',
						class:['xButton', 'small'],
						kids:'Star',
						click:function(){
							vt.deck().entry().isStarred = vt.deck().entry().isStarred == true ? undefined : true;
							document.getElementById('cardmain').delKids().appendX(new XCardMain(vt.deck().workingEntry));
							vt.deck().lastmodif = Date.now(); // this triggers the automated storage of the deck.
							console.log("Implementation not yet finished: " + this.innerText + " (we furthermore want to implement a slightly different algorithm!)");
						}
					}
				]
			}, {
				tag:'nav',
				id:'cardbody',
				click:function(){
					document.getElementById('cardmain').classList.toggle('showA');
					document.getElementById('cardmain').classList.toggle('showB');
					if(document.getElementById('cardmain').classList.contains('showB') && 'speechSynthesisVoiceID' in vt.deck() && 'speechSynthesisAutoSpeak' in vt.deck() && vt.deck().speechSynthesisAutoSpeak){
						if(document.getElementById('speechSynthesisSpeakButton')){
							document.getElementById('speechSynthesisSpeakButton').triggerE('click');
						}
					}
				},
				kids:[
					{
						tag:'div',
						class:['cardside', 'faceA'],
						'count-n':countB > 1 ? countB : undefined,
						kids:processCardFace(card.a || '', true)
					}, {
						tag:'div',
						class:['cardside', 'faceB'],
						'count-n':countA > 1 ? countA : undefined,
						kids:processCardFace(card.b || '', true)
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
								kids:'Almost'
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
		if(!!document.getElementById('container_for_guesswithkeyboard')){
			// this element is already emptied earlier
			document.getElementById('container_for_guesswithkeyboard').appendX(new XGuessWithKeyboard());
		}
	}

	if(!!document.getElementById('article_listofentries') && document.getElementById('article_listofentries').classList.contains('show')){
		var showHints       = document.getElementById('listOptionShowHint').checked;
		var showOtherFields = document.getElementById('listOptionShowOtherFields').checked;
		var querystr        = document.getElementById('listSearchbar').value;
		document.getElementById('listbox').delKids().appendX(new XEntryList(showHints, showOtherFields, querystr));
	}

}
