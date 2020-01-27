<!DOCTYPE html>
<html lang="fr" class="full-height">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
	
	<meta property="og:url" content="{{ url()->current() }}">
	<meta property="og:title" content="Pupil Meter, mesures de précision pour le centrage des lunettes">
	<meta property="og:description" content="Outil de prise de mesures pour la réalisation du centrage des lunettes : 1/2 écart pupillaire et hauteur pleine pupille">
	<meta property="og:image" content="">
	<meta property="fb:app_id" content="">
	
	<!-- csrf token for ajax requests -->
	<meta name="_token" content="{{ csrf_token() }}">
	
    <meta name="description" content="Outil de prise de mesures pour la réalisation du centrage des lunettes : 1/2 écart pupillaire et hauteur pleine pupille">
    <meta name="author" content="Sacha-Maximilien Zacaropoulos">

    <title>Pupil Meter, mesures de précision pour le centrage des lunettes</title>
	
	<!-- Icons -->
	<link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png">
	<link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png">
	<link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png">
	<link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png">
	<link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png">
	<link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png">
	<link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png">
	<link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png">
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png">
	<link rel="icon" type="image/png" sizes="192x192"  href="/android-icon-192x192.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
	<link rel="manifest" href="/manifest.json">
	<meta name="msapplication-TileColor" content="#ffffff">
	<meta name="msapplication-TileImage" content="/ms-icon-144x144.png">
	<meta name="theme-color" content="#ffffff">
	
    <!-- Fonts -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel='stylesheet' type='text/css'>
	<link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet">

    <!-- Styles -->
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="style.css">
	
</head>

<body class="full-height">

	<div id="main-container" class="container-fluid full-height">
	
		<div id="main-panel" class="col-xs-12 col-md-offset-1 col-md-10 text-center full-height no-padding">
		
			<canvas id="user-img" width="640" height="480" draggable="true"></canvas>
			<canvas id="final-img" width="640" height="480"></canvas>
			<canvas id="grid"  class="img-rot" width="640" height="480"></canvas>
		
			<div id="user-img-alert" class="alert alert-success col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3 text-center off">
				<span id="img-rot" class="img-rot off">Réglez l'orientation, la taille et la position de l'image</span>
				<span id="right-pupil" class="set-pupils off">Cliquez sur la pupille droite</span>
				<span id="left-pupil" class="set-pupils off">Cliquez sur la pupille gauche</span>
				<span id="adjust-pupils" class="set-pupils off">Ajuster la position des pupilles</span>
				<span id="set-frame" class="set-pupils off">Ajuster la position des bords des verres</span>
				<span id="set-card" class="set-pupils off">Ajuster la position des bords de la carte</span>
				<span id="set-mode" class="set-pupils off">Sélectionner le mode de vérification des mesures</span>
				<span id="set-ref" class="set-pupils off">Saisissez la référence du modèle ou les cotes Boxing</span>
			</div>
			
			<div id="cotes-alert" class="alert alert-success col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3 text-center off">
				<div class="col-xs-6 no-padding text-center"><strong>1/2 Ep OD :&nbsp;<span id="epR"></span>&nbsp;mm</strong></div>
				<div class="col-xs-6 no-padding text-center"><strong>1/2 Ep OG :&nbsp;<span id="epL"></span>&nbsp;mm</strong></div>
				<div class="col-xs-6 no-padding text-center"><strong>Hauteur OD :&nbsp;<span id="hR"></span>&nbsp;mm</strong></div>
				<div class="col-xs-6 no-padding text-center"><strong>Hauteur OG :&nbsp;<span id="hL"></span>&nbsp;mm</strong></div>
			</div>
			
			<div id="img-upload" class="col-xs-12">
				<button class="btn btn-primary" type="button"><i class="fa fa-file-image-o" aria-hidden="true"></i><span class="hidden-xs">&nbsp;&nbsp;Nouvelle image</span></buton>
			</div>
			
			<div id="zoom-rot" class="col-xs-12 col-sm-11 text-right">
				<button id="img-zoom" type="button" class="btn btn-default off">
					<i class="fa fa-search-plus fa-2x" aria-hidden="true"></i>
					<i class="fa fa-search-minus fa-2x off" aria-hidden="true"></i>
				</button>
				<button id="rotate-left" class="img-rot btn btn-default off"><i class="fa fa-undo fa-2x" aria-hidden="true"></i></button>
				<button  id="rotate-right" class="img-rot btn btn-default off"><i class="fa fa-repeat fa-2x" aria-hidden="true"></i></button>
			</div>
			
			<div id="img-settings" class="col-xs-12 col-sm-10 col-sm-offset-1 text-center no-padding">
				<div id="rotate-one" class="img-rot col-xs-8 col-xs-offset-2 col-md-6 col-md-offset-3 off">
					<input type="range" min="-45" max="45" value="0" step="0.5" autocomplete="off">
				</div>
				
				<div id="select-mode" class="col-xs-10 col-xs-offset-1 col-sm-6 col-sm-offset-3 off">
					<div id="frame-mode" class="col-xs-6">
						<button class="btn btn-info btn-block" type="button">Monture</buton>
					</div>
					
					<div id="card-mode" class="col-xs-6">
						<button class="btn btn-info btn-block" type="button">Carte</buton>
					</div>
				</div>
				
				<div class="col-xs-8 col-xs-offset-2 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 off">
					<div class="col-xs-12 col-sm-4"><input type="number" min="10" max="90" step="0.5" class="form-control text-center" id="coteA" placeholder="A" autocomplete="off"></div>
					<div class="col-xs-12 col-sm-4"><input type="number" min="2" max="30" step="0.5" class="form-control text-center" id="coteD" placeholder="D" autocomplete="off"></div>
					<div class="col-xs-12 col-sm-4"><input type="number" min="10" max="90" step="0.5" class="form-control text-center" id="coteB" placeholder="B" autocomplete="off"></div>
					<div class="col-xs-12 top10"><input id="frame-input" type="text" class="form-control" autocomplete="off" autocomplete="off"></div>
					<div id="frame-list" class="col-xs-8 col-xs-offset-2 col-md-6 col-md-offset-3 no-padding off">
						@foreach($frames as $frame)
						<div class="ref">{{ $frame->ref }}</div>
						@endforeach
					</div>
				</div>
			</div>
			
			<div id="nav-btns" class="col-xs-10 col-xs-offset-1 col-sm-8 col-sm-offset-2 col-lg-6 col-lg-offset-3 no-padding off">
				<div id="previous" class="col-xs-4">
					<button class="btn btn-success btn-block" disabled><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span><span class="hidden-xs">&nbsp;Précédent</span></button>
				</div>
				
				<div id="reset" class="col-xs-4">
					<button class="btn btn-primary btn-block" disabled>Reset</button>
				</div>
				
				<div id="next" class="col-xs-4">
					<button class="btn btn-success btn-block"><span class="hidden-xs">Suivant&nbsp;</span><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></button>
				</div>
				<div class="col-xs-4">
					<a id="save-link" href="#"  target="_blank" class="btn btn-success btn-block off" download="virtualtryon_mesures.png"><span class="hidden-xs">Enregistrer&nbsp;&nbsp;</span><i class="fa fa-floppy-o" aria-hidden="true"></i></a>
				</div>
			</div>
		
			<div id="user-right-eye" class="set-pupils no-padding off"></div>
			<div id="user-left-eye" class="set-pupils no-padding off"></div>
			<img id="drag-user-right-eye" src="{{ url('/assets/icons/drag-right.png') }}" class="user-drags set-pupils off" draggable="true">
			<img id="drag-user-left-eye" src="{{ url('/assets/icons/drag-left.png') }}" class="user-drags set-pupils off" draggable="true">
			<img id="drag-frame-top-left" src="{{ url('/assets/icons/drag-frame-tl.png') }}" class="set-frame frame-drags off" draggable="true">
			<img id="drag-frame-bottom-right" src="{{ url('/assets/icons/drag-frame-br.png') }}" class="set-frame frame-drags off" draggable="true">
			<img id="drag-nose-center" src="{{ url('/assets/icons/drag-nose-center.png') }}" class="set-frame frame-drags off" draggable="true">
			
			<div id="frame-top-left" class="set-frame no-padding off"></div>
			<div id="frame-bottom-right" class="set-frame no-padding off"></div>
			<div id="nose-center" class="set-frame no-padding off"></div>
			
		</div>
			
		<input id="img-input" type="file" accept="image/*">
	
	</div>
	
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <script src="/js/csrf.global.js"></script>
    <script src="/js/victor.min.js"></script>
    <script src="/js/pupil-meter.js"></script>
	
</body>
</html>
