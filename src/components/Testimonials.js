import React, {Component} from 'react';
import '../css/components/testimonials.css';

const $ = window.$;

class Testimonials extends Component {
    constructor(props) {
        super(props);

        this.appTestimonials = [
            {
                "title": "Roger from 2Ports Logistics in Long Beach, CA",
                "content": "I like using SecūrSpace partner facilities because they are extremely clean, professional, and secure."
            },
            {
                "title": "Reggie Adams of 3XL Transport in Matthews, NC",
                "content": "SecūrSpace is great for finding safe parking and storage space."
            },
            {
                "title": " Marcus at TMS Transportation",
                "content": "I have nothing to worry about when I park my truck at a SecūrSpace yard for my 34 hour rest. "  +
                "I can enjoy my time off with my family, because security is great there."
            },
            {
                "title": "Customer from Drive DeVilbis",
                "content": "SecūrSpace is a convenient option for container storage needs. It's easy to book and pay."
            },
            {
                "title": "Customer at PJ Trans, Inc",
                "content": "SecūrSpace helped out our company so promptly yesterday. Highly skilled- we love that!"
            },
            {
                "title": "Karena at Magna Hub, Inc.",
                "content": "We are a small fleet. SecūrSpace is very efficient and easy to use. They helped our company find a perfect solution immediately. We will definitely use it in the future!"
            },
            {
                "title": "Kojus Trans Logistics",
                "content": "SecurSpace website is easy to navigate and it has simple steps to book or secure a space before sending the driver to drop off a unit. Payment is straight forward."
            },
            {
                "title": "Hight Logistics",
                "content": "SecūrSpace is easy to use and space is secured."
            },
            {
                "title": "Eduardo at Unified Global Logistics",
                "content": "We like using SecūrSpace because of how easy it is to book space."
            },
            {
                "title": "Gideon at New Life Trans",
                "content": "It is easy to use the website. Very good customer support."
            }
        ]
        this.state = {};
    }

    componentDidMount() {
        let _self =this;
        if (this.bxslider) {
            this.bxslider.destroySlider();
        }
        this.startSlider();

        $(document).on("scroll", function () {
            let elem = $('#start-testimonials');
            if (_self.isScrolledIntoView(elem)) {
                if(_self.bxslider){
                    _self.bxslider.startAuto();
                }
            }
        });
    }

    componentWillUnmount() {
        $(document).off('scroll');
    }

    startSlider = () => {
        let w = $(window).width() - 20;
        this.bxslider = $('.testimonials-slider ul').bxSlider({
            auto: false,
            infiniteLoop: true,
            pager: true,
            preventDefaultSwipeY: true,
            speed: 500,
            pause: 7000,
            minSlides: 1,
            maxSlides: 1,
            moveSlides: 1,
            slideWidth: w ,
            slideMargin: 20
        })
    };

    isScrolledIntoView = $elem => {
        let $window = $(window);
        let docViewTop = $window.scrollTop();
        let docViewBottom = docViewTop + $window.height();

        let elemTop = $elem.offset().top;
        let elemBottom = elemTop + $elem.height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    };




    render() {
        return (
            <div className="testimonials-slider">
                <div id="start-testimonials"/>
                {
                this.appTestimonials && this.appTestimonials.length > 0
                    ?
                    <ul className="">
                        {this.appTestimonials.map((item, key) =>
                            <li key={key}>
                                <div className="testimonials-title">{item.title}</div>
                                <div className="testimonials-content">
                                    <span>"</span>
                                    {item.content}
                                    <span>"</span>
                                </div>
                            </li>
                        )}
                    </ul>
                    :
                    null
            }
            </div>

        )
    }
}

export default Testimonials;