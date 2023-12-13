// Kakao Maps API 스크립트 로드
var script = document.createElement('script');
script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=f4a2aebd448b6fcc485c8aea465c19a1';
document.head.appendChild(script);

// Kakao Maps API 스크립트 로드 완료 후 실행될 콜백 함수 정의
script.onload = function() {
    // Kakao Maps API 스크립트 로드 완료 후 실행될 코드
    var container = document.getElementById('map');
    var options = { 
        center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 3 
    };

    var map = new kakao.maps.Map(container, options);
};

//  JavaScript 함수 정의 - 경로찾기 버튼 클릭 시 dep_search.html로 이동
 function goToDepSearch() {
    window.location.href = "../dest/marker.html";
}
