module.exports = (function(){

  var _ = require('stackq');
  var path = require('path');
  var plug = require('plugd');
  var fs = require('fs.plug');

  var rackstore = plug.Rack.make('rackStore');

  rackstore.registerPlugPoint('load.model.transform',function(p){
    this.srcTask.from(p,'rack.model');
  });

  rackstore.registerPlugPoint('load.fs.transform',function(p){
    var f = this.srcTask.from(p,'io.iocontrol');
  });

  rackstore.registerPlug('loadModels',function(){
    var models,uuid = _.Util.guid();
    this.newSrcReply('files',uuid).on(this.$bind(function(p){
      var lists = p.stream();
      lists.on(this.$bind(function(f){
        this.Reply.make('load.model',f);
      }));
    }));

    this.newTask('rload','models.reload');

    this.tasks('rload').pause();

    this.tasks('rload').on(function(){
      if(models){
        this.Reply.make('load.fs',{ task: 'dir.read', file: models },uuid);
      }
    });

    this.tasks().on(this.$bind(function(p){
      models = p.body.models;
      this.Task.make('rack.fs',{ task: 'dir.read', file: models },uuid);
      this.tasks('rload').resume();
    }));

  });

  rackstore.registerPlug('loadModel',function(){
    var uuid = _.Util.guid();
    this.newSrcReply('model.data',uuid).on(this.$bind(function(p){
      var lists = p.stream(), data = [];
      lists.on(_.funcs.restrictArgs(_.funcs.bind(data.push,data),1));
      lists.onEvent('dataEnd',this.$bind(function(f){
        console.log('end of stream',data.toString());
        var code = data.join(''),json;
        try{
          console.log('converting',code);
          json = JSON.stringify(code);
          console.log('converted',json);
        }catch(e){
          console.log('loadModel.error',e);
          this.Task.from(p,'loadModel.error');
        }
      }));
    }));

    this.tasks().on(this.$bind(function(p){
      var model = p.body, name = model.id, file = model.file;
      this.Reply.make('load.fs',{ task: 'file.read', file: file },uuid);
    }));

  });

  rackstore.rack = plug.Network.blueprint(function(){

    this.use(fs.Plug('io.iocontrol'),this.makeName('fs'));
    this.use(rackstore.Plug('loadModels','rack.models'),this.makeName('load.models'));
    this.use(rackstore.Plug('loadModel','rack.model'),this.makeName('load.model'));

    this.get(this.makeName('load.models'))
    .attachPoint(rackstore.PlugPoint('load.model.transform'),'load.model','model.transformer');

    this.get(this.makeName('load.models'))
    .attachPoint(rackstore.PlugPoint('load.fs.transform'),'load.fs','fs.transformer')

    this.get(this.makeName('load.model'))
    .attachPoint(rackstore.PlugPoint('load.fs.transform'),'load.fs','fs.transformer')
  });

  rackstore.registerPlug('rackdb',function(){
    var conf,rack = rackstore.rack('rackdb');
    this.attachNetwork(rack);
    this.networkOut(this.replies());

    this.newTask('conf',this.makeName('conf'));

    this.tasks('conf').on(this.$bind(function(p){
      conf = p.body;
      if(_.valids.not.contains(conf,'base')) return;
      if(_.valids.not.contains(conf,'models')) return;
      rack.Task.make('io.control.conf',{ base : conf.base });
      rack.Task.make('rack.models',{ models : conf.models });
    }));

  });


  rackstore.RackIO = plug.Network.blueprint(function(){
    this.use(rackstore.Plug('rackdb'),this.makeName('rackbox'));
  });

}());
