function resize_page() {
    const height = window.innerHeight;
    const width = window.innerWidth;
    const info_width = width - height;
    document.getElementById('map_div').style.width = height+"px";
    document.getElementById('map_div').style.height = height+"px";
    document.getElementById('information_div').style.width = info_width+"px";
    document.getElementById('information_div').style.height = height+"px";
}