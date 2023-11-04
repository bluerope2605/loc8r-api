const { response } = require('express');
const request = require('request');

const apiOptions = {
  server: 'http://localhost:3000' // 개발환경 넣기
};
if (process.env.NODE_ENV === 'production') { //환경변수가 production이면 제품환경(히로쿠)로
  apiOptions.server = 'https://loc8rv2.herokuapp.com';
}

const getLocationInfo = (req,res,callback) =>{
  const path = `/api/locations/${req.params.locationid}`;
  const requestOptions ={
      url:`${apiOptions.server}${path}`,
      method:'GET',
      json:{}
  };
  request(
    requestOptions,
    (err, {statusCode}, body) => {
      let data = body;
      if(statusCode === 200){
          data.coords={
              lng: body.coords[0],
              lat: body.coords[1]
          };
          callback(req,res,data);
      } else {
          showError(req,res,statusCode);
      }  
  });
};

const requestOptions = { //options
  url: "http://yourapi.com/api/path",
  method: "GET",
  json: {},
  qs: {
    offset: 20
  }
};
request(requestOptions, 
  (err, response, body) => { //callback: api로부터 요청한 데이터가 모두 반환됐을떄, 해당 파라미터 사용 가능
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
    qs: { //요청할때 API에게 보내줄 것->  API가 정확하게 찾아서 location다큐먼트 돌려줌
      lng: 127.0253469, //경도
      lat: 37.5831111, //위도
      maxDistance: 20000
    }
  };
  request(
    requestOptions,
    (err, {statusCode}, body) => { //요청결과 다 돌아오면 calback함수 수행 / body=json객체
      let data = [];
      if (statusCode === 200 && body.length) {
        data = body.map ( (item) => {
          item.distance = formatDistance(item.distance)
          return item;
        });
      };
      renderHomepage(req, res, data); //배열로 돌아온 location객체 render함수에 같이 보냄
      //1. 메시지를 저장하기 위한 변수 선언
      //2. 응답바디 배열인지 확인 or 오류: 적절한 메시지전송-응답이 배열이긴한데 비어있을때 메시지전송
      //3. 메시지 뷰로 보냄
    }
  );
};

const formatDistance = (distance) => {
  let thisDistance = 0;
  let unit = 'm';
  if (distance > 1000) {
    thisDistance = parseFloat(distance / 1000).toFixed(1);
    unit = 'km';
  } else {
    thisDistance = Math.floor(distance);
  }
  return thisDistance + unit;
};

const renderHomepage = (req, res, responseBody) => { //responseBody = body (db로부터 받아온 데이터)
  let message = null;
  if (!(responseBody instanceof Array)) {
    message = "API lookup error";
    responseBody = []; // responseBody가 처음에 string으로 전달된 경우 빈 배열로 설정한다???
  } else {
    if (!responseBody.length) {
      message = "No place found nearby";
    }
  }
  res.render('locations-list', { //.pug 생략
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: { 
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: "Looking for wifi and a seat? Loc8r helps you find place \
    to work when out and about. Perhaps with coffee, cake or a pint \
    Let Loc8r help you find the place you're looking for.\ ",
    locations: responseBody,
    message // (db로부터 받아온 데이터) , 응답객체 --> html로 변환 --> view로 보냄
  });
};

// Get 'Location info' page (now)
const locationInfo = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderDetailPage(req, res, responseData)
    );
};
// Get 'Location info' page (past)
// const locationInfo = (req, res) => {
//   const path = `/api/locations/${req.params.locationid}`;
//   const requestOptions = {
//     url: `${apiOptions.server}${path}`,
//     method: 'GET',
//     json: {}
//   };
//   request(
//     requestOptions,
//     (err, {statusCode}, body) => {
//       const data = body;
//       if (statusCode === 200) {
//         data.coords ={
//         lng: body.coords[0],
//         lat: body.coords[1]
//       };
//       renderDetailPage(req, res, data);        
//       } else {
//       showError(req, res, statusCode);
//     }
//   }
//   );
// };

const showError = (req, res, status) => {
  let title = '';
  let content = '';
  if (status === 404) {
    title = '404, page not found';
    content = 'Oh dear. Looks like you can\'t find this page. Sorry.';
  } else {
    title = `${status}, something's gone wrong`;
    content = 'Something, somewhere, has gone just a little bit wrong.';
  }
  res.status(status);
  res.render('generic-text', {
    title,
    content
  });
};

const renderDetailPage = function (req, res, location) {
  res.render('location-info', {
    title: location.name, //'Starcups'
    pageHeader: {
      title: location.name
    },
    sidebar: {
      context: 'is on Loc8r because it has accessible wifi and \
      space to sit down with your laptop and some work done.',
      callToAction: "If you've been and you like it -or if you \
      don't - please leave a review to help other people just like you"
    },
    location
  });
};

// Get 'Add review' page (now)
const addReview = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderReviewForm(req, res, responseData)
    );
};
// Get 'Add review' page (past)
// const addReview = (req, res) => {
//   res.render('location-review-form',
//     {
//       title: 'Review Starcups on Loc8r' ,
//       pageHeader: { title: 'Review Starcups' }
//     }
//   );
// };


const renderReviewForm = function (req, res, {name}) { //respones데이터 중 name만 가져와서 사용하기
  res.render('location-review-form', {
    title: `Review ${name} on Loc8r`, //DB에서 가져온 데이터 중 name을 가져다 쓰기
    pageHeader: {title: `Review ${name}`},
    error: req.query.err
  });
};

/* GET 'Add review' page */
const doAddReview = (req, res) => {
  const locationid = req.params.locationid;
  const path = `/api/locations/${locationid}/reviews`;
  const postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review 
  };
  // renderReviewForm(req, res);
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'POST',
    json: postdata
  };
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect(`/location/${locationid}/review/new?err=val`);
  } else
  {request (
    requestOptions,
    (err, {statusCode}, {name}) => {
      if (statusCode === 201) {
        res.redirect(`/location/${locationid}`);
      } else if (statusCode === 400 && name && name === 'ValidationError'){
        res.redirect(`/location/${locationid}/review/new?err=val`);
      } else {
        showError(req,res,statusCode);
      }
    }
  );
}
};


  module.exports = {
    homelist,
    locationInfo,
    addReview,
    doAddReview
  };
