/**
  This script follows the quick start guide at https://www.marqeta.com/api/guides/WIlA2isAAMkAsk6F/quick-start---marqeta-api for a lot of the values
**/

// Because I'm lazy and don't want to generate it every time
const authHeader = 'Basic dXNlcjI3NTgxNTE5MzQ0MDU2Ojg4OTAxMTViLTdiOGUtNDRiOC05Mjc0LWI2ZjRlMGQzZmFlZA==';

// Dumb way of storing values. Will need to be a secure database eventually
var cardProduct;
var fundingSource;
var user;
var card;
var accountBalance = 0;

(function($) {

// The random number is so I can see if the page refreshes correctly or not
  console.log('Starting! ' + Math.random());

  const cardProductTemplate = {
    'start_date': '2017-01-01',
    'name': 'Example Card Product',
    'config': {
      'fulfillment': {
        'payment_instrument':'VIRTUAL_PAN'
       },
      'poi': {
        'ecommerce': true
      },
      'card_life_cycle': {
        'activate_upon_issue': true
      }
    }
  };

  const fundingSourceTemplate = {
    'name': 'Program Funding'
  };

  $(document).ready(function() {
    console.log('Document ready');

    $('#product-button').click(function() {
      console.log('#product-button clicked!');
      $.ajax({
        url: 'https://shared-sandbox-api.marqeta.com/v3/cardproducts',
        type: 'post',
        data: JSON.stringify(cardProductTemplate),
        headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json',
             'Authorization': authHeader
         },
         dataType: 'json',
         success: function (data) {
           console.log(data);
           cardProduct = data;
           $('#product-token').text('Card product token: ' + cardProduct.token);
         }
      });
    });

    $('#funding-button').click(function() {
      console.log('#funding-button clicked!');
      $.ajax({
        url: 'https://shared-sandbox-api.marqeta.com/v3/fundingsources/program',
        type: 'post',
        data: JSON.stringify(fundingSourceTemplate),
        headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json',
             'Authorization': authHeader
         },
         dataType: 'json',
         success: function (data) {
           console.log(data);
           fundingSource = data;
           $('#funding-token').text('Funding source token: ' + fundingSource.token);
         }
      });
    });

    $('#user-button').click(function() {
      console.log('#user-button clicked!');
      $.ajax({
        url: 'https://shared-sandbox-api.marqeta.com/v3/users',
        type: 'post',
        data: '{}',
        headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json',
             'Authorization': authHeader
         },
         dataType: 'json',
         success: function (data) {
           console.log(data);
           user = data;
           $('#user-token').text('User token: ' + user.token);
         }
      });
    });

    $('#card-button').click(function() {
      console.log('#card-button clicked!');
      let cardTemplate = {
        user_token: user.token,
        card_product_token: cardProduct.token
      };
      $.ajax({
        url: 'https://shared-sandbox-api.marqeta.com/v3/cards',
        type: 'post',
        data: JSON.stringify(cardTemplate),
        headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json',
             'Authorization': authHeader
         },
         dataType: 'json',
         success: function (data) {
           console.log(data);
           card = data;
           $('#card-token').text('Card token: ' + card.token);
         }
      });
    });

// Maintains an estimate of how much money is on the card. Should replace with a query to balance
    function updateBalance() {
      $.ajax({
        url: 'https://shared-sandbox-api.marqeta.com/v3/balances/' + user.token,
        type: 'get',
        headers: {
             'Accept': 'application/json',
             'Authorization': authHeader
         },
         dataType: 'json',
         success: function (data) {
           console.log(data);
           let gpa = data.gpa;
           $('#balance').text("The user's balance is: " + gpa.ledger_balance + ' and available balance is: ' + gpa.available_balance);
         }
      });
    }

    $('#fund-button').click(function() {
      console.log('button clicked!');
      let template = {
        user_token: user.token,
        amount: 100,
        currency_code: 'USD',
        funding_source_token: fundingSource.token
      };
      $.ajax({
        url: 'https://shared-sandbox-api.marqeta.com/v3/gpaorders',
        type: 'post',
        data: JSON.stringify(template),
        headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json',
             'Authorization': authHeader
         },
         dataType: 'json',
         success: function (data) {
           console.log(data);
           updateBalance();
         }
      });
    });

    $('#transact-button').click(function() {
      console.log('button clicked!');
      let template = {
        card_token: card.token,
        amount: 10,
        mid: '123456890'
      };
      $.ajax({
        url: 'https://shared-sandbox-api.marqeta.com/v3/simulate/authorization',
        type: 'post',
        data: JSON.stringify(template),
        headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json',
             'Authorization': authHeader
         },
         dataType: 'json',
         success: function (data) {
           console.log(data);
           updateBalance();
           let transaction = data.transaction;
           if(transaction.state == 'DECLINED') {
             alert(transaction.response.memo);
           }
         }
      });
    });

    $('#balances-button').click(function() {
      console.log('button clicked!');
      updateBalance();
    });
  });
})(jQuery);
