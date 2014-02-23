var tpp_start_time = 1392254507;
var update_interval = 5000;
var api_version = 9;

// https://gist.github.com/mathiasbynens/428626
document.head || (document.head = document.getElementsByTagName('head')[0]);
function changeFavicon(src) {
    var link = document.createElement('link'),
    oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = src;
    if (oldLink) {
        document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
}

function ViewModel() {
    var self = this;

    self.filter_options = ko.observable(['Travel', 'Roster', 'Items', 'Battle', 'Commentary', 'Strategy']);
    self.filter = ko.observableArray();
    for (var i = 0; i < self.filter_options().length; i++) {
        self.filter.push(self.filter_options()[i]);
    }
    self.error = ko.observable(null);
    self.updates = ko.observableArray();
    self.inventory = ko.observableArray();
    self.balance = ko.observable(0);
    self.party = ko.observableArray();
    self.goal = ko.observable();
    self.badges = ko.observableArray();
    self.time = ko.observable("time");
    self.mapURL = ko.observable("https://pokeworld.herokuapp.com/rb/1");

    self.icon = function(mode) {
        return '/images/anarchy.png';
    }

    self.filtered = ko.computed(function() {
        var result = [];
        var updates = self.updates();
        for (var i = 0; i < updates.length; i++) {
            if (self.filter().indexOf(updates[i].category) !== -1 || updates[i].category === 'Meta') {
                result.push(updates[i]);
            }
        }
        return result;
    }, self);

    self.recentUpdates = ko.computed(function() {
        return self.filtered().slice(0, 5);
    }, self);

    self.first = ko.computed(function() {
        return self.filtered()[0];
    }, self);

    self.recentishUpdates = ko.computed(function() {
        return self.filtered().slice(1, 7);
    }, self);

    self.oldUpdates = ko.computed(function() {
        return self.filtered().slice(5);
    }, self);

    self.oldishUpdates = ko.computed(function() {
        return self.filtered().slice(7);
    }, self);

    self.updateFilter = function(data, e) {
        if (self.filter().indexOf(data) === -1) {
            self.filter.push(data);
            e.target.classList.remove('disabled');
        } else {
            self.filter.remove(data);
            e.target.classList.add('disabled');
        }
    };

    self.timeConvert = function(timestamp) {
        var seconds_per_day = 60 * 60 * 24;
        var time = timestamp - tpp_start_time;
        var days = Math.floor(time / seconds_per_day);
        var remainder = Math.floor(time % seconds_per_day);
        var hours = Math.floor(remainder / (60 * 60));
        var remainder = Math.floor(remainder % (60 * 60));
        var minutes = Math.floor(remainder / 60);
        var seconds = Math.floor(remainder % 60);
        return days + "d " + hours + "h " + minutes + "m " + seconds + "s";
    };

    var getUpdates = function() {
        try
        {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/feed.json?i=' + new Date().getTime());
            xhr.onload = function() {
                try {
                    var json = JSON.parse(this.responseText);
                    if (json.version > api_version) {
                        window.location = window.location;
                    }
                    self.updates(json.updates);
                    self.inventory(json.inventory);
                    self.balance(json.balance);
                    self.party(json.party);
                    self.goal(json.goal);
                    self.badges(json.badges);
                    if (self.mapURL() != json.mapURL) {
                        self.mapURL(json.mapURL);
                        var map = document.getElementById('map');
                        if (map) {
                            map.src = map.src;
                        }
                    }
                } catch (e) {
                    self.error("Error getting latest news.");
                }
            };
            xhr.send();
        } catch (ex) { console.log("Error updating: " + ex); }
        setTimeout(getUpdates, update_interval);
    };
    getUpdates();

    var updateTime = function() {
        var date = new Date();
        self.time("Your UTC: " + ("0" + date.getMinutes()).slice(-2) + " :" + ("0" + date.getSeconds()).slice(-2) + " ." + ("0" + Math.floor(date.getMilliseconds() / 10)).slice(-2));
        setTimeout(updateTime, 50);
    };
    updateTime();
    
    return self;
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);
