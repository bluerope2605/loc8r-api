const request = require('request');

const apiOptions = {
  server: 'http://localhost:3000' // 개발환경 넣기
};
if (process.env.NODE_ENV === 'production') { //환경변수가 production이면 제품환경(히로쿠)로
  apiOptions.server = 'https://loc8rv2.herokuapp.com';
}

const requestOptions = { //options
  url: "http://yourapi.com/api/path",
  method: "GET",
  json: {},
  qs: {
    offset: 20
  }
};
request(requestOptions, (err, response, body) => { //callback: api로부터 요청한 데이터가 모두 반환됐을떄, 해당 파라미터 사용 가능
  if (err) {
    console.log(err);
  } else if (response.statusCode === 200) {
    console.log(body);
  } else {
    console.log(response.statusCode);
  }
});


//api를 이용해 db로부터 hompage정보를 가져오는 것
const homelist = (req, res) => {
  const path = '/api/locations'; 
  const requestOptions = {
    url: `${apiOptions.server}${path}`, //fullpath 1. 개발환경: http://localhost:3000/api/locations, 2. 
    method: 'GET',
    json: {},
    qs: {
      lng: 127.2627812,
      lat: 37.0113774,
      maxDistance: 200000
    }
  };
  request(
    requestOptions,
    (err, response, body) => { //요청결과 다 돌아오면 calback함수 수행 / body=json객체
      renderHomepage(req, res, body); //배열로 돌아온 location객체 render함수에 같이 보냄
    }
  );
};
const renderHomepage = (req, res, responseBody) => { //responseBody = body (db로부터 받아온 데이터)
  res.render('locations-list', { //.pug 생략
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: { 
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: "Looking for wifi and a seat? Loc8r helps you find place \
    to work when out and about. Perhaps with coffee, cake or a pint \
    Let Loc8r help you find the place you're looking for.\ ",
    locations: responseBody // (db로부터 받아온 데이터) , 응답객체 --> html로 변환 --> view로 보냄
  });
};

// Get 'home' page
// const homelist = (req, res) => {
//   res.render('locations-list',
//     {
//       title: 'Loc8r - find a place to work with wifi',
//       pageHeader: {
//         title: 'Loc8r',
//         strapLine: 'Find places to work with wifi near you!'
//       },
//       sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
//       locations: [
//         {
//           name: 'Starcups',
//           address: '경기도 안성시 연지동 157-2',
//           rating: 3,
//           facilities: ['Hot drinks', 'Food', 'Premium wifi'],
//           distance: '100m'
//         },
//         {
//           name: 'Cafe Hero',
//           address: '경기도 안성시 미양면 계륵리 192-1',
//           rating: 4,
//           facilities: ['Hot drinks', 'Food', 'Premium wifi'],
//           distance: '200m'
//         },
//         {
//           name: 'Burger Queen',
//           address: '경기도 평택시 진위면 남부대로 627-33',
//           rating: 2,
//           facilities: ['Food', 'Premium wifi'],
//           distance: '250m'
//         }
//       ]
//     }
//   );
// };

// Get 'Location info' page
const locationInfo = (req, res) => {
  res.render('location-info',
    {
      title: 'Starcups',
       pageHeader: {
        title: 'Loc8r',
      },
      sidebar: {
        context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
        callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
      },
      location: {
        name: 'Starcups',
        address: '경기도 안성시 연지동 157-2',
        rating: 3,
        facilities: ['Hot drinks', 'Food', 'Premium wifi'],
        coords: {lat: 37.0078208, lng: 127.2634122},
        openingTimes: [
          {
            days: 'Monday - Friday',
            opening: '7:00am',
            closing: '7:00pm',
            closed: false
          },
          {
            days: 'Saturday',
            opening: '8:00am',
            closing: '5:00pm',
            closed: false
          },
          {
            days: 'Sunday',
            closed: true
          }
        ],
        reviews: [
          {
            author: 'Simon Holmes',
            rating: 5,
            timestamp: '16 July 2013',
            reviewText: 'What a great place. I can\'t say enough good things about it.'
          },
          {
            author: 'Charlie Chaplin',
            rating: 3,
            timestamp: '16 June 2013',
            reviewText: 'It was okay. Coffee wasn\'t great, but the wifi was fast.'
          }
        ]
      }
    }
  );
};

// Get 'Add review' page
const addReview = function(req, res) {
  res.render('location-review-form',
    {
      title: 'Review Starcups on Loc8r' ,
      pageHeader: { title: 'Review Starcups' }
    }
  );
};
  module.exports = {
    homelist,
    locationInfo,
    addReview
  };
