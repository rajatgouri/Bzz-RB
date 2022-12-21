import { API_BASE_URL } from "@/config/serverApiConfig";
import io from "socket.io-client";
import { observable, Observable } from 'rxjs'


const socket = io(API_BASE_URL.slice(0,-5), {
  secure: true,
  rejectUnauthorized: false,
});




export const WQ5508Details = new Observable(function subscribe(subscriber) {
  socket.on('WQ5508-fulllist', (value) => {
    subscriber.next(value);
    subscriber.complete()
  })

});



export const WQ1262Details = new Observable(function subscribe(subscriber) {
  socket.on('WQ1262-fulllist', (value) => {
    subscriber.next(value);
    subscriber.complete()
  })

});



export const WQ3177Details = new Observable(function subscribe(subscriber) {
  socket.on('WQ3177-fulllist', (value) => {
    subscriber.next(value);
    subscriber.complete()
  })
});



export const WQ1075ProcessStarted = new Observable(function subscribe(subscriber) {
  socket.on('WQ1075-process-started', (value) => {
    subscriber.next(value);
    subscriber.complete()
  })
});



export const WQ1075ProcessEnded = new Observable(function subscribe(subscriber) {
  socket.on('WQ1075-process-ended', (value) => {
    subscriber.next(value);
    subscriber.complete()
  })
});




export const WQ1262ProcessStarted = new Observable(function subscribe(subscriber) {
  socket.on('WQ1262-process-started', (value) => {
    subscriber.next(value);
    subscriber.complete()
  })
});



export const WQ1262ProcessEnded = new Observable(function subscribe(subscriber) {
  socket.on('WQ1262-process-ended', (value) => {
    subscriber.next(value);
    subscriber.complete()
  })
});

export const WQ5508ProcessStarted = new Observable(function subscribe(subscriber) {
  socket.on('WQ5508-process-started', (value) => {
    subscriber.next(value);
    subscriber.complete()
  })
});



export const WQ5508ProcessEnded = new Observable(function subscribe(subscriber) {
  socket.on('WQ5508-process-ended', (value) => {
    subscriber.next(value);
    subscriber.complete()
  })
});


export const PBAuditData = new Observable(function subscribe(subscriber) {
  socket.on('on-PB-Audit-data', (value) => {
    subscriber.next(value.result);
    subscriber.complete()
  })
});



export const HBAuditData = new Observable(function subscribe(subscriber) {
  socket.on('on-HB-Audit-data', (value) => {
    subscriber.next(value.result);
    subscriber.complete()
  })
});



export const WQ1075Details = new Observable(function subscribe(subscriber) {
socket.on('WQ1075-fulllist', (value) => {
  subscriber.next(value);
  subscriber.complete()
})

});

export default socket
