<?php
function getAccessPostgre(){
    $access = array();
    array_push($access,array(
        "host"=>"localhost",
        "port"=>"5432",
        "user"=>"monitor_svg_admin",
        "password"=>"monitorsvgadmin",
        "database"=>"monitor_geodat"
    ));
    return $access;
}
function getAccessMySQL(){
    $access = array();
    array_push($access,array(
        "host"=>"127.0.0.1",
        "user"=>"monitor_svg",
        "password"=>"monitor_svguser",
        "database"=>"monitor_svg"
    ));
    return $access;
}
?>