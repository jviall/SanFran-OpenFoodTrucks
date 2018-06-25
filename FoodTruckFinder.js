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
  let offset = 0;
  app.printMoreTrucks(offset, data);

  process.stdin.setEncoding('utf8');
  process.stdout.write('Display more trucks? (yes/no) >> ');

  // command line input
  process.stdin.on('data', function (input) {
    input = input.toString().trim().toLowerCase();
    process.stdin.pause();
    if (input === 'no' || input === 'n') {
      process.stdout.write('Exiting\n');
      process.exit();
    }
    else if (input === 'yes' || input === 'y') {
      app.printMoreTrucks(++offset, data);
    }
    process.stdout.write('Display more trucks? (yes/no) >> ');
    process.stdin.resume();
  });
}

app.printMoreTrucks = function (offset, data) {
  for (let i = 0; i < 10; i++) {
    let index = offset * 10 + i;
    if (!data[index]) {
      process.stdout.write('No more results, exiting.\n');
      process.exit();
    }
    if (i === 0) process.stdout.write('NAME'.padEnd(80) + 'ADDRESS\n-------------------\n');
    process.stdout.write(data[index].name.padEnd(80) + data[index].location + '\n');
  }
}

app.run();

// to run locally, first install node and npm. then:
// $ npm install request && node FoodTruckFinder.js