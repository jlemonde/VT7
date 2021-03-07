<?php
include_once("credentials.php"); // This file only contains $connectionString for PostgreSQL

// USER PRIVILEGES
$privilegeGeneral   = 1; // 1 << 0
$privilegeCanUpload = 2; // 1 << 1
$privilegeCanManage = 4; // 1 << 2

// INITIALISATION SESSION
$lifetime = 259200; /*3 jours*/                             // session duration in seconds
ini_set('session.gc_maxlifetime', $lifetime);               // inactive session time-in (server side verification)
ini_set('session.gc_probability', 0);               // inactive session time-in (server side verification)
session_set_cookie_params($lifetime);                       // default cookie lifetime (including session cookies)
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
	// we have to check that the username is not yet in use
	// then we store all the info and send an ok signal back.
	if(isset($_POST['username']) && isset($_POST['displayname']) && isset($_POST['password']) && isset($_POST['email'])){

		// we check whether the user already exists...
		$db = pg_connect($connectionString);
		$rq = pg_query_params($db, "SELECT username,displayname FROM users WHERE username = $1", array($_POST['username']));
		$ar = pg_fetch_all($rq);
		if($ar){ // ... if it does there is a problem...
			echo "false: user already exists..";
		}
		else{
			// here we can insert the parameters for the new user!
			$passhash = password_hash($_POST['password'], PASSWORD_BCRYPT);
			$db = pg_connect($connectionString);
			$rq = pg_query_params($db, "INSERT INTO users(id,username, displayname, email, passhash, privileges) VALUES(DEFAULT, $1, $2, $3, $4, $5)", array($_POST['username'], $_POST['displayname'], $_POST['email'], $passhash, 1));
			$ar = pg_fetch_all($rq);//echo pg_last_error($db);
			echo 'true';
		}
	}
	else{
		echo 'false: wrong post parameters';
	}
	exit;
}

if(isset($_GET['action']) && $_GET['action'] == 'passwordforgotten'){
	echo 'not implemented yet';
	// use e-mail to send new randomly generated password
	exit;
}

if(isset($_SESSION['logged']) && $_SESSION['logged'] == 'in'){
	if(isset($_GET['action']) && $_GET['action'] == 'changepassword'){
		if(isset($_POST['oldpass0']) && isset($_POST['newpass1']) && isset($_POST['newpass2'])){
			if($_POST['newpass1'] == $_POST['newpass2']){
				$db = pg_connect($connectionString);
				$rq = pg_query_params($db, "SELECT username,passhash FROM users WHERE username = $1", array($_SESSION['username']));
				$ar = pg_fetch_all($rq);
				if(isset($ar[0]) && password_verify($_POST['oldpass0'], $ar[0]['passhash'])){
					$passhash = password_hash($_POST['newpass1'], PASSWORD_BCRYPT);
					$db = pg_connect($connectionString);
					$rq = pg_query_params($db, "UPDATE users SET passhash = $1 WHERE username = $2", array($passhash, $_SESSION['username']));
					echo 'true';
				}
				elseif(isset($ar[0])){
					echo 'wrong password';
				}
				else{
					echo 'wrong username';//should never occurr.
				}
			}
			else{
				echo 'false, new passwords do not coincide';
			}
		}
		exit;
	}

	if(isset($_GET['action']) && $_GET['action'] == 'changeemail'){
		if(isset($_POST['passwd']) && isset($_POST['email'])){
			$db = pg_connect($connectionString);
			$rq = pg_query_params($db, "SELECT username,passhash FROM users WHERE username = $1", array($_SESSION['username']));
			$ar = pg_fetch_all($rq);
			if(isset($ar[0]) && password_verify($_POST['passwd'], $ar[0]['passhash'])){
				$db = pg_connect($connectionString);
				$rq = pg_query_params($db, "UPDATE users SET email = $1 WHERE username = $2", array($_POST['email'], $_SESSION['username']));
				echo 'true, ' . $_POST['email'];
			}
			elseif(isset($ar[0])){
				echo 'wrong password';
			}
			else{
				echo 'wrong username';//should never occurr.
			}
		}
		exit;
	}

	if(isset($_GET['action']) && $_GET['action'] == 'reademailaddress'){
		$db = pg_connect($connectionString);
		$rq = pg_query_params($db, "SELECT username,email FROM users WHERE username = $1", array($_SESSION['username']));
		$ar = pg_fetch_all($rq);
		if($ar && $ar[0] && $ar[0]['email']){
			echo "true, " . $ar[0]['email'];
		}
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
					echo 'true, updated: ' . $_POST['filename'] . ' and lastmodif is ' . $_POST['lastmodif'];
				}
				//elseif( a param that allows to force-backup ){}
				else{
					echo 'false, the backup is newest';
				}
			}
			else{
				// INSERT
				$db = pg_connect($connectionString);
				$rq = pg_query_params($db, "INSERT INTO decks(filename, username, permissions, allowedusers, file, lastmodif, decktitle) VALUES($1, $2, $3, $4, $5, $6, $7)", array($_POST['filename'], $_SESSION['username'], 1, "{}", $_POST['file'], $_POST['lastmodif'], $_POST['decktitle']));
				$ar = pg_fetch_all($rq);// echo pg_last_error($db);
				echo 'true, inserted: ' . $_POST['filename'] . ' and lastmodif is ' . $_POST['lastmodif'];
			}
		}
		else{
			echo 'false clock';
		}

		exit;
	}
	// download deck list
	if(isset($_GET['action']) && $_GET['action'] == 'decklist'){
		$db = pg_connect($connectionString);
		$rq = pg_query_params($db, "SELECT filename,permissions,lastmodif,decktitle FROM decks WHERE username = $1", array($_SESSION['username']));
		$ar = pg_fetch_all($rq);
		if($ar){
			echo "true, " . json_encode($ar);
		}
		elseif(!isset($_SESSION['logged']) || $_SESSION['logged'] != 'in'){
			echo "false, logged out";
		}
		else{
			echo "true, {}";
		}
		exit;
	}
	// download a deck
	if(isset($_GET['action']) && $_GET['action'] == 'downloaddeck'){
		if(isset($_POST['filename'])){
			$db = pg_connect($connectionString);
			$rq = pg_query_params($db, "SELECT filename,permissions,lastmodif,decktitle,file FROM decks WHERE username = $1 AND filename = $2", array($_SESSION['username'], $_POST['filename']));
			$ar = pg_fetch_all($rq);
			if($ar && $ar[0]){
				echo "true, " . ($ar[0]['file']);
			}
			else{
				echo "false, nothing found, cannot download...";
			}
		}
		else{
			echo "false, bad parameters, cannot download...";
		}

		exit;
	}
	// remove a deck
	if(isset($_GET['action']) && $_GET['action'] == 'removedeck'){
		if(isset($_POST['filename'])){
			// INSERT
			$db = pg_connect($connectionString);
			$rq = pg_query_params($db, "DELETE FROM decks WHERE username = $1 AND filename = $2", array($_SESSION['username'], $_POST['filename']));
			$ar = pg_fetch_all($rq);// echo pg_last_error($db);
			echo "true, deleted!";
		}
		else{
			echo "false, bad parameters, cannot delete...";
		}

		exit;
	}

	if(isset($_GET['action']) && $_GET['action'] == 'uploadmedium'){

		// (1) check that the user has got the right privileges to upload files,
		$db = pg_connect($connectionString);
		$rq = pg_query_params($db, "SELECT username, privileges FROM users WHERE username = $1", array($_SESSION['username']));
		$ar = pg_fetch_all($rq);
		if($ar && $ar[0] && $ar[0]['privileges'] & $privilegeCanUpload){
			// successful, thus we check for errors.
			for($f = 0; $f < count($_FILES['file']['name']); $f++){
				if($_FILES['file']['size'][$f] > 2*1024*1024){
					echo "false, The file to be uploaded cannot exceed 2MB.\n";
					continue;
				}
				if(! preg_match("/^(image|video|audio)/", $_FILES['file']['type'][$f])){
					echo "false, The file to be uploaded must be an image, audio or video file.\n";
					continue;
				}
				if($_FILES['file']['error'][$f] === UPLOAD_ERR_OK){
					// successful, thus we can proceed to store the file
					$file_unique_name = sha1_file($_FILES['file']['tmp_name'][$f]);
					$file_extension	= strtolower(pathinfo($_FILES['file']['name'][$f], PATHINFO_EXTENSION));
					$file_name			= $file_unique_name . '.' . $file_extension;

					$uploadfolder		= 'uploads/';
					if(!file_exists($uploadfolder) && !is_dir($uploadfolder)){
						mkdir($uploadfolder);
					}
					// It might be nice to create subfolders for each user, but for now I pass (I'm the only one expected to use this feature for now)
					$destination		= $uploadfolder . $file_name;

					if(!file_exists($destination)){
						$type          = $_FILES['file']['type'][$f][0] == 'i' ? 'image' : ($_FILES['file']['type'][$f][0] == 'a' ? 'audio' : 'video');
						if(move_uploaded_file($_FILES['file']['tmp_name'][$f], $destination)){
							echo "true, {{" . $type . ':' . $file_name . "}}\n";
						}
						else{
							echo "false, Uploaded file failed to be saved\n";
						}
					}
					else{
						echo "false, Uploaded filename did already exist\n";
						// this is very unlikely to happen, unless it is the exact same file!
					}
				}
				else{
					echo "false, There was an error during the upload...\n";
				}
			}

			//print_r($_FILES['file']);
		}
		else{
			echo "false, The user does not have the privileges required to upload files.";
		}
		// (2) if so, procede to save the file(s) to some location, and echo back the relative paths to the files. make sure the files get a unique name!
	}
	if(isset($_GET['action']) && $_GET['action'] == 'phpinfo'){
		phpinfo();
	}



	// |@# Je pense qu'il faudra faire un tableau SQL qui relie les ID de decks avec des ID de users; c'est ça qui est le plus intéressant; combiné avec l'idée de followers/following c'est cool.
	// check deck's access permissions
	// change deck's access permissions
}




?>
