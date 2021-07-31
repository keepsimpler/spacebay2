let AppUtils = {

    timeConverter(timeIn,type) {
        let a = new Date(timeIn),
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            year = a.getFullYear(),
            month = months[a.getMonth()],
            date = a.getDate(),
            hour = a.getHours(),
            min = a.getMinutes(),
            sec = a.getSeconds(),
            ext = 'AM';


        let lastDateStrong ='';
        switch(date){
            case 1:
            case 21:
            case 31:
                lastDateStrong = 'st';
                break;
            case 2:
            case 22:
                lastDateStrong = 'nd';
                break;
            case 3:
            case 23:
                lastDateStrong = 'rd';
                break;
            default:
                lastDateStrong = 'th';
                break;
        }
        if (hour > 12) {
            ext = 'PM';
            hour = (hour - 12);

            if (hour < 10) {
                hour = "0" + hour;
            } else if (hour === 12) {
                hour = "00";
                ext = 'AM';
            }
        }
        else if (hour < 12) {
            hour = ((hour < 10) ? "0" + hour : hour);
            ext = 'AM';
        } else if (hour === 12) {
            ext = 'PM';
        }

        if (min < 10) {
            min = "0" + min;
        }

        if(type === 'with-time'){
            return month + ' ' + date +lastDateStrong+ ', ' + year + ' ' + hour + ':' + min + ':' + sec + ' ' + ext;
        }else{
            return month + ' ' + date +lastDateStrong+ ', ' + year ;
        }

    },
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
};



export {
    AppUtils as default,
};
