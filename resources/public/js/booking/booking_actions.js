(function (GLOBAL) {
    function getValidationErrorFromRes(res) {
        if (res.body) {
            return res.body;
        } else {
            return "An unknown error occurred with response code " + res.status;
        }
    }

    function bookingActionsFactory(fluxStore, apiUtils) {
        function fetchBookings() {
            var day = fluxStore.getDay();
            apiUtils.getBookings(fluxStore.getBookableRoom().id, day).then(
                function (res) {
                    fluxStore.setBookingsForDay(day, res);
                },
                function (e) {
                    alert("An unknown error occurred: " + JSON.stringify(e));
                });
        }

        fetchBookings();

        return {
            setBookingFormDateTimeFields: function (which, getter) {
                if (which === "from") {
                    fluxStore.setFromDateTimeFieldGetter(getter);
                    return;
                }

                if (which === "to") {
                    fluxStore.setToDateTimeFieldGetter(getter);
                    return;
                }

                throw new Error("Unknown date time field " + which);
            },

            submitBookingForm: function () {
                var dates = fluxStore.getFromToDates();
                var fromDate = dates[0]
                var toDate = dates[1];

                var payload = {
                    from: fromDate.toISOString(),
                    to: toDate.toISOString(),
                    bookable_room_id: fluxStore.getBookableRoom().id
                }

                apiUtils.createBooking(payload).then(
                    function () {
                        fluxStore.clearValidationError();
                        fetchBookings();
                        // TODO: Reset form
                    },
                    function (res) {
                        fluxStore.setValidationError(getValidationErrorFromRes(res));
                    }
                );
            },

            moveToPreviousWeek: function () {
                fluxStore.changeWeek(-1);
                fetchBookings();
            },

            moveToNextWeek: function () {
                fluxStore.changeWeek(1);
                fetchBookings();
            },

            deleteBooking: function (booking) {
                if (confirm("Are you sure you want to delete this booking?")) {
                    apiUtils.deleteBooking(booking.id).then(
                        function () {
                            fetchBookings();
                        },
                        function (e) {
                            alert("An unknown error occurred: " + JSON.stringify(e));
                        }
                    )
                }
            }
        };

    }

    GLOBAL.BOOKING_ACTIONS_FACTORY = bookingActionsFactory;
}(this));
