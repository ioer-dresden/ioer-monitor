<?php
include '../database/DBFactory.php';

class NOTES{
    private $notes;
    protected static $instance = NULL;
    public static function get_instance()
    {
        if ( NULL === self::$instance )
            self::$instance = new self;

        return self::$instance;
    }
    function getNotes(){
        if(count($this->notes)==0) {
            $notes = array();
            $sql = "SELECT  HC, HC_INFO, HC_NAME, HC_NAME_EN, HC_INFO, HC_INFO_EN FROM m_hinweiscodes";
            $rs = DBFactory::getMySQLManager()->query($sql);
            foreach ($rs as $row) {
                array_push($notes, array(
                    'HC' => $row->HC,
                    'HC_NAME' => $row->HC_NAME,
                    'HC_NAME_EN' => $row->HC_NAME_EN,
                    'HC_INFO' => $row->HC_INFO,
                    'HC_INFO_EN' => $row->HC_INFO_EN,
                ));
            }
            $this->notes = $notes;
            return $this->notes;
        }else{
            return $this->notes;
        }
    }
    function getNoteText($note_code){
        foreach ($this->getNotes() as $row) {
            if($row['HC'] == $note_code){

                //return $row["HC_KURZ"];
                return $row["HC_NAME"]."||".$row["HC_NAME_EN"]."||".$row["HC_INFO"]."||".$row["HC_INFO_EN"];
            }
        }
    }
}