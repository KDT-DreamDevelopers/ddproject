window.addEventListener('DOMContentLoaded', event => {
    // Simple-DataTables
    // https://github.com/fiduswriter/Simple-DataTables/wiki

    const datatablesSimple = document.getElementById('datatablesSimple');
    if (datatablesSimple) {
        const table = new simpleDatatables.DataTable(datatablesSimple);

        // 최신 데이터를 기준으로 정렬
        table.on('datatable:afterdraw', function() {
            table.order([4, 'desc']).draw(); // 4번째 열(등록일자)을 기준으로 내림차순 정렬
        });
    }
});
