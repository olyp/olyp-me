(function () {
    var csrfToken = document.querySelector("meta[name=csrf-token]");
    if (csrfToken) {
        var CSRF_TOKEN = csrfToken.getAttribute("content");
    } else {
        throw new Error("Unable to find CSRF token");
    }

    var http = OLYP_HTTP_FACTORY(CSRF_TOKEN)

    var apiUtils = {
        createBooking: function (payload) {
            return http("POST", "/api/bookings", payload);
        },

        getBookings: function (bookableRoomId, day) {
            return http("GET", "/api/bookable_rooms/" + bookableRoomId + "/bookings/" + day.format("DD.MM.YYYY"));
        },

        deleteBooking: function (bookingId) {
            return http("DELETE", "/api/bookings/" + bookingId);
        }
    };

    http("GET", "/api/bookable_room").then(
        function (bookableRoom) {
            var fluxStore = BOOKING_STORE_FACTORY(bookableRoom, CURRENT_USER_ID);
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
