class Map{
    constructor(canvas, stage, size, meter_size = 11) {
        this.canvas = canvas;   //html элемент для отрисовки
        this.stage = stage;   // объект createjs для отрисовки к нему крепятся остальные элементы
        this.size = size; // размер карты в пикселях
        this.meter_size = meter_size; //размер реальной карты в метрах
        this.scale = size / meter_size; //маштаб между реальным и пикселями
        this.map_container = new createjs.Container(); // контейнер для элементов, крепится к stage
        this.background = new createjs.Bitmap(document.getElementById('phase2_background')); // картинка для фона карты
        this.moving_objects = []; //
        this.starts = [];
        this.fires = [];
        this.fabrics = [];
        this.villages = [];
        this.boxes = [];
        this.init();
        this.drone_scale = 0.5;  //Коэффициент для дронов
        this.car_scale = 0.6;    //Коэффициент для машинок
        this.fabric_scale = 1;   //Коэффициент для фабрик
        this.village_scale = 0.9;//Коэффициент для деревень
        this.starts_scale = 0.8; //Коэффициент для стартовых площадок
        this.box_scale = 0.5;    //Коэффициент для коробок (работает некорректно, при увеличении, радиус от фабрики увеличивается)
    }
    /**
     * Функция изменения размеров фона под карту
     * @author   ArtiKhog
     */
    init() {
        this.background.scaleX = this.background.scaleY = this.size / 1080;
    }
    /**
     * Функция для обновления карты после получения данных
     * @author   ArtiKhog
     */
    update() {
        this.map_container.removeAllChildren();
        this.stage.removeAllChildren();
        this.stage.addChild(this.map_container);
        this.draw_background();
        this.draw_grid();
        this.draw_all_objects();
    }
    /**
     * Функция для добавления к map_container фона
     * @author   ArtiKhog
     */
    draw_background() {
        this.map_container.addChild(this.background);
    }
    /**
     * Функция для отрисовки сетки поверх карты
     * @author   ArtiKhog
     */
    draw_grid() {
        for (let i = 0; i < this.meter_size; i++) {
            var line = new createjs.Shape();
            line.graphics.beginStroke("white");
            line.graphics.moveTo(this.scale * (i + 0.5), 0);
            line.graphics.lineTo(this.scale * (i + 0.5), this.size);
            line.graphics.moveTo(0, this.scale * (i + 0.5));
            line.graphics.lineTo(this.size, this.scale * (i + 0.5));
            this.map_container.addChild(line);
        }
    }
    /**
     * @author ArtiKhog
     * @params polygon_data     данные полигона из json
     * Функция для создания объектов полигона из полученных данных
     */
    add_polygon_objects(polygon_data) {
        const polygon_objects_array =  Object.values(polygon_data);
        let starts_i = 1;
        polygon_objects_array.forEach(element => {
            switch (element.name_role) {    //проверка роли и добавление объекта согласно роли
                case "Fabric_RolePolygon":
                    var fabric = new Fabric(this.scale, 'fabric', this.fabric_scale, this.box_scale);
                    fabric.get_cargo_data(element.role_data);
                    this.fabrics.push(fabric);
                    break;
                case "Village_RolePolygon":
                    if (element.description !== "Магазин") {
                        switch (element.description) {
                            case "Окуловка":
                                this.villages.push(new Village(this.scale, 'okulovka', this.village_scale, this.box_scale));
                                break;
                            case "Гадюкино":
                                this.villages.push(new Village(this.scale, 'gaducino', this.village_scale, this.box_scale));
                                break;
                            case "Лосево":
                                this.villages.push(new Village(this.scale, 'losevo', this.village_scale, this.box_scale));
                                break;
                            case "Сосновка":
                                this.villages.push(new Village(this.scale, 'sosnovka', this.village_scale, this.box_scale));
                                break;
                            default:
                                this.villages.push(new Village(this.scale, 'village', this.village_scale, this.box_scale));
                                break;
                        }

                    } else if (element.description === "Магазин") {
                        this.villages.push(new Village(this.scale, 'market', this.village_scale, this.box_scale));
                    }
                    break;
                case "TakeoffArea_RolePolygon":
                    this.starts.push(new Polygon_Object(this.scale, `start${starts_i}`, this.starts_scale, ));
                    starts_i++
                    break;
                case "Fire_RolePolygon":
                    this.fires.push(new Fire(this.scale, 'boom'));
            }
        })
    }
    /**
     * @author ArtiKhog
     * @params players_data     данные об игроках из json
     * Функция для добавления объектов игроков из полученных данных
     */
    add_moving_objects(players_data) {
        const moving_objects_array = Object.values(players_data);
        moving_objects_array.forEach(element => {
            switch (element.name_object_controll) {
                case "TestObject":
                    this.moving_objects.push(new Moving_Object(this.scale, 'drone', this.drone_scale, this.box_scale));
                    break;
                case "PioneerObject":
                    this.moving_objects.push(new Moving_Object(this.scale, 'drone', this.drone_scale, this.box_scale));
                    break;
                case "EduBotObject":
                    this.moving_objects.push(new Moving_Object(this.scale, 'car', this.car_scale, this.box_scale));
                    break;
            }
        })
    }
    /**
     * @author ArtiKhog
     * Функция для отрисовки всех объектов.
     * Важен порядок. Те объекты, которые отрисовываются раньше будут отрисовываться под новыми объектами
     */
    draw_all_objects() {
        this.draw_starts();
        this.draw_fabrics();
        this.draw_villages();
        this.draw_fires();
        this.draw_moving_object();
        this.draw_boxes();
    }
    /**
     * @author ArtiKhog
     * Функция для добавления элементов полигона из данных
     */
    draw_starts() {
        for (let i = 0; i < this.starts.length; i++) {
            this.starts[i].draw();
            this.map_container.addChild(this.starts[i].bitmap);
        }
    }
    /**
     * @author ArtiKhog
     * Функция для добавления коптеров и машинок из данных
     */
    draw_moving_object() {
        for (let i = 0; i < this.moving_objects.length; i++) {
            this.moving_objects[i].draw();
            this.map_container.addChild(this.moving_objects[i].bitmap);
        }
    }
    draw_fires() {
        this.fires.forEach(fire => {
            fire.draw();
            this.map_container.addChild(fire.bitmap);
            this.map_container.addChild(fire.indication_bitmap);
            this.map_container.addChild(fire.dead_bitmap);
        })
    }
    draw_fabrics() {
        this.fabrics.forEach(fabric => {
            fabric.draw();
            this.map_container.addChild(fabric.bitmap);
        })
    }
    draw_villages() {
        this.villages.forEach(village => {
            village.draw();
            this.map_container.addChild(village.bitmap);
        })
    }
    draw_boxes() {
        this.fabrics.forEach(fabric => {
            fabric.cargo_array.forEach(cargo => {
                this.map_container.addChild(cargo.bitmap);
            });
        });
        this.villages.forEach(village => {
            village.cargo_array.forEach(cargo => {
                this.map_container.addChild(cargo.bitmap);
            });
        });
        this.moving_objects.forEach(moving => {
            this.map_container.addChild(moving.cargo.bitmap);
        });
    }
    /**
     * @author ArtiKhog
     * Функция парсинга данных из json
     */
    parse_data(players_data, polygon_data) {
        const polygon_objects_array = Object.values(polygon_data);
        let fabric_i = 0;
        let village_i = 0;
        let starts_i = 0;
        let fires_i = 0;
        polygon_objects_array.forEach(element => {
            switch (element.name_role) {
                case "Fabric_RolePolygon":
                    this.fabrics[fabric_i].set_data(element);
                    fabric_i++;
                    break;
                case "Village_RolePolygon":
                    this.villages[village_i].set_data(element);
                    village_i++;
                    break;
                case "TakeoffArea_RolePolygon":
                    this.starts[starts_i].set_data(element);
                    starts_i++;
                    break;
                case "Fire_RolePolygon":
                    this.fires[fires_i].set_data(element);
                    fires_i++;
                    break;
            }
        })

        const moving_objects_array = Object.values(players_data);
        let move_objects_i = 0;
        moving_objects_array.forEach(element => {
            switch (element.name_object_controll) {
                case "TestObject":
                    this.moving_objects[move_objects_i].set_data(element);
                    move_objects_i += 1;
                    break;
                case "PioneerObject":
                    this.moving_objects[move_objects_i].set_data(element);
                    move_objects_i += 1;
                    break;
                case "EduBotObject":
                    this.moving_objects[move_objects_i].set_data(element);
                    move_objects_i += 1;
                    break;
            }
        });
    }
}

/**
 * @author ArtiKhog
 * Класс обычного объекта полигона (стартовая площадка). Его наследуют более сложные объекты
 */

class Polygon_Object{
    constructor(scale, type, scale_koef = 0.7, locus_x = 5.5, locus_y = 5.5) {
        this.x = 0;
        this.y = 0;
        this.scale = scale;
        this.scale_koef = scale_koef;
        this.locus_x = locus_x;
        this.locus_y = locus_y;
        this.bitmap = new createjs.Bitmap();
        this.init(type);
    }
    init(type) {
        this.bitmap = new createjs.Bitmap(document.getElementById(type));
        resize_bitmap(this.bitmap, this.scale, document.getElementById(type).naturalHeight, document.getElementById(type).naturalWidth, this.scale_koef);
    }
    draw() {
        this.bitmap.x = (this.locus_x + this.x) * this.scale;
        this.bitmap.y = (this.locus_y + this.y) * this.scale;
    }
    set_data(data) {
        this.x = data.current_pos[0];
        this.y = -data.current_pos[1];
    }
}

/**
 * @author ArtiKhog
 * Класс для передвигающихся объектов: машинок, коптеров
 */
class Moving_Object extends Polygon_Object {
    constructor(scale, type, scale_koef = 0.3, box_scale=0.5) {
        super(scale, type, scale_koef);
        this.angle = 0;
        this.box_scale = box_scale;
        this.is_cargo = false;
        this.cargo = new Box(0, '', this.box_scale)
        this.color_cargo = ''
    }
    /**
     * @author ArtiKhog
     * @params data  данные об объекте
     * Функция для создания груза радом с данным объектом
     */
    get_cargo_data(data) {
        if (this.is_cargo) {
            this.color_cargo = rgb_parser(data.color_cargo);
            if (this.cargo.scale === 0 || this.cargo.color !== this.color_cargo) {
                this.cargo = new Box(this.scale, this.color_cargo, this.box_scale);
            }
            this.cargo.set_coordinates(this.x, this.y, this.angle);
        } else {
            this.cargo = new Box(0, '');
        }
    }
    draw() {
        createjs.Tween.get(this.bitmap).to({
            x: (this.locus_x + this.x) * this.scale,
            y: (this.locus_y + this.y) * this.scale,
            rotation: this.angle * 180 / Math.PI
        }, 200);
        if (this.is_cargo) {
            this.cargo.set_coordinates(this.x, this.y, this.angle);
            this.cargo.draw(0.5*this.scale, -0.5*this.scale, this.bitmap.regX, this.bitmap.regY);
        }
    }
    set_data(data) {
        this.x = data.current_pos[0];
        this.y = -data.current_pos[1];
        this.angle = data.current_pos[3]
        this.is_cargo = data.is_cargo;
        this.get_cargo_data(data);

        // if (this.is_cargo && !this.cargo_init_flag) {
        //     this.init_cargo(rgb_parser(data.color_cargo) + '_box');
        //     this.cargo_init_flag = true;
        // }
        // if (!this.is_cargo && this.cargo_init_flag) {
        //     this.init_cargo('');
        //     this.cargo_init_flag = false;
        // }
    }
}

/**
 * @author ArtiKhog
 * Класс фабрики
 */
class Fabric extends Polygon_Object {
    constructor(scale, type, scale_koef = 0.7, box_scale=0.5) {
        super(scale, type, scale_koef);
        this.num_cargo = 0;
        this.cargo_color = '';
        this.is_cargo = false;
        this.conditions = 0;
        this.cargo_array = [];
        this.box_scale = box_scale;
    }
    /**
     * @author ArtiKhog
     * Функция
     */
    get_cargo_data(role_data) {
        this.cargo_color = rgb_parser(role_data.current_cargo_color);
        this.is_cargo = role_data.is_cargo;
        this.conditions = role_data.current_conditions;
        this.set_num_cargo(role_data.num_cargo);
    }
    /**
     * @author ArtiKhog
     * @params num_cargo  количество грузов на фабрике
     * Функция для создания/удаления грузов
     */
    set_num_cargo(new_num_cargo) {
        if (this.num_cargo < new_num_cargo ) {
            for (let i = this.num_cargo; i < new_num_cargo; i++) {
                this.cargo_array.push(new Box(this.scale, this.cargo_color, this.box_scale));
            }
        } else if (this.num_cargo > new_num_cargo) {
            for (let i = this.num_cargo; i > new_num_cargo; i--) {
                this.cargo_array.pop();
            }
        }
        this.num_cargo = new_num_cargo;
    }
    draw() {
        createjs.Tween.get(this.bitmap).to({
            x: (this.locus_x + this.x) * this.scale,
            y: (this.locus_y + this.y) * this.scale,
            rotation: this.angle * 180 / Math.PI
        }, 200);
        this.draw_cargo();
    }
    /**
     * @author ArtiKhog
     * Функция для прорисовки грузов. Тут же прорисовка грузов по кругу
     */
    draw_cargo() {
        const rads = 2 * Math.PI / this.cargo_array.length;
        const radius = this.scale_koef * 1.5 * this.scale;
        let rotation_angle, cargo_bitmap_x, cargo_bitmap_y
        for (let i = 0; i < this.cargo_array.length; i++) {
            rotation_angle = rads + Math.PI / 4 + rads * i;
            cargo_bitmap_x = Math.sin(rotation_angle) * radius
            cargo_bitmap_y = Math.cos(rotation_angle) * radius
            this.cargo_array[i].draw(cargo_bitmap_x, cargo_bitmap_y, this.bitmap.regX, this.bitmap.regY);
        }
    }
    set_data(data) {
        this.x = data.current_pos[0];
        this.y = -data.current_pos[1];
        this.set_num_cargo(data.role_data.num_cargo);
        this.cargo_array.forEach(cargo => {
            cargo.set_coordinates(this.x, this.y, this.angle);
        });
    }
}

/**
 * @author ArtiKhog
 * Класс деревни он же используется для магазинов.
 * Класс схож с классом фабрики изменен только способ хранения и получения данных о грузе
 */
class Village extends Polygon_Object {
    constructor(scale, type, scale_koef = 0.8, box_scale=0.5) {
        super(scale, type, scale_koef);
        this.cargo_num = [];
        this.cargo_color = [];
        this.cargo_flag = [false, false, false, false];
        this.cargo_array = [];
        this.box_scale = box_scale;
    }
    set_num_cargo() {
        for (let i = 0; i < this.cargo_num.length; i++) {
            if (this.cargo_num[i] > 0) {
                if (!this.cargo_flag[i]) {
                    this.cargo_array.push(new Box(this.scale, this.cargo_color[i], this.box_scale));
                    this.cargo_flag[i] = true;
                }
            }
        }
    }
    draw() {
        createjs.Tween.get(this.bitmap).to({
            x: (this.locus_x + this.x) * this.scale,
            y: (this.locus_y + this.y) * this.scale,
        }, 200);

        this.draw_cargo()
    }
    draw_cargo() {
        const rads = 2 * Math.PI / this.cargo_array.length;
        const radius = this.scale_koef * 1.5 * this.scale;
        let rotation_angle, cargo_bitmap_x, cargo_bitmap_y
        for (let i = 0; i < this.cargo_array.length; i++) {
            rotation_angle = rads + rads * i;
            cargo_bitmap_x = Math.sin(rotation_angle) * radius
            cargo_bitmap_y = Math.cos(rotation_angle) * radius
            this.cargo_array[i].draw(cargo_bitmap_x, cargo_bitmap_y, this.bitmap.regX, this.bitmap.regY);
        }
    }
    set_data(data) {
        this.x = data.current_pos[0];
        this.y = -data.current_pos[1];
        this.cargo_color = Object.keys(data.role_data.cargo);
        this.cargo_num = Object.values(data.role_data.cargo);
        this.set_num_cargo();
        this.cargo_array.forEach(cargo => {
            cargo.set_coordinates(this.x, this.y, this.angle);
        });
    }
}
/**
 * @author ArtiKhog
 * Класс огня. В нем используется 3 bitmap: для самого огня, для индикации, для потушенного огня
 */
class Fire extends Polygon_Object{
    constructor(scale, type, scale_koef = 0.7) {
        super(scale, type, scale_koef);
        this.power = 0;
        this.is_alive = true;
        this.is_indication = false;
        this.dead_bitmap = new createjs.Bitmap();
        this.indication_bitmap = new createjs.Bitmap();
        this.init_role_bitmaps();
    }
    init_role_bitmaps() {
        var dead_type = 'dead'
        var indication_type = 'indication';
        this.dead_bitmap = new createjs.Bitmap(document.getElementById(dead_type))
        resize_bitmap(this.dead_bitmap, this.scale, document.getElementById(dead_type).naturalHeight, document.getElementById(dead_type).naturalWidth, this.scale_koef);
        this.indication_bitmap = new createjs.Bitmap(document.getElementById(indication_type))
        resize_bitmap(this.indication_bitmap, this.scale, document.getElementById(indication_type).naturalHeight, document.getElementById(indication_type).naturalWidth, this.scale_koef*1.4);
        this.dead_bitmap.alpha = 0;
        this.indication_bitmap.alpha = 0;
    }
    draw() {
        this.bitmap.x = (this.locus_x + this.x) * this.scale;
        this.bitmap.y = (this.locus_y + this.y) * this.scale;
        this.dead_bitmap.x = this.bitmap.x;
        this.dead_bitmap.y = this.bitmap.y;
        this.indication_bitmap.x = this.bitmap.x;
        this.indication_bitmap.y = this.bitmap.y;

        this.draw_indication(this.is_indication);
        this.draw_dead(this.is_alive)
    }
    set_data(data) {
        this.x = data.current_pos[0];
        this.y = -data.current_pos[1];
        this.power = data.role_data.fire_power;
        this.is_indication = data.role_data.is_indication;
        this.is_alive = data.role_data.is_alive;
    }
    /**
     * @author ArtiKhog
     * Функция проверяет найден ли огонь и показывает bitmap индикации
     */
    draw_indication(is_indication) {
        if (is_indication) {
            this.indication_bitmap.alpha = 1;
        } else {
            this.indication_bitmap.alpha = 0;
        }
    }
    /**
     * @author ArtiKhog
     * Функция проверяет потушен ли огонь и показывает bitmap потушенного огня
     */
    draw_dead(is_alive) {
        if (!is_alive) {
            this.dead_bitmap.alpha = 1;
        } else {
            this.dead_bitmap.alpha = 0;
        }
    }
}


/**
 * @author ArtiKhog
 * Класс груза. Оболчка для bitmap груза
 */
class Box{
    constructor(scale, color, scale_koef = 0.5, locus_x = 5.5, locus_y = 5.5) {
        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.locus_x = locus_x;
        this.locus_y = locus_y;
        this.scale = scale;
        this.color = color;
        this.scale_koef = scale_koef;
        this.bitmap = new createjs.Bitmap();
        this.init(color+'_box');
    }
    init(type) {
        this.bitmap = new createjs.Bitmap(document.getElementById(type));
        resize_bitmap(this.bitmap, this.scale, document.getElementById(type).naturalHeight, document.getElementById(type).naturalWidth, this.scale_koef);
    }
    /**
     * @author ArtiKhog
     * @param x_offset смещение по x координате от исходного объекта
     * @param y_offset смещение по y координате от исходного объекта
     * @param regX смещение по x координате bitmap исходного объекта
     * @param regY смещение по y координате bitmap исходного объекта
     */
    draw(x_offset, y_offset, regX, regY) {
        this.bitmap.x = (this.locus_x + this.x) * this.scale
        this.bitmap.y = (this.locus_y + this.y) * this.scale
        createjs.Tween.get(this.bitmap).to({
            regX: x_offset + regX,
            regY: y_offset + regY,
            rotation: this.angle * 180 / Math.PI,
        }, 500);
    }
    set_coordinates(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
    }
}

function resize_bitmap(bitmap, scale, height, width, scale_koef) {
    bitmap.scaleX = scale / height * scale_koef;
    bitmap.scaleY = scale / width * scale_koef;
    bitmap.regX = width / 2;
    bitmap.regY = height / 2;
}

function add_keyboard(map, drone_number) {
    window.onkeydown = function (e) {
        switch (e.code) {
            case 'KeyW':
                map.moving_objects[drone_number].x += 0.25 * Math.sin(map.moving_objects[drone_number].angle);
                map.moving_objects[drone_number].y -= 0.25 * Math.cos(map.moving_objects[drone_number].angle);
                break;
            case 'KeyQ':
                map.moving_objects[drone_number].angle -= 0.15;
                break;
            case 'KeyE':
                map.moving_objects[drone_number].angle += 0.15;
                break;
            case 'KeyG':
                console.log(map.fabrics[1].num_cargo)
                map.fabrics[1].set_num_cargo(0)
                console.log(map.fabrics[1].num_cargo)
                break
            case 'KeyH':
                map.fires[0].is_alive = false;
                break
            case 'KeyF':
                map.moving_objects[2].x = 2;
                break;
        }
    }
}

/**
 * @author ArtiKhog
 * @param rgb_array массив из 3 чисел представляющий rgb
 * Функция для получения нужного цвета из массива
 */
function rgb_parser(rgb_array) {
    if (rgb_array[0] === 255 && rgb_array[1] === 255 && rgb_array[2] === 0) {
        return 'yellow';
    } else if (rgb_array[0] === 0 && rgb_array[1] === 255 && rgb_array[2] === 0) {
        return 'green';
    } else if (rgb_array[0] === 0 && rgb_array[1] === 0 && rgb_array[2] === 255) {
        return 'blue';
    } else if (rgb_array[0] === 255 && rgb_array[1] === 0 && rgb_array[2] === 0) {
        return 'red';
    } else if (rgb_array[0] === 255 && rgb_array[1] === 102 && rgb_array[2] === 0) {
        return 'orange';
}
    return '';
}

function add_ticker(stage, framerate = 60) {
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.framerate = framerate;
    createjs.Ticker.addEventListener("tick", stage);
}
