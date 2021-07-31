import React, {Component} from 'react';
import zxcvbn from "zxcvbn";
import '../css/views/PasswordStrengthMeter.css';

class PasswordStrengthMeter extends Component {

    constructor(props) {
        super(props);
        this.complexity = this.complexity.bind(this);
    }

    complexity = (result) => {

        if(!result.password) return '';
        return (result.score<=1) ? 'weak' :(result.score === 2 ? 'good' : (result.score === 3 ? 'strong' : 'very strong'));
    }

    render() {
        const {password} = this.props;
        const testedResult = zxcvbn(password);
        return (
            <div className="text-right">
                {/*<div className={`password-strength-meter-progress ${this.complexity(testedResult)>=2 ? 'selected' : '' } `}>*/}
                {/*<span></span>*/}
                {/*</div>*/}
                {/*<div className={`password-strength-meter-progress ${this.complexity(testedResult)>=3 ? 'selected' : '' } `}>*/}
                {/*<span></span>*/}
                {/*</div>*/}
                {/*<div className={`password-strength-meter-progress ${this.complexity(testedResult)>=4 ? 'selected' : '' } `}>*/}
                {/*<span></span>*/}
                {/*</div>*/}
                <em>{this.complexity(testedResult)}</em>
            </div>
        );
    }
}

export default PasswordStrengthMeter;