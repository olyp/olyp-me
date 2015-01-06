(function (GLOBAL) {
    var div = React.DOM.div;
    var a = React.DOM.a;
    var input = React.DOM.input;
    var label = React.DOM.label;
    var form = React.DOM.form;


    var FluxRootComponentMixin = {
        propTypes: {
            fluxActions: React.PropTypes.object.isRequired,
            fluxStore: React.PropTypes.object.isRequired
        }
    };

    var FluxChildComponentMixin = {
        propTypes: {
            fluxActions: React.PropTypes.object.isRequired
        }
    };

    var ProfileOverviewPageClass = React.createClass({
        mixins: [FluxChildComponentMixin],

        onChangePasswordClick: function () {
            this.props.fluxActions.gotoChangePassword();
        },

        render: function () {
            return div(
                null,
                React.DOM.h1(null, "Welcome, ", this.props.profile.name),
                a({className: "btn btn-default", onClick: this.onChangePasswordClick}, "Change password"));
        }
    });
    var ProfileOverviewPage = React.createFactory(ProfileOverviewPageClass);

    var ProfileChangePasswordPageClass = React.createClass({
        mixins: [FluxChildComponentMixin, React.addons.LinkedStateMixin],

        onSubmit: function (e) {
            e.preventDefault();
            this.props.fluxActions.changePassword(this.state);
        },

        onCancelClick: function () {
            this.props.fluxActions.gotoOverview();
        },

        getInitialState: function () {
            return {};
        },

        render: function () {
            return form(
                {className: "change-password-form", onSubmit: this.onSubmit},
                div({className: "form-group"},
                    label(null, "Old password"),
                    input({type: "password", className: "form-control", valueLink: this.linkState("oldPassword")})),
                div({className: "form-group"},
                    label(null, "New password"),
                    input({type: "password", className: "form-control", valueLink: this.linkState("newPassword")})),
                div({className: "form-group"},
                    label(null, "Confirm new password"),
                    input({type: "password", className: "form-control", valueLink: this.linkState("newPasswordConfirmation")})),
                input({type: "submit", value: "Change password", className: "btn btn-primary"}),
                " ",
                a({className: "btn btn-default", onClick: this.onCancelClick}, "Cancel"));
        }
    });
    var ProfileChangePasswordPage = React.createFactory(ProfileChangePasswordPageClass);

    var ProfileAppClass = React.createClass({
        mixins: [FluxRootComponentMixin],

        render: function () {
            var currentPage = this.props.fluxStore.getCurrentPage();

            switch (currentPage.page) {
            case "overview":
                return ProfileOverviewPage({
                    fluxActions: this.props.fluxActions,
                    currentPage: currentPage,
                    profile: this.props.fluxStore.getProfile()
                });
            case "changePassword":
                return ProfileChangePasswordPage({
                    fluxActions: this.props.fluxActions,
                    currentPage: currentPage,
                    profile: this.props.fluxStore.getProfile()
                });
            default:
                return div(null, "Page \"" + currentPage.page + "\" not found.");
            }
        }
    });
    var ProfileApp = React.createFactory(ProfileAppClass);

    GLOBAL.PROFILE_COMPONENTS = {
        ProfileApp: ProfileApp
    };
}(this));
