<!DOCTYPE html>
<html>
	<head>
		<title>VocabPocket</title>
		<meta charset="utf-8">
		<meta name="author" content="Johannes LEMONDE">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>

		<!--

		<link rel="manifest" href="manifest.json" />

		-->

		<link rel="icon" href="img/favicon.ico" />

		<link rel="apple-touch-icon" href="img/Icon-60@2x.png" />
		<link rel="apple-touch-icon" sizes="180x180" href="img/Icon-60@3x.png" />
		<link rel="apple-touch-icon" sizes="76x76" href="img/Icon-76.png" />
		<link rel="apple-touch-icon" sizes="152x152" href="img/Icon-76@2x.png" />
		<link rel="apple-touch-icon" sizes="58x58" href="img/Icon-Small@2x.png" />


		<meta name="theme-color" content="#535661">

		<!-- Feuilles de style -->
		<link rel="stylesheet" type="text/css" href="library.css?t=<?php echo time(); ?>" />
		<link rel="stylesheet" type="text/css" href="ui.css?t=<?php echo time(); ?>" />
	</head>
	<body>
		<header id="banner"><span class="short">VocabPocket</span><span class="long">Your vocab's in your pocket</span></header>
		<nav id="bannerbuttonbox">
			<div class="left" id="bannerbuttonboxleft"></div>
			<div class="right" id="bannerbuttonboxright"></div>
		</nav>

		<div id="main"></div>

		<footer id="footer">This is the footer</footer>

		<!-- Scripts -->
		<script type="text/javascript" src="library.js?t=<?php echo time(); ?>"></script>
		<script type="text/javascript" src="flashcards.js?t=<?php echo time(); ?>"></script>
		<script type="text/javascript" src="ui.js?t=<?php echo time(); ?>"></script>
	</body>
</html>
