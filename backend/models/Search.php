<?php
include "../models/Helper.php";
include "../database/DBFactory.php";

class Search
{
    public function __construct($search_string, $option, $lan)
    {
        $this->search_string = strtolower($search_string);
        $this->option = $option;
        $this->language = $lan;
    }

    public function query()
    {
        if ($this->option === "indicator") {
            return json_decode(Helper::get_instance()->escapeJsonString('{"results":[' . substr($this->queryIndicator(), 0, -1) . "]}"), true);
        } else if ($this->option === "orte") {
            return json_decode(Helper::get_instance()->escapeJsonString('{"results":[' . substr($this->queryArea(), 0, -1) . "]}"), true);
        } else {
            $result = substr($this->queryIndicator() . $this->queryArea(), 0, -1);
            return json_decode(Helper::get_instance()->escapeJsonString('{"results":[' . $result . "]}"), true);
        }
    }

    private function queryIndicator()
    {
        // manage languages:
        if ($this->language == "de") {
            $ind_name = "INDIKATOR_NAME";
            $cat_name = "THEMA_KAT_NAME";
            $info1 = "INFO_VIEWER_ZEILE_1";
            $info2 = "INFO_VIEWER_ZEILE_2";
            $info3 = "INFO_VIEWER_ZEILE_3";
            $indicators ="Indikatoren";
        } else {
            $ind_name = "INDIKATOR_NAME_EN";
            $cat_name = "THEMA_KAT_NAME_EN";
            $info1 = "INFO_VIEWER_ZEILE_1_EN";
            $info2 = "INFO_VIEWER_ZEILE_2_EN";
            $info3 = "INFO_VIEWER_ZEILE_3_EN";
            $indicators = "Indicators";
        }
        $JSON = '';
        $sql = "SELECT i." . $ind_name . " as name, i.ID_INDIKATOR as id, i.EINHEIT as unit, i.ID_THEMA_KAT as id_cat, k." . $cat_name . " as cat_name,
              i.METHODIK as methodik, i.BEDEUTUNG_INTERPRETATION as bedeutung, i.DATENGRUNDLAGE_ZEILE_1 as daten1,i.DATENGRUNDLAGE_ZEILE_2 as daten2,
              i." . $info1 . " as info1,i." . $info2 . " as info2, i." . $info3 . " as info3
            FROM m_indikatoren i, m_indikator_freigabe f, m_thematische_kategorien k
            WHERE f.ID_INDIKATOR = i.ID_Indikator
            AND f.STATUS_INDIKATOR_FREIGABE =3
            AND k.ID_THEMA_KAT = i.ID_THEMA_KAT
            GROUP BY i.ID_INDIKATOR";
        $indObject = DBFactory::getMySQLManager()->query($sql);
        $q = $this->search_string;
        //seach for the suitable results inside the object
        foreach ($indObject as $key => $row) {
            //search inside indicators
            if (strpos(strtolower($row->id), $q) !== false
                or strpos(strtolower($row->name), $q) !== false
                // removing search parameters that are not needed as of meeting protocol from 05.11
                //or strpos(strtolower($row->cat_name), $q) !== false
                //or strpos(strtolower($row->methodik), $q) !== false
                //or strpos(strtolower($row->bedeutung), $q) !== false
                //or strpos(strtolower($row->daten1),$q)!==false
                //or strpos(strtolower($row->daten2),$q)!==false
                or strpos(strtolower($row->info1), $q) !== false
                or strpos(strtolower($row->info2), $q) !== false
                or strpos(strtolower($row->info3), $q) !== false
            ) {
                $name = str_replace('"', '', $row->name);
                $string = '{"titel": "' . $name . '","value":"' . $row->id . '","category":"' .$indicators .'","description":"' . $row->unit . '"},';
                if (strpos($JSON, $string) !== true) {
                    $JSON .= $string;
                }
            }
        }
        return $JSON;
    }

    private function queryArea()
    {
        // manage languages:
        if ($this->language == "de") {
            $locations ="Orte";
        } else {
            $locations = "Locations";
        }
        $JSON = '';
        $searchTerm = $this->search_string;
        $year_pg = DBFactory::getMySQLTask()->getPostGreYear(2016);

        $geom = "the_geom ";

        $query_bld = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS center from  vg250_bld_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%" . $searchTerm . "%')";
        $erg_bld = DBFactory::getPostgreSQLManager()->query($query_bld);
        foreach ($erg_bld as $row) {
            $coordinates = str_replace(array('POINT(', ')'), array('', ''), $row->center);
            $array = explode(" ", $coordinates);
            $JSON .= '{"titel": "' . $row->gen . '","value":["' . $array[0] . '","' . $array[1] . '"],"category":"' .$locations .'","description":"Bundesland"},';
        }

        $query_ror = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_ror_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%" . $searchTerm . "%')";
        $erg_ror = DBFactory::getPostgreSQLManager()->query($query_ror);
        if (true) //(empty((array)$erg_bld))          ---check if Bundesland comes before not wanted, as of Meeting 19.02.2020
        {
            foreach ($erg_ror as $row) {
                $coordinates = str_replace(array('POINT(', ')'), array('', ''), $row->center);
                $array = explode(" ", $coordinates);
                $JSON .= '{"titel": "' . $row->gen . '","value":["' . $array[0] . '","' . $array[1] . '"],"category":"' .$locations .'","description":"Raumordnungsregion"},';
            }
        }


        $query_krs = "select gid, ags, gen,des, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_krs_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%" . $searchTerm . "%')";
        $erg_krs = DBFactory::getPostgreSQLManager()->query($query_krs);
        if (true) //(empty((array)$erg_bld))          ---check if Bundesland comes before not wanted, as of Meeting 19.02.2020
        {
            foreach ($erg_krs as $row) {
                $coordinates = str_replace(array('POINT(', ')'), array('', ''), $row->center);
                $array = explode(" ", $coordinates);
                $JSON .= '{"titel": "' . $row->gen . '","value":["' . $array[0] . '","' . $array[1] . '"],"category":"' .$locations .'","description":"' . $row->des . '"},';
            }
        }

        /*$query_g50 = "select gid, ags, gen,des, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_g50_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%".$searchTerm."%')";
        $erg_g50 = DBManagerFactory::getPostgreSQLManager()->query($query_g50);
        if (empty((array)$erg_krs)) {
            foreach($erg_g50 as $row){
                $coordinates = str_replace(array('POINT(',')'),array('',''),$row->center);
                $array = explode(" ",$coordinates);
                $JSON .= '{"titel": "' . $row->gen. '","value":["' . $array[0]. '","'.$array[1].'"],"category":"Orte","description":"'.$row->des.'"},';
            }
        }*/

        $query_gem = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_gem_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%" . $searchTerm . "%')";
        $erg_gem = DBFactory::getPostgreSQLManager()->query($query_gem);
        if (true) //(empty((array)$erg_bld))          ---check if Bundesland comes before not wanted, as of Meeting 19.02.2020
        {
            foreach ($erg_gem as $row) {
                $coordinates = str_replace(array('POINT(', ')'), array('', ''), $row->center);
                $array = explode(" ", $coordinates);
                $JSON .= '{"titel": "' . $row->gen . '","value":["' . $array[0] . '","' . $array[1] . '"],"category":"' .$locations .'","description":"Gemeinde"},';
            }
        }

        $query_stt = "select gid, ags, gen, ST_AsText(ST_centroid(transform(" . pg_escape_string($geom) . ",4326))) AS CENTER from  vg250_stt_" . $year_pg . "_grob where LOWER(gen) LIKE LOWER('%" . $searchTerm . "%')";
        $erg_stt = DBFactory::getPostgreSQLManager()->query($query_stt);

        if (true) //(empty((array)$erg_bld))          ---check if Bundesland comes before not wanted, as of Meeting 19.02.2020
        {
            foreach ($erg_stt as $row) {
                $coordinates = str_replace(array('POINT(', ')'), array('', ''), $row->center);
                $array = explode(" ", $coordinates);
                $JSON .= '{"titel": "' . $row->gen . '","value":["' . $array[0] . '","' . $array[1] . '"],"category":"' .$locations .'","description":"Stadtteil"},';
            }
        }

        return $JSON;
    }
}
