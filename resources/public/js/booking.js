(function () {
    var csrfToken = document.querySelector("meta[name=csrf-token]");
    if (csrfToken) {
        var CSRF_TOKEN = csrfToken.getAttribute("content");
    } else {
        throw new Error("Unable to find CSRF token");
    }

    function http(method, path, body) {
        var deferred = when.defer();

        var xhr = new XMLHttpRequest();
        xhr.open(method, path, true);
        xhr.setRequestHeader("X-CSRF-Token", CSRF_TOKEN);
        xhr.onload = function () {
            var status = xhr.status;
            console.log("Content-Type", xhr.getResponseHeader("Content-Type"));
            if (status >= 200 && status < 300) {
                deferred.resolve(xhr.responseText);
            } else {
                deferred.reject({status: status, body: xhr.responseText, xhr: xhr});
            }
        };
        if (body) {
            xhr.send(JSON.stringify(body));
        } else {
            xhr.send();
        }

        return deferred.promise;
    }

    var apiUtils = {
        createBooking: function (from, to) {
            return http("POST", "/api/bookings", {from: from, to: to});
        }
    };

    var fluxStore = BOOKING_STORE_FACTORY();
    var fluxActions = BOOKING_ACTIONS_FACTORY(fluxStore, apiUtils);

    var bookingAppInst = React.render(
        BOOKING_COMPONENTS.BookingApp({
            fluxActions: fluxActions,
            fluxStore: fluxStore
        }),
        document.getElementById("booking-app"));

    fluxStore.setBookingAppInst(bookingAppInst);
}());
