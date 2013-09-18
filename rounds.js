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
      return roundEnd - now;
    },
    isEvent: function(){
      return !!this.get('isEvent');
    }
  });

  var TimerCollection = Backbone.Collection.extend({
    url: function(){ return '/rounds.json'},
    model: Timer,
    current: function(){
      //filter to only show current rounds
      var threshold = 7200; //threshold in seconds for displaying rounds.  3600 = 1 hour.
      var rounds = this.filter(function(round){
        return threshold > Math.abs(round.getTimeRemaining());
      });
      return rounds;
    }
  });

  var TimerView = Backbone.View.extend({
    tagName: 'div',
    template: TimerTemplates.timer_container,
    pad: function(num){
      if(num > 9){return num}
      return '0' + num;
    },
    formatSeconds: function(secs){
      var output = '';
      var hours = parseInt(secs / 3600);
      var minutes = Math.floor(secs / 60) % 60;
      var seconds = secs % 60;
      if(hours > 0){
        output += hours + ":";
      }
      output += this.pad(minutes) + ":" + this.pad(seconds);
      return output;
    },
    render: function(){ 
      var self = this;
      var timeRemainingStr = function(){
        if(self.model.getTimeRemaining() < 0){
          var timer = "";
          if(self.model.isEvent()){
            var message = "The event has started";
          }else{
            var message = "The round is finished";
          }
        } else {
          var timer = self.formatSeconds(self.model.getTimeRemaining())
          if(self.model.isEvent()){
            var message = " remaining until event starts";
          }else{
            var message = " left in the round";
          }
        }
        return timer + message;
      }
      this.$el.html(this.template({
        timer:{
          id: this.model.id,
          name:this.model.get('roundName'),
          timeRemaining: timeRemainingStr()
        }
      }));
      return this;
    },
  });

  var TimerListView = Backbone.View.extend({
    el: '#content-inner-container',
    render: function(){
      if(this.collection.length <= 0){ this.$el.html('<h1>There are no current events</h1>'); return this };
      this.$el.html('');
      this.addAllTimers();
      return this;
    },
    addTimer: function(timer){
      var view = new TimerView({model:timer})
      var t = view.render().el;
      this.$el.append(t);
    },
    addAllTimers: function(){
      _.each(this.collection.current(),this.addTimer, this);
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

