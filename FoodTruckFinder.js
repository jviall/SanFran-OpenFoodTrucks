const request = require('request');

var app = {};

app.run = function () {
  let date = new Date(),
    time = date.getHours() + ':' + ((date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()),
    day = date.getDay(),
    result;

  request('http://data.sfgov.org/resource/bbb8-hzi6.json?$query=select location, applicant as name where start24 < \'' + time + '\' and end24 > \'' + time + '\' and dayorder=' + day + ' order by name', function (error, response, body) {
    result = JSON.parse(body);
    app.displayOpenTrucks(result);
  });
}

app.displayOpenTrucks = function (data) {
  process.stdout.write('NAME'.padEnd(80) + 'ADDRESS\n-------------------\n');
  data.forEach(truck => {
    process.stdout.write(truck.name.padEnd(80) + truck.location + '\n');
  });
}
app.run();

// to run locally, first install node and npm. then:
// $ npm install request && node FoodTruckFinder.js