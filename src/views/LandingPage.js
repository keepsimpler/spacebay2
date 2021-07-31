import React, {Component} from 'react';
import Busy from "../components/Busy";
import { withRouter } from "react-router";
import '../css/theme/mainContent.css';

const $ = window.$;

class LandingPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pageCount: 0,
            error: null,
            singlePostId: this.props.match && this.props.match.params.id ? (this.props.match.params.id) : null,
            singlePost: null,
            url: window.location.href
        };
    }

    componentDidMount() {
        this.getDataAll();
        let wH = $(window).innerHeight();
        let wH1 = wH - $('#appNav').innerHeight() - $(".ss-footer-section").innerHeight() - 21;
        $(".blog-content").css("minHeight", wH1);
    }


    getPost = id => {
        return new Promise((resolve, reject) => {
            let url = '/api/getLandingPage/' + id;
            $.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/json; charset=UTF-8',
                dataType: "text",
                success: (data) => {
                    let doc = new DOMParser().parseFromString(data, 'text/html');

                    document.open();
                    document.write(data);
                    document.close();

                    let base = document.createElement('base');
                    base.href = 'https://3473416.hs-sites.com/';
                    document.getElementsByTagName('head')[0].appendChild(base);
                    resolve(doc.documentElement.innerHTML);
                },
                error: (data) => {
                    reject(data);
                }
            });
        });
    };

    getDataAll = page => {
        let _this = this;
        Busy.set(true);
        this.getPost(_this.state.singlePostId).then(function (data) {
            Busy.set(false);
            _this.setState({error: null});
            // _this.setState({singlePost: data});
        }).catch(function (error) {
            Busy.set(false);
            let err = error;
            err.customMessage = err.responseJSON && err.responseJSON.message ? err.responseJSON.message : '';
            _this.setState({
                error: err,
                data: null
            });
        });
    };

    render() {
        return (
            <div className="landing-page-container">
                {/*{*/}
                {/*    this.state.singlePost ?*/}
                {/*        <div dangerouslySetInnerHTML={{__html: this.state.singlePost}}/>*/}
                {/*        :*/}
                {/*        null*/}
                {/*}*/}
            </div>
        )
    }
}

export default withRouter(LandingPage);
