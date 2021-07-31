import React, {Component} from 'react';
import {withGoogleMap, GoogleMap, Marker} from "react-google-maps/lib";
import MarkerWithLabel from "react-google-maps/lib/components/addons/MarkerWithLabel";
import MapStyle from "./MapStyle";
// import '../css/components/supplierMap.css';
import 'css/views/search.css';
const google = window.google;

const SupplierSearchMap = withGoogleMap(props => (

    <GoogleMap
        ref={props.ref}
        center={props.center}
        zoom={props.zoom}
        options={props.options}
        onClick={props.onClick}
        disableDefaultUI="true"
        mapTypeControl="false"
    >
        {
            props.markers.map((marker, index) => (
                <div key={index}>
                {
                    props.account && props.account.userType === 'ADMIN' ?
                        <MarkerWithLabel
                            key={index}
                            position={marker.position}
                            onClick={() => props.onMarkerClick(marker)}
                            icon={marker.icon}
                            animation={window.google.maps.Animation.DROP}
                            shape={marker.shape}
                            labelAnchor={new window.google.maps.Point(0, 0)}
                            labelStyle={{
                                backgroundColor: "#cfdddd",
                                fontSize: "12px",
                                fontWeight: "500",
                                padding: "3px 5px",
                                borderRadius: "3px"
                            }}
                        >
                            <div>{((marker.supplier.maxSpacesBooked || marker.supplier.maxSpacesBooked === 0) ? marker.supplier.maxSpacesBooked : "NA") + "/" + (marker.supplier.totalNumberOfSpaces ? marker.supplier.totalNumberOfSpaces : "NA")}</div>
                        </MarkerWithLabel>
                        :
                        <Marker
                            key={index}
                            position={marker.position}
                            onClick={() => props.onMarkerClick(marker)}
                            icon={marker.icon}
                            animation={window.google.maps.Animation.DROP}
                            shape={marker.shape}
                        />
                }
                </div>
            ))
        }
    </GoogleMap>

));


class SupplierMap extends Component {
    componentDidUpdate (prevProps, prevState) {
        if(!document.getElementById('map-legend')) {
            if (this.mapContainer.state && this.mapContainer.state.map) {
                var icons;
                if (this.props.account && this.props.account.userType === 'ADMIN') {
                    icons = [
                        {
                            name: 'Instant Approval',
                            icon: 'app-images/parking-icon-auto-approve-selected.png'
                        },
                        {
                            name: 'Request Space',
                            icon: 'app-images/parking-icon-selected.png'
                        },
                        {
                            name: 'Not Live',
                            icon: 'app-images/not-live-parking-icon-selected.png'
                        }
                    ];
                } else {
                    icons = [
                        {
                            name: 'Instant Approval',
                            icon: 'app-images/parking-icon-auto-approve-selected.png'
                        },
                        {
                            name: 'Request Space',
                            icon: 'app-images/parking-icon-selected.png'
                        }
                    ];
                }

                var containerMap = document.getElementById('container-element');
                var legend = document.createElement('div');
                legend.setAttribute('id','map-legend');
                containerMap.appendChild(legend);
                for(var i=0; i<icons.length; i++) {
                    var type = icons[i];
                    var name = type.name;
                    var icon = type.icon;
                    var div = document.createElement('div');
                    div.innerHTML = '<img src="' + icon + '"> ' + name;
                    legend.appendChild(div);
                }

                this.mapContainer.state.map.controls[window.google.maps.ControlPosition.LEFT_BOTTOM].push(legend);
            }
        }

    }

    componentDidMount(){

    }

    static createMarkers(suppliers, selectedSupplier) {
        let markers = [];
        for (let i = 0; i < suppliers.length; i++) {
            let supplier = suppliers[i];
            let isSelectedSupplier = selectedSupplier && supplier.locationId === selectedSupplier.locationId;
            let image = {
                url: SupplierMap.getIconUrl(isSelectedSupplier, supplier.hasRequestedCapacity, supplier.visible),
                size: isSelectedSupplier ? new window.google.maps.Size(34, 48) : new window.google.maps.Size(30, 42),
                scaledSize: isSelectedSupplier ? new window.google.maps.Size(34, 48) : new window.google.maps.Size(30, 42),
                origin: new window.google.maps.Point(0, 0),
                anchor: isSelectedSupplier ? new window.google.maps.Point(17, 48) : new window.google.maps.Point(15, 42)
            };
            let thisMarker = {
                supplier: supplier,
                position: new window.google.maps.LatLng(supplier.addressLatitude, supplier.addressLongitude),
                icon: image
            };
            markers.push(thisMarker);
        }
        return markers;
    }

    onMarkerClicked = selectedMarker => {
        let selectedSupplier = selectedMarker ? selectedMarker.supplier : null;
        this.props.handleSupplierSelected(selectedSupplier);
        if(selectedSupplier){
            let windowLink=window.location.href;
            windowLink =windowLink.split('?');
            let url=windowLink[0]+'?initLat='+selectedSupplier.addressLatitude+'&initLng='+selectedSupplier.addressLongitude+'&selectedSupplier='+selectedSupplier.locationId;
            if (window.history.replaceState) {
                //prevents browser from storing history with each change:
                //window.history.replaceState("", "", url);
                window.history.pushState({}, null, url);
            }
        }
    };

    deselectAllMarkers = targetMarker => {
        this.onMarkerClicked(null);
    };

    static getIconUrl(isSelectedSupplier, hasRequestedCapacity, visible) {

        if (isSelectedSupplier) {

            return visible && hasRequestedCapacity ?
                'app-images/parking-icon-auto-approve-selected.png' :
                visible ?
                    'app-images/parking-icon-selected.png' :
                    'app-images/not-live-parking-icon-selected.png';
        }
        else {
            return visible && hasRequestedCapacity ?
                'app-images/parking-icon-auto-approve-unselected.png':
                visible ?
                    'app-images/parking-icon-unselected.png':
                    'app-images/not-live-parking-icon-unselected.png';
        }

    }

    render () {
        return (
            <SupplierSearchMap
                ref={(mapContainer) => {
                    this.mapContainer = mapContainer;
                }}
                containerElement={
                    <div id="container-element" style={{ height: `100%` }} />
                }
                mapElement={
                    <div id="map-element" style={{ height: `100%` }} />

                }
                center={this.props.location}
                zoom={11}
                options={{
                    styles: MapStyle,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: window.google.maps.ControlPosition.TOP_RIGHT
                    }
                }}
                markers={SupplierMap.createMarkers(this.props.suppliers, this.props.selectedSupplier)}
                onMarkerClick={this.onMarkerClicked}
                onClick={this.deselectAllMarkers}
                account={this.props.account}
            />
        )
    }
}

export default SupplierMap;
