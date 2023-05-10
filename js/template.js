const DataUrl = "http://10.10.33.15:31222/game?target=get&type_command=player&command=visualization&param=none";
// const DataUrl = "http://10.10.1.187:31222/game?target=get&type_command=player&command=visualization&param=none"
// const DataUrl = "http://127.0.0.1:5555/?target=get&type_command=player&command=visualization&param=0";
function start() {
    resize_page();

    // resize(page_height, page_width);
    var canvas = document.getElementById('map');
    var stage = new createjs.Stage(canvas);
    add_ticker(stage, 60);
    var map = new Map(canvas, stage, canvas.height);
    add_keyboard(map, 0)
    get_objects(map);
    get_info(map);
    map.update();

    setInterval(function () {
        get_info(map);
        map.update();
    }, 100);



}

window.addEventListener('resize', () => {
    resize_page();
})


function get_objects(map) {
    fetch(DataUrl).then(response =>
        response.json().then(data => ({
                data: data,
                status: response.status
            })
        ).then(res => {

            const team_value = Object.values(res.data.team_info)
            map.add_moving_objects(team_value[0].players);
            map.add_polygon_objects(res.data.polygon_info);
        }).catch(function (e) {
            console.log(e)
        }));
}

function get_info(map) {
    fetch(DataUrl).then(response =>
        response.json().then(data => ({
                data: data,
                status: response.status
            })
        ).then(res => {
            const team_value = Object.values(res.data.team_info)
            const polygon_value = Object.values(res.data.polygon_info)
            // document.getElementById('description').innerText = res.data.server_info.game_description
            document.getElementById('team_name').innerText = `${team_value[0].name_team}`
            document.getElementById('team_city').innerText = `${team_value[0].city_team}`
            document.getElementById('points').innerText = `${team_value[0].balls_team}`
            document.getElementById('time').innerText = `${res.data.server_info.gameTime}`
            map.parse_data(team_value[0].players, polygon_value);
        }).catch(function (e) {
            console.log(e)
        }));
}