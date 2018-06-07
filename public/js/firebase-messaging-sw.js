importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
var config = {
  apiKey: "BFIbHAEqALswOooz8VyDBuDqNETU3nEfB5SuRd9qw7NpC-_hto-6Q261FIOtZ8k8SMLNOySqvp9ubywjwgUUjIk",
  authDomain: "concierge-audi.firebaseapp.com",
  databaseURL: "https://concierge-audi.firebaseio.com",
  projectId: "concierge-audi",
  storageBucket: "concierge-audi.appspot.com",
  messagingSenderId: "831682357807"
};
firebase.initializeApp(config);

const messaging =firebase.messaging();
