<?php
    $path=$_GET['path'];
    if (stristr($path, "fbcdn.")==FALSE && stristr($path, "facebook.")==FALSE)
    {
        echo "ERROR";
        exit;
    }
    header("Content-Description: Facebook Proxied File");
    header("Content-Type: image");
    header("Content-Disposition: attachment; filename=".$path);
    @readfile($path);
?>