$(document).ready(function(){
	
	let lastUploadedImg;
	const userImg = document.createElement("img");
	const imgCanvas = document.getElementById("user-img");
	const imgCtx = imgCanvas.getContext("2d");
	
	const gridCanvas = document.getElementById("grid");
	const gridCtx = gridCanvas.getContext("2d");
	gridCtx.strokeStyle = "blue";
	
	const finalImgCanvas = document.getElementById("final-img");
	const finalImgCtx = finalImgCanvas.getContext("2d");
	
	const outputWidth = 960;
	const outputRatio = 1/1;
	
	let mode;
	
	let gridStep = 60;
	
	const ratio = 1/1;
	const zoomVal = 2.5;
	let customScale = 1;
	
	const epReel = 62;
	let epPx = 62;
	let epRMm = epLMm = 31;
	let hPupRMm = hPupLMm = 22;
	let mmToPxH = mmToPxV = 1;
	
	const defaultFrame = { aInt: 53, d: 18, bInt: 33, drageoir: 1 };
	let coteAInt = defaultFrame.aInt;
	let coteD = defaultFrame.d;
	let coteBInt = defaultFrame.bInt;
	let drageoir = defaultFrame.drageoir;
	
	const cardWidthMm = 85.60;
	const cardHeightMm = 53.98;
	
	let imgRotation = 0;
	
	let currentStep = 0;
	const finalStep = 6;
	
	let isSettingPositions = false;
	let imgZoomed = false;
	let gridShown = false;
	let firstImgLoad = true;
	let imgDrawn = false;
	
	const userPoints = [];
	const framePoints = [];
	let noseCenter = [];

	const transparentImg = new Image();
    transparentImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
	
	updateDomElements();
	
	// EVENTS
	
	$('#img-upload button').on("click", () => {
		$('#img-input').trigger("click");
	});
	
	$('#img-input').on("change", () => {
		const uploadedImg = document.getElementById("img-input").files[0];
		const imgReader = new FileReader();
		imgReader.addEventListener("load", () => {
			lastUploadedImg = imgReader.result;
			firstImgLoad = true;
			resetUserImg();
		});
		if(uploadedImg){
			imgReader.readAsDataURL(uploadedImg);
		}
	});
	
	userImg.addEventListener("load", () => {
		if(userImg.src === ""){ return; }

		const imgRatio = userImg.naturalWidth / userImg.naturalHeight;
		
		const imgCanvasWidth = imgCanvas.width;
		const imgCanvasHeight = imgCanvas.height;
		const canvasRatio = imgCanvasWidth / imgCanvasHeight;
		
		imgCtx.save();
		
		imgCtx.clearRect(0, 0, imgCanvasWidth, imgCanvasHeight);
		
		imgCtx.translate(imgCanvasWidth / 2, imgCanvasHeight / 2);

		if(imgRotation !== 0){
			imgCtx.rotate( degsToRads(imgRotation) );
		}
		
		const imgScale = imgZoomed ? zoomVal * customScale : customScale;
		imgCtx.scale(imgScale, imgScale);

		imgCtx.translate(-imgCanvasWidth / 2, -imgCanvasHeight / 2);
		
		if(imgRatio > canvasRatio){
			imgCtx.drawImage(userImg, 0, (imgCanvasHeight - imgCanvasWidth / imgRatio) / 2, imgCanvasWidth, imgCanvasWidth / imgRatio);
		}
		else{
			imgCtx.drawImage(userImg, (imgCanvasWidth - imgCanvasHeight * imgRatio) / 2, 0, imgCanvasHeight * imgRatio, imgCanvasHeight);
		}
		
		imgCtx.restore();
		
		if(firstImgLoad){
			currentStep = 0;
			$('#next button').trigger("click");
			firstImgLoad = false;
		}
		
		$('#user-img').removeClass("off");
		imgDrawn = true;
	});
	
	// taille de l'image
	$('#main-panel').on("wheel", (e) => {
		e.preventDefault();
		if(currentStep !== 1){ return; }
		customScale -= e.originalEvent.deltaY / 2000;
		drawUserImg();
	});
	
	let lastPosition = [0, 0];
	let lastImgPosition = [0, 0];
	let initialFingersDistance;
	let initialImgScale = 1;
	let startId;
	let touchStarted = false;
	// position de l'image et pointage des pupilles
	$('#user-img').on("dragstart touchstart click", (e) => {
		e.stopPropagation();
		
		if(e.originalEvent.type === "dragstart"){
			if(currentStep === 1){
				e.originalEvent.dataTransfer.setData('text/plain', "");
				lastImgPosition = [e.originalEvent.clientX, e.originalEvent.clientY];
			}
		}
		else if(e.originalEvent.type === "touchstart"){
			if(currentStep === 1){
				if(e.originalEvent.touches.length === 2){
					const finger1 = new Victor(e.originalEvent.touches[0].clientX, e.originalEvent.touches[0].clientY);
					const finger2 = new Victor(e.originalEvent.touches[1].clientX, e.originalEvent.touches[1].clientY);
					initialFingersDistance = finger1.distance(finger2);
					initialImgScale = customScale;
				}
				else if(e.originalEvent.touches.length === 1){
					lastImgPosition = [e.originalEvent.touches[0].clientX, e.originalEvent.touches[0].clientY];
					touchStarted = true;
				}
			}
		}
		// pointage des pupilles
		else if(e.originalEvent.type === "click"){
			if(currentStep === 2){
				if(!isSettingPositions || userPoints.length > 1){ return; }
				
				const centerPanelOffset = $('#main-panel').offset();
				userPoints[userPoints.length] = [e.clientX - centerPanelOffset.left, e.clientY - centerPanelOffset.top];
				
				if(userPoints.length === 1){
					$('#user-right-eye').css( "left", userPoints[0][0] - ($('#user-right-eye').width() / 2) );
					$('#user-right-eye').css( "top", userPoints[0][1] - ($('#user-right-eye').height() / 2) );
					$('#user-right-eye').removeClass("off");
					
					$('#drag-user-right-eye').css( "left", userPoints[0][0] - $('#drag-user-right-eye').width() );
					$('#drag-user-right-eye').css( "top", userPoints[0][1] );
					
					$('#user-img-alert span').addClass("off");
					$('#user-img-alert span[id^="left"]').removeClass("off");
				}
				if(userPoints.length === 2){
					$('#user-left-eye').css( "left", userPoints[1][0] - ($('#user-left-eye').width() / 2) );
					$('#user-left-eye').css( "top", userPoints[1][1] - ($('#user-left-eye').height() / 2) );
					$('#user-left-eye').removeClass("off");
					
					$('#drag-user-left-eye').css( "left", userPoints[1][0] );
					$('#drag-user-left-eye').css( "top", userPoints[1][1] );
					
					$('#user-img-alert span').addClass("off");
					$('#adjust-pupils').removeClass("off");
					
					$('.user-drags').removeClass("off");
					
					$('#main-panel').css("cursor", "default");
					$('#next button').prop("disabled", false);
				}
			}
		}
	});

	$('.user-drags, .frame-drags').on("dragstart touchstart", function(e){
		e.stopPropagation();
		
		if(currentStep !== 2 && currentStep !== 5){ return; }
		startId = $(this).attr("id");
		if(e.originalEvent.type === "dragstart"){
			e.originalEvent.dataTransfer.setData('text/plain', "");
			event.dataTransfer.setDragImage(transparentImg, 0, 0);
			lastPosition = [e.originalEvent.clientX, e.originalEvent.clientY];
		}
		else if(e.originalEvent.type === "touchstart"){
			lastPosition = [e.originalEvent.touches[0].clientX, e.originalEvent.touches[0].clientY];
			touchStarted = true;
		}
	});

	$('#main-panel').on("dragover touchmove", (e) => {
		if(currentStep !== 1 && currentStep !== 2 && currentStep !== 5){ return; }
		
		e.originalEvent.preventDefault();
		
		// pinch zoom
		if(e.originalEvent.type === "touchmove" && e.originalEvent.touches.length === 2){
			if(initialFingersDistance){
				const finger1 = new Victor(e.originalEvent.touches[0].clientX, e.originalEvent.touches[0].clientY);
				const finger2 = new Victor(e.originalEvent.touches[1].clientX, e.originalEvent.touches[1].clientY);
				customScale = initialImgScale + finger1.distance(finger2) / initialFingersDistance - 1;
				drawUserImg();
			}
		}
		else{
			let eventClientX, eventClientY;
			if(e.originalEvent.type === "dragover"){
				eventClientX = e.originalEvent.clientX;
				eventClientY = e.originalEvent.clientY;
			}
			else if(e.originalEvent.type === "touchmove"){
				eventClientX = e.originalEvent.touches[0].clientX;
				eventClientY = e.originalEvent.touches[0].clientY;
			}
			
			if(currentStep === 1){
				if(e.originalEvent.type === "touchmove" && !touchStarted){ return; }
				
				$('#user-img, #final-img').css( "left", "+=" + ( eventClientX - lastImgPosition[0] ) );
				$('#user-img, #final-img').css( "top", "+=" + ( eventClientY - lastImgPosition[1] ) );
				
				lastImgPosition = [eventClientX, eventClientY];
			}
			else if(currentStep === 2 || currentStep === 5){
				if(e.originalEvent.type === "touchmove" && !touchStarted){ return; }
				
				const deltaX = eventClientX - lastPosition[0];
				const deltaY = eventClientY - lastPosition[1];
				
				$( '#' + startId.replace("drag-", "") ).css("left", "+=" + deltaX);
				$('#' + startId).css("left", "+=" + deltaX);
				
				if(startId.indexOf("nose-center") === -1){
					$( '#' + startId.replace("drag-", "") ).css("top", "+=" + deltaY);
					$('#' + startId).css("top", "+=" + deltaY);
				}
				
				switch( startId.replace("drag-", "") ){
					case "user-right-eye":
						userPoints[0][0] += deltaX;
						userPoints[0][1] += deltaY;
						break;
					case "user-left-eye":
						userPoints[1][0] += deltaX;
						userPoints[1][1] += deltaY;
						break;
					case "frame-top-left":
						framePoints[0][0] += deltaX;
						framePoints[0][1] += deltaY;
						if(mode === "frame"){
							updateMmToPx();
							updateNosePosition();
						}
						break;
					case "frame-bottom-right":
						framePoints[1][0] += deltaX;
						framePoints[1][1] += deltaY;
						if(mode === "frame"){
							updateMmToPx();
							updateNosePosition();
						}
						break;
					case "nose-center":
						noseCenter[0] += deltaX;
						break;
				}
				lastPosition = [eventClientX, eventClientY];
			}
		}
	});

	$(document).on("drop", (e) => {
		e.originalEvent.preventDefault();
		startId = "";
	});

	$(document).on("touchend", () => {
		touchStarted = false;
		startId = "";
		initialFingersDistance = 0;
	});
	
	$('#rotate-one').on("touchmove", (e) => {
		e.stopPropagation();
	});
	
	let isLongTouching = null;
	$("input[type='range']").on("touchstart", function(){
		const _this = $(this);
		if(!isLongTouching){
			isLongTouching = setTimeout(() => {
				_this.trigger("contextmenu");
			}, 500);
		}
	});

	$("input[type='range']").on("touchmove", () => {
		if(isLongTouching){
			clearTimeout(isLongTouching);
			isLongTouching = null;
		}
	});

	$("input[type='range']").on("touchend", () => {
		if(isLongTouching){
			clearTimeout(isLongTouching);
			isLongTouching = null;
		}
	});
	
	// passage à l'étape suivante
	$('#next button').on("click", () => {
		if(currentStep > finalStep - 1){ return;}
		currentStep++;
		handleCurrentStep();
	});

	$('#previous button').on("click", () => {
		if(currentStep < 2){ return; }
		currentStep--;
		handleCurrentStep();
	});

	$('#reset button').on("click", () => {
		if(currentStep < 2){ return; }
		currentStep = 1;
		handleCurrentStep();
	});
	
	// rotations de la photo
	$('#rotate-right').on("click", (e) => {
		e.stopPropagation();
		imgRotation = (imgRotation + 90) % 360;
		drawUserImg();
	});

	$('#rotate-left').on("click", (e) => {
		e.stopPropagation();
		imgRotation = (imgRotation - 90) % 360;
		drawUserImg();
	});

	let oldRotationVal = 0;
	$('#rotate-one input').on("input", function(){
		const newRotationVal = $(this).val();
		imgRotation += newRotationVal - oldRotationVal;
		oldRotationVal = newRotationVal;
		drawUserImg();
	});

	// remise à zéro
	$('#rotate-one input').on("contextmenu", function(e){
		e.preventDefault();
		oldRotationVal = 0;
		imgRotation = 0;
		$(this).val(0).trigger("input");
	});
	
	// zoom sur l'images
	$('#img-zoom').on("click", () => {
		if(currentStep > 5){ return; }
		toggleZoom();
	});
	
	$('#frame-input').on("input", function(){
		const ref = $(this).val();
		if( ref.length < 2 ){ return; }
		
		$('.ref').each(function(i){
			if($(this).text().toLowerCase().indexOf( ref.toLowerCase() ) === -1){
				$(this).addClass("off");
			}
			else{
				$(this).removeClass("off");
			}
		});
		
		$('#frame-list').removeClass("off");
	});
	
	$('.ref').on("click", function(){
		const ref = $(this).text();
		$('#frame-input').val(ref);
		
		$.ajax({
			url: '/cotes',
			method: "POST",
			data: {'ref': ref},
			success: (cotes) => {
				cotes = JSON.parse(cotes);
				coteAInt = cotes.a_int;
				coteBInt = cotes.b_int;
				coteD = cotes.d;
				drageoir = cotes.drageoir;
				
				$('#coteA').val(coteAInt + drageoir * 2).focus().blur();
				$('#coteD').val(coteD).focus().blur();
				$('#coteB').val(coteBInt + drageoir * 2).focus().blur();
				
				$('#frame-list').addClass("off");
				$('#next button').prop("disabled", false);
			}
		});
	});
	
	// saisie manuelle des cotes
	$('input[id^=cote]').on("input", function(){
		switch( $(this).attr("id").replace("cote", "") ){
			case "A":
				coteAInt = parseFloat( $(this).val() ) - 2 * drageoir;
				break;
			case "D":
				coteD = parseFloat( $(this).val() );
				break;
			case "B":
				coteBInt = parseFloat( $(this).val() ) - 2 * drageoir;
				break;
		}
		
		if( $('#coteA').val() && $('#coteD').val() && $('#coteB').val() ){
			$('#next button').prop("disabled", false);
		}
		else{
			$('#next button').prop("disabled", true);
		}
	});
	
	// sélection du mode
	$('#select-mode button').on("click", function(e){
		e.stopPropagation();
		mode = $(this).parent("div").attr("id").replace("-mode", "");
		currentStep++;
		handleCurrentStep();
	});
	
	$(window).on("resize orientationchange", () => {
		updateDomElements();
	});
	
	$('body').on("touchmove", (e) => {
		e.preventDefault();
	});
		
	// FUNCTIONS
	
	function handleCurrentStep(){
		$('#user-img-alert span').addClass("off");
		
		if(currentStep === 0 || currentStep > finalStep){ return; }
		
		if(currentStep > 1){
			$('#previous button, #reset button').prop("disabled", false);
		}
		else{
			$('#previous button, #reset button').prop("disabled", true);
		}
		
		if(currentStep < 3){
			userPoints.length = 0;
			
			coteAInt = defaultFrame.aInt;
			coteD = defaultFrame.d;
			coteBInt = defaultFrame.bInt;
			drageoir = defaultFrame.drageoir;
			$('#coteA, #coteD, #coteB, #frame-input').val("");
		}
		if(currentStep < 6){
			framePoints.length = 0;
			updateMeasures();
		}
		
		if(currentStep === 2 || currentStep === 3 || currentStep === 4 || currentStep >= finalStep){
			$('#next button').prop("disabled", true);
		}
		else{
			$('#next button').prop("disabled", false);
		}
		
		// rotation de l'image
		if(currentStep === 1){
			$('.img-rot, #user-img-alert, #nav-btns').removeClass("off");
			resetUserImg();
			drawGrid();
			gridShown = true;
		}
		else{
			$('.img-rot').addClass("off");
		}
		
		// pointage des pupilles
		if(currentStep === 2){
			isSettingPositions = true;
			$('#main-panel').css("cursor", "crosshair");
			
			$('#user-img-alert span[id^="right"]').removeClass("off");
		}
		else{
			$('#main-panel').css("cursor", "default");
			$('.set-pupils').addClass("off");
		}
		
		// choix de la monture
		if(currentStep === 3){
			updatePupilDistance();
			
			if( $('#coteA').val() && $('#coteD').val() && $('#coteB').val() ){
				$('#next button').prop("disabled", false);
			}
			
			$('#set-ref').removeClass("off");
			$('#frame-list').parent("div").removeClass("off");
		}
		else{
			$('#frame-list').parent("div").addClass("off");
		}
		
		// choix du mode PDM
		if(currentStep === 4){
			$('#set-mode, #select-mode').removeClass("off");
		}
		else{
			$('#select-mode').addClass("off");
		}
		
		// positionnement des repères
		if(currentStep === 5){
			const zoomCoef = (imgZoomed) ? zoomVal : 1;
			const hPup = ( userPoints[0][1] + userPoints[1][1] ) / 2;
			
			if(mode === "frame"){
				$('#set-frame').removeClass("off");
				
				framePoints[0] = [ userPoints[0][0] - ( (coteAInt + 4) * mmToPxH * zoomCoef ) / 2, userPoints[0][1] - (coteBInt * mmToPxV * zoomCoef * 0.38) ];
				framePoints[1] = [ userPoints[0][0] + ( (coteAInt - 4) * mmToPxH * zoomCoef ) / 2, userPoints[0][1] + (coteBInt * mmToPxV * zoomCoef * 0.62) ];
				
				noseCenter = [framePoints[1][0] + drageoir * mmToPxH * zoomCoef + coteD * mmToPxH * zoomCoef / 2, hPup + 10 * mmToPxV * zoomCoef];
			}
			else if(mode === "card"){
				$('#set-card').removeClass("off");
				
				noseCenter = [userPoints[0][0] + epPx * zoomCoef / 2, hPup + 10 * mmToPxV * zoomCoef];
				
				framePoints[0] = [ noseCenter[0] - cardWidthMm * mmToPxH * zoomCoef / 2, hPup + 40 * mmToPxV * zoomCoef ];
				framePoints[1] = [ noseCenter[0] + cardWidthMm * mmToPxH * zoomCoef / 2, hPup + (40 + cardHeightMm) * mmToPxV * zoomCoef ];
			}
			
			setFramePosition();
			setNoseCenterPosition();
			
			$('.set-frame').removeClass("off");
		}
		else{
			$('.set-frame, #nose-center').addClass("off");
		}
		
		// traitement des donnés saisies
		if(currentStep === 6){
			if(framePoints.length !== 2){ return; }
			updateMeasures();
			triggerFinalImgDrawing();
			
			$('#user-img-alert, #img-zoom, #next').addClass("off");
			$('#final-img').css("z-index", "10");
		}
		else{
			finalImgCtx.clearRect(0, 0, finalImgCanvas.width, finalImgCanvas.height);
			
			$('#user-img-alert, #img-zoom, #next').removeClass("off");
			$('#save-link').addClass("off");
			$('#final-img').css("z-index", "0");
		}
	}
	
	function setFramePosition(){
		if( framePoints[0] ){
			$('#frame-top-left').css( "left", framePoints[0][0] );
			$('#frame-top-left').css( "top", framePoints[0][1] );
			
			$('#drag-frame-top-left').css( "left", framePoints[0][0] - $('#drag-frame-top-left').width() );
			$('#drag-frame-top-left').css( "top", framePoints[0][1] - $('#drag-frame-top-left').height() );
		}
		
		if( framePoints[1] ){
			$('#frame-bottom-right').css( "left", framePoints[1][0] - $('#frame-bottom-right').width() );
			$('#frame-bottom-right').css( "top", framePoints[1][1] - $('#frame-bottom-right').height() );
			
			$('#drag-frame-bottom-right').css( "left", framePoints[1][0] );
			$('#drag-frame-bottom-right').css( "top", framePoints[1][1] );
		}
	}
	
	function setNoseCenterPosition(){
		$('#nose-center').css("left", noseCenter[0] - $('#nose-center').width() / 2);
		$('#nose-center').css("top", noseCenter[1] - $('#nose-center').height() / 2);
		
		$('#drag-nose-center').css("left", noseCenter[0] - $('#drag-nose-center').width() / 2);
		$('#drag-nose-center').css( "top", noseCenter[1] - $('#nose-center').height() / 2 - $('#drag-nose-center').height() );
	}
	
	function handleZoom(){
		const centerPanelOffsetLeft = $('#main-panel').offset().left;
		const centerPanelOffsetTop = $('#main-panel').offset().top;
		
		const imgCenterPositionX = $('#user-img').width() / 2 + $('#user-img').offset().left;
		const imgCenterPositionY = $('#user-img').height() / 2 + $('#user-img').offset().top;
		
		if( userPoints[0] ){
			const rightEyeDeltaX = userPoints[0][0] + centerPanelOffsetLeft - imgCenterPositionX;
			const rightEyeDeltaY = userPoints[0][1] + centerPanelOffsetTop - imgCenterPositionY;
			
			if(imgZoomed){
				userPoints[0][0] += (zoomVal -1) * rightEyeDeltaX;
				userPoints[0][1] += (zoomVal -1) * rightEyeDeltaY;
				
				$('#user-right-eye, #drag-user-right-eye').css( "left", "+=" + (zoomVal -1) * rightEyeDeltaX);
				$('#user-right-eye, #drag-user-right-eye').css( "top", "+=" + (zoomVal -1) * rightEyeDeltaY);
			}
			else{
				userPoints[0][0] += rightEyeDeltaX * (1 - zoomVal) / zoomVal;
				userPoints[0][1] += rightEyeDeltaY * (1 - zoomVal) / zoomVal;
				
				$('#user-right-eye, #drag-user-right-eye').css( "left", "+=" + rightEyeDeltaX * (1 - zoomVal) / zoomVal );
				$('#user-right-eye, #drag-user-right-eye').css( "top", "+=" + rightEyeDeltaY * (1 - zoomVal) / zoomVal );
			}
		}
		if( userPoints[1] ){
			const leftEyeDeltaX = userPoints[1][0] + centerPanelOffsetLeft - imgCenterPositionX;
			const leftEyeDeltaY = userPoints[1][1] + centerPanelOffsetTop - imgCenterPositionY;
			
			if(imgZoomed){
				userPoints[1][0] += (zoomVal -1) * leftEyeDeltaX;
				userPoints[1][1] += (zoomVal -1) * leftEyeDeltaY;
				
				$('#user-left-eye, #drag-user-left-eye').css( "left", "+=" + (zoomVal -1) * leftEyeDeltaX );
				$('#user-left-eye, #drag-user-left-eye').css( "top", "+=" + (zoomVal -1) * leftEyeDeltaY);
			}
			else{
				userPoints[1][0] += leftEyeDeltaX * (1 - zoomVal) / zoomVal;
				userPoints[1][1] += leftEyeDeltaY * (1 - zoomVal) / zoomVal;
				
				$('#user-left-eye, #drag-user-left-eye').css( "left", "+=" + leftEyeDeltaX * (1 - zoomVal) / zoomVal );
				$('#user-left-eye, #drag-user-left-eye').css( "top", "+=" + leftEyeDeltaY * (1 - zoomVal) / zoomVal );
			}
		}
		
		const zoomCoef = imgZoomed ? zoomVal : 1 / zoomVal;
		$('#frame-top-left, #frame-bottom-right').width( $('#frame-top-left').width() * zoomCoef );
		$('#frame-top-left, #frame-bottom-right').height( $('#frame-top-left').height() * zoomCoef );
		$('#nose-center').height($('#nose-center').height() * zoomCoef);
		
		if( framePoints[0] ){
			const leftFrameDeltaX = framePoints[0][0] + centerPanelOffsetLeft - imgCenterPositionX;
			const leftFrameDeltaY = framePoints[0][1] + centerPanelOffsetTop - imgCenterPositionY;
			
			if(imgZoomed){
				framePoints[0][0] += (zoomVal -1) * leftFrameDeltaX;
				framePoints[0][1] += (zoomVal -1) * leftFrameDeltaY;
			}
			else{
				framePoints[0][0] += leftFrameDeltaX * (1 - zoomVal) / zoomVal;
				framePoints[0][1] += leftFrameDeltaY * (1 - zoomVal) / zoomVal;
			}
		}
		if( framePoints[1] ){
			const rightFrameDeltaX = framePoints[1][0] + centerPanelOffsetLeft - imgCenterPositionX;
			const rightFrameDeltaY = framePoints[1][1] + centerPanelOffsetTop - imgCenterPositionY;
			
			if(imgZoomed){
				framePoints[1][0] += (zoomVal -1) * rightFrameDeltaX;
				framePoints[1][1] += (zoomVal -1) * rightFrameDeltaY;
			}
			else{
				framePoints[1][0] += rightFrameDeltaX * (1 - zoomVal) / zoomVal;
				framePoints[1][1] += rightFrameDeltaY * (1 - zoomVal) / zoomVal;
			}
		}
		setFramePosition();
		
		if(noseCenter){
			const noseDeltaX = noseCenter[0] + centerPanelOffsetLeft - imgCenterPositionX;
			const noseDeltaY = noseCenter[1] + centerPanelOffsetTop - imgCenterPositionY;
			
			if(imgZoomed){
				noseCenter[0] += (zoomVal -1) * noseDeltaX;
				noseCenter[1] += (zoomVal -1) * noseDeltaY;
			}
			else{
				noseCenter[0] += noseDeltaX * (1 - zoomVal) / zoomVal;
				noseCenter[1] += noseDeltaY * (1 - zoomVal) / zoomVal;
			}
			setNoseCenterPosition();
		}
		
		if(imgZoomed){
			gridStep /= zoomVal;
		}
		else{
			gridStep *= zoomVal;
		}
		if(gridShown){
			drawGrid();
		}
	}
	
	function updatePupilDistance(){
		if(userPoints.length !== 2){ return; }
		
		epPx = new Victor( userPoints[1][0], userPoints[1][1] ).distance( new Victor( userPoints[0][0], userPoints[0][1] ) );
		if(imgZoomed){ epPx /= zoomVal; }
		
		mmToPxH = mmToPxV = epPx / epReel;
	}
	
	function updateMeasures(){
		if(framePoints.length !== 2){
			$('#epR').text("");
			$('#epL').text("");
			$('#hR').text("");
			$('#hL').text("");
			$('#cotes-alert').addClass("off");
			return;
		}
		
		updateMmToPx();
		
		const zoomCoef = imgZoomed ? zoomVal : 1;
		
		if(mode === "frame"){
			const frameBottom = framePoints[1][1] + (drageoir * mmToPxV * zoomCoef);
			const hPupRPx = Math.abs( frameBottom - userPoints[0][1] ) / zoomCoef;
			const hPupLPx = Math.abs( frameBottom - userPoints[1][1] ) / zoomCoef;
			
			hPupRMm = hPupRPx / mmToPxV;
			hPupLMm = hPupLPx / mmToPxV;
		}
		else if(mode === "card"){
			hPupRMm = hPupLMm = ( coteBInt + (drageoir * 2) ) / 2 + 2;
		}
		
		const epRPx = Math.abs(userPoints[0][0] - noseCenter[0] ) / zoomCoef;
		const epLPx = Math.abs(userPoints[1][0] - noseCenter[0] ) / zoomCoef;
		
		epRMm = epRPx / mmToPxH;
		epLMm = epLPx / mmToPxH;
		
		$('#epR').text( Math.round(epRMm * 2) / 2 );
		$('#epL').text( Math.round(epLMm * 2) / 2 );
		$('#hR').text( Math.round(hPupRMm * 2) / 2 );
		$('#hL').text( Math.round(hPupLMm * 2) / 2 );
		$('#cotes-alert').removeClass("off");
	}
	
	function updateMmToPx(){
		const zoomCoef = imgZoomed ? zoomVal : 1;
		if(mode === "frame"){
			const coteAIntPx = Math.abs( framePoints[1][0] - framePoints[0][0] ) / zoomCoef;
			const coteBIntPx = Math.abs( framePoints[1][1] - framePoints[0][1] ) / zoomCoef;
			
			mmToPxH = coteAIntPx / coteAInt;
			mmToPxV = coteBIntPx / coteBInt;
		}
		else if(mode === "card"){
			mmToPxH = Math.abs( framePoints[1][0] - framePoints[0][0] ) / zoomCoef / cardWidthMm;
			mmToPxV = Math.abs( framePoints[1][1] - framePoints[0][1] ) / zoomCoef / cardHeightMm;
		}
	}
	
	function updateNosePosition(){
		const zoomCoef = imgZoomed ? zoomVal : 1;
		const hPup = ( userPoints[0][1] + userPoints[1][1] ) / 2;
		noseCenter = [framePoints[1][0] + drageoir * mmToPxH * zoomCoef + coteD * mmToPxH * zoomCoef / 2, hPup + 10 * mmToPxV * zoomCoef];
		$('#drag-nose-center').css("left", noseCenter[0] - $('#drag-nose-center').width() / 2);
		$('#nose-center').css("left", noseCenter[0] - $('#nose-center').width() / 2);
	}
	
	// affiche la photo de l'utilisateur
	function drawUserImg(){
		if(lastUploadedImg){
			imgDrawn = false;
			userImg.removeAttribute("src");
			userImg.setAttribute("src", lastUploadedImg);
		}
	}
	
	function resetUserImg(){
		$('#user-img').addClass("off");
		customScale = 1;
		lastImgPosition = [0, 0];
		$('#rotate-one input').trigger("contextmenu");
		if(imgZoomed){
			toggleZoom();
		}
		else{
			drawUserImg();
		}
		$('#user-img, #final-img').css( {"left": ( $('#main-panel').width() - $('#user-img').width() ) / 2, "top": ( $('#main-panel').height() - $('#user-img').height() ) / 2} );
	}
	
	function drawGrid(){
		const gridWidth = $('#grid').width();
		const gridHeight =  $('#grid').height();
		
		gridCtx.clearRect(0, 0, gridWidth, gridHeight);
		
		gridCtx.beginPath();
		for(let i = 1 ; i < gridStep ; i++){
			
			gridCtx.moveTo( (i / gridStep) * gridWidth, 0);
			gridCtx.lineTo( (i / gridStep) * gridWidth, gridHeight);
			
			gridCtx.moveTo(0 , (i / gridStep) * gridHeight);
			gridCtx.lineTo(gridWidth, (i / gridStep) * gridHeight);			
		}
		gridCtx.stroke();
		
		gridCtx.lineWidth = 5;
		gridCtx.beginPath();
		
		const zoomCoef = imgZoomed ? zoomVal : 1;
		gridCtx.ellipse(gridWidth/ 2, gridHeight / 2.2, zoomCoef * gridHeight / 3.2, zoomCoef * gridHeight / 5, Math.PI / 2, 0, Math.PI * 2);
		gridCtx.stroke();
		gridCtx.lineWidth = 1;
	}
	
	function triggerFinalImgDrawing(){
		if(imgZoomed){
			toggleZoom();
			const waitingForUserImg = setInterval(function(){
				if(imgDrawn){
					clearInterval(waitingForUserImg);
					drawFinalImg();
				}
			}, 20);
		}
		else{
			drawFinalImg();
		}
	}
	function drawFinalImg(){
		finalImgCtx.drawImage(imgCanvas, 0, 0);
		
		const deltaOffsetLeft = $('#main-panel').offset().left - $('#user-img').offset().left;
		const deltaOffsetTop = $('#main-panel').offset().top - $('#user-img').offset().top;
		
		const rightEyePosition = [userPoints[0][0] + deltaOffsetLeft, userPoints[0][1] + deltaOffsetTop];
		const leftEyePosition = [userPoints[1][0] + deltaOffsetLeft, userPoints[1][1] + deltaOffsetTop];
		const frameTopLeftPosition = [framePoints[0][0] + deltaOffsetLeft, framePoints[0][1] + deltaOffsetTop];
		const frameBottomRightPosition = [framePoints[1][0] + deltaOffsetLeft, framePoints[1][1] + deltaOffsetTop];
		const nosePosition = [noseCenter[0] + deltaOffsetLeft, ( userPoints[0][1] + userPoints[1][1] ) / 2 + deltaOffsetTop];
		
		finalImgCtx.strokeStyle = "green";
		finalImgCtx.beginPath();
		
		finalImgCtx.moveTo(rightEyePosition[0] - 10, rightEyePosition[1]);
		finalImgCtx.lineTo(rightEyePosition[0] + 10, rightEyePosition[1]);
		finalImgCtx.moveTo(rightEyePosition[0], rightEyePosition[1] - 10);
		finalImgCtx.lineTo(rightEyePosition[0], rightEyePosition[1] + 10);
		
		finalImgCtx.moveTo(leftEyePosition[0] - 10, leftEyePosition[1]);
		finalImgCtx.lineTo(leftEyePosition[0] + 10, leftEyePosition[1]);
		finalImgCtx.moveTo(leftEyePosition[0], leftEyePosition[1] - 10);
		finalImgCtx.lineTo(leftEyePosition[0], leftEyePosition[1] + 10);
		
		finalImgCtx.stroke();
		
		finalImgCtx.setLineDash( [5, 2] );
		finalImgCtx.beginPath();
		
		finalImgCtx.moveTo(nosePosition[0], nosePosition[1] - 60);
		finalImgCtx.lineTo(nosePosition[0], nosePosition[1] + 100);
		
		finalImgCtx.stroke();
		
		finalImgCtx.strokeStyle = "blue";
		finalImgCtx.beginPath();
		
		// lignes verticales
		finalImgCtx.moveTo(frameTopLeftPosition[0], frameTopLeftPosition[1] - 20);
		finalImgCtx.lineTo(frameTopLeftPosition[0], frameBottomRightPosition[1] + 20);
		finalImgCtx.moveTo(frameBottomRightPosition[0], frameTopLeftPosition[1] - 20);
		finalImgCtx.lineTo(frameBottomRightPosition[0], frameBottomRightPosition[1] + 20);
		
		// lignes horizontales
		finalImgCtx.moveTo( frameTopLeftPosition[0] - 20, frameTopLeftPosition[1] );
		finalImgCtx.lineTo( frameBottomRightPosition[0] + 20, frameTopLeftPosition[1] );
		finalImgCtx.moveTo( frameTopLeftPosition[0] - 20, frameBottomRightPosition[1]  );
		finalImgCtx.lineTo( frameBottomRightPosition[0] + 20, frameBottomRightPosition[1] );
		
		finalImgCtx.stroke();
		
		finalImgCtx.font = "bold 13px sans-serif";
		finalImgCtx.fillStyle = "white";
		
		finalImgCtx.fillText("1/2 Ep : " + Math.round(epRMm * 2) / 2 + " mm", rightEyePosition[0] - 35, frameBottomRightPosition[1] + 30);
		finalImgCtx.fillText("H : " + Math.round(hPupRMm * 2) / 2 + " mm", rightEyePosition[0] - 35, frameBottomRightPosition[1] + 47);
		
		finalImgCtx.fillText("1/2 Ep : " + Math.round(epLMm * 2) / 2 + " mm", leftEyePosition[0] - 35, frameBottomRightPosition[1] + 30);
		finalImgCtx.fillText("H : " + Math.round(hPupLMm * 2) / 2 + " mm", leftEyePosition[0] - 35, frameBottomRightPosition[1] + 47);
		
		const savedImgCanvas = document.createElement("canvas");
		savedImgCanvas.height = $('#user-img').height() * 0.4;
		savedImgCanvas.width = savedImgCanvas.height * outputRatio;
		
		// coordonnées à l'intérieur du main panel
		const imgCenter = [$('#main-panel').width() / 2, $('#main-panel').height() / 2];
		const finalImgCanvasStart = [ parseFloat( $('#final-img').css("left") ), parseFloat( $('#final-img').css("top") ) ];
		const savedImgCanvasStart = [ imgCenter[0] - savedImgCanvas.width / 2, imgCenter[1] - savedImgCanvas.height * 0.3 ];
		const sx = finalImgCanvasStart[0] < savedImgCanvasStart[0] ? savedImgCanvasStart[0] - finalImgCanvasStart[0] : 0;
		const sy = finalImgCanvasStart[1] < savedImgCanvasStart[1] ? savedImgCanvasStart[1] - finalImgCanvasStart[1] : 0;
		const swidth = finalImgCanvasStart[0] < savedImgCanvasStart[0] ? finalImgCanvasStart[0] + finalImgCanvas.width - savedImgCanvasStart[0] : savedImgCanvasStart[0] + savedImgCanvas.width - finalImgCanvasStart[0];
		const sheight = finalImgCanvasStart[1] < savedImgCanvasStart[1] ? finalImgCanvasStart[1] + finalImgCanvas.height - savedImgCanvasStart[1] : savedImgCanvasStart[1] + savedImgCanvas.height - finalImgCanvasStart[1];
		const x = finalImgCanvasStart[0] < savedImgCanvasStart[0] ? 0 : finalImgCanvasStart[0] - savedImgCanvasStart[0];
		const y = finalImgCanvasStart[1] < savedImgCanvasStart[1] ? 0 : finalImgCanvasStart[1] - savedImgCanvasStart[1];
		
		savedImgCanvas.getContext("2d").drawImage(finalImgCanvas, sx, sy, swidth, sheight, x, y, swidth, sheight);
		
		const outputImgCanvas = document.createElement("canvas");
		outputImgCanvas.width = outputWidth;
		outputImgCanvas.height = outputWidth / outputRatio;
		outputImgCanvas.getContext("2d").drawImage(savedImgCanvas, 0, 0, outputImgCanvas.width, outputImgCanvas.height);
		
		$('#save-link').attr( "href", outputImgCanvas.toDataURL() ).removeClass("off");
	}
	
	function toggleZoom(){
		imgZoomed = imgZoomed ? false : true;
		$('#img-zoom i').toggleClass("off");
		drawUserImg();
		handleZoom();
	}
	
	function degsToRads(alpha){
		return alpha * Math.PI / 180;
	}
	
	// dimensions des éléments
	function updateDomElements(){
		let canvasWidth, canvasHeight;
		
		const availableHeight = $('#main-panel').height();
		const neededWidth = availableHeight * ratio;
		
		if( neededWidth > $('#main-panel').width() ){
			canvasWidth = $('#main-panel').width();
			canvasHeight = canvasWidth / ratio;
		}
		else{
			canvasWidth = neededWidth;
			canvasHeight = availableHeight;
		}
		
		// centrage des canvas		
		$('canvas').width(canvasWidth).height(canvasHeight).attr("width", canvasWidth).attr("height", canvasHeight);
		$('canvas').css("left", ( $('#main-panel').width() - canvasWidth ) / 2 );
		$('canvas').css("top", ( $('#main-panel').height() - canvasHeight ) / 2 );
		
		if(userImg){
			drawUserImg();
		}
		if(gridShown){
			drawGrid();
		}
		
		if(currentStep > 1){
			$('#reset button').trigger("click");
			handleCurrentStep();
		}
	}
	
});