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
        $log.log('Loop: ', i, bitpay.data[i].code); // debug

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

      // Force the inital load order. Only call getBitcoinPrice once we have 
      // populated the $scope.currencies array so we can get the currency symbol
      $scope.getBitcoinPrice($scope.currencies[0]);
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

  $scope.dropdownClick = function(index) {
    $scope.getBitcoinPrice($scope.currencies[index]);
  };

  // Go!
  $scope.getCurrencies();

 });
