(function (GLOBAL) {
    function getValidationErrorFromRes(res) {
        if (res.body) {
            return res.body;
        } else {
            return "An unknown error occurred with response code " + res.status;
        }
    }

    function bookingActionsFactory(fluxStore, apiUtils) {
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

                apiUtils.createBooking(fromDate.toISOString(), toDate.toISOString()).then(
                    function () {
                        fluxStore.clearValidationError();
                        // TODO: Update grid
                    },
                    function (res) {
                        fluxStore.setValidationError(getValidationErrorFromRes(res));
                    }
                );
            }
        };

    }

    GLOBAL.BOOKING_ACTIONS_FACTORY = bookingActionsFactory;
}(this));