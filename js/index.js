var tpp_start_time = 1392254634220;
var update_interval = 3000;
var api_version = 1;

function ViewModel() {
    var self = this;

    self.filter = ko.observable(['Travel', 'Roster', 'Inventory', 'Battles', 'Meta']);
    self.error = ko.observable(null);
    self.updates = ko.observableArray();

    self.filtered = ko.computed(function() {
        var result = [];
        var updates = self.updates();
        for (var i = 0; i < updates.length; i++) {
            if (self.filter().indexOf(updates[i].category) !== -1) {
                result.push(updates[i]);
            }
        }
        return result;
    }, self);

    self.recentUpdates = ko.computed(function() {
        return self.filtered().slice(0, 5);
    }, self);

    self.oldUpdates = ko.computed(function() {
        return self.filtered().slice(5);
    }, self);

    var getUpdates = function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/feed.json');
        xhr.onload = function() {
            try {
                var json = JSON.parse(this.responseText);
                if (json.version > api_version) {
                    window.location = window.location;
                }
                self.updates(json.updates);
            } catch (e) {
                self.error("Error getting latest news.");
            }
        };
        xhr.send();
    };
    getUpdates();
    setInterval(getUpdates, update_interval);
    
    return self;
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);
