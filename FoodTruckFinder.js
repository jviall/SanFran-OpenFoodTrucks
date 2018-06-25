const request = require('request');

let app = {};

  /**
   * Database Request
   * SoQL: Select Location and Name (applicant) from rows where
   * today's time is after their open time and before their close time
   * order by name, alpha-numerically  
   */
app.run = function () {
  let date = new Date(),
    time = date.getHours() + ':' + ((date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()),
    day = date.getDay(),
    DoW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    results;

  request('http://data.sfgov.org/resource/bbb8-hzi6.json?$query=select location, applicant as name where start24 < \'' + time + '\' and end24 > \'' + time + '\' and dayorder=' + day + ' order by name', function (error, response, body) {
    try {
      results = JSON.parse(body); // throws syntax error

      if(results.length === 0 || !results.length){// empty query
        process.stdout.write("\nNo food trucks are open at this time, exiting.\n");
        process.exit();
      }
      process.stdout.write('Displaying Food Trucks open at ' + time + ' on ' + DoW[day] + '. (' + results.length + ' total)\n');
      app.displayOpenTrucks(results);
    }catch(e){
      console.log(e + "\nAn error occurred--exiting.");
      process.exit(1);
    }
  });
}

/**
 * Makes the first call to printPage(), handles the command line input, and
 * calls printPage() or exits depending on user input of yes/no.
 * @param data -- the array of food truck "objects"
 */
app.displayOpenTrucks = function (data) {
  let offset = 0;
  app.printPage(offset, data);

  process.stdin.setEncoding('utf8');
  process.stdout.write('\nDisplay more trucks? (yes/no) >> ');

  // CL input listener
  process.stdin.on('data', function (input) {
    input = input.toString().trim().toLowerCase();
    process.stdin.pause();

    if (input === 'no' || input === 'n') {
      process.stdout.write('Exiting');
      process.exit();
    }
    else if (input === 'yes' || input === 'y') {
      app.printPage(++offset, data);
    }
    process.stdout.write('\nDisplay more trucks? (yes/no) >> ');
    process.stdin.resume();
  });
}

/**
 * Prints 1 page of up to 10 Food trucks' name and location. Exits the
 * program if no more trucks are left.
 * @param offset -- page offset for the data array 
 * @param data -- the array of food truck "objects"
 */
app.printPage = function (offset, data) {
  for (let i = 0; i < 10; i++) {
    let index = offset * 10 + i;
    if (!data[index]) { // next index is undefined
      process.stdout.write('\nNo more results--exiting.');
      process.exit();
    }
    if (i === 0) process.stdout.write('NAME'.padEnd(80) + 'ADDRESS\n'.padEnd(95, '-') + '\n');
    process.stdout.write(data[index].name.padEnd(80) + data[index].location + '\n');
  }
  // no point in prompting user if no trucks are left to print.
  if (!data[offset*10 + 10]) { 
    process.stdout.write('\nNo more results--exiting.');
    process.exit();
  }
}

app.run();

// to run locally, first install node and npm. then:
// $ npm install request && node FoodTruckFinder.js