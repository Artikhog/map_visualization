const DataUrl = "http://10.10.33.15:31222/game?target=get&type_command=player&command=visualization&param=none";
// const DataUrl = "http://127.0.0.1:5555/?target=get&type_command=player&command=visualization&param=0";
function start() {
    const page_height = window.innerHeight;
    const page_width = window.innerWidth;
    // resize(page_height, page_width);
    var canvas = document.getElementById('map');
    var stage = new createjs.Stage(canvas);
    add_ticker(stage, 60);
    var map = new Map(canvas, stage, page_height);
    add_keyboard(map, 0)
    get_objects(map);
    map.update();

    setInterval(function () {
        get_info(map);
        // map.draw_fires();
        map.update();
    }, 300);

}

function get_objects(map) {
    fetch(DataUrl).then(response =>
        response.json().then(data => ({
                data: data,
                status: response.status
            })
        ).then(res => {
            map.add_moving_objects(res.data.team_info.Blue.players);
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
            document.getElementById('team_name').innerText = `Команда: ${res.data.team_info.Blue.name_team}`
            document.getElementById('points').innerText = `Баллы: ${res.data.team_info.Blue.balls_team}`
            document.getElementById('time').innerText = `Время: ${res.data.server_info.gameTime}`
            map.parse_data(res.data.team_info.Blue.players, res.data.polygon_info);
        }).catch(function (e) {
            console.log(e)
        }));
}