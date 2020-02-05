class VibeQ {
	
	constructor (source, openTube, closedTube, fade_type='linear') {
		this.source     = source;
		this.context    = source.context;
		this.openTube   = openTube;
		this.closedTube = closedTube;
		this.FADE_TYPE  = fade_type;

		this.tubes = {};
		this.tubes[1] = this.openTube;
		this.tubes[2] = this.closedTube;

		this.setGainFunction();

		openTube.disconnect();
		closedTube.disconnect();
		openTube.setStop(false);
		closedTube.setStop(false);

		var ff = closedTube.setFundamentalFrequency(openTube.FUNDAMENTAL_FREQ,true);

		//console.log(ff);

		if (ff != 0.5 * openTube.FUNDAMENTAL_FREQ) console.log(openTube.FUNDAMENTAL_FREQ,closedTube.FUNDAMENTAL_FREQ);

		this.source.connect(this.openTube.allFilters.highShelf);
		this.source.connect(this.closedTube.allFilters.highShelf);
	};

	connect (destination){
		this.openTube.connect(  destination);
		this.closedTube.connect(destination);
	};

	setGain(gain,fade_type=this.FADE_TYPE){
		//console.log("Setting gain...")

		var max_dB = 50.0;

		var open  =     (gain+50)/100 + this.PHASE_SHIFT;
		var closed= 1 - (gain+50)/100 + this.PHASE_SHIFT;
		var gain1 = open;
		var gain2 = closed;


		if (fade_type=='linear'){
			gain1 = gain>=0? gain:0;
			gain2 = gain>=0? 0:-gain;
		}if(fade_type=='constant-power'){
			gain1 = max_dB * Math.cos(  open* 0.5*Math.PI);
  			gain2 = max_dB * Math.cos(closed* 0.5*Math.PI);
		};
			console.log('gain1',open, gain1);
  			console.log('gain2',closed,gain2);
			this.openTube.setGain(  gain1);
			this.closedTube.setGain(gain2);
	};

	setGainFunction(func = Math.sin){
		this.gainFunction = func;
	};
};

window.addEventListener('click', function() {

	var tube  = new TubeQ(source,stopped=false);
	var tube2 = new TubeQ(source,stopped=true);

	var vibes = new VibeQ(source, tube, tube2);

	createSliders(10,'peaking-sliders2');
	bindSliders(tube,'peaking-sliders');
	bindSliders(tube2,'peaking-sliders2');

	vibes.connect(streamNode);

	var peakingSliders = document.querySelectorAll("input[type=range]");

	var fundamentalGain = document.querySelector('[data-filter="fundamental"][data-param="gain"]');
	fundamentalGain.addEventListener('input', function(){


		vibes.setGain(fundamentalGain.value);

		peakingSliders.forEach(function(slider){

		var sliderSet = Boolean(slider.parentNode.parentNode.getAttribute('id'))? slider.parentNode.parentNode.getAttribute('id')[slider.parentNode.parentNode.getAttribute('id').length-1]: 0;

		slider.value = parseInt(sliderSet)? vibes.tubes[parseInt(sliderSet)].allFilters[ slider.getAttribute('data-filter') ][ 'gain' ].value:slider.value;

	})

	});

}, {once:true} );