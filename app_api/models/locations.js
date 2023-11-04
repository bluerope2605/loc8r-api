const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    reviewText: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        'default': Date.now
    }
});


/*openingTime에대한 스키마 정의*/
const openingTimesSchema = new mongoose.Schema({
    days: {
        type: String,
        require: true
    },
    opening: String,
    closing: String,
    closed: {
        type: Boolean,
        required: true
    }
});

/*homelist의 location Document 스키마 정의*/
const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true //location이름이 없을시 문제 발생, 필수로 name필드 있어야함
    }, 
    address: String,
    rating: {
        type: Number,
        'default': 0
    },
    facilities: [String],
    coords: {
        type: {type: String}, 
        coordinates: [Number]
        // index: '2dsphere' // location에 대한 지리정보를 스키마에 표현 가능함
    },
    openingTimes: [openingTimesSchema],
    reviews: [reviewSchema]
});
locationSchema.index({coords: '2dsphere'});   

 /* 한 로케이션 클릭하면-> 해당 로케이션의 세부정보페이지로 넘어감
 Details페이지 스키마 정의 */

 mongoose.model('Location', locationSchema); //컬랙션이름 생략-> locations