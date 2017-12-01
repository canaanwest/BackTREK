// Vendor Modules
import 'jquery-modal'
import $ from 'jquery';
import _ from 'underscore';

// CSS
import './css/foundation.css';
import './css/style.css';

import Trip from './app/models/trip';
import TripList from './app/collections/trip_list';
import Reservation from './app/models/reservation';

console.log('it loaded!');

const tripList = new TripList();

const render = function(tripList) {
  const tripTemplate = _.template($('#trip-template').html());
  const $tripList = $('#trip-list');
  $tripList.empty();
  tripList.forEach((trip) => {
    $tripList.append($(tripTemplate(trip.attributes)).attr('id', `${trip.id}`));
  })
}

const reservationFields = ['name', 'age', 'email']
const tripFields = ['name', 'continent', 'about', 'weeks', 'cost', 'category'];
const events = {
  addTrip(event) {
    console.log("I want to make a new trip");
    event.preventDefault();
    const tripData = {};
    tripFields.forEach((field) => {
      const value = $(`#newTripForm input[name=${field}]`).val();
      if (value !== "") {
        tripData[field] = value
      }
    });
    const trip = new Trip(tripData);

    if (trip.isValid()){
      console.log("SUCCESSSSSSS")
      console.log();
      trip.save({}, {
        success: events.successfulSave,
        error: events.failedSave,
      });

    } else {
      console.log("What's on book is invalid on the client side")
      console.log(trip)
    }
  },
  successfulSave(trip, response) {
    console.log("Successful Save!")
    // $('#status-messages ul').empty();
    // $('#status-messages ul').append(`<li>${trip.get('title')} added!!!!!!!!!!!!!!!!</li>`)
    // $('#status-messages').show();
    //clear form after execution has happened
  },

  failedSave(trip, response){
    console.log("Failed Save");
    console.log(response);
    // for (let key in response.responseJSON.errors) {
    //   response.responseJSON.errors[key].forEach((error) => {
    //     $('#status-messages ul').append(`<li>${key}: ${error}</li>`)
    //   })
    // }
    // $('#status-messages').show()
    trip.destroy();
  },
}

$(document).ready( () => {
  $('#newTripForm').hide();
  $('#bookingForm').hide();
  $('#all-trips').hide();
  tripList.on('update', render, tripList);
  tripList.fetch();

  $('#show-all').on('focus', function(){
    $('#trip-description').empty();
    $('#newTripForm').hide()
    $('#all-trips').show();
  });

  $('#trip-list').on('click', 'tr', function(){
    $('#trip-description').empty();
    const tripTemplate = _.template($('#description-template').html());
    const trip = new Trip(this);
    trip.fetch({}, ).done(() => {$('#trip-description').html($(tripTemplate(trip.attributes)))});

    $('#bookingForm form').remove('action');
    $('#bookingForm form').attr('action', `https://ada-backtrek-api.herokuapp.com/trips/${trip.id}/reservations`);

    $('#bookingForm').show();
  });

  const $bookingForm = $('#bookingForm form')
  $bookingForm.submit(function(event){
    event.preventDefault()
    const formData = $(this).serialize();

    $.post($bookingForm.attr('action'), formData, (response)=>{
      $('#trips').html(`Booked your trip!`)
      console.log("BOOKED IT!")

    }).fail(() => {
      $('#trips').html('<p>Booking Trip Failed</p>')
    }).always(()=> {
      console.log("You did something with a reservation form!")
    })
  });

  $('#new-trip').on('focus', function(){
    $('#newTripForm').modal();
    $('#newTripForm').submit(function(event) {


      events.addTrip(event)
      $.modal.close();
      tripList.fetch();
    });

    // $('#newTripForm').show();
  });



});
