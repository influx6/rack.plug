var _ = require('stackq');
var plug = require('plugd');
var rack = require('../rack.plug.js');

_.Jazz('rack.plug specification tests',function(n){

  var grid = rack.RackIO('rack.grid');

  grid.Task.make('rackdb.conf',{
    base:'../confs',
    models: './models'
  });

  n('can i create a rack network',function(k){

    k.sync(function(d,g){
      _.Expects.truthy(plug.Network.instanceBelongs(d));
    });

    k.for(grid);
  });

});
