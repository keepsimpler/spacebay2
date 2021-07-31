import React, {Component} from 'react';
import {withGoogleMap, GoogleMap} from "react-google-maps/lib";
import MapStyle from "./MapStyle";
// import '../css/components/supplierMap.css';

const SimpleMap = withGoogleMap(props => (

    <GoogleMap
        ref={props.ref}
        center={props.center}
        zoom={props.zoom}
        options={props.options}
        disableDefaultUI="true"
        mapTypeControl="false"
    >
    </GoogleMap>

));



class NoLocationMap extends Component {

    render () {
        return (
            <SimpleMap
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
                options={{ styles: MapStyle, mapTypeControl: false, streetViewControl: false, fullscreenControl: false}}
            />
        )
    }
}

export default NoLocationMap;
