/**
* DeepThought on your wrist!
*/
 
var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Vibe = require('ui/vibe');

// Parse Socket Feed
var parseSocketFeed = function(data, quantity) {
  
  var items = [];
  for(var i = 0; i < quantity; i++) {

    var title = data.sockets[i].socket;
    var status = data.sockets[i].status;
    var on = data.sockets[i].on;
    var off = data.sockets[i].off;

    var image;
    if (status == 1) { image = 'images/bulb_on.png'; } else { image = 'images/bulb_off.png'; }
     
    // Add to menu items array
    items.push({
      title:title,
      icon:image,
      on: on,
      off: off
    });
  }

  return items;
};


// Parse Room Feed
var parseRoomFeed = function(data, quantity) {
  var items = [];
  for(var i = 0; i < quantity; i++) {

    var title = data.rooms[i].room;
    var temperature = data.rooms[i].temperature + '\u00B0C';
    var movement = data.rooms[i].movement;
    var light = data.rooms[i].light;
    
    var subtitle = temperature + ' - ';
    if (movement == '0') { subtitle = subtitle + "Still"; } else { subtitle = subtitle + "Active"; }
    subtitle = subtitle + ' - ' + light + '%';
    
     
    // Add to menu items array
    items.push({
      title: title,
      subtitle: subtitle

    });
  }
 
  // Finally return whole array
  return items;
};
 

// TV Show Menu
var getTVMenu = function(data, quantity) {
  var items = [];
  for(var i = 0; i < quantity; i++) {

    var show = data.tvshows[i].show;
    var episode = data.tvshows[i].episode;

    // Add to menu items array
    items.push({
      title:show,
      subtitle: episode
    });
  }
  
  var menu = new UI.Menu({
    sections: [{
      title: 'TV Shows',
      items: items
    }]
  });
  
  // Finally return menu
  return menu;
};


// Movie Menu
var getMovieMenu = function(data, quantity) {
  var items = [];
  for(var i = 0; i < quantity; i++) {

    var movie = data.movies[i].movie;

    // Add to menu items array
    items.push({
      title: movie
    });
  }
  
  var menu = new UI.Menu({
    sections: [{
      title: 'Movies',
      items: items
    }]
  });
  
  // Finally return menu
  return menu;
};


// Main menu
var menu = new UI.Menu({
    sections: [{
      title: 'DeepThought',
      items: [{
        title: 'Automation',
        icon: 'images/socket.png',
      }, {
        title: 'Rooms',
        icon: 'images/room.png',
      }, {
        title: 'Entertainment',
        icon: 'images/entertain.png',
      }, {
        title: 'Weather',
        icon: 'images/sun.png',
      }]
    }]
});
 
menu.show();
 
// Main Menu Selection
menu.on('select', function(e) {

  // Automation Menu
  if (e.item.title == 'Automation')
  {
    // Make request to DeepThought for socket list
    ajax({
      url:'http://DeepThought.local/automation/socketList.php',
      type:'json'},     
    function(data) {
     
      // Show socket menu      
      var items = parseSocketFeed(data, data.count);
      
      var socketMenu = new UI.Menu({
        sections: [{
          title: 'Sockets',
          items: items
        }]
      });
      
      socketMenu.show();
    
      // Click to swicth on
      socketMenu.on('select', function(e) {
        var on = e.item.on;
        ajax({
          url:'http://DeepThought.local/automation/power.php?e=' + on
        });

        // Notify the user
        Vibe.vibrate('short');

        setTimeout(function() {
          ajax({
            url:'http://DeepThought.local/automation/socketList.php',
            type:'json'},     
          function(data) {
            var updatedItems = parseSocketFeed(data, data.count);
            socketMenu.items(0, updatedItems);          
          });
        }, 750);
        
      });
    
      // Long click to swicth off
      socketMenu.on('longSelect', function(e) {
        var off = e.item.off;
        ajax({
          url:'http://DeepThought.local/automation/power.php?e=' + off
        });      

        // Notify the user
        Vibe.vibrate('double');

        setTimeout(function() {
          ajax({
            url:'http://DeepThought.local/automation/socketList.php',
            type:'json'},     
          function(data) {
            var updatedItems = parseSocketFeed(data, data.count);
            socketMenu.items(0, updatedItems);          
          });
        }, 750);
        
      });

    });    
  }

  // Rooms
  if (e.item.title == 'Rooms')
  {
    ajax({
      url:'http://DeepThought.local/automation/roomJSON.php',
      type:'json'},     
    function(data) {
  
      // Create an array of Menu items
      var menuItems = parseRoomFeed(data, data.count);
 
      // Construct Menu to show to user
      var resultsMenu = new UI.Menu({
        sections: [{
          title: 'Rooms',
          items: menuItems
        }]
      });
    
      resultsMenu.show();
        
    });
  
  }
  
  // Entertainment Menu
  if (e.item.title == 'Entertainment')
  {
    
    // Main menu
    var entMenu = new UI.Menu({
      sections: [{
      title: 'Entertainment',
        items: [{
          title: 'Movies',
          icon: 'images/film.png',
        }, {
          title: 'TV Shows',
          icon: 'images/tv.png',
        }]
      }]
    });
 
    entMenu.show();
    
    // Click to swicth on
    entMenu.on('select', function(e) {
    
      // Movie Menu
      if (e.item.title == 'Movies')
      {

        // Make request to Movie list
        ajax({
          url:'http://DeepThought.local/entertainment/movieJSON.php',
          type:'json'},     
        function(data) {
       
          // Show socket menu
          var movieMenu = getMovieMenu(data, data.count);
          movieMenu.show();
      
        });
      }      
      
      // TV Show Menu
      if (e.item.title == 'TV Shows')
      {

        // Make request to DeepThought for TV Show list
        ajax({
          url:'http://DeepThought.local/entertainment/tvJSON.php',
          type:'json'},     
        function(data) {
       
          // Show socket menu
          var tvMenu = getTVMenu(data, data.count);
          tvMenu.show();
      
        });
      }
      
    });    
  }

  // Weather
  if (e.item.title == 'Weather')
  {
    ajax(
      {
        url:'http://thingspeak.com/channels/22830/feed.json?key=09IMPB7648R7T8AQ&&results=1',
        type:'json'
      },
      function(data) {

      var weatherWindow = new UI.Window();
 
      var text = new UI.Text({
        position: new Vector2(0, 0),
        size: new Vector2(144, 84),
        text: 'Temperature at Home',
        font:'GOTHIC_28_BOLD',
        color:'white',
        textOverflow:'wrap',
        textAlign:'center',
        backgroundColor:'black'
      });
      weatherWindow.add(text);
    
      text = new UI.Text({
        position: new Vector2(0, 84),
        size: new Vector2(144, 84),
        text: data.feeds[0].field1 + '\u00B0C',
        font:'BITHAM_42_BOLD',
        color:'black',
        textOverflow:'wrap',
        textAlign:'center',
        backgroundColor:'white'
      });
      weatherWindow.add(text);

      weatherWindow.show();    
    
      } 
    );    
  }
  
});
