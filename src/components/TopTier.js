import React, {Component} from 'react';
import '../css/components/topTier.css';

const $ = window.$;

class TopTier extends Component {
    constructor(props) {
        super(props);

        this.appItems = [
            {
                "img": "../app-images/landing/toptier/HD_Main_Logo.png"
            },
            {
                "img": "../app-images/landing/toptier/ITS_ConGlobal_logo.png"
            },
            {
                "img": "../app-images/landing/toptier/MRS_CMC_logo.png"
            },
            {
                "img": "../app-images/landing/toptier/TCW_Logo_full.png"
            },
            {
                "img": "../app-images/landing/toptier/UPTime_Logo.png"
            },
            {
                "img": "../app-images/landing/toptier/yusenlogo.png"
            },
        ]
        this.state = {};
    }

    componentDidMount() {
        if (this.bxslider) {
            this.bxslider.destroySlider();
        }
        this.startSlider();

    }

    startSlider = () => {
        let numberOfVisibleSlides , sliderMargin;
        let windowWidth = $(window).width();
        let w = $('.top-tier').width() ;

        if(windowWidth< 520) {
            numberOfVisibleSlides = 2;
            sliderMargin = 20;
        }
        else if (windowWidth < 768) {
            numberOfVisibleSlides = 4;
            sliderMargin = 20;
        }
        else if (windowWidth < 1200) {
            numberOfVisibleSlides = 6;
            sliderMargin = 0;
        }
        else {
            numberOfVisibleSlides = 6;
            sliderMargin =0;
        }

        this.bxslider = $('.top-tier ul').bxSlider({
            auto:  (numberOfVisibleSlides === 2),
            responsive: true,
            infiniteLoop: true,
            pager: false,
            controls: (numberOfVisibleSlides === 2),
            preventDefaultSwipeY: true,
            speed: 500,
            minSlides: numberOfVisibleSlides,
            maxSlides: numberOfVisibleSlides,
            moveSlides: 1,
            slideWidth: Math.ceil(w / numberOfVisibleSlides),
            slideMargin: sliderMargin
        })
    };


    render()
{
    return (
        <div className="top-tier">
            <h2>Supported by top-tier customers and partners across the globe</h2>
            {
                this.appItems && this.appItems.length > 0
                    ?
                    <ul className="">
                        {this.appItems.map((item, key) =>
                            <li key={key}>
                                <img src={item.img} alt=""/>
                            </li>
                        )}
                    </ul>
                    :
                    null
            }
            <div className="clear"/>
        </div>

    )
}
}

export default TopTier;
