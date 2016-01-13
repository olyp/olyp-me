var UTIL = (function () {
    var keysToSkip = {dispatch: true, actions: true, children: true};
    function moriPropsChanged(props, nextProps) {
        for (var key in props) {
            if (props.hasOwnProperty(key)) {
                if (key in keysToSkip) continue;

                if (!mori.equals(props[key], nextProps[key])) {
                    return true
                }
            }
        }
    }

    function moriShouldComponentUpdate(nextProps, nextState) {
        if (moriPropsChanged(this.props, nextProps)) {
            return true;
        }

        if (nextProps.children) {
            if (React.Children.count(nextProps.children) > 1) {
                throw new Error("Mori property diffing only supports a single child component")
            }

            if (moriPropsChanged(this.props.children.props, nextProps.children.props)) {
                return true;
            }
        }

        return false;
    }

    return {
        moriShouldComponentUpdate: moriShouldComponentUpdate,
        createComponent: function (renderFn, props) {
            var classDefinition = {};
            classDefinition.shouldComponentUpdate = moriShouldComponentUpdate;
            classDefinition.displayName = renderFn.name;

            for (var key in props) {
                if (props.hasOwnProperty(key)) classDefinition[key] = props[key];
            }

            classDefinition.render = function () {
                return renderFn.call(this, this.props);
            };

            return React.createFactory(React.createClass(classDefinition));
        }
    }
}());
