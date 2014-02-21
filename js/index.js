var tpp_start_time = 1392254573;
var update_interval = 10000;
var api_version = 1;

function ViewModel() {
    var self = this;

    self.filter_options = ko.observable(['Travel', 'Roster', 'Inventory', 'Battle', 'Meta']);
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

    self.updateFilter = function(data, e) {
        if (self.filter().indexOf(data) === -1) {
            self.filter.push(data);
            e.target.classList.remove('disabled');
        } else {
            self.filter.remove(data);
            e.target.classList.add('disabled');
        }
    };

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
                self.inventory(json.inventory);
                self.balance(json.balance);
                self.party(json.party);
                self.goal(json.goal);
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
