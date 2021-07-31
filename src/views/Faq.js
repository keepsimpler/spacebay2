import React, {Component} from 'react';
import Busy from "../components/Busy";
import '../css/theme/mainContent.css';
import '../css/views/faq.css';
import '../css/views/hubspot_faq.css';
import {Helmet} from "react-helmet";
import { withRouter } from "react-router";
import URLUtils from "../util/URLUtils";
import Error from "../components/Error";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import classNames from 'classnames'

const $ = window.$;

class Faq extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTerm: URLUtils.getQueryVariable('searchedTerm') ? URLUtils.getQueryVariable('searchedTerm') : '',
            singleClass: 'hidden',
            posts: null,
            htmlContent: null,
            error: null,
            singlePostId: this.props.match && this.props.match.params.id ? (this.props.match.params.id) : null,
            singlePost: null,
            url: window.location.href,
            successContact: ''
        };
    }

    componentDidMount() {
        this.getDataAll(this.state.currentTerm);
        let wH = $(window).innerHeight();
        let wH1 = wH - $('#appNav').innerHeight() - $(".ss-footer-section").innerHeight() - 21;
        $(".blog-content").css("minHeight", wH1);
    }

    getKnowledgeBaseArticle = term => {
        return new Promise((resolve, reject) => {
            let url = '/api/getKnowledgeArticle?term=' + term;
            $.ajax({
                url: url,
                type: 'GET',
                contentType: 'text/html;',
                dataType: "text",
                success: (data) => {
                    let doc = new DOMParser().parseFromString(data, 'text/html');
                    let bc = this.generateBreadCrumbs(doc);

                    let pozStart = data.indexOf('<main');
                    let pozEnd = data.indexOf('</main');
                    data = data.substr(pozStart, pozEnd - pozStart);

                    doc = new DOMParser().parseFromString(data, 'text/html');
                    $(doc.body.querySelectorAll('header')).remove();
                    $(doc.body.querySelectorAll('meta')).remove();

                    // $(doc.body.querySelectorAll('.kb-breadcrumbs')).remove();
                    $(doc.body.querySelectorAll('.kb-sidebar')).remove();
                    $(doc.body.querySelectorAll('footer')).remove();
                    $(doc.body.querySelectorAll('.main-body')).removeClass('main-body');


                    $(doc.body.querySelectorAll('.kb-breadcrumbs')).html(bc);

                    resolve(doc.documentElement.innerHTML);
                },
                error: (data) => {
                    reject(data);
                }
            });
        });
    };

    generateBreadCrumbs(doc) {
        let title = doc.getElementsByTagName('title')[0];
        return '<ol className="blog-breadcrumb"><li><a href="/faq">FAQ</a>&nbsp; ›&nbsp;</li><li>' +
            title.innerText + '</li></ol>';

    }

    getPageContent(doc) {
        let myPage = $(doc.body.querySelectorAll('.kb-content')).html();
        return myPage;
    }


    removeParts(doc, elem) {
        let myPage = $(doc.body.querySelectorAll(elem)).remove();
        return myPage.html();
    }

    getKnowledgeBase = term => {
        return new Promise((resolve, reject) => {
            let url = '/api/getKnowledge?term=' + (term ? term : 'space how do can what my i');
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

    getDataAll = term => {
        let _this = this;
        Busy.set(true);
        if (_this.state.singlePostId) {
            _this.getKnowledgeBaseArticle(_this.state.singlePostId).then(function (values) {
                Busy.set(false);
                _this.setState({error: null});

                if (values) {
                    _this.setState({singlePost: values});
                } else {
                    _this.setState({singlePost: null});
                }

                setTimeout(function () {
                    _this.setState({singleClass: ''});
                });

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
            Promise.all([this.getKnowledgeBase(term)]).then(function (values) {
                Busy.set(false);
                _this.setState({error: null});

                let posts = null;
                if (values && values[0]) {
                    posts = values[0].results;
                    posts.sort(function (a, b) {
                        var x = a.category.toLowerCase();
                        var xSub = a.subcategory ? a.subcategory.toLowerCase() : '';
                        var y = b.category.toLowerCase();
                        var ySub = b.subcategory ? b.subcategory.toLowerCase() : '';
                        if (x === y) {
                            return xSub < ySub ? -1 : xSub > ySub ? 1 : 0;
                        }
                        return x < y ? -1 : x > y ? 1 : 0;
                    });
                }
                _this.setState({posts: posts});
                _this.createHtml();

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
    };

    getSlug = post => {
        return post.url.split("/").splice(-1);

    };

    handleSearch = () => {
        this.setState({currentTerm: this.state.searchedTerm});
        this.getDataAll(this.state.currentTerm);
    };

    static isInteger(x) {
        return x.indexOf('.') < 0 && x % 1 === 0;
    }

    handleChange = event => {

        //Clear out success and error messages when the user begins editing again.
        this.setState({
            updateSuccessful: false,
            errorMessage: '',
            successContact: ''
        });

        let name = event.target.name;
        let value = event.target.value;

        if ('contactPhone' === name && (!Faq.isInteger(value) || value > 9999999999)) {
            return;
        }

        this.setState({[name]: value});

    };

    createHtml = () => {
        let currentCategory = '';
        let currentSubCategory = '';
        let htmlContent = '';

        for (let i = 0; i < this.state.posts.length; i++) {
            let item = this.state.posts[i];
            if (typeof item.subcategory === 'undefined') {
                item.subcategory = 'General';
            }
            if (currentCategory !== item.category) {
                if (currentCategory !== '') {
                    htmlContent += '</ul></div></div></div>';
                }
                currentCategory = item.category;
                currentSubCategory = item.subcategory;

                //start section
                htmlContent += '<div class="w100 pull-left b-bottom">';
                htmlContent += '<h3 class="faq-category">' + item.category + '</h3><br/>';
                htmlContent += '<div class="d-flex flex-wrap"><div class="col-sm-12 col-md-6 no-padding"><h4>' + item.subcategory + '</h4>';
                htmlContent += '<ul>';

            } else if (currentSubCategory !== item.subcategory) {
                currentSubCategory = item.subcategory;
                htmlContent += '</ul></div>';
                htmlContent += '<div class="col-sm-12 col-md-6 no-padding"><h4>' + item.subcategory + '</h4>';
                htmlContent += '<ul>';
            }
            htmlContent += ' <li><a href ="/faq/' + this.getSlug(item) + '">' + item.title + '</a></li>';
        }
        if (htmlContent) htmlContent += '</ul></div></div></div>';

        this.setState({htmlContent: htmlContent});
    };

    setErrorMessage = message => {
        Busy.set(false);
        this.setState({
            updateSuccessful: false,
            errorMessage: message,
            successContact: ''
        });
    };

    handleSubmit = event => {

        this.setState({errorMessage: ''});

        if (!this.state.contactName) {
            this.setErrorMessage("Please enter a contact name");
            return;
        }

        if (!this.state.contactEmail) {
            this.setErrorMessage("Please enter a contact email address");
            return;
        }

        if (!this.state.contactMessage) {
            this.setErrorMessage("Please enter your message");
            return;
        }
        let fields = [
            {
                "name": "firstname",
                "value": this.state.contactName
            },
            {
                "name": "email",
                "value": this.state.contactEmail
            },
            {
                "name": "phone",
                "value": this.state.contactPhone
            },
            {
                "name": "message",
                "value": this.state.contactMessage
            }
        ];


        $.ajax({
            url: 'https://api.hsforms.com/submissions/v3/integration/submit/3473416/2a175ba1-5b4a-4e97-9851-8f5196345940',
            data: JSON.stringify({fields}),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });
    };

    handleFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON.errors ? jqXHR.responseJSON.errors[0].message : "";
        errorMessage = errorMessage ? errorMessage : (jqXHR.responseJSON ? jqXHR.responseJSON.message : "Wrong request");
        this.setErrorMessage(errorMessage);
    };

    handleSuccess = contact => {
        this.setState({doneEditingContactForm: true});
        this.setState({
            contactName: '',
            contactEmail: '',
            contactPhone: '',
            contactMessage: '',
            successContact: 'Success'
        })
        //(contact.inlineMessage);
    };


    render() {
        return (
            <section id="ssFaq" className={classNames("w100 pull-left", this.props.fromSinglePost ? "faq-single" : "faq")}>
                {this.state.singlePostId && this.state.singlePost
                    ?
                    <div className={'blog-content w100 ' + this.state.singleClass}>
                        <div className="container" dangerouslySetInnerHTML={{__html: this.state.singlePost}}/>
                    </div>
                    :
                    null
                }
                {!this.state.singlePostId && this.state.posts
                    ?
                    <div className="">
                        <Helmet>
                            <title>SecurSpace Support | Nationwide Truck Parking & Storage</title>
                            <meta name="keywords" content="blog"/>
                            <meta name="description"
                                  content="Stay up to date on all things truck and trailer parking, equipment drop off, drop yard efficiency, yard space and more with the SecurSpace blog."/>
                            <link rel="canonical" href={this.state.url}/>
                        </Helmet>

                        <header className="grey-bg">
                            <h1 className="content-header-title">How can we help you? </h1>
                            <div className="content-header-description"> You can also browse the topics below to find
                                what you are looking for.
                            </div>
                            <form id="landingInlineSearchForm">
                                <div className="faq-search">

                                    <input type="text"
                                           name="searchedTerm"
                                           value={this.state.searchedTerm}
                                           onChange={this.handleChange}
                                           placeholder="Type keywords to find answers"
                                    />

                                    <div className="flex-right">
                                        <button type="button" onClick={this.handleSearch}>
                                            Search
                                        </button>

                                    </div>
                                </div>
                            </form>
                            <br/>
                            <div className='w100 text-center pull-left'></div>
                            <div className="clear"></div>
                        </header>
                        <br/>

                        {!this.state.currentTerm ?
                            <div className="w100 pull-left white-bg blog">
                                <div className="container" id="page-content">
                                    {this.state.htmlContent ?
                                        <div className="blog-content w100"
                                             dangerouslySetInnerHTML={{__html: this.state.htmlContent}}/>
                                        :
                                        null
                                    }
                                    <div className="clear"></div>
                                </div>
                            </div>
                            :
                            <div className="w100 pull-left white-bg blog">
                                <div className="container" id="page-content">
                                    <p className="subtitle">Searching FAQ for '{this.state.currentTerm}'</p>
                                    {this.state.htmlContent ?
                                        <div className="blog-content w100">
                                            {
                                                this.state.posts.map((item, key) =>
                                                    <a className="faq-search-result"
                                                       href={'/faq/' + this.getSlug(item)} key={'a-' + key}>
                                                        <p>
                                                            {item.category}
                                                            {item.subcategory ? ' / ' : ''}
                                                            {item.subcategory}
                                                        </p>
                                                        <h4 dangerouslySetInnerHTML={{__html: item.title}}/>
                                                        <p dangerouslySetInnerHTML={{__html: item.description}}/>
                                                    </a>
                                                )}
                                        </div>

                                        :
                                        <div className="blog-content w100 ">
                                            <div className="faq-search-result">
                                                <h4 className="txt-black">No results</h4>
                                                <p>Please check your spelling or try another term</p>
                                            </div>
                                        </div>
                                    }
                                    <div className="clear"></div>
                                </div>
                            </div>
                        }
                        <div className="w100 pull-left">
                            {this.state.successContact ?
                                <div className="thank_you container">
                                    <img alt="" src="../app-images/contact/thank_you_icon.svg"/>
                                    <h2 className='text-center'>Thank you for contacting SecūrSpace!</h2>
                                    <p>We will contact you as soon as possible</p>
                                </div>
                                :
                                <div className="container" id="contact-page-form-panel">
                                    <h3>Still need help? Send us your question!</h3>
                                    <form method="post"
                                          action="https://forms.hubspot.com/uploads/form/v2/3473416/2a175ba1-5b4a-4e97-9851-8f5196345940">
                                        <div>
                                            <fieldset>
                                                <label>NAME<sup>*</sup></label>
                                                <input type="text"
                                                       name="contactName"
                                                       value={this.state.contactName}
                                                       onChange={this.handleChange}
                                                       placeholder="Enter a contact name"
                                                />
                                                <hr/>
                                            </fieldset>
                                            <fieldset>
                                                <label>E-MAIL<sup>*</sup></label>
                                                <input type="text"
                                                       name="contactEmail"
                                                       value={this.state.contactEmail}
                                                       onChange={this.handleChange}
                                                       placeholder="Enter an email where we can reach you"
                                                />
                                                <hr/>
                                            </fieldset>
                                            <fieldset>
                                                <label>PHONE</label>
                                                <input type="text"
                                                       name="contactPhone"
                                                       value={this.state.contactPhone}
                                                       onChange={this.handleChange}
                                                       placeholder="Enter a phone number where we can reach you"
                                                />
                                                <hr/>
                                            </fieldset>
                                            <fieldset>
                                                <label>QUESTION<sup>*</sup></label>
                                                <textarea
                                                    name="contactMessage"
                                                    value={this.state.contactMessage}
                                                    onChange={this.handleChange}
                                                    placeholder="How can we help you?"
                                                />
                                                <hr/>
                                            </fieldset>
                                        </div>

                                        {this.state.errorMessage ? <Error>{this.state.errorMessage}</Error> : ''}

                                        <div>
                                            <button type="button" className="w100 orange-button "
                                                    onClick={this.handleSubmit}>Submit
                                            </button>
                                        </div>


                                    </form>
                                </div>
                            }
                        </div>
                    </div>
                    :
                    null
                }
            </section>
        )
    }
}
export default withRouter(Faq);
