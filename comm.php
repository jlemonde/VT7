<?php
include_once("credentials.php"); // This file only contains $connectionString for PostgreSQL

// INITIALISATION SESSION
$lifetime = 259200; /*3 jours*/                             // session duration in seconds
session_set_cookie_params($lifetime);                       // default cookie lifetime (including session cookies)
ini_set('session.gc_maxlifetime', $lifetime);               // inactive session time-in (server side verification)
session_start();
setcookie(
	session_name(),
	session_id(),
	array(
		'expires'  => time()+$lifetime,
		'samesite' => 'Strict'
	)
);  // rewrite session cookie so that session remains active.

function logout(){
	if(isset($_SESSION['username'])){
		unset($_SESSION['username']);
	}
	$_SESSION['logged'] = 'out';
}

if(isset($_GET['action']) && $_GET['action'] == 'login'){
	if(isset($_POST['username']) && isset($_POST['password'])){
		$db = pg_connect($connectionString);
		$rq = pg_query_params($db, "SELECT username,passhash FROM users WHERE username = $1", array($_POST['username']));
		$ar = pg_fetch_all($rq);
		if(isset($ar[0]) && password_verify($_POST['password'], $ar[0]['passhash'])){
			echo 'ok: ' . $_POST['username'];
			// open session here, and set up all the required variables
			$_SESSION['username'] = $_POST['username'];
			$_SESSION['logged']   = 'in';

		}
		elseif(isset($ar[0])){
			echo 'wrong password';
		}
		else{
			echo 'wrong username';
		}
		exit;
	}
}

if(isset($_GET['action']) && $_GET['action'] == 'logout'){
	logout();
	exit;
}

if(isset($_GET['action']) && $_GET['action'] == 'isloggedinas' && isset($_POST['username'])){
	if(isset($_SESSION['logged']) && $_SESSION['logged'] == 'in' && isset($_SESSION['username']) && $_SESSION['username'] == $_POST['username']){
		echo 'true';
	}
	else{
		echo 'false';
	}
	exit;
}


if(isset($_GET['action']) && $_GET['action'] == 'accountcreation'){
	echo 'not implemented yet';
	exit;
}

if(isset($_GET['action']) && $_GET['action'] == 'passwordforgotten'){
	echo 'not implemented yet';
	// use e-mail to send new randomly generated password
	exit;
}

if(isset($_SESSION['logged']) && $_SESSION['logged'] == 'in'){
	if(isset($_GET['action']) && $_GET['action'] == 'changepassword'){
		echo 'not implemented yet';
		exit;
	}

	if(isset($_GET['action']) && $_GET['action'] == 'changeemail'){
		echo 'not implemented yet';
		exit;
	}

	if(isset($_GET['action']) && $_GET['action'] == 'uploaddeck'){
		// here we make sure that the client and the server have the same clock; this is crucial in order to avoid data losses if the user uses two devices with different clocks. we allow two minutes missmatch.
		if(isset($_POST['clienttimestamp']) && abs(intval($_POST['clienttimestamp']) - time()) <= 120 /*two minutes*/){

			// we check whether the file exists...
			$db = pg_connect($connectionString);
			$rq = pg_query_params($db, "SELECT filename,permissions,lastmodif,decktitle FROM decks WHERE username = $1 AND filename = $2", array($_SESSION['username'], $_POST['filename']));
			$ar = pg_fetch_all($rq);
			if($ar){ // ... if it does:
				// we want to check the timestamps, and if the backed-up deck is strictly obsolete, we update it
				if(intval($ar[0]['lastmodif']) < intval($_POST['lastmodif'])){
					// UPDATE
					$db = pg_connect($connectionString);
					$rq = pg_query_params($db, "UPDATE decks SET lastmodif = $1, file = $2, decktitle = $3 WHERE username = $4 AND filename = $5", array($_POST['lastmodif'], $_POST['file'], $_POST['decktitle'], $_SESSION['username'], $_POST['filename']));
					$ar = pg_fetch_all($rq);// echo pg_last_error($db);
					echo 'true, updated';
				}
				//elseif( a param that allows to force-backup ){}
				else{
					echo 'false, the backup is newest';
				}
			}
			else{
				// INSERT
				$db = pg_connect($connectionString);
				$rq = pg_query_params($db, "INSERT INTO decks (filename, username, permissions, allowedusers, file, lastmodif, decktitle) VALUES($1, $2, $3, $4, $5, $6, $7)", array($_POST['filename'], $_SESSION['username'], 1, "{}", $_POST['file'], $_POST['lastmodif'], $_POST['decktitle']));
				$ar = pg_fetch_all($rq);// echo pg_last_error($db);
				echo 'true, inserted';
			}
		}
		else{
			echo 'false clock';
		}

		exit;
	}
	// download deck list

	// download a deck

	// upload a deck


	// |@# Je pense qu'il faudra faire un tableau SQL qui relie les ID de decks avec des ID de users; c'est ça qui est le plus intéressant; combiné avec l'idée de followers/following c'est cool.
	// check deck's access permissions
	// change deck's access permissions
}












// $db = pg_connect($connectionString);
// $r  = pg_query($db, "SELECT id,username,displayname,email FROM users");
// print_r(pg_fetch_all($r));

?>
