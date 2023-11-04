//요청이 들어왔을때 해당 controller를 맵핑 시켜주는 역할(라우터 )
const express = require('express');
const router = express.Router();
const ctrlLocations = require('../controllers/locations');
const ctrlReviews = require('../controllers/reviews');

//locations
router
    .route('/locations')
    .get(ctrlLocations.locationsListByDistance) //DB로부터 무엇인가를 가져와야 할 경우(/locations로 get메소드 요청이들어오면 locationsListByDistance로 연결시켜줘라)
    .post(ctrlLocations.locationsCreate); // (/locations으로 post요청이 들어오면 locationsCreate로 맵핑시켜줘라)
router  
    .route('/locations/:locationid')
    .get(ctrlLocations.locationsReadOne)
    .put(ctrlLocations.locationsUpdateOne)
    .delete(ctrlLocations.locationsDeleteOne);

//reviews
router
    .route('/locations/:locationid/reviews')
    .post(ctrlReviews.reviewsCreate);
router
    .route('/locations/:locationid/reviews/:reviewid')
    .get(ctrlReviews.reviewsReadOne)
    .put(ctrlReviews.reviewsUpdateOne)
    .delete(ctrlReviews.reviewsDeleteOne);

module.exports = router;
