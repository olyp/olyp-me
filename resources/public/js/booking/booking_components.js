var BOOKING_COMPONENTS = (function () {
    var hours = [];
    for (var i = 0; i < 24; i++) {
        hours.push(i);
    }

    function padNum(num) {
        if (num < 10) {
            return "0" + num;
        } else {
            return num.toString();
        }
    }

    var BookingFormDateTimeFields = React.createFactory(React.createClass({
        componentDidMount: function () {
            var calendarInput = this.refs["calendarInput"].getDOMNode();

            jQuery(calendarInput)
                .datepicker({
                    dateFormat: "dd.mm.yy",
                    firstDay: 1,
                    onSelect: function (dateText) {
                        this.datePickerDate = dateText;
                        this.updateDate();
                    }.bind(this)
                })
                .datepicker("setDate", moment(this.props.value).toDate());
            this.setDatePickerDate();
        },

        updateDate: function () {
            var hourSelect = this.refs["hourSelect"].getDOMNode();
            var newDate = moment(this.datePickerDate + " " + hourSelect.value, "DD.MM.YYYY HH:mm");
            this.props.onChange(newDate.valueOf());
        },

        onHourSelectChange: function () {
            this.updateDate();
        },

        decrementTime: function () {
            var newDate = moment(this.props.value);
            newDate.subtract(30, "minutes");
            this.props.onChange(newDate.valueOf());
        },

        incrementTime: function () {
            var newDate = moment(this.props.value);
            newDate.add(30, "minutes");
            this.props.onChange(newDate.valueOf());
        },

        decrementDate: function () {
            var newDate = moment(this.props.value);
            newDate.subtract(1, "days");
            this.props.onChange(newDate.valueOf());
        },

        incrementDate: function () {
            var newDate = moment(this.props.value);
            newDate.add(1, "days");
            this.props.onChange(newDate.valueOf());
        },

        componentDidUpdate: function () {
            // If the date is set from the outside, we need to update the date picker internal state here.
            var calendarInput = this.refs["calendarInput"].getDOMNode();
            jQuery(calendarInput)
                .datepicker("setDate", moment(this.props.value).toDate());

            this.setDatePickerDate();
        },

        setDatePickerDate: function () {
            var calendarInput = this.refs["calendarInput"].getDOMNode();
            this.datePickerDate = moment(jQuery(calendarInput).datepicker("getDate")).format("DD.MM.YYYY");
        },


        render: function () {
            var date = moment(this.props.value);

            return React.DOM.div(null,
                React.DOM.div({className: "form-group"},
                    React.DOM.div({className: "input-group input-group-lg"},
                        React.DOM.div({className: "input-group-btn"},
                            React.DOM.a({className: "btn btn-default", onClick: this.decrementTime, onTouchEnd: function (e) { e.preventDefault(); this.decrementTime(); }.bind(this)},
                                React.DOM.span({className: "glyphicon glyphicon-minus"}))),
                        React.DOM.select({className: "form-control", value: date.format("HH:mm"), ref: "hourSelect", onChange: this.onHourSelectChange},
                            hours.map(function (hour) {
                                return [
                                    React.DOM.option({key: "hour-" + hour + "-0"}, padNum(hour) + ":00"),
                                    React.DOM.option({key: "hour-" + hour + "-30"}, padNum(hour) + ":30")
                                ];
                            })),
                        React.DOM.div({className: "input-group-btn"},
                            React.DOM.a({className: "btn btn-default", onClick: this.incrementTime, onTouchEnd: function (e) { e.preventDefault(); this.incrementTime(); }.bind(this)},
                                React.DOM.span({className: "glyphicon glyphicon-plus"}))))),
                React.DOM.div({className: "form-group"},
                    React.DOM.div({className: "input-group input-group-lg"},
                        React.DOM.div({className: "input-group-btn"},
                            React.DOM.a({className: "btn btn-default", onClick: this.decrementDate, onTouchEnd: function (e) { e.preventDefault(); this.decrementDate(); }.bind(this)},
                                React.DOM.span({className: "glyphicon glyphicon-minus"}))),
                        React.DOM.input({ref: "calendarInput", type: "text", className: "form-control", readOnly: true, size: 10}),
                        React.DOM.div({className: "input-group-btn"},
                            React.DOM.a({className: "btn btn-default", onClick: this.incrementDate, onTouchEnd: function (e) { e.preventDefault(); this.incrementDate(); }.bind(this)},
                                React.DOM.span({className: "glyphicon glyphicon-plus"}))))));
        }
    }));

    function getErrorMessageComponent(err) {
        if (err.xhr) {
            if (err.status === 422) {
                try {
                    var data = JSON.parse(err.body);
                    return React.DOM.div({style: {whiteSpace: "pre-wrap"}},
                        JSON.stringify(data, null, 2));
                } catch (e) {}
            }

            return "Unknown error (code " + err.status + ")";
        }

        return err.toString();
    }
    
    var BookingFormMessage = UTIL.createComponent(function BookingFormMessage(props) {
        var msg = props.msg;
        if (!msg) {
            return null;
        }

        return React.DOM.div({className: "panel " + (mori.get(msg, "isError") ? "panel-danger" : "panel-success")},
            React.DOM.div({className: "panel-heading"}, mori.get(msg, "msg")));
    });

    var BookingForm = UTIL.createComponent(function BookingForm(props) {
        return React.DOM.form({className: "booking-form", onSubmit: function (e) {
                e.preventDefault();
                props.actions.submitBookingForm();
            }},
            BookingFormMessage({msg: mori.get(props.form, "flashMessage")}),
            React.DOM.div({className: "form-group"},
                React.DOM.label(null, "From"),
                BookingFormDateTimeFields({
                    dispatch: props.dispatch,
                    value: mori.get(props.form, "from"),
                    onChange: function (value) { props.dispatch({type: "SET_BOOKING_FORM_FROM", value: value}); }
                })),
            React.DOM.div({className: "form-group"},
                React.DOM.label(null, "To"),
                BookingFormDateTimeFields({
                    dispatch: props.dispatch,
                    value: mori.get(props.form, "to"),
                    onChange: function (value) { props.dispatch({type: "SET_BOOKING_FORM_TO", value: value}); }
                })),
            React.DOM.div({className: "form-group"},
                React.DOM.label(null, "Comment"),
                React.DOM.input({
                    type: "text",
                    className: "form-control input-lg",
                    value: mori.get(props.form, "comment"),
                    onChange: function (e) { props.dispatch({type: "SET_BOOKING_FORM_COMMENT", value: e.target.value}) }
                })),
            React.DOM.input({type: "submit", value: "Book now!", className: "btn btn-success btn-lg", disabled: mori.get(props.form, "isSubmitting")}));
    });

    var CalendarGridReservationButtons = UTIL.createComponent(function CalendarGridReservationButtons(props) {
        return React.DOM.span(
            {className: "calendar-grid-week-reservation-buttons"},
            React.DOM.a({
                onClick: function () { props.actions.deleteBooking(mori.getIn(props.reservation, ["booking", "id"])); }
            }, React.DOM.span({className: "glyphicon glyphicon-trash"})));
    });

    function formatHour(hour) {
        return padNum(hour) + ":00";
    }

    var HALF_HOUR_HEIGHT = 13;
    var HOUR_HEIGHT = HALF_HOUR_HEIGHT * 2;

    function getOffset(offset) {
        return (offset / 30) * HALF_HOUR_HEIGHT;
    }

    function currentWeekSummary(baseDayVal, firstDayVal, lastDayVal) {
        var firstDay = moment(firstDayVal);
        var lastDay = moment(lastDayVal);

        var firstMonth = firstDay.format("MMM");
        var lastMonth = lastDay.format("MMM");

        return React.DOM.span(null,
            firstMonth + " " + firstDay.format("DD")
            + " - "
            + (firstMonth === lastMonth ? "" : (lastMonth + " ")) + lastDay.format("DD")
            + ", " + moment(baseDayVal).format("YYYY"));
    }

    var CalendarGridAgenda = UTIL.createComponent(function CalendarGridAgenda(props) {
        return React.DOM.div({className: "calendar-grid-agenda"},
            mori.toJs(mori.map(function (dayValue) {
                var day = moment(dayValue).tz("Europe/Oslo");
                var dayStart = day.clone();
                var dayEnd = day.clone().endOf("day");
                var label = day.format("ddd");

                var dayStartVal = dayStart.valueOf();
                var dayEndVal = dayEnd.valueOf();

                var reservationsForDay = mori.pipeline(props.reservations,
                    mori.partial(mori.filter, function (reservation) {
                        var reservationFromVal = moment(mori.get(reservation, "from")).valueOf();
                        var reservationToVal = moment(mori.get(reservation, "to")).valueOf();

                        return reservationFromVal < dayEndVal && reservationToVal > dayStartVal;
                    }),
                    mori.partial(mori.sortBy, mori.curry(mori.get, "from")));

                return React.DOM.div({key: "day-" + label},
                    React.DOM.h2({
                        style: {borderBottom: "1px solid #ccc"}
                    }, day.format("dddd, DD.MM")),
                    mori.isEmpty(reservationsForDay) && React.DOM.div({style: {color: "#999", fontStyle: "italic", textAlign: "center", padding: "1em"}}, "No bookings"),
                    mori.toJs(mori.map(function (reservation) {
                        var from = moment(Math.max(moment(mori.get(reservation, "from")).valueOf(), dayStartVal));
                        var to = moment(Math.min(moment(mori.get(reservation, "to")).valueOf(), dayEndVal + 1000));

                        var booking = mori.get(reservation, "booking");
                        var user = mori.get(booking, "user");
                        var bookingId = mori.get(booking, "id");

                        return React.DOM.div(
                            {
                                key: "reservation-" + mori.get(reservation, "id"),
                                className: "row",
                                style: {marginBottom: "1em", paddingBottom: "1em", borderBottom: "1px solid #eee"}
                            },
                            React.DOM.div({className: "col-xs-3"},
                                    React.DOM.div(null, from.format("HH:mm")),
                                    React.DOM.div(null, to.format("HH:mm"))),
                            React.DOM.div({className: "col-xs-9"},
                                React.DOM.div({style: {fontWeight: "bold", fontSize: 16, lineHeight: 1.2}}, mori.get(user, "name")),
                                React.DOM.div({style: {fontStyle: "italic", color: "#666", fontSize: 11}}, mori.get(reservation, "comment")),
                                props.currentUserId === mori.get(user, "id") && React.DOM.a({
                                    onClick: function () { props.actions.deleteBooking(bookingId); },
                                    className: "btn btn-danger",
                                    style: {marginTop: "1em"}
                                }, React.DOM.span({className: "glyphicon glyphicon-trash"})))
                        );
                    }, reservationsForDay))
                );
            }, mori.get(props.calendar, "days"))));
    });

    var CalendarGridWeek = UTIL.createComponent(function CalendarGridWeek(props) {
        var calendarDays = mori.get(props.calendar, "days");

        var calendarGridClassNames = ["calendar-grid-week-content"];
        if (props.reservations === null) {
            calendarGridClassNames.push("calendar-grid-week-content-no-data");
        }

        return React.DOM.div({className: "calendar-grid-week"},
            React.DOM.div({className: "calendar-grid-week-hours"},
                React.DOM.div({className: "calendar-grid-week-hours-header"}),
                hours.map(function (hour) {
                    var classNames = ["calendar-grid-week-hour-cell"];
                    if (hour % 2 === 0)
                        classNames.push("calendar-grid-week-hour-cell-colored-row");


                    return React.DOM.div({
                        key: "hour-" + hour, className: classNames.join(" ")
                    }, formatHour(hour));
                })),
            React.DOM.div({className: calendarGridClassNames.join(" ")},
                mori.toJs(mori.map(function (dayValue) {
                    var day = moment(dayValue).tz("Europe/Oslo");
                    var dayStart = day.clone();
                    var dayEnd = day.clone().endOf("day");
                    var label = day.format("ddd");

                    var dayStartVal = dayStart.valueOf();
                    var dayEndVal = dayEnd.valueOf();


                    var reservationsForDay = mori.filter(function (reservation) {
                        var reservationFromVal = moment(mori.get(reservation, "from")).valueOf();
                        var reservationToVal = moment(mori.get(reservation, "to")).valueOf();

                        return reservationFromVal < dayEndVal && reservationToVal > dayStartVal;
                    }, props.reservations);

                    return React.DOM.div({key: "day-" + label, className: "calendar-grid-week-column"},
                        React.DOM.div({className: "calendar-grid-week-day-header"}, label + " " + day.format("DD.MM")),
                        React.DOM.div({className: "calendar-grid-week-day-reservations"},
                            hours.map(function (hour) {
                                var classNames = ["calendar-grid-week-hour-cell"];
                                if (hour % 2 === 0)
                                    classNames.push("calendar-grid-week-hour-cell-colored-row");

                                return React.DOM.div({key: "hour-" + hour, className: classNames.join(" ")});
                            }),
                            mori.toJs(mori.map(function (reservation) {
                                var reservationFrom = moment(mori.get(reservation, "from"));
                                var reservationTo = moment(mori.get(reservation, "to"));

                                var dayStartHourOffsetMinutes = (reservationFrom.valueOf() - dayStartVal) / 1000 / 60;
                                var reservationLengthOffsetMinutes = (reservationTo.valueOf() - reservationFrom.valueOf()) / 1000 / 60;
                                var classNames = ["calendar-grid-week-reservation"];

                                var topOffset = getOffset(dayStartHourOffsetMinutes);
                                var bottomOffset = topOffset + getOffset(reservationLengthOffsetMinutes);

                                if (topOffset < 0) {
                                    classNames.push("calendar-grid-week-reservation-overlaps-previous");
                                }

                                if (bottomOffset > (HOUR_HEIGHT * 24)) {
                                    classNames.push("calendar-grid-week-reservation-overlaps-next");
                                }

                                var user = mori.getIn(reservation, ["booking", "user"])

                                return React.DOM.div(
                                    {
                                        key: "reservation-" + topOffset + "-" + bottomOffset,
                                        className: classNames.join(" "),
                                        title: reservation.comment,
                                        style: {
                                            top: Math.max(topOffset, 0) + "px",
                                            bottom: ((HOUR_HEIGHT * 24) - bottomOffset) + "px"
                                        }
                                    },
                                    React.DOM.div({className: "calendar-grid-week-reservation-user-name"}, mori.get(user, "name")),
                                    React.DOM.div({className: "calendar-grid-week-reservation-comment"}, mori.get(reservation, "comment")),
                                    props.currentUserId === mori.get(user, "id") && CalendarGridReservationButtons({
                                        dispatch: props.dispatch,
                                        actions: props.actions,
                                        reservation: reservation
                                    })
                                );
                            }, reservationsForDay))
                        ));
                }, calendarDays))));
    }, {
        componentDidMount: function () {
            this.scrollToBottom();
        },

        componentDidUpdate: function () {
            this.scrollToBottom();
        },

        scrollToBottom: function () {
            var el = this.getDOMNode();
            el.scrollTop = el.scrollHeight;
        }
    });

    var CalendarGrid = UTIL.createComponent(function CalendarGrid(props) {
        var calendarDays = mori.get(props.calendar, "days");
        var baseDay = mori.get(props.calendar, "baseDay");

        return React.DOM.div({className: "calendar-grid"},
            React.DOM.div({style: {marginBottom: 14}, className: "calendar-grid-header"},
                React.DOM.a({className: "btn btn-default", onClick: function () { props.actions.gotoToday(); }}, "Today"),
                " ",
                React.DOM.div({className: "btn-group", style: {marginRight: 10}},
                    React.DOM.a({
                        className: "btn btn-default",
                        onClick: function () { props.actions.gotoWeek(-1); }
                    }, React.DOM.span({className: "glyphicon glyphicon-chevron-left"})),
                    React.DOM.a({
                        className: "btn btn-default",
                        onClick: function () { props.actions.gotoWeek(1); }
                    }, React.DOM.span({className: "glyphicon glyphicon-chevron-right"}))),
                " ",
                currentWeekSummary(baseDay, mori.first(calendarDays), mori.last(calendarDays))),
            CalendarGridAgenda({
                dispatch: props.dispatch,
                actions: props.actions,
                reservations: props.reservations,
                calendar: props.calendar,
                currentUserId: props.currentUserId
            }),
            CalendarGridWeek({
                dispatch: props.dispatch,
                actions: props.actions,
                reservations: props.reservations,
                calendar: props.calendar,
                currentUserId: props.currentUserId
            }));
    });

    var BookingApp = UTIL.createComponent(function BookingApp(props) {
        var reservableRoom = mori.get(props.appState, "reservableRoom");

        return React.DOM.div({},
            React.DOM.div({className: "calendar-grid-title"}, "Booking of \"", mori.get(reservableRoom, "name") + "\""),
            React.DOM.div({className: "row booking-form-calendar-grid"},
                BookingForm({
                    dispatch: props.dispatch,
                    actions: props.actions,
                    form: mori.get(props.appState, "bookingForm")
                }),
                React.DOM.hr({className: "booking-form-calendar-grid-separator"}),
                CalendarGrid({
                    dispatch: props.dispatch,
                    actions: props.actions,
                    calendar: mori.get(props.appState, "calendar"),
                    reservations: mori.get(props.appState, "reservations"),
                    currentUserId: mori.get(props.appState, "currentUserId")
                }))
        );
    });

    return {
        BookingApp: BookingApp
    }
}());
