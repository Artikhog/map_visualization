class Map{
    constructor(canvas, stage, size, meter_size = 11) {
        this.canvas = canvas;
        this.stage = stage;
        this.size = size;
        this.meter_size = meter_size;
        this.scale = size / meter_size;
        this.map_container = new createjs.Container();
        this.background = new createjs.Bitmap(document.getElementById('black_background'));
        this.moving_objects = [];
        this.starts = [];
        this.fires = [];
        this.fabrics = [];
        this.villages = [];
        this.boxes = [];
        this.init();
    }
    init() {
        this.background.scaleX = this.background.scaleY = this.size / 1080;
    }
    update() {
        this.map_container.removeAllChildren();
        this.stage.removeAllChildren();
        this.stage.addChild(this.map_container);
        this.draw_background();
        this.draw_grid();
        this.draw_all_objects();
    }

    draw_background() {
        this.map_container.addChild(this.background);
    }
    draw_grid() {
        for (let i = 1; i < this.meter_size; i++) {
            var line = new createjs.Shape();
            line.graphics.beginStroke("white");
            line.graphics.moveTo(this.scale * i, 0);
            line.graphics.lineTo(this.scale * i, this.size);
            line.graphics.moveTo(0, this.scale * i);
            line.graphics.lineTo(this.size, this.scale * i);
            this.map_container.addChild(line);
        }
    }
    add_polygon_objects(polygon_data) {
        const polygon_objects_array =  Object.values(polygon_data);
        let starts_i = 1;
        polygon_objects_array.forEach(element => {
            switch (element.name_role) {
                case "Fabric_RolePolygon":
                    var fabric = new Fabric(this.scale, 'fabric');
                    fabric.get_cargo_data(element.role_data);
                    this.fabrics.push(fabric);
                    break;
                case "Village_RolePolygon":
                    this.villages.push(new Village(this.scale, 'village'));
                    break;
                case "TakeoffArea_RolePolygon":
                    this.starts.push(new Polygon_Object(this.scale, `start${starts_i}`));
                    starts_i++
                    break;
                case "Fire_RolePolygon":
                    this.fires.push(new Fire(this.scale, 'boom'));
            }
        })
    }
    add_moving_objects(players_data) {
        const moving_objects_array = Object.values(players_data);
        moving_objects_array.forEach(element => {
            switch (element.name_object_controll) {
                case "TestObject":
                    this.moving_objects.push(new Moving_Object(this.scale, 'drone'));
                    break;
                case "PioneerObject":
                    this.moving_objects.push(new Moving_Object(this.scale, 'drone'));
                    break;
                case "EduBotObject":
                    this.moving_objects.push(new Moving_Object(this.scale, 'car'));
                    break;
            }
        })
    }
    draw_all_objects() {
        this.draw_starts();
        this.draw_fabrics();
        this.draw_villages();
        this.draw_fires();
        this.draw_moving_object();
        this.draw_boxes();
    }
    draw_starts() {
        for (let i = 0; i < this.starts.length; i++) {
            this.starts[i].draw();
            this.map_container.addChild(this.starts[i].bitmap);
        }
    }
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
                    console.log(fires_i + ' ' + element.role_data.is_indication)
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

class Polygon_Object{
    constructor(scale, type, scale_koef = 0.9, locus_x = 5.5, locus_y = 5.5) {
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

class Moving_Object extends Polygon_Object {
    constructor(scale, type, scale_koef = 0.35, bitmap_scale_koef=0.3) {
        super(scale, type, scale_koef);
        this.angle = 0;
        this.is_cargo = false;
        this.cargo = new Box(0, '')
        this.color_cargo = ''
    }
    set_cargo(data) {
        if (this.is_cargo) {
            this.color_cargo = rgb_parser(data.color_cargo);
            if (this.cargo.scale === 0) {
                this.cargo = new Box(this.scale, this.color_cargo);
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
            this.cargo.draw(0.5, -0.5, this.bitmap.regX, this.bitmap.regY);
        }
    }
    set_data(data) {
        this.x = data.current_pos[0];
        this.y = -data.current_pos[1];
        this.angle = data.current_pos[3]
        this.is_cargo = data.is_cargo;
        this.set_cargo(data);

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

class Fabric extends Polygon_Object {
    constructor(scale, type, scale_koef = 1.1) {
        super(scale, type, scale_koef);
        this.num_cargo = 0;
        this.cargo_color = '';
        this.is_cargo = false;
        this.conditions = 0;
        this.cargo_array = [];
    }
    get_cargo_data(role_data) {
        this.cargo_color = rgb_parser(role_data.current_cargo_color);
        this.is_cargo = role_data.is_cargo;
        this.conditions = role_data.current_conditions;
        this.set_num_cargo(role_data.num_cargo);

    }
    create_cargo() {
        for (let i = 0; i < this.num_cargo; i++) {
            this.cargo_array.push(new Box(this.scale, this.cargo_color));
        }
    }
    set_num_cargo(new_num_cargo) {
        if (this.num_cargo < new_num_cargo ) {
            for (let i = this.num_cargo; i < new_num_cargo; i++) {
                this.cargo_array.push(new Box(this.scale, this.cargo_color));
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

        for (let i = 0; i < this.cargo_array.length; i++) {
            this.cargo_array[i].draw(2 * box_distribution_x(i), 2 * box_distribution_y(i), this.bitmap.regX, this.bitmap.regY);
        }
    }
    set_data(data) {
        this.x = data.current_pos[0];
        this.y = -data.current_pos[1];
        this.cargo_array.forEach(cargo => {
            cargo.set_coordinates(this.x, this.y, this.angle);
        });
    }
}

class Village extends Polygon_Object {
    constructor(scale, type, scale_koef = 0.9) {
        super(scale, type, scale_koef);
        this.cargo_num = [];
        this.cargo_color = [];
        this.cargo_flag = [false, false, false, false];
        this.cargo_array = [];
    }
    draw() {
        createjs.Tween.get(this.bitmap).to({
            x: (this.locus_x + this.x) * this.scale,
            y: (this.locus_y + this.y) * this.scale,
        }, 200);

        for (let i = 0; i < this.cargo_array.length; i++) {
            this.cargo_array[i].draw(2 * box_distribution_x(i), 2 * box_distribution_y(i), this.bitmap.regX, this.bitmap.regY);
        }
    }
    set_num_cargo() {
        for (let i = 0; i < this.cargo_num.length; i++) {
            if (this.cargo_num[i] > 0) {
                if (!this.cargo_flag[i]) {
                    this.cargo_array.push(new Box(this.scale, this.cargo_color[i]));
                    this.cargo_flag[i] = true;
                }
            }
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
    draw_indication(is_indication) {
        if (is_indication) {
            this.indication_bitmap.alpha = 1;
        } else {
            this.indication_bitmap.alpha = 0;
        }
    }
    draw_dead(is_alive) {
        if (!is_alive) {
            this.dead_bitmap.alpha = 1;
        } else {
            this.dead_bitmap.alpha = 0;
        }
    }
}

class Box{
    constructor(scale, color, scale_koef = 0.3, locus_x = 5.5, locus_y = 5.5) {
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
    draw(x_offset, y_offset, regX, regY) {
        createjs.Tween.get(this.bitmap).to({
            x: (this.locus_x + this.x) * this.scale,
            y: (this.locus_y + this.y) * this.scale,
            regX: x_offset * this.scale + regX,
            regY: y_offset * this.scale + regY,
            rotation: this.angle * 180 / Math.PI,
        }, 200);
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
            case 'KeyF':
                map.moving_objects[drone_number].set_cargo(map.fabrics[1].cargo_array[2]);
                console.log(map.moving_objects[drone_number].cargo);
                map.fabrics[1].set_num_cargo(0);
                break;
            case 'KeyG':
                map.fires[0].x = 5
                break
            case 'KeyH':
                map.fires[0].is_alive = false;
                break
        }
    }
}

function rgb_parser(rgb_array) {
    if (rgb_array[0] === 255 && rgb_array[1] === 255) {
        return 'yellow';
    } else if (rgb_array[1] === 255) {
        return 'green';
    } else if (rgb_array[2] === 255) {
        return 'blue';
    } else if (rgb_array[0] === 255) {
        return 'red';
    }
    return '';
}

function box_distribution_x(i) {
    let x = (-1) ** (i % 2);
    return x
}

function box_distribution_y(i) {
    let y = (-1) ** (Math.round(i/2))
    return y
}

function add_ticker(stage, framerate = 60) {
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.framerate = framerate;
    createjs.Ticker.addEventListener("tick", stage);
}
