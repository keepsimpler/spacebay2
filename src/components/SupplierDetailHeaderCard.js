import React from 'react';
import "../css/components/supplierDetailHeaderCard.css"
import PaymentUtils from "../util/PaymentUtils";

export default ({supplier, onClose, recurringBooking, selectedFrequencyType, usedPrice}) => (
    <div className="ss-supplier-detail-header-card">
        {supplier.companyName ?
            <div className="ss-supplier-detail-header-card-wcompany-name  col-lg-4 col-md-4 col-sm-4">
                <div className="ss-supplier-detail-header-card-company-name">
                    {supplier.locationName}
                </div>
                <div className="ss-supplier-detail-header-card-company-desc">
                    {supplier.city}, {supplier.state}
                </div>
            </div>
            :
            <div className="ss-supplier-detail-header-card-woutcompany-name  col-lg-4 col-md-4 col-sm-4">
                <div className="ss-supplier-detail-header-card-company-desc">
                    {supplier.city}, {supplier.state}
                </div>
            </div>
        }
        <div className="ss-supplier-detail-header-card-price col-lg-4 col-md-4 col-sm-4">
            {
                recurringBooking ?
                    selectedFrequencyType && selectedFrequencyType.name === "Monthly" ?
                        <span>
                                <strong>${PaymentUtils.convertSmallestSubUnitToMainUnit(usedPrice ? usedPrice : supplier.pricePerMonth, PaymentUtils.CURRENCY_US_DOLLAR)}</strong>
                                &nbsp;per month
                            </span>
                        :
                        recurringBooking && selectedFrequencyType && selectedFrequencyType.name === "Weekly" ?
                            <span>
                                    <strong>
                                        ${PaymentUtils.convertSmallestSubUnitToMainUnit(usedPrice ? usedPrice : supplier.pricePerWeek, PaymentUtils.CURRENCY_US_DOLLAR)}</strong>
                                &nbsp;per week
                            </span>
                            :
                            ""
                    :
                    <span>
                            <strong>${PaymentUtils.convertSmallestSubUnitToMainUnit(usedPrice ? usedPrice : supplier.pricePerDay, PaymentUtils.CURRENCY_US_DOLLAR)}</strong>
                        &nbsp;per day
                    </span>
            }
        </div>
        <div className="col-lg-4 col-md-4 col-sm-4 ss-supplier-detail-type">
            <span
                className={!supplier.visible ? "notlive" : supplier.hasRequestedCapacity ? "instant" : ""}>{!supplier.visible ? "Not Live" : supplier.hasRequestedCapacity ? "Instant Approval" : "Request Space"}
            </span>
        </div>
        <div className="ss-supplier-detail-close">
            <img
                alt="Close"
                src="../app-images/close.png"
                onClick={onClose}
            />
        </div>
    </div>
)
