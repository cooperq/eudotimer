/************************************
 * Round timer for eudomonia game store
 * written by Cooper Quintin <cooperq@gmail.com>
 * see LICENSE for license details
 ************************************/

$(function(){

  var TimerTemplates = {
    timer_container: _.template($("#timer-container").html())
  };

  var Timer = Backbone.Model.extend({
    getTimeRemaining: function(){
      var roundStart = this.get('roundStart') * 1;
      var roundLength = this.get('roundLength') * 60;
      var roundEnd = parseInt(roundStart) + parseInt(roundLength);
      var now = Math.round(new Date().getTime()/1000);
      console.log('round', roundEnd, roundStart, roundLength, now);
      return roundEnd - now;
    },
  });

  var TimerCollection = Backbone.Collection.extend({
    url: function(){ return '/rounds.json'},
    model: Timer,
  });

  var TimerView = Backbone.View.extend({
    tagName: 'div',
    template: TimerTemplates.timer_container,
    render: function(){ 
      this.$el.html(this.template({
        timer:{
          id: this.model.id,
          name:this.model.get('roundName'),
          timeRemaining: this.model.getTimeRemaining()
        }
      }));
      return this;
    },
  });

  var TimerListView = Backbone.View.extend({
    el: '#content-inner-container',
    render: function(){
      console.log('tick');
      if(this.collection.length <= 0){ return this };
      console.log('adding alltimers');
      this.$el.html('');
      this.addAllTimers();
      return this;
    },
    addTimer: function(timer){
      console.log('adding timer', timer);
      var view = new TimerView({model:timer})
      var t = view.render().el;
      this.$el.append(t);
    },
    addAllTimers: function(){
      console.log(this.collection);
      this.collection.each(this.addTimer, this);
    }
  });
  
  //initialize the collection and view
  Timers = new TimerCollection();
  var RoundList = new TimerListView({collection: Timers});

  //start the main loop
  setInterval((function(self) {         
    //stupid code trick to preserve `this`
    return function() {
      RoundList.render();
    }
  })(this) , 1000);
  
  setInterval((function(self) {         
    //stupid code trick to preserve `this`
    return function() {
      Timers.fetch();
    }
  })(this) , 5000);

  //fetch any data that is already there
  Timers.fetch();
   
});

