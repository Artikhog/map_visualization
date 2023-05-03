// const DataUrl = "http://10.10.33.15:31222/game?target=get&type_command=player&command=visualization&param=none";
// const DataUrl = "http://10.10.1.187:31222/game?target=get&type_command=player&command=visualization&param=none"
const DataUrl = "http://127.0.0.1:5555/?target=get&type_command=player&command=visualization&param=0";
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
            map.add_moving_objects(res.data.team_info.PepegaTeam.players);
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

            document.getElementById('description').innerText = res.data.server_info.game_description
            document.getElementById('team_name').innerText = `${res.data.team_info.PepegaTeam.name_team}`
            document.getElementById('points').innerText = `${res.data.team_info.PepegaTeam.balls_team}`
            document.getElementById('time').innerText = `${res.data.server_info.gameTime}`
            map.parse_data(res.data.team_info.PepegaTeam.players, res.data.polygon_info);
        }).catch(function (e) {
            console.log(e)
        }));
}