const homelist = (req, res) => {
    const path = '/api/locations';
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'get',
        json: {},
        qs: {
            lng: 127.0,
            lat: 37.5,
            maxDistance: 20000 
        }
    };
    request(
        requestOptions,
        (err, {statusCode}, body) => {
            let data = [];
            data = body.map( (item) => {
                item.distance = formatDistance(item.distance);
                return item;
            });
            renderHomepage(req, res, data)

        }
    )
}

const formatDistance = (distance) => {
    let thisDistance = 0;
    let unit = 'm';
    if(distance > 1000) {
        thisDistance = parseFloat(distance / 1000).toFixed(1);
    }
}