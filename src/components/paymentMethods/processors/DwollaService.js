export default class DwollaService {
    constructor(env: { dwollaEnv: String }) {
        this.env = env

        this.loadDwolla(env)
    }

    loadDwolla = (env: { dwollaEnv: String }) => {
        if (!window.dwolla) {
            const script = document.createElement('script')
            script.onload = () => this.configureDwolla(env)
            script.src = 'https://cdn.dwolla.com/1/dwolla.min.js'
            document.head.appendChild(script)
        } else {
            this.configureDwolla(env)
        }
    }

    configureDwolla = (env: { dwollaEnv: String }) => {
        this.dwolla = window.dwolla
        this.dwolla.configure(env.dwollaEnv)
    }

    createDwollaFundingSource = (
        data: {
            authorityId: String,
            userType: String,
            routingNumber: String,
            accountNumber: String,
            accountType: String,
            bankAccountLastFour: String,
            token: String
        },
        onSuccess: (dwollaFundingSourceId : String) => void,
        onFail: (dwollaErrorMessage: String) => void
    ) => {

        if (this.dwolla) {
            const {
                routingNumber,
                accountNumber,
                accountType,
                bankAccountLastFour,
                token
            } = data

            this.dwolla.fundingSources.create(
                token,
                {
                    routingNumber,
                    accountNumber,
                    type: accountType,
                    name: bankAccountLastFour
                },
                (err, resp) => {
                    if (err) {
                        let errorMessage = "Error adding payment method.";
                        let embedded = err._embedded;
                        if (embedded) {
                            let embeddedErrors = embedded.errors;
                            if (embeddedErrors && embeddedErrors.length > 0) {
                                let embeddedError = embeddedErrors[0];
                                if (embeddedError) {
                                    errorMessage = embeddedError.message;
                                }
                            }
                        }
                        onFail(errorMessage)
                    } else {
                        let links = resp['_links'];
                        let fundingSource = links['funding-source'];
                        let fundingSourceHref = fundingSource['href'];
                        let dwollaFundingSourceId = fundingSourceHref.substring(fundingSourceHref.lastIndexOf("/") + 1, fundingSourceHref.length);

                        onSuccess(dwollaFundingSourceId)
                    }
                }
            )
        } else {
            console.warn("Attempting to create dwolla funding source without viable instance")
        }
    }
}
