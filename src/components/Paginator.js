import React, {Component} from 'react';
import PropTypes from 'prop-types'

import '../css/components/paginator.css';


class Paginator extends Component {
    static propTypes = {
        currentPage: PropTypes.number,
        pageCount: PropTypes.number
    }

    constructor(props) {
        super(props);

        this.state = {
            currentPage: props.currentPage ? props.currentPage : 0,
            pageCount: props.pageCount ? props.pageCount : null,
            error: null,
            pages: null
        };
    }

    componentDidMount() {
        this.setState({pages:this.pagination(this.props.currentPage, this.props.pageCount)});
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({pages:this.pagination(nextProps.currentPage, nextProps.pageCount)});
    }

    pagination = (c, m) => {
        var current = c,
            last = m,
            delta = 1,
            left = current - delta,
            right = current + delta +1,
            range = [],
            rangeWithDots = [],
            l;

        for (let i = 1; i <= last; i++) {
            if ((i === 1 || i === last) || (i >= left && i < right)) {
                range.push(i);
            }
        }


        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }

            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };



    render() {
        return (
            <ul className="paginator">
                {this.state.pages ?
                    this.state.pages.map((item, index) => {

                        let link = <a href={"../blog?page="+item}>{item}</a>

                        if(item === "...") {
                            link = <div>{item}</div>
                        }

                        return (
                            <li key={index}
                                className={(item === this.props.currentPage) ? 'current' : ''}>
                                {link}
                            </li>
                        )
                    })
                    :

                    null}
            </ul>
        )
    }
}


export default Paginator;
