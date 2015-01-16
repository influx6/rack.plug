var _ = require('stackq');
var plug = require('plugd');
var rack = require('../rack.plug.js');

_.Jazz('rack.plug specification tests',function(n){

  var rack = rack.RackIO('rack.grid');

  rack.Task.make('rackdb.conf',{
    base:'./confs',
    models: './models'
  });

});
