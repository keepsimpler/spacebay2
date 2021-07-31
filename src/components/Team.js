import React, {Component} from 'react';
import '../css/components/team.css';

const $ = window.$;

class Team extends Component {
    constructor(props) {
        super(props);

        this.team = [
            {
                "img": "../app-images/lance.png",
                "name": "Lance Theobald",
                "title": "Chief Executive Officer",
                "description":"Not only does this problem add to the congestion issues costing truckers and shippers time and money, but future improvement looks grim "
            },
            {
                "img": "https://s3-us-west-1.amazonaws.com/securspace-files/app-images/AdamSimkins.png",
                "name": "Adam Simkins",
                "title": "Chief Technical Officer",
                "description":"Not only does this problem add to the congestion issues costing truckers and shippers time and money, but future improvement looks grim "
            }, {
                "img": "https://s3-us-west-1.amazonaws.com/securspace-files/app-images/CoryBailey.png",
                "name": "Cory Bailey",
                "title": "President",
                "description":"Not only does this problem add to the congestion issues costing truckers and shippers time and money, but future improvement looks grim "
            }
        ];
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
        let w = $('.our-team').width() ;

        if(windowWidth< 520) {
            numberOfVisibleSlides = 1;
            sliderMargin = 20;
        }
        else if (windowWidth < 800) {
            numberOfVisibleSlides = 1;
            sliderMargin = 20;
        }
        else if (windowWidth < 1200) {
            numberOfVisibleSlides = 3;
            sliderMargin = 20;
        }
        else {
            numberOfVisibleSlides = 3;
            sliderMargin =20;
        }

        this.bxslider = $('.our-team ul').bxSlider({
            auto:  (numberOfVisibleSlides === 1),
            responsive: true,
            infiniteLoop: true,
            pager: false,
            controls: (numberOfVisibleSlides === 1),
            preventDefaultSwipeY: true,
            speed: 500,
            minSlides: numberOfVisibleSlides,
            maxSlides: numberOfVisibleSlides,
            moveSlides: 1,
            slideWidth: Math.ceil(w / numberOfVisibleSlides),
            slideMargin: sliderMargin
        })
    };




    render() {
        return (
            <div className="our-team">
                {
                    this.team && this.team.length > 0
                        ?
                        <ul className="">
                            {this.team.map((item, key) =>
                                <li key={key}>
                                    <img  className="img-circle" src={item.img} alt=""/>
                                    <div className="our-team-name">{item.name}</div>
                                    <div className="our-team-title">{item.title}</div>
                                    {/*<div className="our-team-separator"><hr/></div>*/}
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

export default Team;