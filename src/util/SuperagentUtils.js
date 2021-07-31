import superagent from "superagent";
import {TrackJS} from "trackjs";

const request = superagent.agent()
    .use(function(req) {
        req.on('response', function (res) {
            if (!res.ok) {
                if (!TrackJS) { return; } // Safety Check

                let errorMessage = res.body && res.body.message ?
                    res.body.message :
                    (res.status + " " + res.statusText + ": " + res.req.method + " " + res.req.url);

                // Log the relevant info to the Telemetry Console
                TrackJS.console.log({
                    message: errorMessage,
                    method: res.req.method,
                    url: res.req.url,
                    status: res.status,
                    statusText: res.statusText
                });

                // Record the Error
                TrackJS.track(errorMessage);
            }
        });
    });

export default request;