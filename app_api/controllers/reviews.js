const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

const reviewsCreate = (req,res) => {
    const locationId = req.params.locationid;  //parent 다큐먼트인 location을 가져옴
    if(locationId){
        Loc
            .findById(locationId) //model로 가져오기
            .select('reviews') //기존의 서브다큐먼트 (이미 써져있는 리뷰) 검색
            .exec((err, location) => { //윗줄은 쿼리만 작성, 실제 실행하는 줄
                if (err) {
                    res
                        .status(400)
                        .json(err);
                } else {
                    doAddReview(req, res, location); //리뷰를 추가하는 외부 함수
                }
            });
    } else { // location 없으면 에러
        res 
            .status(404)
            .json({"message": "Location not found"});
    }
};

const doAddReview = (req, res, location) => {
    if (!location) {
        res
            .status(404)
            .json({"message": "Location not found"})
    } else {
        const {author, rating, reviewText} = req.body;
        location.reviews.push({ //해당 location의 맨 마지막 배열에 push로 넣어준다. 
            author,
            rating,
            reviewText
        });
        location.save((err, location) => {
            if (err) {
                res
                    .status(400)
                    .json(err);
            } else {
                updateAverageRating(location._id); // 해당 location 별은 전체reviews의 평균값
                const thisReview = location.reviews[location.reviews.length -1 ]; //마지막 리뷰를 찾는 코드 
                //const thisReview = location.reviews.slice(-1).pop();
                res
                    .status(201)
                    .json(thisReview);
            }
        });
    }
}

const doSetAverageRating = (location) => {
    if (location.reviews && location.reviews.length > 0) {
        const count = location.reviews.length;
        const total = location.reviews.reduce((acc, {rating}) => {
            return acc + rating;
        }, 0);
        location.rating = parseInt(total / count, 10);
        location.save(err => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Average raging updated to ${location.rating}`);
            }
        }); 
    }
};

//리뷰 평점을 계산
const updateAverageRating = (locationId) => {
    Loc.findById(locationId) //해당 location 찾아오기
    .select('rating reviews')
    .exec((err, location) => {
        if(!err) {
            doSetAverageRating(location); //배열의 평균값을 가하는 함수
        }
    });
};

const reviewsReadOne = (req,res) => {
    Loc
        .findById(req.params.locationid)
        .select('name reviews') //select메소드는 검색하고 싶은 패스를 공백으로 구분해주는 문자열로 받아드림.
        .exec((err, location)=>{ //location = 윗줄에서 정해졌던 값들 (배열객체)
            if(!location) {
                return res
                    .status(404)
                    .json({"message":"location not found"});
            } else if (err){
                return res
                    .status(400)
                    .json(err);
            }

            if(location.reviews && location.reviews.length > 0) { //리뷰가 존재한다면?
                const review = location.reviews.id(req.params.reviewid);//location의 서브다큐 reviews의 배열의 id를 'reviewid(특정id)'로
                if (!review) {
                    return res
                        .status(404)
                        .json({"message":"review not found"});
                } else {
                    const respone = {
                        location: {
                            name: location.name,
                            id: req.params.location
                        },
                        review
                    };

                    return res
                        .status(200)
                        .json(response);
                }
            } else {
                return res
                    .status(404)
                    .json({"message":"No reviews found"});
            }
        });
};
const reviewsUpdateOne = (req,res) => { //리뷰를 업데이트(갱신)
    if (!req.params.locationid || !req.params.reviewid) {
        return res
            .status(404)
            .json({
                "message": "Not found, locationid and reviewid are both required"
            });
    }
    Loc 
    .findById(req.params.locationid)
    .select('reviews')
    .exec((err, location) => {
        if (!location) {
            return res
                .status(404)
                .json({
                    "message": "Location not found"
                });
        } else if (err) {
            return res
                .status(400)
                .json(err);
        }
        if(location.reviews && location.reviews.length > 0) {
            const thisReview = location.reviews.id(req.params.reviewid);
            if(!thisReview){
                res
                    .status(404)
                    .json({
                    "message": "Review not found"
                    });
            } else {
                thisReview.author = req.body.author;
                thisReview.rating = req.body.rating;
                thisReview.reviewText = req.body.reviewText;
                location.save((err, location) => {
                    if (err) {
                        res
                            .status(404)
                            .json(err);
                    } else {
                        updateAverageRating(location._id);
                        res
                            .status(200)
                            .json(thisReview);
                    }
                });
            }
        } else {
            res
                .status(404)
                .json({
                    "message": "Nod review to update"
                });
        }
        // location.name = req.body.name;
        // location.save((err, loc) => {
        //     if (err) {
        //         res
        //             .status(404)
        //             .json(err);
        //     } else {
        //         res
        //             .status(200)
        //             .json(loc);
        //     }
        // });
    })
};



const reviewsDeleteOne = (req,res) => {
    const {locationid, reviewid} = req.params;
    if(!locationid || !reviewid) {
        return res
            .status(404)
            .json({'message': 'Not found, locationid and \ reviewid are both required'});
    }
    Loc
        .findById(locationid)
        .select('reviews')
        .exec((err, location) => {
            if (!location) {
                return res
                    .status(404)
                    .json({'message': 'Location not found'});
            } else if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            if (location.reviews && location.reviews.length > 0) {
                if (!location.reviews.id(reviewid)) {
                    return res
                        .status(404)
                        .json({'message': 'Review not found'});
                } else {
                    location.reviews.id(reviewid).remove();
                    location.save(err => {
                        if (err) {
                            return res
                                .status(404)
                                .json(err);
                        } else {
                            updateAverageRating(location._id);
                            res
                                .statues(204)
                                .json(null);
                        }
                    });
                }
            } else {
                res 
                    .status(404)
                    .json({'message': 'No Review to delete'});
            }
        });
};

module.exports = {
    reviewsCreate,
    reviewsReadOne,
    reviewsUpdateOne,
    reviewsDeleteOne,
};