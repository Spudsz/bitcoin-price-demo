'use strict';

/**
 * @ngdoc function
 * @name bitcoin-price-demo.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the bitcoin-price-demo
 */
var myapp = angular.module('bitcoin-price-demo');
myapp.controller('MainCtrl', function ($scope, $filter, $resource, $log) {

  $scope.currencies = [{code:'',name:'Loading -'}];
  $scope.topCurrencies = [{code:'AUD'},{code:'USD'},{code:'EUR'},{code:'GBP'},{code:'JPY'},{code:'CAD'},{code:'CNY'}];
  $scope.selectedCurrencyCode = $scope.topCurrencies[0].code;
  $scope.btcPrice = '';
  $scope.graphLoading = true;

  // CurrencyCode Dropdown
  $scope.getCurrencies = function() {

    var res = $resource('https://bitpay.com/currencies');
    res.get('', function(bitpay){
      // Server Returns:
      // { data: [ { code: "BTC", symbol: "฿", precision: 6, exchangePctFee: 200, payoutEnabled: true, name: "Bitcoin", plural: "Bitcoin", alts: "btc", minimum: 0.000006, payoutFields: [ "bitcoinAddress" ] }, ...
      $log.log('Currencies: ', bitpay.data[0].code); // debug

      bitpay.data.splice(0, 1); // Remove first element, is always BTC

      // Find all $scope.topCurrencies in bitpay.data and remove them
      // Loop bitpay.data once - larger array
      for (var i = 0; i < bitpay.data.length; i++) {
        // $log.log('Loop: ', i, bitpay.data[i].code); // debug

        // Loop $scope.topCurrencies multiple times - smaller array
        for (var j = 0; j < $scope.topCurrencies.length; j++) {
          if (bitpay.data[i].code === $scope.topCurrencies[j].code) {
            $log.log('GOTCHA!',i,$scope.topCurrencies[j].code); // debug
            $scope.topCurrencies[j] = bitpay.data[i]; // Save full object
            bitpay.data.splice(i,1); // Remove
            i--;
          }  
        }
      }

      // Join arrays so we get $scope.topCurencies at the top
      $scope.currencies = $scope.topCurrencies.concat(bitpay.data);

      // Force the inital load order.
      // Only call getBitcoinPrice once we have populated the 
      // $scope.currencies array so we can get the currency symbol
      $scope.getBitcoinPrice($scope.currencies[0]);

      // Force the inital load order.
      // Render the Bitcoin Graph
      $scope.getBitcoinGraph($scope.currencies[0].code);
    });
  };

  // Get and display Bitcoin price
  $scope.getBitcoinPrice = function(selectedCurrency) {
    $scope.btcPrice = '';
    $scope.selectedCurrencyCode = selectedCurrency.code;

    if (selectedCurrency !== undefined) {
      // Server Returns:
      // { data: { code: "GBP", name: "Pound Sterling", rate: 150.032822 } }
      var res = $resource('https://bitpay.com/rates/:code');
      res.get({code:selectedCurrency.code}, function(bitpay){
        $scope.btcPrice = $filter('currency')(bitpay.data.rate, selectedCurrency.symbol, 2);
      });
    }
  };

  // CurrencyCode Dropdown - click
  $scope.dropdownClick = function(index) {
    $scope.getBitcoinPrice($scope.currencies[index]);
    $scope.getBitcoinGraph($scope.currencies[index].code);
  };

  // Get and display Bitcoin Graph
  $scope.getBitcoinGraph = function(currencyCode) {
    $scope.graphLoading = true;

    $scope.graphOptions = {
        chart: {
            type: 'lineChart',
            interpolate: 'step',
            showLegend: false,
            showMaxMin: false,
            useInteractiveGuideline: true,
            transitionDuration: 300,
            showValues: false,
            height: 300,
            x: function(d){ return d.x; },
            y: function(d){ return d.y.toFixed(2); },
            xAxis: {
              showMaxMin: false,
              tickFormat: function(d){
                return $filter('date')(d,'dd-MM-yy');
              },
              tickPadding: 15
            },
            yAxis: {
              showMaxMin: false,
              tickPadding: 10
            }
        }
    };

    var res = $resource('https://api.coindesk.com/v1/bpi/historical/close.json?currency=:code');
    res.get({code:currencyCode}, function(coindesk){
      // Server Returns: 
      // {
      //   bpi: {
      //   2015-03-26: 247.648,
      //   ...
      //   2015-04-25: 225.8529
      //   },
      //   disclaimer: "This data was produced from the CoinDesk Bitcoin Price Index. BPI value data returned as USD.",
      //   time: {
      //     updated: "Apr 26, 2015 00:03:00 UTC",
      //     updatedISO: "2015-04-26T00:03:00+00:00"
      //   }
      // }
      $log.log('Coindesk: ',coindesk.bpi);

      var tmpArray = [];
      angular.forEach(coindesk.bpi, function(value,key) {
        tmpArray.push({x: Date.parse(key), y: value});
      });
      $log.log('tmpArray: ', tmpArray);
      
      $scope.graphData = [{
        values: tmpArray,
        key: currencyCode
      }];

      $scope.graphLoading = false;
    });
  };

  // Go!
  $scope.getCurrencies();

 });
