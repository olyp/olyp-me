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
            var calendarButton = this.refs["calendarButton"].getDOMNode();

            jQuery(calendarButton)
                .datepicker()
                .on("changeDate", function (e) {
                    this.datePickerDate =  moment(e.date).format("DD.MM.YYYY");
                    this.updateDate();
                    jQuery(calendarButton).datepicker("hide");
                }.bind(this));
            this.datePickerDate = moment(this.props.value).format("DD.MM.YYYY");
        },

        updateDate: function () {
            var hourSelect = this.refs["hourSelect"].getDOMNode();
            var newDate = moment(this.datePickerDate + " " + hourSelect.value, "DD.MM.YYYY HH:mm");
            this.props.onChange(newDate.valueOf());
        },

        componentDidUpdate: function () {
            // If the date is set from the outside, we need to update the date picker internal state here.
            // Not implemented yet.
        },

        render: function () {
            var date = moment(this.props.value);

            return React.DOM.div({className: "form-inline"},
                React.DOM.div({className: "input-group"},
                    React.DOM.span({
                            className: "input-group-addon",
                            ref: "calendarButton",
                            "data-date-format": "DD.MM.YYYY",
                            "data-date": date.format("DD.MM.YYYY")
                        },
                        React.DOM.span({className: "glyphicon glyphicon-calendar"})),
                    React.DOM.input({type: "text", className: "form-control", value: date.format("DD.MM.YYYY"), readOnly: true, size: 10})),
                " ",
                React.DOM.div({className: "form-group"},
                    React.DOM.select({className: "form-control", value: date.format("HH:mm"), ref: "hourSelect", onChange: this.updateDate},
                        hours.map(function (hour) {
                            return [
                                React.DOM.option({key: "hour-" + hour + "-0"}, padNum(hour) + ":00"),
                                React.DOM.option({key: "hour-" + hour + "-30"}, padNum(hour) + ":30")
                            ];
                        }))))
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

    var ValidationError = React.createFactory(React.createClass({
        render: function () {
            var err = this.props.err;
            if (!err) {
                return null;
            }

            return React.DOM.div({className: "panel panel-danger"},
                React.DOM.div({className: "panel-heading"},
                    getErrorMessageComponent(err)));
        }
    }));

    var BookingForm = React.createFactory(React.createClass({
        render: function () {
            var props = this.props;

            return React.DOM.form({onSubmit: function (e) {
                    e.preventDefault();
                    props.actions.submitBookingForm();
                }},
                ValidationError({err: mori.get(props.form, "validationError")}),
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
                        className: "form-control",
                        value: mori.get(props.form, "comment"),
                        onChange: function (e) { props.dispatch({type: "SET_BOOKING_FORM_COMMENT", value: e.target.value}) }
                    })),
                React.DOM.input({type: "submit", value: "Book now!", className: "btn btn-default", disabled: mori.get(props.form, "isSubmitting")}));
        }
    }));

    var CalendarGridReservationButtons = React.createFactory(React.createClass({
        render: function () {
            var props = this.props;

            return React.DOM.span(
                {className: "calendar-grid-reservation-buttons"},
                React.DOM.a({
                    onClick: function () { props.actions.deleteBooking(props.reservation.booking.id); }
                }, React.DOM.span({className: "glyphicon glyphicon-trash"})));
        }
    }));

    function formatHour(hour) {
        return padNum(hour) + ":00";
    }

    function reservationIntersects(booking, dayStart, dayEnd) {
        return (booking.from.valueOf() <= dayEnd.valueOf()) && (dayStart.valueOf() <= booking.to.valueOf());
    }


    var HOUR_HEIGHT = 40;

    function getOffset(offset) {
        var hoursOffset = Math.floor(offset);
        if (hoursOffset === 0) {
            return 0;
        } else {
            return hoursOffset * HOUR_HEIGHT + ((offset % hoursOffset) * HOUR_HEIGHT);
        }
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

    var CalendarGrid = React.createFactory(React.createClass({
        render: function () {
            var props = this.props;
            var calendarDays = mori.get(props.calendar, "days");
            var reservations = (mori.toJs(props.reservations) || []).map(function (reservation) {
                return {
                    id: reservation.id,
                    from: moment(reservation.from).tz("Europe/Oslo"),
                    to: moment(reservation.to).tz("Europe/Oslo"),
                    comment: reservation.comment,
                    booking: reservation.booking,
                    reservableRoom: reservation["reservable_room"]
                }
            });
            reservations.sort(function (a, b) {
                return a.from.valueOf() - b.from.valueOf();
            });

            var calendarGridClassNames = ["calendar-grid-content"];
            if (props.reservations === null) {
                calendarGridClassNames.push("calendar-grid-content-no-data");
            }

            return React.DOM.div({className: "calendar-grid"},
                React.DOM.div({style: {marginBottom: 14}},
                    React.DOM.a({className: "btn btn-xs btn-default", onClick: function () { props.actions.gotoToday(); }}, "Today"),
                    " ",
                    React.DOM.div({className: "btn-group"},
                        React.DOM.a({
                            className: "btn btn-xs btn-default",
                            onClick: function () { props.actions.gotoWeek(-1); }
                        }, React.DOM.span({className: "glyphicon glyphicon-chevron-left"})),
                        React.DOM.a({
                            className: "btn btn-xs btn-default",
                            onClick: function () { props.actions.gotoWeek(1); }
                        }, React.DOM.span({className: "glyphicon glyphicon-chevron-right"}))),
                    " ",
                    currentWeekSummary(mori.get(props.calendar, "baseDay"), mori.first(calendarDays), mori.last(calendarDays))),
                React.DOM.div({className: "calendar-grid-hours"},
                    React.DOM.div({className: "calendar-grid-hours-header"}),
                    hours.map(function (hour) {
                        return React.DOM.div({
                            key: "hour-" + hour, className: "calendar-grid-hour-cell"
                        }, formatHour(hour));
                    })),
                React.DOM.div({className: calendarGridClassNames.join(" ")},
                    mori.toJs(mori.map(function (dayValue) {
                        var day = moment(dayValue).tz("Europe/Oslo");
                        var dayStart = day.clone();
                        var dayEnd = day.clone().endOf("day");
                        var label = day.format("ddd");

                        var reservationsForDay = [];
                        if (reservations.length > 0 && reservationIntersects(reservations[0], dayStart, dayEnd)) {

                            var lastIntersectingReservation = null;
                            for (var i = 1; i < reservations.length; i++) {
                                if (!reservationIntersects(reservations[i], dayStart, dayEnd)) {
                                    lastIntersectingReservation = i;
                                    break;
                                }
                            }

                            if (lastIntersectingReservation === null) {
                                reservationsForDay = reservations;
                                reservations = reservations.slice(reservations.length - 1);
                            } else {
                                reservationsForDay = reservations.slice(0, lastIntersectingReservation);
                                reservations = reservations.slice(lastIntersectingReservation);
                            }
                        }

                        return React.DOM.div({key: "day-" + label, className: "calendar-grid-column"},
                            React.DOM.div({className: "calendar-grid-day-header"}, label + " " + day.format("DD.MM")),
                            React.DOM.div({className: "calendar-grid-day-reservations"},
                                hours.map(function (hour) {
                                    return React.DOM.div({key: "hour-" + hour, className: "calendar-grid-hour-cell"});
                                }),
                                reservationsForDay.map(function (reservation) {
                                    var dayStartHourOffset = (reservation.from.valueOf() - dayStart.valueOf()) / 1000 / 60 / 60;
                                    var reservationLengthOffset = (reservation.to.valueOf() - reservation.from.valueOf()) / 1000 / 60 / 60;
                                    var classNames = ["calendar-grid-reservation"];

                                    var topOffset = getOffset(dayStartHourOffset);
                                    var bottomOffset = topOffset + getOffset(reservationLengthOffset);

                                    if (topOffset < 0) {
                                        classNames.push("calendar-grid-reservation-overlaps-previous");
                                    }

                                    if (bottomOffset > (HOUR_HEIGHT * 24)) {
                                        classNames.push("calendar-grid-reservation-overlaps-next");
                                    }

                                    return React.DOM.div(
                                        {
                                            key: "reservation-" + topOffset + "-" + bottomOffset,
                                            className: classNames.join(" "),
                                            style: {
                                                top: Math.max(topOffset, 0) + "px",
                                                bottom: ((HOUR_HEIGHT * 24) - bottomOffset) + "px"
                                            }
                                        },
                                        React.DOM.div({className: "calendar-grid-reservation-user-name"}, reservation.booking.user.name),
                                        React.DOM.div({className: "calendar-grid-reservation-comment", title: reservation.comment}, reservation.comment),
                                        props.currentUserId === reservation.booking.user.id && CalendarGridReservationButtons({
                                            dispatch: props.dispatch,
                                            actions: props.actions,
                                            reservation: reservation
                                        })
                                    );
                                })));
                    }, calendarDays))));
        }
    }));

    var BookingApp = React.createFactory(React.createClass({
        render: function () {
            var props = this.props;
            var reservableRoom = mori.get(props.appState, "reservableRoom");

            return React.DOM.div({className: "row"},
                React.DOM.div({className: "calendar-grid-title"}, "Booking of \"", mori.get(reservableRoom, "name") + "\""),
                React.DOM.div({className: "col-md-3 col-md-push-9"},
                    BookingForm({
                        dispatch: props.dispatch,
                        actions: props.actions,
                        form: mori.get(props.appState, "bookingForm")
                    })),
                React.DOM.div({className: "col-md-9 col-md-pull-3"},
                    CalendarGrid({
                        dispatch: props.dispatch,
                        actions: props.actions,
                        calendar: mori.get(props.appState, "calendar"),
                        reservations: mori.get(props.appState, "reservations"),
                        currentUserId: mori.get(props.appState, "currentUserId")
                    })));
        }
    }));

    return {
        BookingApp: BookingApp
    }
}());
