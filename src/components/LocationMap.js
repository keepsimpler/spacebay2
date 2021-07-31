import React, {Component} from "react";
import {GoogleMap, InfoWindow, Marker, withGoogleMap} from "react-google-maps";

const google = window.google

class LocationMap extends Component {
    render() {
        const props = this.props
        return (
            <GoogleMap
                ref={(map) => {
                    this.map = map;
                }}
                defaultZoom={4}
                center={props.center}
                zoom={props.zoom}
                options={props.options}
                onClick={props.onClick}
            >
                {props.markers.map((marker, index) => (
                    <Marker
                        key={index}
                        position={marker.position}
                        onClick={() => props.onMarkerClick(marker)}
                        icon={marker.icon}
                        animation={google.maps.Animation.DROP}
                    >
                        {/*
                 Show info window only if the 'showInfo' key of the marker is true.
                 That is, when the Marker pin has been clicked and 'onCloseClick' has been
                 Successfully fired.
                 */}
                        {marker.showInfo && (
                            <InfoWindow onCloseClick={() => props.onMarkerClose(marker)}>
                                <div>{marker.infoContent}</div>
                            </InfoWindow>
                        )}
                    </Marker>
                ))}
            </GoogleMap>
        )
    }
}

export default withGoogleMap(LocationMap);
