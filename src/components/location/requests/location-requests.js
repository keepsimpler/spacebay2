import Request from 'superagent';

export const requestLocations = () : Promise => {
  return Request.get(`/api/location`);
}
