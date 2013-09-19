/************************************
 * Round timer for eudomonia game store
 * written by Cooper Quintin <cooperq@gmail.com>
 * see LICENSE for license details
 ************************************/

$(function(){

  //pointers to template containers.  Templates are located in rounds.html
  var TimerTemplates = {
    timer_container: _.template($("#timer-container").html())
  };

  //Main timer model
  var Timer = Backbone.Model.extend({

    getName: function(){
      var name = this.get('name')[0];
      var round = this.get('round')[0];
      if(round > 0){ name += ' - Round ' + round}
      return name;
    },

    getStartTime: function(){
      return Date.parse(this.get('start_time')[0]);
    },

    getTimeRemaining: function(){
      var roundEnd = Math.round(this.getStartTime().getTime()/1000) + this.get('round_length') * 60;
      var now = Math.round(new Date().getTime()/1000);
      return roundEnd - now;
    },

    isEvent: function(){
      return this.get('round') < 1;
    },

    isNotEvent: function(){
      return this.get('round') > 1;
    },

    roundHasNotStarted: function(){
      return this.isNotEvent() && (Math.round(this.getStartTime().getTime()/1000) > Math.round(new Date().getTime()/1000));
    }

  });

  //Collection for Timer
  var TimerCollection = Backbone.Collection.extend({
    url: function(){ return '/rounds.json'},
    model: Timer,
    comparator: function(timer){
      return timer.get('name')[0] + timer.get('round')[0]  
    }
  });

  //Single timer view
  var TimerView = Backbone.View.extend({
    //wrapper tag for timer
    tagName: 'div',

    //pointer to template
    template: TimerTemplates.timer_container,

    //utility function to pad numbers with a leading zero
    pad: function(num){
      if(num > 9){return num}
      return '0' + num;
    },

    //utitlity function to format a number as hours:minutes:seconds
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

    //a clusterfuck that adds a helpful string to the end of the time
    //TODO: Refactor this
    formatTimeRemainingStr: function(){
      if(this.model.getTimeRemaining() < 0){
        var timer = "";
        if(this.model.isEvent()){
          var message = "The event has started";
        }else{
          var message = "The round is finished";
        }
      } else if(this.model.roundHasNotStarted()) {
        var timer = "";
        var message = "The round will start at " + this.model.getStartTime().toString("hh:mm");
      } else { //There is still time left in the round or until the event starts
        var timer = this.formatSeconds(this.model.getTimeRemaining())
        if(this.model.isEvent()){
          var message = " remaining until event starts";
        }else{
          var message = " left in the round";
        }
      }
      return timer + message;
    },

    //render a single timer on the screen
    render: function(){ 
      this.$el.html(this.template({
        timer:{
          id: this.model.id,
          name:this.model.getName(),
          timeRemaining: this.formatTimeRemainingStr()
        }
      }));
      return this;
    },
  });

  //View for the timer collection
  var TimerListView = Backbone.View.extend({

    //target element to render the view in
    el: '#content-inner-container',

    //render the list
    render: function(){
      if(this.collection.length <= 0){ this.$el.html('<h1>There are no current events</h1>'); return this };
      this.$el.html('');
      this.addAllTimers();
      return this;
    },

    //add a single timer to the view
    addTimer: function(timer){
      var view = new TimerView({model:timer})
      var t = view.render().el;
      this.$el.append(t);
    },

    //add all timers to the view
    addAllTimers: function(){
      this.collection.each(this.addTimer, this);
    }
  });
  
  //initialize the collection and list view
  Timers = new TimerCollection();
  var RoundList = new TimerListView({collection: Timers});

  //start the main loop
  setInterval((function(self) {         
    //stupid code trick to preserve scope
    return function() {
      RoundList.render();
    }
  })(this) , 1000);
 
  //Check for updates to rounds from server every 5 seconds
  setInterval((function(self) {         
    return function() {
      Timers.fetch();
    }
  })(this) , 5000);

  //Get the inital data
  Timers.fetch();
   
});

