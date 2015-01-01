(function (GLOBAL) {
    function getValidationErrorFromRes(res) {
        if (res.body) {
            return res.body;
        } else {
            return "An unknown error occurred with response code " + res.status;
        }
    }

    function bookingActionsFactory(fluxStore, apiUtils) {
        function fetchBookings(day) {
            apiUtils.getBookings(fluxStore.getBookableRoom().id, day).then(
                function (res) {
                    console.log(res);
                    // fluxStore.setBookingsForDay();
                },
                function (e) {
                    alert("An unknown error occurred: " + JSON.stringify(e));
                });
        }

        fetchBookings(fluxStore.getDay());

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
                        // TODO: Update grid
                        // TODO: Reset form
                    },
                    function (res) {
                        fluxStore.setValidationError(getValidationErrorFromRes(res));
                    }
                );
            },

            moveToPreviousWeek: function () {
                fluxStore.changeWeek(-1);
                fetchBookings(fluxStore.getDay());
            },

            moveToNextWeek: function () {
                fluxStore.changeWeek(1);
                fetchBookings(fluxStore.getDay());
            }
        };

    }

    GLOBAL.BOOKING_ACTIONS_FACTORY = bookingActionsFactory;
}(this));
