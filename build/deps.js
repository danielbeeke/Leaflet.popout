var deps = {
	Core: {
		src: [
			'Leaflet.popout.js'
		],
		desc: 'The core of the plugin. Currently only includes the version.'
	},

	Label: {
		src: [
			'Popout.js',
		],
		desc: 'Leaflet.popout plugin files.',
		deps: ['Core']
	}
};

if (typeof exports !== 'undefined') {
	exports.deps = deps;
}