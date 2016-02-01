(function () {
    var csrfToken = document.querySelector("meta[name=csrf-token]");
    if (csrfToken) {
        var CSRF_TOKEN = csrfToken.getAttribute("content");
    } else {
        throw new Error("Unable to find CSRF token");
    }

    var http = OLYP_HTTP_FACTORY(CSRF_TOKEN);

    function getDaysForBaseDay(baseDay) {
        return mori.vector(
            baseDay.clone().valueOf(),
            baseDay.clone().day(2).valueOf(),
            baseDay.clone().day(3).valueOf(),
            baseDay.clone().day(4).valueOf(),
            baseDay.clone().day(5).valueOf(),
            baseDay.clone().day(6).valueOf(),
            baseDay.clone().day(7).valueOf())
    }

    function createCalendarForBaseDay(baseDay) {
        return mori.hashMap(
            "baseDay", baseDay.valueOf(),
            "days", getDaysForBaseDay(baseDay));
    }

    function createBookingForm() {
        return mori.hashMap(
            "from", moment().hour(14).minute(0).valueOf(),
            "to", moment().hour(15).minute(0).valueOf(),
            "comment", "")
    }

    function updateBookingFormFrom(bookingForm, fromVal) {
        bookingForm = mori.assoc(bookingForm, "from", fromVal);

        var toVal = mori.get(bookingForm, "to");
        var newMinToVal = moment(fromVal).add(30, "minutes").valueOf();
        if (toVal < newMinToVal) {
            bookingForm = mori.assoc(bookingForm, "to", newMinToVal);
        }

        return bookingForm;
    }

    function updateBookingFormTo(bookingForm, toVal) {
        bookingForm = mori.assoc(bookingForm, "to", toVal);

        var fromVal = mori.get(bookingForm, "from");
        var newMaxFromVal = moment(toVal).subtract(30, "minutes").valueOf();
        if (fromVal > newMaxFromVal) {
            bookingForm = mori.assoc(bookingForm, "from", newMaxFromVal);
        }

        return bookingForm;
    }

    function createReducer() {
        return function (state, action) {
            switch (action.type) {
                case "DO_THING":
                    return mori.assoc(state, "thing", Math.random());
                case "CHANGE_WEEK_START":
                    return mori.pipeline(state,
                        mori.curry(mori.assoc, "calendar", createCalendarForBaseDay(action.baseDay)),
                        mori.curry(mori.dissoc, "reservations"));
                case "CHANGE_WEEK_SUCCESS":
                    return mori.assoc(state, "reservations", action.reservations);
                case "SET_BOOKING_FORM_FROM":
                    return mori.updateIn(state, ["bookingForm"], mori.curry(updateBookingFormFrom, action.value));
                case "SET_BOOKING_FORM_TO":
                    return mori.updateIn(state, ["bookingForm"], mori.curry(updateBookingFormTo, action.value));
                case "SET_BOOKING_FORM_COMMENT":
                    return mori.assocIn(state, ["bookingForm", "comment"], action.value);
                case "SUBMIT_BOOKING_FORM_START":
                    return mori.assocIn(state, ["bookingForm", "isSubmitting"], true);
                case "SUBMIT_BOOKING_FORM_SUCCESS":
                    return mori.assoc(state, "bookingForm",
                        mori.assoc(createBookingForm(),
                            "successMessage", "Your booking has been filed!"));
                case "SUBMIT_BOOKING_FORM_ERROR":
                    return mori.updateIn(state, ["bookingForm"], mori.curry(mori.assoc,
                        "isSubmitting", false,
                        "validationError", action.err));
                default:
                    return state;
            }
        }
    }

    function getReservations(reservableRoomId, day) {
        return http("GET", "/api/reservable_rooms/" + reservableRoomId + "/reservations/" + day.format("DD.MM.YYYY"));
    }

    function NOOP(){}
    function createDiscardingFunction() {
        var prevFunction = null;

        return function (newFunction) {
            if (prevFunction) {
                prevFunction.discard();
            }

            prevFunction = (function () {
                var isDiscarded = false;
                return {
                    f: function () {
                        if (isDiscarded) {
                            return NOOP;
                        } else {
                            return newFunction.apply(this, arguments);
                        }
                    },
                    discard: function () {
                        isDiscarded = true;
                    }
                }
            }());

            return prevFunction.f;
        }
    }

    function createActions(store) {
        var fetchReservationsResHandler = createDiscardingFunction();
        var fetchReservationsErrHandler = createDiscardingFunction();

        function fetchReservations(baseDay, reservableRoomId) {
            store.dispatch({type: "CHANGE_WEEK_START", baseDay: baseDay});

            getReservations(reservableRoomId, baseDay).then(
                fetchReservationsResHandler(function (res) {
                    store.dispatch({type: "CHANGE_WEEK_SUCCESS", reservations: mori.toClj(res)});
                }),
                fetchReservationsErrHandler(function (err) {
                    store.dispatch({type: "CHANGE_WEEK_ERROR"});
                }));
        }

        return {
            gotoWeek: function (weekStep) {
                var appState = store.getState();
                var oldCalendar = mori.get(appState, "calendar");
                var baseDay = moment(mori.get(oldCalendar, "baseDay")).tz("Europe/Oslo").isoWeekday(1).add(weekStep * 7, "days").startOf("day");
                fetchReservations(baseDay, mori.getIn(appState, ["reservableRoom", "id"]));
            },

            gotoToday: function () {
                var appState = store.getState();
                var baseDay = moment().tz("Europe/Oslo").isoWeekday(1).startOf("day");
                fetchReservations(baseDay, mori.getIn(appState, ["reservableRoom", "id"]));
            },

            submitBookingForm: function () {
                store.dispatch({type: "SUBMIT_BOOKING_FORM_START"});
                var appState = store.getState();

                var oldCalendar = mori.get(appState, "calendar");
                var baseDay = moment(mori.get(oldCalendar, "baseDay"));

                var bookingForm = mori.get(appState, "bookingForm");
                var data = {
                    from: moment(mori.get(bookingForm, "from")).toISOString(),
                    to: moment(mori.get(bookingForm, "to")).toISOString(),
                    reservable_room_id: mori.getIn(appState, ["reservableRoom", "id"]),
                    comment: mori.get(bookingForm, "comment")
                };

                http("POST", "/api/bookings", data).then(
                    function (res) {
                        fetchReservations(baseDay, mori.getIn(appState, ["reservableRoom", "id"]));
                        store.dispatch({type: "SUBMIT_BOOKING_FORM_SUCCESS"});
                    },
                    function (err) {
                        console.error(err);
                        store.dispatch({type: "SUBMIT_BOOKING_FORM_ERROR", err: err})
                    }
                );
            },

            deleteBooking: function (bookingId) {
                if (!confirm("Are you sure you want to delete this booking?")) {
                    return;
                }

                var appState = store.getState();
                var oldCalendar = mori.get(appState, "calendar");
                var baseDay = moment(mori.get(oldCalendar, "baseDay"));

                http("DELETE", "/api/bookings/" + bookingId).then(function () {
                    fetchReservations(baseDay, mori.getIn(appState, ["reservableRoom", "id"]));
                });
            }
        }
    }

    var targetEl = document.getElementById("booking-app");

    function initialize(reservableRoom, currentUserId) {
        var store = Redux.createStore(createReducer(), mori.hashMap(
            "reservableRoom", reservableRoom,
            "currentUserId", currentUserId,
            "calendar", createCalendarForBaseDay(moment().tz("Europe/Oslo").isoWeekday(1).startOf("day")),
            "bookingForm", createBookingForm()));

        var actions = createActions(store);
        actions.gotoToday();

        function render() {
            var state = store.getState();
            React.render(BOOKING_COMPONENTS.BookingApp({appState: state, dispatch: store.dispatch, actions: actions}), targetEl);
        }

        store.subscribe(render);
        render();
    }


    http("GET", "/api/reservable_room").then(
        function (res) {
            initialize(mori.toClj(res), CURRENT_USER_ID);
        },
        function (err) {
            alert("An unknown error occurred! " + JSON.stringify(err));
        });
}());
