import React, {Component} from 'react';
import { withRouter } from "react-router";
import Busy from "../components/Busy";
import Paginator from "../components/Paginator";
import '../css/theme/mainContent.css';

import BlogPostSummary from "../components/BlogPostSummary";
import BlogPostDetails from "../components/BlogPostDetails";
import URLUtils from '../util/URLUtils';

import {Helmet} from "react-helmet";

const $ = window.$;
const pageSize = 9;

class Blog extends Component {
    constructor(props) {
        super(props);
        let pageNo = +URLUtils.getQueryVariable('page');
        console.log("found page number", pageNo)
        this.state = {
            currentPage: pageNo ? pageNo : 1,
            pageCount: 0,
            posts: null,
            topics: null,
            nrTopics: null,
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

    getTopics = () => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/api/getTopics',
                type: 'GET',
                contentType: 'application/json; charset=UTF-8',
                dataType: "json",
                success: (data) => {
                    resolve(data);
                },
                error: (data) => {
                    reject(data);
                }
            });
        });
    };

    getPost = id => {
        return new Promise((resolve, reject) => {
            let url = '/api/getPageByName/' + id;
            $.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/json; charset=UTF-8',
                dataType: "json",
                success: (data) => {
                    resolve(data);
                },
                error: (data) => {
                    reject(data);
                }
            });
        });
    };

    getPosts = page => {
        return new Promise((resolve, reject) => {
            let url = '/api/getBlogs?limit=' + pageSize + '&offset=' + (page - 1) * pageSize;

            $.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/json; charset=UTF-8',
                dataType: "json",
                success: (data) => {
                    resolve(data);
                },
                error: (data) => {
                    reject(data);
                }
            });
        });
    };

    getDataAll = page => {
        let _this = this;
        let usedPage = page ? page : this.state.currentPage;
        Busy.set(true);

        if (_this.state.singlePostId) {
            Promise.all([this.getTopics(), this.getPost(_this.state.singlePostId)]).then(function (values) {
                Busy.set(false);
                _this.setState({error: null});

                let topics = null;
                if (values && values[0]) {
                    let data = values[0];
                    topics = (data && data.objects) ? data.objects : null;
                }
                _this.setState({topics: topics});

                let singlePost = null;
                if(values &&values[1]) {
                    let data = values[1];
                    singlePost =  (data && data.objects) ? data.objects : [data];
                }
                _this.setState({singlePost: singlePost});
            }).catch(function (error) {
                Busy.set(false);
                let err = error;
                err.customMessage = err.responseJSON && err.responseJSON.message ? err.responseJSON.message : '';
                _this.setState({
                    error: err,
                    data: null
                });

            });
        } else {
            Promise.all([this.getTopics(), this.getPosts(usedPage)]).then(function (values) {
                Busy.set(false);
                _this.setState({error: null});

                let topics = null;
                if (values && values[0]) {
                    let data = values[0];
                    topics = (data && data.objects) ? data.objects : null;
                }

                let posts = null;
                if (values && values[1]) {
                    let data = values[1];
                    posts = (data && data.objects) ? data.objects : (data ? [data] : null);
                    _this.setState({pageCount: Math.ceil(data.total / pageSize)});
                }

                _this.setState({topics: topics, posts: posts});
            }).catch(function (error) {
                Busy.set(false);
                let err = error;
                err.customMessage = err.responseJSON && err.responseJSON.message ? err.responseJSON.message : '';
                _this.setState({
                    error: err,
                    data: null
                });

            });
        }
        _this.forceUpdate();
    };

    render() {
        return (
            <section className="w100 pull-left blog">

                {this.state.singlePostId && this.state.singlePost
                    ?
                    this.state.singlePost.map((post, index) =>
                        <BlogPostDetails key={this.state.currentPage + 'p' + index} post={post}
                                         topics={this.state.topics}/>
                    )
                    :
                    null
                }
                {!this.state.singlePostId && this.state.posts
                    ?
                    <div>
                        <Helmet>
                            <title>SecurSpace Blog | Nationwide Truck Parking & Storage</title>
                            <meta name="keywords" content="blog" />
                            <meta name="description"
                                  content="Stay up to date on all things truck and trailer parking, equipment drop off, drop yard efficiency, yard space and more with the SecurSpace blog." />
                            <link rel="canonical" href={this.state.url} />
                        </Helmet>
                        <div className="background parallax-bg"
                             style={{
                                 backgroundImage: 'url(https://s3-us-west-1.amazonaws.com/securspace-files/app-images/add_partners_trucks2.jpg)',
                             }}
                        >
                            <div className="overlay"></div>
                            <div className="title-full">
                                <h5>SECURSPACE</h5>
                                <h1>BLOG</h1>
                            </div>
                            <div className="arrow"></div>
                            <div className="overlay-blog"></div>
                        </div>
                        <div className="w100 pull-left white-bg">
                            <div className="container" id="page-content">
                                <div className="blog-content w100">
                                    {this.state.posts.map((post, index) =>
                                        <BlogPostSummary key={post.id} post={post} topics={this.state.topics}/>
                                    )
                                    }
                                </div>
                                <div className="clear"></div>
                            </div>
                        </div>

                    </div>
                    :
                    null
                }
                {
                    (this.state.pageCount > 1 )
                        ?
                        <Paginator currentPage={this.state.currentPage} pageCount={this.state.pageCount} />
                        :
                        null
                }
            </section>
        )
    }
}


export default withRouter(Blog);
