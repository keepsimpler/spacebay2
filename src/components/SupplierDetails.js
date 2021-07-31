import React, {Component} from 'react';
import 'bxslider/dist/jquery.bxslider.min';
import 'bxslider/dist/jquery.bxslider.min.css';
import '@fancyapps/fancybox/dist/jquery.fancybox';
import '@fancyapps/fancybox/dist/jquery.fancybox.css';
import '../css/components/supplierDetails.css';
import BookSpaceForm from "./BookSpaceForm";
import {Link} from "react-router-dom";
import Busy from "./Busy";
import SupplierDetailHeaderCard from "./SupplierDetailHeaderCard";
import { GlobalModalContext } from "../context/global-modal-context";


const $ = window.$;

class SupplierDetails extends Component {
    static contextType = GlobalModalContext

    constructor(props) {
        super(props);

        this.state = {
            orderNumber: '',
            autoApproved: '',
            usedPrice: 0,
            recurringBooking: this.props.recurringBooking,
            selectedFrequencyType: this.props.selectedFrequencyType,
            frequencyTypeOptions: this.props.frequencyTypeOptions,
            selectedFrequencyTypeOption: this.props.selectedFrequencyTypeOption,
            startDate: this.props.startDate,
            endDate: this.props.endDate
        };

        this.bxslider = null;
    }

    onClose = () => {
        this.setState({orderNumber: ''});
    };

    startSlider = () => {
        let w = $('#supplierDetailContainer').width() - 20;
        let total = this.props.supplier.gallery.length;
        this.bxslider = $('.bxslider').bxSlider({
            auto: false,
            infiniteLoop: true,
            pager: true,
            preventDefaultSwipeY: true,
            speed: 500,
            minSlides: 2,
            maxSlides: 2,
            moveSlides: 1,
            slideWidth: w / 2,
            slideMargin: 20,
            buildPager: function (slideIndex) {
                if (total === 1) {
                    return '1/1 Photo';
                } else return (slideIndex + 1) + '/' + total + ' Photos';
            }
        });

        $(".fancybox")
            .fancybox({
                padding: 0,
                arrows: true,
                nextClick: true,
                autoPlay: false,
                playSpeed: 1500,
                openEffect: 'elastic',
                openSpeed: 'slow',
                closeEffect: 'fade',
                closeSpeed: 'fast',
                nextEffect: 'elastic',
                nextSpeed: 'slow',
                closeBtn: true
            });
    };

    componentDidMount() {
        if (this.bxslider) {
            this.bxslider.destroySlider();
        }

        if (this.props.supplier.gallery.length > 0) {
            this.startSlider();
        }
    }

    componentDidUpdate(prevProps) {

        if (this.props.supplier.locationId !== prevProps.supplier.locationId) {
            this.setState({"usedPrice": 0});
        }
        if (this.bxslider && this.props.supplier.gallery === prevProps.supplier.gallery) {
            return;
        }
        if (this.bxslider) {
            this.bxslider.destroySlider();
        }

        if (this.props.supplier.gallery.length > 0) {
            this.startSlider();
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.startDate !== nextProps.startDate) {
            this.setState({
                startDate: nextProps.startDate
            });
        }
        if (this.props.endDate !== nextProps.endDate) {
            this.setState({
                endDate: nextProps.endDate
            });
        }
    }

    onBookSpaceSuccess = (orderNumber, autoApproved) => {
        Busy.set(false);
        this.setState({orderNumber: orderNumber, autoApproved: autoApproved});
        this.props.clearErrors();
    };

    onError = (message) => {
        Busy.set(false);
        this.props.onError(message);
    };

    handleFrequencyChange = (
        recurringBooking,
        selectedFrequencyType,
        frequencyTypeOptions,
        selectedFrequencyTypeOption,
        endDate
    ) => {
        this.setState({
            recurringBooking: recurringBooking,
            selectedFrequencyType: selectedFrequencyType,
            frequencyTypeOptions: frequencyTypeOptions,
            selectedFrequencyTypeOption:selectedFrequencyTypeOption
        })
    };

    rateChange = rate => {
        this.setState({
            usedPrice: rate
        })
    };

    render() {
        const globalModalContext = this.context
        const { showLoginModal } = globalModalContext
        return (
            <div id="supplierDetailContainer">
                <SupplierDetailHeaderCard
                    supplier={this.props.supplier}
                    onClose={this.props.onClose}
                    usedPrice={this.state.usedPrice}
                    selectedFrequencyType={this.state.selectedFrequencyType}
                    recurringBooking={this.state.recurringBooking}
                />
                <div className="with-scroll">
                    {
                        (this.props.supplier.gallery && this.props.supplier.gallery.length > 0) ?
                            (this.props.supplier.gallery.length > 1 ) ?
                                <ul className="bxslider">
                                    {this.props.supplier.gallery.map((item, key) =>
                                        <li key={key}>
                                            <a className="fancybox" data-fancybox="gallery"
                                               href={'https://s3-us-west-1.amazonaws.com/securspace-files/gallery/' + this.props.supplier.locationId + '/' + item}>
                                                <img alt=""
                                                     src={'https://s3-us-west-1.amazonaws.com/securspace-files/gallery/' + this.props.supplier.locationId + '/' + item}/>
                                            </a>
                                        </li>
                                    )}
                                </ul>
                                :
                                <ul className="bxslider">
                                    <li key="1">
                                        <a className="fancybox" data-fancybox="gallery"
                                           href={'https://s3-us-west-1.amazonaws.com/securspace-files/gallery/' + this.props.supplier.locationId + '/' + this.props.supplier.gallery[0]}>
                                            <img alt=""
                                                 src={'https://s3-us-west-1.amazonaws.com/securspace-files/gallery/' + this.props.supplier.locationId + '/' + this.props.supplier.gallery[0]}/>
                                        </a>
                                    </li>
                                    <li key="2">
                                        <a className="fancybox" data-fancybox="gallery"
                                           href={'https://s3-us-west-1.amazonaws.com/securspace-files/gallery/' + this.props.supplier.locationId + '/' + this.props.supplier.gallery[0]}>
                                            <img alt=""
                                                 src={'https://s3-us-west-1.amazonaws.com/securspace-files/gallery/' + this.props.supplier.locationId + '/' + this.props.supplier.gallery[0]}/>
                                        </a>
                                    </li>
                                </ul>
                            : <ul className="bxslider hidden"></ul>
                    }
                    <div id="supplierDetailsContent">
                        {
                            this.state.orderNumber ?
                                this.state.autoApproved ?
                                    <div className="order-summary">
                                        <h1>THANKS FOR YOUR ORDER<br/></h1>
                                        <h2>{"Booking Number: " + this.state.orderNumber}</h2>
                                        <ul>
                                            <li><p>This order has been approved and your payment is processing.</p></li>
                                            <li><p>Please check the My Bookings page for details about your booking.</p>
                                            </li>
                                        </ul>
                                        <hr/>
                                        <button id="continue-search-button" className="ss-button-primary"
                                                onClick={() => this.setState({orderNumber: ''})}>Continue Searching
                                        </button>
                                        <Link to={{pathname: '/my-bookings'}}>
                                            <button className="ss-button-primary">View Bookings</button>
                                        </Link>
                                    </div>
                                    :
                                    <div className="order-summary">
                                        <h1>THANKS FOR YOUR ORDER<br/></h1>
                                        <h2>{"Booking Number: " + this.state.orderNumber}</h2>
                                        <ul>
                                            <li><p>This order has been submitted for approval.</p></li>
                                            <li><p>Please check the My Bookings page for the status of this order.</p>
                                            </li>
                                            <li><p>You will not be charged until the order is approved.</p></li>
                                        </ul>
                                        <button id="continue-search-button" className="ss-button-primary"
                                                onClick={() => this.setState({orderNumber: ''})}>Continue Searching
                                        </button>
                                        <Link to={{pathname: '/my-bookings'}}>
                                            <button className="ss-button-primary">View Bookings</button>
                                        </Link>
                                    </div>
                                :
                                this.props.account && this.props.account.id ?
                                    <BookSpaceForm account={this.props.account}
                                                   supplier={this.props.supplier}
                                                   numberOfSpaces={this.props.numberOfSpaces}
                                                   recurringBooking={this.state.recurringBooking}
                                                   frequencyTypeOptions={this.state.frequencyTypeOptions}
                                                   selectedFrequencyType={this.state.selectedFrequencyType}
                                                   selectedFrequencyTypeOption={this.state.selectedFrequencyTypeOption}
                                                   startDate={this.state.startDate}
                                                   endDate={this.state.endDate}
                                                   onError={this.onError}
                                                   onSuccess={this.onBookSpaceSuccess}
                                                   handleLogout={this.props.handleLogout}
                                                   handleFrequencyChange={this.handleFrequencyChange}
                                                   rateChange={this.rateChange}
                                                   paymentMethods={this.props.paymentMethods}
                                                   readSupplierPendingBooking={this.props.readSupplierPendingBooking}
                                                   handleAccountChange={this.props.handleAccountChange}
                                    />
                                    :
                                    <div>
                                        <BookSpaceForm account={this.props.account}
                                                       supplier={this.props.supplier}
                                                       numberOfSpaces={this.props.numberOfSpaces}
                                                       recurringBooking={this.state.recurringBooking}
                                                       frequencyTypeOptions={this.state.frequencyTypeOptions}
                                                       selectedFrequencyType={this.state.selectedFrequencyType}
                                                       selectedFrequencyTypeOption={this.state.selectedFrequencyTypeOption}
                                                       startDate={this.state.startDate}
                                                       endDate={this.state.endDate}
                                                       onError={this.onError}
                                                       onSuccess={this.onBookSpaceSuccess}
                                                       handleLogout={this.props.handleLogout}
                                                       handleFrequencyChange={this.handleFrequencyChange}
                                                       rateChange={this.rateChange}
                                                       paymentMethods={this.props.paymentMethods}
                                                       readSupplierPendingBooking={this.props.readSupplierPendingBooking}
                                        />
                                        <div className="need-to-login-panel">
                                            <p>Log In To Book<br/> Space At This Supplier!</p>
                                            <span className="pointer" onClick={()=>{
                                                showLoginModal()
                                            }}>
                                                <button className="orange-button">Log In</button>
                                            </span>
                                        </div>
                                    </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default SupplierDetails;
