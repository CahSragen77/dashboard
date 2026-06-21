let masterData = [];

fetch('data/master.json')
.then(res => res.json())
.then(data => {

    masterData = data;

    loadSummary(data);
    loadTable(data);
    loadChart(data);

});

function loadSummary(data){

    document.getElementById('totalSku').innerText =
        data.length;

    let totalStock = data.reduce((total, item) => {

        let stok = parseFloat(item.on_hand);

        if (isNaN(stok)) stok = 0;

        return total + stok;

    }, 0);

    document.getElementById('totalStock').innerText =
        totalStock;

    let kosong =
        data.filter(item =>
        Number(item.on_hand) == 0).length;

    document.getElementById('emptyStock').innerText =
        kosong;

    let food =
        data.filter(item =>
        item.nama_div == "FOOD").length;

    document.getElementById('foodCount').innerText =
        food;

    let nonfood =
        data.filter(item =>
        item.nama_div == "NON FOOD").length;

    document.getElementById('nonFoodCount').innerText =
        nonfood;
}
function loadTable(data){

    let tbody =
        document.getElementById('tableBody');

    tbody.innerHTML="";

    data.slice(0,100).forEach(item=>{

        tbody.innerHTML += `
        <tr>
            <td>${item.plu}</td>
            <td>${item.descp}</td>
            <td>${item.on_hand}</td>
            <td>${item.nama_supp}</td>
        </tr>`;
    });
}

document.getElementById('search')
.addEventListener('keyup', function(){

    let key = this.value.toLowerCase();

    let hasil = masterData.filter(item =>

        item.descp.toLowerCase().includes(key) ||
        item.plu.includes(key) ||
        item.barcode.includes(key)
    );

    loadTable(hasil);
});

function loadChart(data){

    let food =
        data.filter(i=>i.nama_div=="FOOD").length;

    let nonfood =
        data.filter(i=>i.nama_div=="NON FOOD").length;

   new Chart(
    document.getElementById('divisiChart'),
    {
        type:'pie',

        data:{
            labels:['Food','Non Food'],
            datasets:[{
                data:[food, nonfood]
            }]
        },

        options:{
            responsive:true,
            maintainAspectRatio:true
        }
    }
);
