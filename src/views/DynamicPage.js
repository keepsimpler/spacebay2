import React, {Component} from 'react';
import Busy from "../components/Busy";
import {withRouter} from "react-router";
import '../css/theme/mainContent.css';
import '../css/views/staticPage.css';

const $ = window.$;

class DynamicPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            error: null,
            title: this.props.type === 'terms' ? 'Platform Terms of Use' : 'SecurSpace Privacy Policy'
        };
    }

    componentDidMount() {
        this.getData();
    }

    backHistory = () => {
        this.props.cancel()
    };

    formatDate(date) {
        let month = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        date = new Date(date);
        return month[date.getMonth()] + ' ' + date.getDate() + ", " + date.getFullYear();
    }

    getData() {
        let _this = this;
        let apiMethod = '';
        Busy.set(true);
        if (this.props.accountId) {
            apiMethod = '../api/get-proof?typeContent=' + _this.props.type + "&accountId=" + this.props.accountId;
            this.setState({title: this.props.type === 'terms' ? 'Proof for Terms of Use Acceptance' : 'Proof for Privacy Policy Acceptance'});
        } else {
            apiMethod = '../api/get-static-content?typeContent=' + _this.props.type + (this.props.version ? "&versionNumber=" + this.props.version : "");
            this.setState({title: this.props.type === 'terms' ? 'Platform Terms of Use' : 'SecurSpace Privacy Policy'})
        }

        $.ajax({
            url: apiMethod,
            type: 'GET',
            success: (data) => {
                Busy.set(false);
                data.lastDate = _this.formatDate(data.createdDate);
                _this.setState({data: data, error: null});
            },
            error: (err) => {
                Busy.set(false);
                console.log(err);
                err.customMessage = err.responseJSON && err.responseJSON.message ? err.responseJSON.message : '';
                _this.setState({
                    error: err,
                    data: null
                });
            }
        });
    }


    render() {
        return (
            <div id="page-content" className={this.state.data ? '' :' hidden'}>
                <div onClick={this.backHistory} className="for-close pointer" >
                    <img alt=""
                         src="../app-images/close.png"/>
                </div>

                {this.state.data ?
                    <header className="about-header">

                        <div className="container">
                            <h1 className="page-title">{this.state.title}</h1>
                            <h4 className="underline">
                                Last modified: {this.state.data.lastDate}
                                ‌</h4>
                            <p><span>Version number: {this.state.data.versionNumber}</span></p>
                            <h3>{this.props.type === 'terms' ? 'PLEASE NOTE: THESE TERMS OF USE CONTAIN AN ARBITRATION AGREEMENT.' : ''}</h3>
                        </div>

                    </header>
                    :
                    ''
                }
                {this.state.data && this.state.data.content ?
                    <div dangerouslySetInnerHTML={{__html: this.state.data.content}}/>
                    :
                    ''
                }
                {this.state.error ?
                    <header className="about-header">
                        <div className="container">
                            <h1>{this.state.title}</h1>
                            <h4 className="text-danger">
                                {this.state.error.customMessage ? this.state.error.customMessage : "ERROR!"}
                                ‌</h4>
                        </div>
                    </header>
                    :
                    ""
                }
            </div>

        )
    }
}


export default withRouter(DynamicPage);
