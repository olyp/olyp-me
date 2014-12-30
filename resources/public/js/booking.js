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
            if (status >= 200 && status < 300) {
                var contentType = xhr.getResponseHeader("Content-Type");
                if (contentType && contentType.indexOf("application/json") === 0) {
                    deferred.resolve(JSON.parse(xhr.responseText));
                } else {
                    deferred.resolve(xhr.responseText);
                }
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


    http("GET", "/api/bookable_room").then(
        function (bookableRoom) {
            var initialData = {
                bookableRoom: bookableRoom
            };

            var fluxStore = BOOKING_STORE_FACTORY(initialData);
            var fluxActions = BOOKING_ACTIONS_FACTORY(fluxStore, apiUtils);

            var bookingAppInst = React.render(
                BOOKING_COMPONENTS.BookingApp({
                    fluxActions: fluxActions,
                    fluxStore: fluxStore
                }),
                document.getElementById("booking-app"));

            fluxStore.setBookingAppInst(bookingAppInst);
        },
        function (err) {
            alert("An unknown error occurred! " + JSON.stringify(err));
        }
    );
}());
