(function (GLOBAL) {
    function getValidationErrorFromRes(res) {
        if (res.body) {
            return res.body;
        } else {
            return "An unknown error occurred with response code " + res.status;
        }
    }

    function bookingActionsFactory(fluxStore, apiUtils) {
        function fetchReservations() {
            var day = fluxStore.getDay();
            apiUtils.getReservations(fluxStore.getReservableRoom().id, day).then(
                function (res) {
                    fluxStore.setReservationsForDay(day, res);
                },
                function (e) {
                    alert("An unknown error occurred: " + JSON.stringify(e));
                });
        }

        fetchReservations();

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
                    reservable_room_id: fluxStore.getReservableRoom().id
                }

                apiUtils.createBooking(payload).then(
                    function () {
                        fluxStore.clearValidationError();
                        fetchReservations();
                        // TODO: Reset form
                    },
                    function (res) {
                        fluxStore.setValidationError(getValidationErrorFromRes(res));
                    }
                );
            },

            moveToPreviousWeek: function () {
                fluxStore.changeWeek(-1);
                fetchReservations();
            },

            moveToNextWeek: function () {
                fluxStore.changeWeek(1);
                fetchReservations();
            },

            deleteBooking: function (reservation) {
                if (confirm("Are you sure you want to delete this booking?")) {
                    apiUtils.deleteBooking(reservation.booking.id).then(
                        function () {
                            fetchReservations();
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
