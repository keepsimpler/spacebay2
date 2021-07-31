import React, {Component} from 'react';
import "../css/components/reportRowAction.css"

class ReportRowAction extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false
        document.body.removeEventListener('click', this.hideOptions);
    }

    showOptions = event => {
        if(this.mounted) {
            this.setState({show: true});
        }

        document.body.addEventListener('click', this.hideOptions, true);
    };

    selectAction = (option, item) => {
        if (option && typeof option.action === 'function') {
            option.action(item);
        }
    };

    hideOptions = () => {
        if(this.mounted) {
            this.setState({show: false});
        }

        document.body.removeEventListener('click', this.hideOptions);
    };


    render() {
        let visibleActions = this.props.actions.filter(action => {
            return !action.hasOwnProperty("shouldShowAction") || action.shouldShowAction(this.props.item);
        });
        return (
            <div>
                {
                    visibleActions.length > 0 ?
                        <div className='ss-row-action'>

                            <img className='ss-row-action-icon'
                                 onClick={this.showOptions}
                                 src="https://s3-us-west-1.amazonaws.com/securspace-files/app-images/ellipses-icon.png"
                                 alt="row-action"/>

                            <div className={this.state.show ? "ss-action-options-visible" : "ss-action-options-hidden"}>
                                <ul className="ss-action-list">
                                    {
                                        visibleActions.map((action, index) =>
                                            <li key={index}
                                                className={(!action.hasOwnProperty("shouldShowAction") || action.shouldShowAction(this.props.item)) ? "ss-action-item" : "hidden"}
                                                onClick={() => this.selectAction(action, this.props.item)}>
                                                {action.displayValue}
                                            </li>
                                        )

                                    }
                                </ul>
                            </div>
                        </div>
                        :
                        ''
                }
            </div>
        );
    }
}

export default ReportRowAction;
