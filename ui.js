// EVERYTHING THAT IS ABOUT THE INTERFACE COMES HERE, INCLUDING THE PAGES' FINITE STATE MACHINE

// FINITE STATE MACHINE
function FiniteStateMachine(){
   const FSM_INIT    = 'init';
   const FSM_LOGIN   = 'login';
   const FSM_NEWUSER = 'newuser';
   const FSM_HOME    = 'home';
   const FSM_DECK    = 'deck';

   var state = FSM_INIT;

   this.init = function(){
      state = FSM_INIT;
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
   };
   this.logIn = function(){
      state = FSM_LOGIN;
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
      state = FSM_NEWUSER;
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
      state = FSM_HOME;
      document.getElementById('bannerbuttonboxleft').delKids();
      document.getElementById('bannerbuttonboxright').delKids();
      document.getElementById('main').delKids();
      document.getElementById('main').appendX(new xDeckListButtons());
   };
   this.goTo = function(deck_id){
      state = FSM_DECK;
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
      vt.selectWorkingDeck(deck_id);
      document.getElementById('main').delKids();
   };
}
var fsm = new FiniteStateMachine();
fsm.init();


// UI:
function xAppOpenClose(section){
   section.getElementsByTagName('article')[0].classList.toggle('show');
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
               document.getElementById('login_input_text').focus();
            }
         }, {
            tag:'article',
            class:'show',
            kids:[
               {
                  tag:'input',
                  type:'text',
                  id:'login_input_text'
               }, {
                  tag:'input',
                  type:'password',
                  id:'login_input_password'
               }, {
                  tag:'div',
                  class:['xButton', 'fullwidth'],
                  kids:'Log in'
               }
            ]
         }
      ]
   });
   document.getElementById('login_input_text').focus();
}



function xDeckListButtons(){
   this.tag  = 'div';
   this.kids = [];
   for(var i = 0; i < vt.decks.length; i++){
      this.kids.push({
         tag:'div',
         class:['xButton', 'small'],
         i:i,
         kids:vt.deck(i).name,
         click:function(){
            fsm.goTo(parseInt(this.getAttribute('i')));
         }
      });
   }
}

// debug:
