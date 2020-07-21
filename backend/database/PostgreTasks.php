<?php
require_once('PostgreManager.php');

class PostgreTasks extends PostgreManager
{
    function getGeometry($year,$spatial_extend,$ags_array)
    {
        try {
            $year_pg = DBFactory::getMySQLTask()->getPostGreYear($year);

            $log = "  getGeometry ";
            file_put_contents('log.txt', "Postgres: " . $log, FILE_APPEND);
            $digit = '';
            $geom = "x.the_geom ";
            $krs_col = "";
            $sql_join_krs = "";
            //set the gemetry column
            if ($year == 2000) {
                $geom = "x.geom";
            }
            if ($spatial_extend === "gem") {
                $krs_col = ",k.gen as kreis";
                $sql_join_krs = " inner join vg250_krs_".$year_pg."_grob k on cast(k.ags as text) Like substring(cast(x.ags as text) for 5)";
            }
            if (count($ags_array) == 0) {
                // Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
                $sql = "select x.ags, x.des, replace(x.gen, '''','') as gen, st_asgeojson(transform(" .
                    pg_escape_string($geom) . ",4326)) AS geojson " . $krs_col . " from  vg250_" . $spatial_extend . "_" . $year . "_grob x" . $sql_join_krs . " where x.ags is not null";
            } else {
                $sql = "select x.ags, x.des, replace(x.gen, '''','') as gen, st_asgeojson(transform(" .
                    pg_escape_string($geom) . ",4326)) AS geojson " . $krs_col . " from  vg250_" . $spatial_extend . "_" . $year . "_grob x " . $sql_join_krs . " where CAST(x.ags AS TEXT) Like'" . $ags_array[0] . "";

                foreach ($ags_array as $value) {
                    if (strlen($value) <= 5) {
                        $digit = "%'";
                        $sql .= "%' or CAST(x.ags AS TEXT) Like'" . $value . "";
                    } else {
                        $digit = "'";
                        $sql .= "' or CAST(x.ags AS TEXT) Like'" . $value . "";
                    }
                }
            }
        }
        catch(Error $e){
            $trace = $e->getTrace();
            echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
        }
        return $this->query($sql . $digit);
    }
    function countGeometries($year,$raumgl,$ags_array)
    {
        try {

            $year_pg = DBFactory::getMySQLTask()->getPostGreYear($year);
            $query = "select COUNT(AGS) from vg250_" . $raumgl . "_" . $year_pg . "_grob";
            if (count($ags_array) > 0) {
                $sql_pg = "select COUNT(AGS) from  vg250_" . $raumgl . "_" . $year_pg . "_grob where AGS Like'" . $ags_array[0] . "";

                foreach ($ags_array as $key => $value) {
                    if (strlen($value) <= 5) {
                        $digit = "%'";
                        $sql_pg .= "%' or AGS Like '" . $value . "";
                    } else {
                        $digit = "'";
                        $sql_pg .= "' or AGS Like '" . $value . "";
                    }
                }
                $query = $sql_pg . $digit;
            }
        }
        catch(Error $e){
            $trace = $e->getTrace();
            echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
        }
        return $this->query($query);
    }
    function getDescription($des,$ags,$spatial_extend){
        try {
            $value_return = $des;
            if ($spatial_extend === 'bld') {
                //specal issue for berlin, because ther is a wrong record insde the vg 250
                if ($ags == 11) {
                    $value_return = "Stadtstaat";
                } else if (strpos(strtolower($des), 'stadt') !== false) {
                    $value_return = "Stadtstaat";
                } else {
                    $value_return = "Flächenstaat";
                }
            } else if ($spatial_extend === 'krs') {
                if (strtolower($des) === "kreisfreie stadt") {
                    $value_return = "Kreisfreie Stadt";
                } else {
                    $value_return = "Landkreis";
                }
            }
        }
        catch(Error $e){
            $trace = $e->getTrace();
            echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
        }
        return $value_return;
    }
    function getAGSName($raumgliederung,$ags,$year)
    {
        try {

            if (intval($year) == 2018) {
                $year = DBFactory::getMySQLTask()->getPostGreYear($year);
            }
            $sql = "select gen from vg250_" . $raumgliederung . "_" . $year . "_grob where ags ='" . $ags . "'";
            $rs = $this->query($sql);
        }
        catch(Error $e){
            $trace = $e->getTrace();
            echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
        }
        return $rs[0]->gen;
    }
}