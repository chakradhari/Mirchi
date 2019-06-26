var sannamObj = {};
var tejaObj = {};
var byadgiObj = {};
var threeFourtyOneobj = {};
var no5Obj = {};
var devanurObj = {};

function makeApiCall() {
  var params = {
    // The ID of the spreadsheet to retrieve data from.
    spreadsheetId: "1dwhlEIQ_H0NcAIT-SSg1sM_ZpsT2KZNUvc2fqWI9lYU", // TODO: Update placeholder value.

    // The A1 notation of the values to retrieve.
    ranges: ['Daily Snapshot', 'Consolidated Prices', '334/Sannam', 'Teja', 'Byadgi', '341', 'No 5', 'Devanur Deluxe'],
    majorDimension: "COLUMNS"
    
    // TODO: Update placeholder value.

    // majorDimension: "ROWS"
    // How values should be represented in the output.
    // The default render option is ValueRenderOption.FORMATTED_VALUE.
    // valueRenderOption: "", // TODO: Update placeholder value.

    // How dates, times, and durations should be represented in the output.
    // This is ignored if value_render_option is
    // FORMATTED_VALUE.
    // The default dateTime render option is [DateTimeRenderOption.SERIAL_NUMBER].
    // dateTimeRenderOption: "" // TODO: Update placeholder value.
  };

  var request = gapi.client.sheets.spreadsheets.values.batchGet(params);
  request.then(
    function(response) {
      // TODO: Change code below to process the `response` object:
      updateDailyInFlow(response.result.valueRanges[0].values);
      updateDailyArrivalsIndividualFields(response.result.valueRanges[1].values)
      sannamObj = response.result.valueRanges[2];
      tejaObj = response.result.valueRanges[3];
      byadgiObj = response.result.valueRanges[4];
      threeFourtyOneobj = response.result.valueRanges[5];
      no5Obj = response.result.valueRanges[6];
      devanurObj = response.result.valueRanges[7];
      initializeChart();
    },
    function(reason) {
      console.error("error: " + reason.result.error.message);
    }
  );
}

function updateDailyArrivalsIndividualFields(fields) {
  var dateArray = fields[0];

      var index = 0;

      for(let i=1; i < dateArray.length; i++) {
        if(new Date().setHours(0, 0, 0, 0) == new Date(dateArray[i]).setHours(0, 0, 0, 0)) {
            index = i;
        }
      }

      var table = document.getElementById('dailyRatesTable');
      if(index) {
        var cellBuffer = 1;
        var rowBuffer = 1;
        fields.forEach((value, i) => {
          
          if(i == 0) {
            return;
          }
          
          value.forEach((val, i) => {
            if(rowBuffer == 5) {
              rowBuffer = 1;
              cellBuffer++;
            }
            if(i == index) {
              table.rows[rowBuffer].cells[cellBuffer].innerHTML = val;
              rowBuffer++;
            }
          })
        });
      }
}

function updateDailyInFlow(fields) {
  var dateArray = fields[0];

  var index = 0;

  for(let i=1; i < dateArray.length; i++) {
    if(new Date().setHours(0, 0, 0, 0) == new Date(dateArray[i]).setHours(0, 0, 0, 0)) {
        index = i;
    }
  }
  console.log(index)
  var table = document.getElementById('OverAllInFlow');
  if(index) {
    var rowBuffer = 0;
    fields.forEach((value, i) => {
      if(i == 0) {
        return;
      }
      value.forEach((val, i) => {
        if(i == index) {
          table.rows[rowBuffer].cells[1].innerHTML = val;
          rowBuffer++;
        }
      })
    });
  }
}

function initClient() {
  var API_KEY = "AIzaSyBshQgbcousVir0__rUic0Bj1Ei6XYuKrE"; // TODO: Update placeholder with desired API key.

  var CLIENT_ID =
    "630686695251-oh60qp0scjcee56rqsnvmf7n5flpjhu8.apps.googleusercontent.com"; // TODO: Update placeholder with desired client ID.

  // TODO: Authorize using one of the following scopes:
  //   'https://www.googleapis.com/auth/drive'
  //   'https://www.googleapis.com/auth/drive.file'
  //   'https://www.googleapis.com/auth/drive.readonly'
  //   'https://www.googleapis.com/auth/spreadsheets'
  //   'https://www.googleapis.com/auth/spreadsheets.readonly'
  var SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: SCOPE,
      discoveryDocs: [
        "https://sheets.googleapis.com/$discovery/rest?version=v4"
      ]
    })
    .then(function() {
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
      updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

function updateSignInStatus(isSignedIn) {
  if (isSignedIn) {
    makeApiCall();
  }
}

function initializeChart() {
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawCharts);
}

function getModifiedArray(fields) {
  var values = fields;
  
  var modifiedArray = [];
  modifiedArray.push([
        "Date",
        "Medium",
        "Medium Best",
        "Best",
        "Deluxe"
      ]);
  var buffer = 1;
  
  for (var i = 1; i < values[0].length; i++) {
    
    var arr = [];
    
    values.forEach(function(value, index) {
      if (index == 0) {
        arr.push(value[buffer]);
        return;
      }
      arr.push(parseInt(value[buffer]));
    });
    
    buffer++;
    modifiedArray.push(arr);
  }
  
  return modifiedArray;
}

function drawCharts() {
  drawChart(sannamObj.values, '334/Sannam Chart', 'sannam_graph');
  drawChart(tejaObj.values, 'Teja Chart', 'teja_graph');
  drawChart(byadgiObj.values, 'Byadgi Chart', 'byadgi_graph');
  drawChart(threeFourtyOneobj.values, '341 Chart', '341_graph');
  drawChart(no5Obj.values, 'No 5 Chart', 'no5_graph');
  drawChart(devanurObj.values, 'Devanur Chart', 'denvar');
}

function drawChart(fields, title, id) {
  
  // Create the data table.
  var getUpdatedInfo = getModifiedArray(fields);
  var data = google.visualization.arrayToDataTable(getUpdatedInfo);

  var options = {
    title: title,
    curveType: 'function',
    legend: {
      position: 'bottom'
    }
  };

  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.LineChart(document.getElementById(id));
  chart.draw(data, options);
}

/*
      // Logic for consolidated prices.

      var dateArray = response.result.values[0];

      var index = 0;

      for(let i=1; i < dateArray.length; i++) {
        if(new Date().setHours(0, 0, 0, 0) == new Date(dateArray[i]).setHours(0, 0, 0, 0)) {
            index = i;
        }
      }

      var table = document.getElementById('dailyRatesTable');
      if(index) {
        var cellBuffer = 1;
        var rowBuffer = 1;
        response.result.values.forEach((value, i) => {
          
          if(i == 0) {
            return;
          }
          
          value.forEach((val, i) => {
            if(rowBuffer == 5) {
              rowBuffer = 1;
              cellBuffer++;
            }
            if(i == index) {
              table.rows[rowBuffer].cells[cellBuffer].innerHTML = val;
              rowBuffer++;
            }
          })
        });
      }
      */


      /*
      // Small table Market Arrivals

      var dateArray = response.result.values[0];

      var index = 0;

      for(let i=1; i < dateArray.length; i++) {
        if(new Date().setHours(0, 0, 0, 0) == new Date(dateArray[i]).setHours(0, 0, 0, 0)) {
            index = i;
        }
      }
      console.log(index)
      var table = document.getElementById('OverAllInFlow');
      if(index) {
        var rowBuffer = 0;
        response.result.values.forEach((value, i) => {
          if(i == 0) {
            return;
          }
          value.forEach((val, i) => {
            if(i == index) {
              table.rows[rowBuffer].cells[1].innerHTML = val;
              rowBuffer++;
            }
          })
        });
      }
      */