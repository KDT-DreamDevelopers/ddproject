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

function showCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;  // 위도
            var lon = position.coords.longitude; // 경도
            
            var mapContainer = document.getElementById('map');
            var options = {
                center: new kakao.maps.LatLng(lat, lon),
                level: 3
            };
            
            var map = new kakao.maps.Map(mapContainer, options);
            
            // 마커 표시
            var markerPosition = new kakao.maps.LatLng(lat, lon);
            var marker = new kakao.maps.Marker({
                position: markerPosition
            });
            marker.setMap(map);
        });
    } else {
        alert("Geolocation을 지원하지 않습니다.");
    }
}