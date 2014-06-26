/**
 * A class to handle in memory buffers with interval dumps
 */

var merge = require('merge');

module.exports = function(options, callback) {	
	
	function Buffer() {
		this.defaults = {
			granurality: 1000,
			interval: 1000
		}
		this.options = merge(this.defaults, options);
		this.buffer = {};
		this.processingBuffer = {};
		
		this.addMessage = function(msg) {
			var d = new Date();
			var t = Math.round(d.getTime() / this.options.granurality);
			if (!this.buffer[t + 1]) {
				this.buffer[t + 1] = [];
			}
			if (!this.buffer[t]) {
				this.buffer[t] = [];
			}
			this.buffer[t][this.buffer[t].length] = msg;
		}
		
		setInterval(function() {
			var d = new Date();
			var t = Math.round(d.getTime() / 1000);	
			for ( var x in this.buffer) {
				if (x < t - 2) {
					this.processingBuffer[x] = this.buffer[x];
					delete this.buffer[x];
					if (this.processingBuffer[x].length > 0) {
						callback(
							this.processingBuffer[x], 
							function() {
								delete this.context.processingBuffer[this.index];
							}.bind({context: this, index: x}),
							function(skipNext) {
								if(skipNext) {
									this.context.buffer[this.index] = this.context.processingBuffer[this.index];
								}
								delete this.context.processingBuffer[this.index];
							}.bind({context: this, index: x})
						);						
					}
				}
			}						
		}.bind(this), this.options.interval);
	}
	return new Buffer();
}