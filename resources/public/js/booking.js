(function () {
    var div = React.DOM.div;
    var form = React.DOM.form;
    var label = React.DOM.label;
    var input = React.DOM.input;
    var a = React.DOM.a;
    var span = React.DOM.span;

    var BookingFormDateTimeFieldsClass = React.createClass({
        componentDidMount: function () {
            var container = this.getDOMNode();

            var rowWrapper = document.createElement("div");
            rowWrapper.className = "row";

            var datePickerCell = document.createElement("div");
            datePickerCell.className = "col-xs-7";
            rowWrapper.appendChild(datePickerCell);

            var timePickerCell = document.createElement("div");
            timePickerCell.className = "col-xs-5";
            rowWrapper.appendChild(timePickerCell);

            var dateInput = document.createElement("input");
            dateInput.type = "text";
            dateInput.className = "form-control";
            dateInput.value = this.props.initialDate.format("DD.MM.YYYY");
            jQuery(dateInput).datepicker({format: "dd.mm.yyyy", weekStart: 1});
            datePickerCell.appendChild(dateInput);

            var timeInput = document.createElement("input");
            timeInput.type = "text";
            timeInput.className = "form-control";
            timeInput.value = this.props.initialDate.format("HH:mm");
            timePickerCell.appendChild(timeInput);

            container.appendChild(rowWrapper);
        },

        render: function () {
            return div();
        }
    });
    var BookingFormDateTimeFields = React.createFactory(BookingFormDateTimeFieldsClass);

    var BookingFormClass = React.createClass({
        render: function () {
            return form(
                null,
                div({className: "form-group"},
                    label(null, "From"),
                    BookingFormDateTimeFields({initialDate: moment().hour(14).minute(0)})),
                div({className: "form-group"},
                    label(null, "To"),
                    BookingFormDateTimeFields({initialDate: moment().hour(15).minute(0)})),
                input({type: "button", value: "Book now!", className: "btn btn-default"}));
        }
    });
    var BookingForm = React.createFactory(BookingFormClass);

    function formatHour(hour) {
        if (hour < 10) {
            return "0" + hour + ":00";
        } else {
            return hour + ":00";
        }
    }

    var CalendarGridClass = React.createClass({
        prevWeekButtonClicked: function () {
        },

        nextWeekButtonClicked: function () {
        },

        render: function () {
            var hours = [];
            for (var i = 0; i < 24; i++) {
                hours.push(i);
            }

            return div(
                {className: "calendar-grid"},
                div({className: "calendar-grid-hours"},
                    div({className: "calendar-grid-hours-header"},
                        div({className: "btn-group"},
                            a({className: "btn btn-xs btn-default", onClick: this.prevWeekButtonClicked},
                              span({className: "glyphicon glyphicon-chevron-left"})),
                            a({className: "btn btn-xs btn-default", onClick: this.nextWeekButtonClicked},
                              span({className: "glyphicon glyphicon-chevron-right"})))),
                    hours.map(function (hour) {
                        return div(
                            {key: "hour-" + hour, className: "calendar-grid-hour-cell"},
                            formatHour(hour));
                    })),
                div({className: "calendar-grid-content"},
                    this.props.days.map(function (day) {
                        return div(
                            {key: "day-" + day.label, className: "calendar-grid-column"},
                            div(
                                {className: "calendar-grid-day-header"},
                                day.label, " ", day.inst.format("DD.MM")),
                            hours.map(function (hour) {
                                return div(
                                    {key: "hour-" + hour, className: "calendar-grid-hour-cell"},
                                    "-");
                            }));
                    })));
        }
    });
    var CalendarGrid = React.createFactory(CalendarGridClass);

    var BookingAppClass = React.createClass({
        render: function () {
            var monday = moment().day("Monday");
            var days = [
                {label: "Mon", inst: monday.clone()},
                {label: "Tue", inst: monday.clone().day(2)},
                {label: "Wed", inst: monday.clone().day(3)},
                {label: "Thu", inst: monday.clone().day(4)},
                {label: "Fri", inst: monday.clone().day(5)},
                {label: "Sat", inst: monday.clone().day(6)},
                {label: "Sun", inst: monday.clone().day(7)}
            ];

            return div(
                {className: "row"},
                div({className: "col-md-3 col-md-push-9"}, BookingForm()),
                div({className: "col-md-9 col-md-pull-3"}, CalendarGrid({days: days})));
        }
    });
    var BookingApp = React.createFactory(BookingAppClass);

    React.render(BookingApp(), document.getElementById("booking-app"));
}());
